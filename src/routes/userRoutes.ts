import express from 'express';
import { USER_PRIVILEGED_FIELDS } from '../lib/userFields';

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, points, badges, "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor", "onboardingCompleted", "registeredAt" FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/users/:id/update", authenticateToken, async (req: any, res) => {
  try {
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "superadmin" || req.user.role === "super_admin");
    if (!isAdmin && req.user?.id !== req.params.id) {
      return res.status(403).json({ success: false, error: "You can only update your own profile" });
    }

    let fields = Object.keys(req.body);
    if (!isAdmin) {
      fields = fields.filter(f => !USER_PRIVILEGED_FIELDS.has(f));
    }
    if (fields.length === 0) {
      return res.json({ success: true });
    }
    const setClause = fields
      .map((field, idx) => `"${field}" = $${idx + 1}`)
      .join(", ");
    const values = fields.map(field => req.body[field]);
    values.push(req.params.id);

    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
