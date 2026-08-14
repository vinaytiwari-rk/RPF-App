import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, auditEvent } from '../db/middleware.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

// Public certificate verification metadata only. Do not fabricate a signature record
// when no record exists; absence must remain explicit and verifiable.
router.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool.query(`SELECT service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "No certificate signature configuration exists for this service." });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to fetch certificate signature metadata." });
  }
});

// All remaining administrator routes in this legacy compatibility router are protected.
// This also prevents the subsequently-mounted adminDynamicRoutes router from exposing
// unprotected /api/admin/* reads through route fall-through.
router.use("/api/admin", authenticateToken, requireAdmin);

router.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const body = req.body || {};
    const { username, newPassword } = body;
    if (!username || !newPassword) return res.status(400).json({ success: false, error: "Username and password are required." });
    if (String(newPassword).length < 12) return res.status(400).json({ success: false, error: "Administrator password must be at least 12 characters." });

    const hash = await bcrypt.hash(String(newPassword), 12);
    const result = await pool.query(`UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin' RETURNING id, username`, [String(username).trim(), hash]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: "Administrator credential record not found." });

    await auditEvent({ userId: String(req.user?.id || ""), action: "admin_credentials_updated", resource: "admin_credentials", req });
    return res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to update administrator credentials." });
  }
});

router.put("/api/admin/hq/certificates/signatures", async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body || {};
    if (!service_id || !signatory_1_name || !signatory_1_designation) {
      return res.status(400).json({ success: false, error: "Service and primary signatory details are required." });
    }
    await pool.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
        signatory_1_name = EXCLUDED.signatory_1_name,
        signatory_1_designation = EXCLUDED.signatory_1_designation,
        signatory_2_name = EXCLUDED.signatory_2_name,
        signatory_2_designation = EXCLUDED.signatory_2_designation
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name ?? null, signatory_2_designation ?? null]);
    await auditEvent({ userId: String(req.user?.id || ""), action: "certificate_signature_updated", resource: "service_signatures", resourceId: String(service_id), req });
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to update certificate signature configuration." });
  }
});

router.post("/api/admin/hq/certificates/issue", async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body || {};
    if (!volunteer_id || !service_id) return res.status(400).json({ success: false, error: "Volunteer and service are required." });

    const certId = `RP-${new Date().getFullYear()}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ success: false, error: "Volunteer not found." });
    const realVolId = volRes.rows[0].id;
    const existing = await pool.query(`SELECT 1 FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(409).json({ success: false, error: "Certificate already issued for this service." });
    const result = await pool.query(`INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`, [certId, realVolId, service_id]);
    await auditEvent({ userId: String(req.user?.id || ""), action: "certificate_issued", resource: "certificate", resourceId: String(result.rows[0].id ?? certId), req, metadata: { volunteer_id: realVolId, service_id } });
    return res.json({ success: true, certificate: result.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to issue certificate." });
  }
});

// Canonical service-content contract is implemented by adminHqRoutes.ts.
// The old content_en/content_hi contract has intentionally been removed.

router.get("/api/admin/hq/donations", async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donations ORDER BY "createdAt" DESC');
    return res.json({ success: true, donations: result.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Failed to fetch donations." });
  }
});

const ADMIN_SETTINGS_COLUMNS = new Set([
  'splash_animation', 'splash_logo', 'splash_duration', 'login_bg_image',
  'social_login_enabled', 'marquee_text', 'marquee_speed', 'marquee_color',
  'marquee_bg_color', 'primary_color', 'secondary_color', 'font_family',
  'hero_type', 'hero_media_url', 'show_widgets', 'show_notices',
  'founder_image', 'founder_message'
]);

router.get("/api/admin/settings", async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM app_settings WHERE id = 1');
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err: any) {
    console.error('Admin settings read error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

router.post("/api/admin/settings", async (req, res) => {
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

    await auditEvent({ userId: String(req.user?.id || ""), action: "admin_settings_updated", resource: "app_settings", req, metadata: { fields_updated: entries.map(([key]) => key) } });
    return res.json({ success: true, data: result.rows[0] || {} });
  } catch (err: any) {
    console.error('Admin settings update error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update settings' });
  }
});

export default router;
