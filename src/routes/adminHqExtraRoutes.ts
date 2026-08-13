import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole } from '../db/middleware.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

router.put("/api/admin/hq/credentials", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    const body = req.body || {};
    const { username, newPassword } = body;
    if (!username || !newPassword) return res.status(400).json({ error: "Missing username or password" });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin'`, [username, hash]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public certificate verification metadata only.
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

router.put("/api/admin/hq/certificates/signatures", authenticateToken, requireAdmin, async (req, res) => {
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

router.post("/api/admin/hq/certificates/issue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body;
    if (!volunteer_id || !service_id) return res.status(400).json({ error: "Volunteer and service are required." });

    // Use a cryptographically random identifier instead of a 4-digit Math.random()
    // value, which made certificate IDs easy to enumerate.
    const certId = `RP-${new Date().getFullYear()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const realVolId = volRes.rows[0].id;
    const existing = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Certificate already issued for this service." });
    const result = await pool.query(`INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`, [certId, realVolId, service_id]);
    res.json({ success: true, certificate: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/api/admin/hq/services/:id/content", authenticateToken, requireAdmin, async (req, res) => {
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

// SECURITY: shadow the legacy admin settings handlers with a safe implementation.
// The legacy POST accepted arbitrary object keys as SQL identifiers.
const ADMIN_SETTINGS_COLUMNS = new Set([
  'splash_animation', 'splash_logo', 'splash_duration', 'login_bg_image',
  'social_login_enabled', 'marquee_text', 'marquee_speed', 'marquee_color',
  'marquee_bg_color', 'primary_color', 'secondary_color', 'font_family',
  'hero_type', 'hero_media_url', 'show_widgets', 'show_notices',
  'founder_image', 'founder_message'
]);

router.get("/api/admin/settings", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM app_settings WHERE id = 1');
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err: any) {
    console.error('Admin settings read error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

router.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
    const entries = Object.entries(updates).filter(([key]) => ADMIN_SETTINGS_COLUMNS.has(key));
    if (entries.length === 0) return res.status(400).json({ success: false, error: 'No valid settings fields supplied' });

    const setClause: string[] = [];
    const values: unknown[] = [];
    for (const [key, value] of entries) {
      setClause.push(`"${key}" = $${values.length + 1}`);
      values.push(value);
    }
    values.push(1);
    const result = await pool.query(
      `UPDATE app_settings SET ${setClause.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err: any) {
    console.error('Admin settings update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

export default router;
