import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/campaigns", async (req, res) => {
  const cached = apiCache.get("/api/campaigns");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    const data = { campaigns: result.rows };
    apiCache.set("/api/campaigns", { data, timestamp: Date.now() });
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO campaigns 
       (id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        new Date().toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/campaigns/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    await pool.query(
      `UPDATE campaigns SET 
       "titleEn" = $1, "titleHi" = $2, "goalAmount" = $3, "raisedAmount" = $4, 
       "imageUrl" = $5, "coverImgUrl" = $6, urgent = $7 
       WHERE id = $8`,
      [
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error editing campaign:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/campaigns/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
