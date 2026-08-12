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

router.post("/api/support_requests", async (req, res) => {
  try {
    const { citizenName, citizenPhone, requestType, location, description, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO support_requests (id, "citizenName", "citizenPhone", "requestType", location, description, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, citizenName, citizenPhone, requestType, location, description, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/sos_alerts", async (req, res) => {
  try {
    const { citizenName, citizenPhone, location, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO sos_alerts (id, "citizenName", "citizenPhone", location, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, citizenName, citizenPhone, location, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/grievances", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "audioUrl", "videoUrl", "imageUrl", created_at AS "createdAt" FROM grievances ORDER BY created_at DESC'
    );
    res.json({ grievances: result.rows });
  } catch (error: any) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/grievances", async (req, res) => {
  try {
    const { title, description, category, urgency, location, reportedBy, citizenName, status, date, aiSummary, audioUrl, videoUrl, imageUrl } = req.body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO grievances 
       (id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "audioUrl", "videoUrl", "imageUrl") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING id`,
      [
        id,
        title,
        description,
        category,
        urgency,
        location,
        reportedBy,
        status || "Pending",
        date || new Date().toLocaleDateString(),
        aiSummary || "",
        audioUrl || "",
        videoUrl || "",
        imageUrl || ""
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Error creating grievance:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/grievances/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.query('UPDATE grievances SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/grievances/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM grievances WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
