import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

const JAN_SEVA_API_BASE = process.env.JAN_SEVA_API_URL || 'https://api.therpdoundation.org/api/patient';

// Zero-Load In-Memory Caching (Prevents Server CPU/RAM Spikes & Rate Limits)
const cardCache = new Map<string, { data: any, expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

const getCached = (key: string) => {
  const item = cardCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cardCache.delete(key);
    return null;
  }
  return item.data;
};

const setCached = (key: string, data: any, ttlMs = CACHE_TTL_MS) => {
  cardCache.set(key, { data, expiresAt: Date.now() + ttlMs });
};

/**
 * 🔒 PRIVACY POLICY & ACCESS CONTROL:
 * 1. ONLY ADMINS can view all cards (/api/cards) and overall stats (/api/cards/stats).
 * 2. Regular USERS can ONLY view/search/download THEIR OWN Jan Seva Card (/api/cards/my).
 */

// Preserve the upstream schema without guessing or dropping unknown Jan Seva fields.
// Migration is idempotent; production deployments should provision this table before imports.
const ensureMirror = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS jan_seva_card_mirror (
    card_no TEXT PRIMARY KEY,
    record JSONB NOT NULL,
    source TEXT NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
};
const cardNumber = (record: any): string | null => {
  const value = record?.cardNo ?? record?.card_no ?? record?.janSevaCardNo;
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() || null : null;
};
const writeMirror = async (records: any[], source: string) => {
  await ensureMirror();
  const client = await pool.connect();
  let imported = 0, skipped = 0;
  try {
    await client.query('BEGIN');
    for (const record of records) {
      const number = record && typeof record === 'object' && !Array.isArray(record) ? cardNumber(record) : null;
      if (!number) { skipped++; continue; }
      await client.query(
        `INSERT INTO jan_seva_card_mirror (card_no, record, source, synced_at)
         VALUES ($1, $2::jsonb, $3, NOW())
         ON CONFLICT (card_no) DO UPDATE SET record = EXCLUDED.record, source = EXCLUDED.source, synced_at = NOW()`,
        [number, JSON.stringify(record), source]
      );
      imported++;
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
  cardCache.clear();
  return { imported, skipped };
};

// Explicit admin-only import: one batch at a time, no unbounded 66k-row request.
// Accepts JSON arrays exported from the authorized Jan Seva system.
router.post('/api/admin/cards/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const records = req.body?.records;
    if (!Array.isArray(records) || records.length < 1 || records.length > 500)
      return res.status(400).json({ success: false, error: 'Provide 1–500 card records per batch' });
    const result = await writeMirror(records, 'admin-import');
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Jan Seva card import failed:', error?.message);
    res.status(500).json({ success: false, error: 'Card import failed' });
  }
});

// The external endpoint's paging contract must be verified against the real API.
// Stop if the response schema differs; never infer that 66k records were synced.
router.post('/api/admin/cards/sync', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Number(req.body?.page);
    const limit = Number(req.body?.limit ?? 100);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 500)
      return res.status(400).json({ success: false, error: 'Valid page and limit (1–500) required' });
    const headers = process.env.JAN_SEVA_API_TOKEN
      ? { Authorization: `Bearer ${process.env.JAN_SEVA_API_TOKEN}` } : {};
    const response = await axios.get(JAN_SEVA_API_BASE, { params: { page, limit }, headers, timeout: 15000 });
    if (!Array.isArray(response.data?.patients))
      return res.status(502).json({ success: false, error: 'External API schema not verified: expected patients array' });
    const records = response.data.patients;
    if (records.length > limit)
      return res.status(502).json({ success: false, error: 'External API ignored requested page size' });
    const result = records.length ? await writeMirror(records, 'external-api') : { imported: 0, skipped: 0 };
    res.json({ success: true, page, limit, ...result, received: records.length,
      totalPatients: Number.isFinite(Number(response.data.totalPatients)) ? Number(response.data.totalPatients) : null,
      totalPages: Number.isFinite(Number(response.data.totalPages)) ? Number(response.data.totalPages) : null });
  } catch (error: any) {
    console.error('Jan Seva sync failed:', error?.message);
    res.status(502).json({ success: false, error: 'External Jan Seva API unavailable or unauthorized' });
  }
});

router.get('/api/admin/cards/mirror', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureMirror();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const [rows, count] = await Promise.all([
      pool.query('SELECT card_no, record, source, synced_at FROM jan_seva_card_mirror ORDER BY synced_at DESC LIMIT $1 OFFSET $2', [limit, (page - 1) * limit]),
      pool.query('SELECT COUNT(*)::int AS total FROM jan_seva_card_mirror')
    ]);
    res.json({ success: true, records: rows.rows, total: count.rows[0]?.total || 0, page, limit });
  } catch { res.status(500).json({ success: false, error: 'Card mirror unavailable' }); }
});

