import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const body = req.body || {};
    const { username, newPassword } = body;
    if (!username || !newPassword) return res.status(400).json({ error: "Missing username or password" });
    
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin'`,
      [username, hash]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { service_id, signatory_1_name: 'Rohit Pandit', signatory_1_designation: 'Founder', signatory_2_name: '', signatory_2_designation: '' } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/api/admin/hq/certificates/signatures", async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body;
    await pool.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
      signatory_1_name = EXCLUDED.signatory_1_name,
      signatory_1_designation = EXCLUDED.signatory_1_designation,
      signatory_2_name = EXCLUDED.signatory_2_name,
      signatory_2_designation = EXCLUDED.signatory_2_designation
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/admin/hq/certificates/issue", async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body;
    const certId = "RP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    
    // Validate volunteer
    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const realVolId = volRes.rows[0].id;

    // Check if already issued
    const existing = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Certificate already issued for this service." });

    const result = await pool.query(
      `INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`,
      [certId, realVolId, service_id]
    );
    res.json({ success: true, certificate: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/api/admin/hq/services/:id/content", async (req, res) => {
  try {
    const body = req.body || {};
    const { id } = req.params;
    const { content_en, content_hi, action_label_en, action_label_hi, action_url } = body;
    
    await pool.query(`
      INSERT INTO service_content (service_id, content_en, content_hi, action_label_en, action_label_hi, action_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (service_id) DO UPDATE SET 
        content_en = EXCLUDED.content_en,
        content_hi = EXCLUDED.content_hi,
        action_label_en = EXCLUDED.action_label_en,
        action_label_hi = EXCLUDED.action_label_hi,
        action_url = EXCLUDED.action_url,
        updated_at = CURRENT_TIMESTAMP
    `, [id, content_en, content_hi, action_label_en, action_label_hi, action_url]);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/admin/hq/donations", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY "createdAt" DESC');
    res.json({ success: true, donations: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
