import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// Primary & Fallback External API Endpoints
const PRIMARY_JAN_SEVA_API = process.env.JAN_SEVA_API_URL || 'https://api.therpfoundation.org/api/patient';
const FALLBACK_JAN_SEVA_API = 'https://www.api.therpfoundation.org/api/patient';
const JAN_SEVA_PORTAL_URL = 'https://jansevacard.therpfoundation.org';

// In-Memory Caching (Zero-Load Protection against spikes)
const cardCache = new Map<string, { data: any, expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60s default

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
 * Robust upstream Jan Seva API client.
 * Kept only for existing user-facing compatibility/application routes;
 * Admin bulk/external sync routes have been removed.
 */
async function callJanSevaApi(subPath = '', options: any = {}) {
  const timeout = options.timeout || 7000;
  const headers = {
    'User-Agent': 'Samahit-AppAPI/2.5 (+https://appapi.therpfoundation.org)',
    ...(process.env.JAN_SEVA_API_TOKEN ? { Authorization: `Bearer ${process.env.JAN_SEVA_API_TOKEN}` } : {}),
    ...(options.headers || {})
  };

  const cleanSubPath = subPath ? (subPath.startsWith('/') ? subPath : `/${subPath}`) : '';
  const endpoints = [
    `${PRIMARY_JAN_SEVA_API}${cleanSubPath}`,
    `${FALLBACK_JAN_SEVA_API}${cleanSubPath}`
  ];

  let lastError: any = null;
  for (const endpoint of endpoints) {
    try {
      return await axios({
        method: options.method || 'GET',
        url: endpoint,
        params: options.params,
        data: options.data,
        headers,
        timeout
      });
    } catch (err: any) {
      lastError = err;
      if (err.response && (err.response.status === 400 || err.response.status === 404)) {
        throw err;
      }
    }
  }
  throw lastError;
}

/**
 * Idempotent local PostgreSQL mirror table.
 * The master JSON import and local verification depend on this table.
 */
export const ensureMirror = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS jan_seva_card_mirror (
    card_no TEXT PRIMARY KEY,
    record JSONB NOT NULL,
    source TEXT NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
};

const ensureAuditLogs = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource, resource_id)');
};

const writeAuditLog = async (req: any, action: string, resource: string, resourceId: string | null, metadata: Record<string, unknown> = {}) => {
  try {
    await ensureAuditLogs();
    const userId = String(req.user?.id || req.user?.userId || '') || null;
    const forwarded = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = forwarded || req.ip || null;
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource, resource_id, ip_address, user_agent, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [userId, action, resource, resourceId, ip, String(req.headers?.['user-agent'] || ''), JSON.stringify(metadata)]
    );
  } catch (auditError: any) {
    console.warn('Audit log write failed:', auditError?.message);
  }
};

const extractCardNumber = (record: any): string | null => {
  const value =
    record?.cardNo ??
    record?.cardNumber ??
    record?.card_number ??
    record?.cardNoNumber ??
    record?.janSevaCardNo ??
    record?.janSevaCardNumber ??
    record?.jan_seva_card_no ??
    record?.card_id ??
    record?.cardId ??
    record?.patient?.cardNo ??
    record?.patient?.cardNumber ??
    record?.data?.cardNo ??
    record?.data?.cardNumber ??
    record?._id;
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim() || null
    : null;
};

export const writeMirror = async (records: any[], source: string) => {
  await ensureMirror();
  const client = await pool.connect();
  let imported = 0;
  let skipped = 0;

  try {
    await client.query('BEGIN');

    for (const record of records) {
      const number = record && typeof record === 'object' && !Array.isArray(record)
        ? extractCardNumber(record)
        : null;

      if (!number) {
        skipped++;
        continue;
      }

      await client.query(
        `INSERT INTO jan_seva_card_mirror (card_no, record, source, synced_at)
         VALUES ($1, $2::jsonb, $3, NOW())
         ON CONFLICT (card_no) DO UPDATE
         SET record = EXCLUDED.record, source = EXCLUDED.source, synced_at = NOW()`,
        [number, JSON.stringify(record), source]
      );

      imported++;
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  cardCache.clear();
  return { imported, skipped };
};

// =============================================================================
// SYNCHRONIZATION & IMPORT ROUTES
// =============================================================================

// Explicit admin-only import: one batch at a time (up to 500 rows)
router.post('/api/admin/cards/import', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const records = req.body?.records;
    if (!Array.isArray(records) || records.length < 1 || records.length > 500)
      return res.status(400).json({ success: false, error: 'Provide 1–500 card records per batch' });

    const result = await writeMirror(records, 'admin-import');
    await writeAuditLog(req, 'JAN_SEVA_MASTER_IMPORT', 'jan_seva_card_mirror', null, {
      received: records.length,
      imported: result.imported,
      skipped: result.skipped,
      source: 'admin-master-json'
    });

    res.json({ success: true, ...result, received: records.length });
  } catch (error: any) {
    console.error('Jan Seva card import failed:', error?.message);
    await writeAuditLog(req, 'JAN_SEVA_MASTER_IMPORT_FAILED', 'jan_seva_card_mirror', null, {
      error: error?.message || 'Unknown import error'
    });
    res.status(500).json({ success: false, error: error?.message || 'Card import failed' });
  }
});


