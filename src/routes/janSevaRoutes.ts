import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

const JAN_SEVA_API_BASE = process.env.JAN_SEVA_API_URL || 'https://api.therpfoundation.org/api/patient';

// Fetch all cards / search cards (bridges with master Jan Seva MongoDB API)
router.get("/api/cards", async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    try {
      const response = await axios.get(`${JAN_SEVA_API_BASE}`, {
        params: { search, page, limit },
        timeout: 5000
      });
      if (response.data && response.data.patients) {
        return res.json({ 
          success: true, 
          applications: response.data.patients,
          totalPatients: response.data.totalPatients,
          totalPages: response.data.totalPages
        });
      }
    } catch (apiErr: any) {
      console.warn("Jan Seva external API query failed, falling back to local PG:", apiErr.message);
    }

    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 ORDER BY "submittedAt" DESC'
    );
    res.json({ success: true, applications: result.rows });
  } catch (error: any) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});

// Overall Stats (Total 66,505+ records)
router.get("/api/cards/stats", async (req, res) => {
  try {
    const response = await axios.get(`${JAN_SEVA_API_BASE}/stats`, { timeout: 5000 });
    return res.json({ success: true, stats: response.data });
  } catch (error: any) {
    const pgCount = await pool.query('SELECT COUNT(*) FROM card_applications_v2');
    res.json({ success: true, stats: { total: parseInt(pgCount.rows[0]?.count || '0', 10), newToday: 0, thisWeek: 0 } });
  }
});

// Search by CardNo, Aadhaar, Mobile across 66,505 dataset
router.get("/api/cards/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "Query parameter required" });

    try {
      const response = await axios.get(`${JAN_SEVA_API_BASE}/${query}`, { timeout: 5000 });
      if (response.data) {
        return res.json({ success: true, patient: response.data });
      }
    } catch {}

    const result = await pool.query(
      'SELECT * FROM card_applications_v2 WHERE "cardNo" = $1 OR "idNumber" = $1',
      [query]
    );
    res.json({ success: true, patient: result.rows[0] || null });
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
      }, { timeout: 5000 });

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

    res.json({ success: true, cardNo });
  } catch (error: any) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});

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
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/cards/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM card_applications_v2 WHERE "userId" = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/cards/my", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 WHERE "userId" = $1',
      [userId]
    );
    res.json({ success: true, application: result.rows[0] || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
