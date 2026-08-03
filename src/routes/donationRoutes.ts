import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.post("/api/donations", async (req, res) => {
  try {
    const { userId, donorName, donorEmail, amount, campaignId } = req.body;
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    await pool.query(
      'INSERT INTO donations ("userId", "donorName", "donorEmail", amount, "campaignId", "transactionId", status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId || null, donorName, donorEmail || null, amount, campaignId || null, transactionId, 'success']
    );

    if (userId) {
      await pool.query(
        'UPDATE users SET "isDonor" = true WHERE id = $1',
        [userId]
      );
    }

    if (campaignId) {
      await pool.query(
        'UPDATE campaigns SET raised = COALESCE(raised, 0) + $1 WHERE id = $2',
        [amount, campaignId]
      );
    }

    res.json({ success: true, transactionId, message: "Donation recorded successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
