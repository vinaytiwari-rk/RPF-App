import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2'
    );
    res.json({ applications: result.rows });
  } catch (error: any) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/cards", async (req, res) => {
    try {
      const { userId, name, gender, dob, address, idType, idNumber, status } = req.body;
      const submittedAt = new Date().toISOString();
      const id = crypto.randomUUID();
      await pool.query(
        `INSERT INTO card_applications_v2 
         (id, "userId", name, gender, dob, address, "idType", "idNumber", status, "submittedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          userId || "guest",
          name,
          gender,
          dob,
          address,
          idType,
          idNumber,
          status || "pending",
          submittedAt
        ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/cards/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `JSC-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
      ["approved", cardNo, userId]
    );
    // update user table janSevaCardStatus
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
    // update user table janSevaCardStatus
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

router.get("/api/cards/download/:id", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=JanSevaCard_${req.params.id}.pdf`);
    res.send(Buffer.from("%PDF-1.4 ... MOCK JAN SEVA CARD PDF FOR ID " + req.params.id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
