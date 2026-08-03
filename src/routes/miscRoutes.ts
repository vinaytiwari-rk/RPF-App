import express from 'express';
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
    if (!q) {
      return res.status(400).json({ success: false, error: "Missing search query" });
    }
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
      return res.json({ notifications: parsed.notifications || [] });
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
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/stats", async (req, res) => {
  const cached = apiCache.get("/api/stats");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;

  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications_v2");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const sRes = await pool.query(`
      SELECT COUNT(*) FROM service_submissions_v2 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {}

  const data = {
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  };
  apiCache.set("/api/stats", { data, timestamp: Date.now() });
  res.json(data);
});

export default router;