// Fetch all cards - STRICTLY ADMIN ONLY
router.get("/api/cards", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const cacheKey = `cards:admin:${search}:${page}:${limit}`;
    const cachedData = getCached(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const response = await axios.get(`${JAN_SEVA_API_BASE}`, {
        params: { search, page, limit },
        timeout: 4000
      });
      if (response.data && response.data.patients) {
        const payload = {
          success: true,
          applications: response.data.patients,
          totalPatients: response.data.totalPatients,
          totalPages: response.data.totalPages
        };
        setCached(cacheKey, payload, 30 * 1000);
        return res.json(payload);
      }
    } catch (apiErr: any) {
      console.warn("Jan Seva external API query failed, falling back to local PG:", apiErr.message);
    }

    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 ORDER BY "submittedAt" DESC LIMIT $1 OFFSET $2',
      [limit, (Number(page) - 1) * Number(limit)]
    );
    const payload = { success: true, applications: result.rows };
    setCached(cacheKey, payload, 10 * 1000);
    res.json(payload);
  } catch (error: any) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});

// Public impact totals only. Never expose names, phone numbers, ID numbers or card records.
router.get("/api/public/cards/impact", async (_req, res) => {
  try {
    const cached = getCached("cards:public-impact");
    if (cached) return res.json(cached);
    let total: number | null = null;
    let source = "external";
    try {
      const response = await axios.get(`${JAN_SEVA_API_BASE}/stats`, { timeout: 5000 });
      const data = response.data?.stats || response.data;
      const value = data?.totalCards ?? data?.totalPatients ?? data?.total ?? data?.count;
      if (value !== undefined && value !== null && Number.isFinite(Number(value)) && Number(value) >= 0) {
        total = Number(value);
      }
    } catch { /* Use local count only when external stats cannot be reached. */ }
    if (total === null) {
      source = "local";
      const local = await pool.query('SELECT COUNT(*)::int AS total FROM card_applications_v2 WHERE status = $1', ['approved']);
      total = Number(local.rows[0]?.total || 0);
    }
    const payload = { success: true, totalCards: total, source, scope: source === 'local' ? 'local-approved-only' : 'external-reported', updatedAt: new Date().toISOString() };
    setCached("cards:public-impact", payload, 120000);
    res.json(payload);
  } catch {
    res.status(503).json({ success: false, error: 'Card totals temporarily unavailable' });
  }
});

