import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

const JAN_SEVA_API_BASE = process.env.JAN_SEVA_API_URL || 'https://api.therpfoundation.org/api/patient';

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

// Create Jan Seva Card
router.post("/api/cards", async (req, res) => {
  try {
    const { userId, name, gender, dob, address, idType, idNumber, mobileNo, district, vidhanSabhaNo } = req.body;
    
    if (idType === "aadhaar" || idNumber) {
      const existing = await pool.query('SELECT "cardNo" FROM card_applications_v2 WHERE "idNumber" = $1', [idNumber]);
      if (existing.rows.length > 0) {
         return res.status(400).json({ success: false, error: "A card with this ID number already exists.", cardNo: existing.rows[0].cardNo });
      }
    }

    const submittedAt = new Date().toISOString();
    const id = crypto.randomUUID();
    const status = "approved"; // Instant generation

    let cardNo = "";
    try {
      const apiResponse = await axios.post(`${JAN_SEVA_API_BASE}`, {
        nameOfMember: name,
        gender,
        dob,
        mobileNo,
        aadhaarNo: idNumber,
        district,
        vidhanSabhaNo: vidhanSabhaNo || "0000",
        addressType: "Urban",
        createdBy: userId || "web_user"
      }, { timeout: 4000 });

      if (apiResponse.data && apiResponse.data.cardNo) {
        cardNo = apiResponse.data.cardNo;
      }
    } catch (apiErr: any) {
      console.warn("Failed to create on Mongo master API, generating local cardNo:", apiErr.message);
    }

    if (!cardNo) {
      cardNo = `0001${(vidhanSabhaNo || '0000').padStart(4, '0')}0001${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await pool.query(
      `INSERT INTO card_applications_v2 
       (id, "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, userId || "guest", name, gender, dob, address, idType || "aadhaar", idNumber, status, cardNo, submittedAt]
    );

    if (userId && userId !== "guest") {
      await pool.query(
        'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
        ["approved", cardNo, userId]
      );
    }

    cardCache.delete("cards:stats");
    res.json({ success: true, cardNo });
  } catch (error: any) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Approval & Management Routes
router.post("/api/cards/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `000100000001${Math.floor(1000 + Math.random() * 9000)}`;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
      ["approved", cardNo, userId]
    );
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
      ["approved", cardNo, userId]
    );
    cardCache.clear();
    res.json({ success: true, cardNo });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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
