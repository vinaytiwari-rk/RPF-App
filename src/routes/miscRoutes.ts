import express from 'express';
import { queryExternalSearch } from '../lib/externalSearch';
import { apiCache, CACHE_TTL } from '../lib/apiCache';

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/search/external", async (req, res) => {
  try {
    const q = (req.query.q || req.query.query) as string;
    if (!q) return res.status(400).json({ success: false, error: "Missing search query" });
    const results = await queryExternalSearch(q);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error("External search API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/notifications", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [] });
    }
    res.json({ notifications: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/testimonials", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : [] });
    }
    res.json({ testimonials: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/stats", async (req, res) => {
  const cached = apiCache.get("/api/stats");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);

  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let campaigns = 0;

  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications_v2");
    beneficiaries = parseInt(bRes.rows[0].count, 10) || 0;
  } catch (e) {}
  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10) || 0;
  } catch (e) {}
  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10) || 0;
  } catch (e) {}
  try {
    const sRes = await pool.query(`
      SELECT COUNT(*) FROM service_submissions_v2
      WHERE "serviceName" = 'Scholarships Support'
         OR "serviceNameEn" = 'Scholarships Support'
         OR "serviceName" = 'Campaigns'
    `);
    campaigns = parseInt(sRes.rows[0].count, 10) || 0;
  } catch (e) {}

  const data = { beneficiaries, volunteers, healthCamps, campaigns };
  apiCache.set("/api/stats", { data, timestamp: Date.now() });
  res.json(data);
});

// Jobs are database-backed only. Empty tables intentionally return an empty list;
// the API must never seed fictional listings into production data.
router.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM job_listings ORDER BY posted_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Panchang is database-backed only. No fabricated daily values are inserted.
router.get('/api/culture/panchang', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query("SELECT * FROM panchang_calendar WHERE date = $1", [today]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Panchang data is not available for today" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching panchang:", err);
    res.status(500).json({ error: "Failed to fetch panchang" });
  }
});

// AI chat remains an API integration point; this route must not pretend to be a real AI service.
router.post('/api/ai/chat', async (req, res) => {
  return res.status(503).json({ error: "AI assistant is not configured" });
});

router.get('/api/ai/chat/history', authenticateToken, async (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    const result = await pool.query(
      "SELECT role, content FROM chat_history WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 50",
      [sessionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export default router;