// Overall Stats - STRICTLY ADMIN ONLY
router.get("/api/cards/stats", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cacheKey = "cards:stats";
    const cachedStats = getCached(cacheKey);
    if (cachedStats) {
      return res.json(cachedStats);
    }

    let statsData = null;
    try {
      const response = await axios.get(`${JAN_SEVA_API_BASE}/stats`, { timeout: 4000 });
      statsData = response.data;
    } catch (error: any) {
      const pgCount = await pool.query('SELECT COUNT(*) FROM card_applications_v2');
      statsData = { total: parseInt(pgCount.rows[0]?.count || '0', 10), newToday: 0, thisWeek: 0 };
    }

    const payload = { success: true, stats: statsData };
    setCached(cacheKey, payload, 120 * 1000);
    return res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search Card - Admins can search any record; Regular Users can ONLY search their own record
router.get("/api/cards/search", authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query parameter required" });

    const q = String(query).trim();
    const user = (req as any).user;

    // Privacy Protection: Non-admin users are restricted to their own ID/CardNo/Mobile
    if (user?.role !== "admin") {
      const isOwnSearch =
        q === user?.id ||
        q === user?.mobile ||
        q === user?.phone ||
        q === user?.janSevaCardNo ||
        q === user?.aadhaarNo;

      if (!isOwnSearch) {
        return res.status(403).json({
          success: false,
          error: "Access Denied: You can only search and view your own Jan Seva Card."
        });
      }
    }

    const cacheKey = `search:${q}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    // 1. Search local Postgres first
    const pgResult = await pool.query(
      'SELECT * FROM card_applications_v2 WHERE "cardNo" = $1 OR "idNumber" = $1 OR "userId" = $1 LIMIT 1',
      [q]
    );

    if (pgResult.rows.length > 0) {
      const payload = { success: true, patient: pgResult.rows[0] };
      setCached(cacheKey, payload, 60 * 1000);
      return res.json(payload);
    }

    // 2. Fallback to external MongoDB master dataset (66,505 records)
    try {
      const response = await axios.get(`${JAN_SEVA_API_BASE}/${q}`, { timeout: 4000 });
      if (response.data) {
        const payload = { success: true, patient: response.data };
        setCached(cacheKey, payload, 60 * 1000);
        return res.json(payload);
      }
    } catch {}

    res.json({ success: true, patient: null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Authenticated application. Never issue fabricated card numbers on upstream failure.
router.post("/api/cards", authenticateToken, async (req: any, res) => {
  try {
    const actorId = String(req.user?.id || req.user?.userId || '');
    if (!actorId) return res.status(401).json({ success: false, error: 'Login required' });
    const { name, gender, dob, address, idType, idNumber, mobileNo, district, vidhanSabhaNo } = req.body || {};
    if (!String(name || '').trim() || !/^\\d{12}$/.test(String(idNumber || '')))
      return res.status(400).json({ success: false, error: 'Valid name and 12-digit identity number required' });
    const existing = await pool.query(
      'SELECT status, "cardNo" FROM card_applications_v2 WHERE "userId" = $1 OR "idNumber" = $2 LIMIT 1',
      [actorId, idNumber]
    );
    if (existing.rows.length) return res.status(409).json({
      success: false, error: 'An application already exists. Contact support to update it.',
      status: existing.rows[0].status
    });
    let cardNo: string | null = null;
    try {
      const headers = process.env.JAN_SEVA_API_TOKEN
        ? { Authorization: `Bearer ${process.env.JAN_SEVA_API_TOKEN}` } : {};
      const upstream = await axios.post(JAN_SEVA_API_BASE, {
        nameOfMember: name, gender, dob, mobileNo, aadhaarNo: idNumber,
        district, vidhanSabhaNo, addressType: 'Urban', createdBy: actorId
      }, { headers, timeout: 12000 });
      if (upstream.data?.cardNo) cardNo = String(upstream.data.cardNo);
    } catch (error: any) {
      console.warn('Jan Seva upstream application unavailable:', error?.response?.status || error?.code || 'unknown');
    }
    const status = cardNo ? 'approved' : 'pending';
    await pool.query(
      `INSERT INTO card_applications_v2
       (id, "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [crypto.randomUUID(), actorId, String(name).trim(), gender, dob, address, idType || 'aadhaar',
        idNumber, status, cardNo, new Date().toISOString()]
    );
    await pool.query('UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
      [status, cardNo, actorId]);
    cardCache.clear();
    res.status(cardNo ? 201 : 202).json({ success: true, status, cardNo,
      message: cardNo ? 'Card issued by authorized API' : 'Application received; pending verification' });
  } catch (error: any) {
    console.error('Jan Seva application failed:', error?.code || error?.message);
    res.status(500).json({ success: false, error: 'Unable to submit application' });
  }
});

// Admin Approval & Management Routes
router.post("/api/cards/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = String(req.body?.userId || '').trim();
    const cardNo = String(req.body?.cardNo || '').trim();
    if (!userId || !cardNo || cardNo.length > 100)
      return res.status(400).json({ success: false, error: 'Verified user ID and issued card number required' });
    // Never mint a random card number. Match an already-issued upstream/mirrored record.
    await ensureMirror();
    const mirror = await pool.query('SELECT card_no FROM jan_seva_card_mirror WHERE card_no = $1 LIMIT 1', [cardNo]);
    if (!mirror.rows.length)
      return res.status(409).json({ success: false, error: 'Card number not found in synchronized Jan Seva records' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const application = await client.query(
        'UPDATE card_applications_v2 SET status = $1, "cardNo" = $2 WHERE "userId" = $3 RETURNING "userId"',
        ['approved', cardNo, userId]
      );
      if (!application.rowCount) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: 'Application not found' });
      }
      await client.query('UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
        ['approved', cardNo, userId]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
    cardCache.clear();
    res.json({ success: true, cardNo });
  } catch (error: any) {
    console.error('Jan Seva approval failed:', error?.code || error?.message);
    res.status(500).json({ success: false, error: 'Approval failed' });
  }
});

router.post("/api/cards/reject", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1 WHERE "userId" = $2',
      ["rejected", userId]
    );
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1 WHERE id = $2',
      ["rejected", userId]
    );
    cardCache.clear();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/cards/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM card_applications_v2 WHERE "userId" = $1', [req.params.userId]);
    cardCache.clear();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get My Card - Regular Users can ONLY view THEIR OWN Card
router.get("/api/cards/my", authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const requestedUserId = (req.query.userId as string) || user?.id;

    // Privacy Protection: Non-admin users cannot query other users' card
    if (user?.role !== "admin" && requestedUserId !== user?.id) {
      return res.status(403).json({
        success: false,
        error: "Access Denied: You can only view your own Jan Seva Card."
      });
    }

    const cacheKey = `cards:my:${requestedUserId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 WHERE "userId" = $1',
      [requestedUserId]
    );
    const payload = { success: true, application: result.rows[0] || null };
    setCached(cacheKey, payload, 30 * 1000);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