// Admin Audit Trail
router.get('/api/admin/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureAuditLogs();
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
    const result = await pool.query(
      `SELECT id, user_id, action, resource, resource_id, ip_address, user_agent, metadata, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ success: true, logs: result.rows });
  } catch (error: any) {
    console.error('Audit log retrieval failed:', error?.message);
    res.status(500).json({ success: false, error: 'Unable to load audit logs' });
  }
});

// Get Paginated Mirror Records
router.get('/api/admin/cards/mirror', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await ensureMirror();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = String(req.query.search || '').trim().toLowerCase();

    let query = 'SELECT card_no, record, source, synced_at FROM jan_seva_card_mirror';
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE LOWER(card_no) LIKE $1 OR LOWER(record::text) LIKE $1`;
    }

    const countQuery = search
      ? 'SELECT COUNT(*)::int AS total FROM jan_seva_card_mirror WHERE LOWER(card_no) LIKE $1 OR LOWER(record::text) LIKE $1'
      : 'SELECT COUNT(*)::int AS total FROM jan_seva_card_mirror';

    params.push(limit);
    params.push((page - 1) * limit);
    query += ` ORDER BY synced_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const [rows, count] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    res.json({
      success: true,
      records: rows.rows,
      total: count.rows[0]?.total || 0,
      page,
      limit
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Card mirror query failed: ' + err.message });
  }
});

// =============================================================================
// PATIENT / CARD VERIFICATION & COMPATIBILITY ROUTES
// =============================================================================

// Public / Bridge Card Verification
router.get('/api/janseva/verify/:id', async (req, res) => {
  try {
    const rawId = String(req.params.id || '').trim();
    if (!rawId) return res.status(400).json({ success: false, error: 'Card number or ID required' });

    // 1. Search local Postgres mirror
    await ensureMirror();
    const mirrorRes = await pool.query(
      `SELECT card_no, record, source, synced_at FROM jan_seva_card_mirror 
       WHERE card_no = $1 OR LOWER(record->>'aadhaarNo') = LOWER($1) OR LOWER(record->>'mobileNo') = LOWER($1) 
       LIMIT 1`,
      [rawId]
    );

    if (mirrorRes.rows.length > 0) {
      const rec = mirrorRes.rows[0].record;
      return res.json({
        success: true,
        verified: true,
        source: 'local-mirror',
        cardNo: mirrorRes.rows[0].card_no,
        member: {
          name: rec.nameOfMember || rec.name || 'Beneficiary',
          gender: rec.gender,
          dob: rec.dob,
          district: rec.district,
          vidhanSabhaNo: rec.vidhanSabhaNo,
          mobileNo: rec.mobileNo ? `******${String(rec.mobileNo).slice(-4)}` : null,
          status: 'verified'
        },
        portalUrl: `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(mirrorRes.rows[0].card_no)}`,
        syncedAt: mirrorRes.rows[0].synced_at
      });
    }

    // 2. Search local card applications
    const appRes = await pool.query(
      `SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" 
       FROM card_applications_v2 
       WHERE "cardNo" = $1 OR "idNumber" = $1 OR "userId" = $1 
       LIMIT 1`,
      [rawId]
    );

    if (appRes.rows.length > 0) {
      const app = appRes.rows[0];
      return res.json({
        success: true,
        verified: app.status === 'approved',
        source: 'local-application',
        cardNo: app.cardNo || null,
        member: {
          name: app.name,
          gender: app.gender,
          dob: app.dob,
          status: app.status
        },
        portalUrl: app.cardNo ? `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(app.cardNo)}` : null,
        submittedAt: app.submittedAt
      });
    }

    // 3. Fallback to external API
    try {
      const extRes = await callJanSevaApi(`/${encodeURIComponent(rawId)}`, { timeout: 4000 });
      if (extRes.data) {
        return res.json({
          success: true,
          verified: true,
          source: 'external-api',
          cardNo: extRes.data.cardNo || rawId,
          member: extRes.data,
          portalUrl: `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(extRes.data.cardNo || rawId)}`
        });
      }
    } catch {}

    res.status(404).json({
      success: false,
      verified: false,
      error: 'Jan Seva Card record not found in verified registry',
      portalUrl: `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(rawId)}`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Full /api/patient compatibility endpoint for external portals
router.get('/api/patient', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const search = String(req.query.search || '').trim();

    // Try external upstream first with short timeout
    try {
      const extRes = await callJanSevaApi('', {
        params: { page, limit, search },
        timeout: 4000
      });
      if (extRes.data && Array.isArray(extRes.data.patients)) {
        return res.json(extRes.data);
      }
    } catch {}

    // Fallback to local mirror + applications
    await ensureMirror();
    const offset = (page - 1) * limit;
    const [mirrorRows, totalRes] = await Promise.all([
      pool.query('SELECT record FROM jan_seva_card_mirror ORDER BY synced_at DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*)::int AS total FROM jan_seva_card_mirror')
    ]);

    const patients = mirrorRows.rows.map(r => r.record);
    res.json({
      success: true,
      patients,
      totalPatients: totalRes.rows[0]?.total || patients.length,
      totalPages: Math.ceil((totalRes.rows[0]?.total || patients.length) / limit),
      page,
      source: 'local-mirror'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================================================
// ADMIN CARD RETRIEVAL & MANAGEMENT
// =============================================================================

// Fetch all cards - STRICTLY ADMIN ONLY
router.get("/api/cards", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;
    const cacheKey = `cards:admin:${search}:${page}:${limit}`;
    const cachedData = getCached(cacheKey);

    if (cachedData) {
      return res.json(cachedData);
    }

    // 1. First, fetch from local Postgres applications
    const localApps = await pool.query(
      `SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" 
       FROM card_applications_v2 
       ORDER BY "submittedAt" DESC LIMIT $1 OFFSET $2`,
      [Number(limit), (Number(page) - 1) * Number(limit)]
    );

    // 2. Fetch from local mirror
    await ensureMirror();
    const mirrorApps = await pool.query(
      `SELECT card_no, record, source, synced_at 
       FROM jan_seva_card_mirror 
       ORDER BY synced_at DESC LIMIT $1 OFFSET $2`,
      [Number(limit), (Number(page) - 1) * Number(limit)]
    );

    // Format mirrored records to fit application shape
    const formattedMirror = mirrorApps.rows.map(m => {
      const rec = m.record || {};
      return {
        userId: rec.createdBy || m.card_no,
        name: rec.nameOfMember || rec.name || 'Mirrored Beneficiary',
        gender: rec.gender || '—',
        dob: rec.dob || '—',
        address: rec.address || `${rec.district || ''} ${rec.vidhanSabhaNo || ''}`.trim() || '—',
        idType: 'Aadhaar',
        idNumber: rec.aadhaarNo ? `******${String(rec.aadhaarNo).slice(-4)}` : '—',
        status: 'approved',
        cardNo: m.card_no,
        submittedAt: m.synced_at,
        source: m.source
      };
    });

    // Merge distinct by cardNo
    const combined = [...localApps.rows];
    const seenCards = new Set(localApps.rows.map(r => r.cardNo).filter(Boolean));

    for (const item of formattedMirror) {
      if (!seenCards.has(item.cardNo)) {
        combined.push(item);
        seenCards.add(item.cardNo);
      }
    }

    const payload = {
      success: true,
      applications: combined,
      totalLocal: localApps.rowCount,
      totalMirrored: mirrorApps.rowCount
    };

    setCached(cacheKey, payload, 15 * 1000);
    res.json(payload);
  } catch (error: any) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});

// Public impact totals
router.get("/api/public/cards/impact", async (_req, res) => {
  try {
    const cached = getCached("cards:public-impact");
    if (cached) return res.json(cached);

    let total = 0;
    let source = "mirror";

    try {
      await ensureMirror();
      const [mirrorCount, localApproved] = await Promise.all([
        pool.query('SELECT COUNT(*)::int AS count FROM jan_seva_card_mirror'),
        pool.query("SELECT COUNT(*)::int AS count FROM card_applications_v2 WHERE status = 'approved'")
      ]);
      total = (mirrorCount.rows[0]?.count || 0) + (localApproved.rows[0]?.count || 0);
    } catch {}

    const payload = {
      success: true,
      totalCards: total,
      source,
      portalUrl: JAN_SEVA_PORTAL_URL,
      updatedAt: new Date().toISOString()
    };

    setCached("cards:public-impact", payload, 120000);
    res.json(payload);
  } catch {
    res.status(503).json({ success: false, error: 'Card totals temporarily unavailable' });
  }
});

// Overall Stats - STRICTLY ADMIN ONLY
router.get("/api/cards/stats", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const cacheKey = "cards:stats";
    const cachedStats = getCached(cacheKey);
    if (cachedStats) return res.json(cachedStats);

    await ensureMirror();
    const [mirrorCount, pgStats] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM jan_seva_card_mirror'),
      pool.query(`SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected
        FROM card_applications_v2`)
    ]);

    const payload = {
      success: true,
      stats: {
        totalMirrored: mirrorCount.rows[0]?.count || 0,
        totalLocal: pgStats.rows[0]?.total || 0,
        approved: pgStats.rows[0]?.approved || 0,
        pending: pgStats.rows[0]?.pending || 0,
        rejected: pgStats.rows[0]?.rejected || 0,
        portalUrl: JAN_SEVA_PORTAL_URL,
        apiUrl: PRIMARY_JAN_SEVA_API
      }
    };

    setCached(cacheKey, payload, 30 * 1000);
    return res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search Card
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

    // 1. Search local Postgres applications
    const pgResult = await pool.query(
      'SELECT * FROM card_applications_v2 WHERE "cardNo" = $1 OR "idNumber" = $1 OR "userId" = $1 LIMIT 1',
      [q]
    );

    if (pgResult.rows.length > 0) {
      const payload = { success: true, patient: pgResult.rows[0], source: 'local-application' };
      setCached(cacheKey, payload, 60 * 1000);
      return res.json(payload);
    }

    // 2. Search local Postgres mirror
    await ensureMirror();
    const mirrorResult = await pool.query(
      `SELECT card_no, record, source, synced_at FROM jan_seva_card_mirror 
       WHERE card_no = $1 OR LOWER(record->>'aadhaarNo') = LOWER($1) OR LOWER(record->>'mobileNo') = LOWER($1) 
       LIMIT 1`,
      [q]
    );

    if (mirrorResult.rows.length > 0) {
      const payload = { success: true, patient: mirrorResult.rows[0].record, source: 'local-mirror' };
      setCached(cacheKey, payload, 60 * 1000);
      return res.json(payload);
    }

    // 3. Fallback to external API
    try {
      const response = await callJanSevaApi(`/${encodeURIComponent(q)}`, { timeout: 4000 });
      if (response.data) {
        const payload = { success: true, patient: response.data, source: 'external-api' };
        setCached(cacheKey, payload, 60 * 1000);
        return res.json(payload);
      }
    } catch {}

    res.json({ success: true, patient: null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Authenticated application
router.post("/api/cards", authenticateToken, async (req: any, res) => {
  try {
    const actorId = String(req.user?.id || req.user?.userId || '');
    if (!actorId) return res.status(401).json({ success: false, error: 'Login required' });
    const { name, gender, dob, address, idType, idNumber, mobileNo, district, vidhanSabhaNo } = req.body || {};
    if (!String(name || '').trim() || !/^\d{12}$/.test(String(idNumber || '')))
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
      const upstream = await callJanSevaApi('', {
        method: 'POST',
        data: {
          nameOfMember: name, gender, dob, mobileNo, aadhaarNo: idNumber,
          district, vidhanSabhaNo, addressType: 'Urban', createdBy: actorId
        },
        timeout: 10000
      });
      if (upstream.data?.cardNo) cardNo = String(upstream.data.cardNo);
    } catch (error: any) {
      console.warn('Jan Seva upstream application submission fallback:', error?.message);
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
    res.status(cardNo ? 201 : 202).json({
      success: true,
      status,
      cardNo,
      portalUrl: cardNo ? `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(cardNo)}` : null,
      message: cardNo ? 'Card issued by authorized API' : 'Application received; pending verification'
    });
  } catch (error: any) {
    console.error('Jan Seva application failed:', error?.code || error?.message);
    res.status(500).json({ success: false, error: 'Unable to submit application' });
  }
});

// Admin Approval
router.post("/api/cards/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = String(req.body?.userId || '').trim();
    const cardNo = String(req.body?.cardNo || '').trim();
    if (!userId || !cardNo || cardNo.length > 100)
      return res.status(400).json({ success: false, error: 'Verified user ID and issued card number required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [cardNo]);
      
      const assigned = await client.query(
        'SELECT "userId" FROM card_applications_v2 WHERE "cardNo" = $1 AND "userId" <> $2 LIMIT 1',
        [cardNo, userId]
      );
      if (assigned.rows.length) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, error: 'This card is already linked to another account' });
      }

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
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    cardCache.clear();
    await writeAuditLog(req, 'JAN_SEVA_CARD_APPROVED', 'card_application', userId, { cardNo });
    res.json({
      success: true,
      cardNo,
      portalUrl: `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(cardNo)}`
    });
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
    await writeAuditLog(req, 'JAN_SEVA_CARD_REJECTED', 'card_application', String(userId || ''), {});
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

    const app = result.rows[0] || null;
    const payload = {
      success: true,
      application: app,
      portalUrl: app?.cardNo ? `${JAN_SEVA_PORTAL_URL}/verify?id=${encodeURIComponent(app.cardNo)}` : null
    };

    setCached(cacheKey, payload, 30 * 1000);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
