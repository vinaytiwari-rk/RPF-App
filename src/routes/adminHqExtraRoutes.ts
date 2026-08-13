import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import bcrypt from 'bcryptjs';
import { apiCache } from '../lib/apiCache.js';

const router = express.Router();

router.put("/api/admin/hq/credentials", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, newPassword } = req.body || {};
    if (!username || !newPassword) return res.status(400).json({ success: false, error: "Missing username or password" });
    const hash = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(`UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin' RETURNING username`, [String(username).trim(), hash]);
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: "Administrator account not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// These canonical endpoints are registered before the legacy dynamic admin routes.
router.get("/api/admin/settings", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    res.json({ success: true, data: result.rows[0] || {} });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body || {};
    const allowedColumns = new Set([
      "tollFree", "webUrl", "email", "founderMessageEn", "founderMessageHi",
      "helplinesMarquee", "founderImgUrl", "alertBannerEn", "alertBannerHi",
      "carouselSlides", "customServices", "logo_image", "logoImgUrl"
    ]);
    const entries = Object.entries(updates).filter(([key]) => allowedColumns.has(key));
    if (entries.length === 0) return res.status(400).json({ success: false, error: "No valid settings supplied." });
    const setClause = entries.map(([key], index) => `"${key}" = $${index + 1}`).join(', ');
    const values = entries.map(([, value]) => value);
    const result = await pool.query(`UPDATE app_settings SET ${setClause} WHERE id = 1 RETURNING *`, values);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Settings row not found." });
    apiCache.delete("admin_settings");
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Admin settings save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/admin/volunteers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const countResult = await pool.query(`SELECT COUNT(*)::int AS count FROM volunteers`);
    const totalCount = countResult.rows[0]?.count || 0;
    const result = await pool.query(
      `SELECT id, full_name AS name, username, mobile, email, approval_status AS status, registration_number, created_at
       FROM volunteers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, data: result.rows, totalPages: Math.max(1, Math.ceil(totalCount / limit)), currentPage: page });
  } catch (err: any) {
    console.error("Admin volunteers fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/api/admin/volunteers/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const status = String(req.body?.status || '').trim().toLowerCase();
    const allowed = new Set(["pending", "approved", "rejected", "active", "inactive"]);
    if (!allowed.has(status)) return res.status(400).json({ success: false, error: "Invalid volunteer status." });
    const result = await pool.query(
      `UPDATE volunteers SET approval_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, full_name AS name, username, mobile, email, approval_status AS status, registration_number, created_at`,
      [status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Volunteer not found." });
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Admin volunteer status error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) return res.json({ success: true, data: { service_id, signatory_1_name: 'Rohit Pandit', signatory_1_designation: 'Founder', signatory_2_name: '', signatory_2_designation: '' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/api/admin/hq/certificates/signatures", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body;
    if (!service_id || !signatory_1_name || !signatory_1_designation) return res.status(400).json({ success: false, error: "Service, first signatory name and designation are required." });
    const result = await pool.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
        signatory_1_name = EXCLUDED.signatory_1_name,
        signatory_1_designation = EXCLUDED.signatory_1_designation,
        signatory_2_name = EXCLUDED.signatory_2_name,
        signatory_2_designation = EXCLUDED.signatory_2_designation
      RETURNING *
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name || null, signatory_2_designation || null]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/hq/certificates/issue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body;
    if (!volunteer_id || !service_id) return res.status(400).json({ success: false, error: "Volunteer and service are required." });
    const certId = "RP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ success: false, error: "Volunteer not found" });
    const realVolId = volRes.rows[0].id;
    const existing = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(409).json({ success: false, error: "Certificate already issued for this service." });
    const result = await pool.query(`INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`, [certId, realVolId, service_id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/api/admin/hq/services/:id/content", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, action_url } = req.body || {};
    if (!content || typeof content !== 'object' || Array.isArray(content)) return res.status(400).json({ success: false, error: "Content must be an object keyed by language code." });
    const result = await pool.query(`
      INSERT INTO service_content (service_id, content, action_url, updated_at)
      VALUES ($1, $2::jsonb, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (service_id) DO UPDATE SET content = EXCLUDED.content, action_url = EXCLUDED.action_url, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [id, JSON.stringify(content), action_url || null]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    console.error("Service content save error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/api/admin/hq/donations", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
