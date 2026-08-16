import express from 'express';
import crypto from 'crypto';
import { pool } from '../db/dbPool.js';
import { authenticateToken } from '../db/middleware.js';

const router = express.Router();

// Process-level liveness endpoint: deliberately does not touch PostgreSQL,
// authentication, or any external service so cPanel/Passenger can distinguish
// a live Node process from an application/database failure.
router.get('/api/liveness', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'rpf-app',
    timestamp: new Date().toISOString(),
  });
});

// This router is mounted before healthRoutes in server.ts. These guarded
// endpoints therefore prevent legacy healthRoutes fallback/demo data from
// reaching clients until that legacy module is fully retired.
router.get('/api/health-vitals', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM health_vitals WHERE user_id = $1', [req.user.id]);
    return res.json({ success: true, data: result.rows[0] ?? null });
  } catch (error: any) {
    console.error('health-vitals read failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to load health data' });
  }
});

router.post('/api/health-vitals', authenticateToken, async (req: any, res: any) => {
  try {
    const allowedFields = [
      'steps', 'water_cups', 'calories', 'exercise_mins', 'weight', 'height',
      'bmi', 'sleep_hours', 'heart_rate', 'sleep_cycle', 'period_day', 'pregnancy_week'
    ];
    const values: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined && req.body?.[field] !== null) values[field] = req.body[field];
    }

    if (Object.keys(values).length === 0) {
      return res.status(400).json({ success: false, error: 'At least one health value is required' });
    }

    const columns = Object.keys(values);
    const params = [req.user.id, ...columns.map((column) => values[column])];
    const insertColumns = ['user_id', ...columns, 'updated_at'];
    const placeholders = ['$1', ...columns.map((_, index) => `$${index + 2}`), 'NOW()'];
    const updates = columns.map((column, index) => `"${column}" = $${index + 2}`).join(', ');

    await pool.query(
      `INSERT INTO health_vitals (${insertColumns.map((column) => `"${column}"`).join(', ')})
       VALUES (${placeholders.join(', ')})
       ON CONFLICT (user_id) DO UPDATE SET ${updates}, updated_at = NOW()`,
      params,
    );

    return res.json({ success: true });
  } catch (error: any) {
    console.error('health-vitals write failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to save health data' });
  }
});

// Never expose fabricated child profile values when the user has no record.
router.get('/api/pediatric', authenticateToken, async (req: any, res: any) => {
  try {
    const [profile, vaccines] = await Promise.all([
      pool.query('SELECT * FROM pediatric_profile WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT * FROM vaccine_status WHERE user_id = $1', [req.user.id]),
    ]);
    return res.json({ success: true, profile: profile.rows[0] ?? null, vaccines: vaccines.rows });
  } catch (error: any) {
    console.error('pediatric read failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to load child health data' });
  }
});

// Donor registration contains personal contact information and must require
// authentication. Verification must never be inferred from the request body.
router.post('/api/blood_donors', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, bloodGroup, phone, location, lastDonated } = req.body ?? {};
    if (!name || !bloodGroup || !phone) {
      return res.status(400).json({ success: false, error: 'Name, blood group and phone are required' });
    }

    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors
       (id, name, "bloodGroup", phone, location, verified, distance, "lastDonated", "createdAt")
       VALUES ($1, $2, $3, $4, $5, false, NULL, $6, NOW())`,
      [id, String(name).trim(), String(bloodGroup).trim().toUpperCase(), String(phone).trim(), location || null, lastDonated || null],
    );

    return res.status(201).json({ success: true, id });
  } catch (error: any) {
    console.error('blood donor registration failed:', error);
    return res.status(500).json({ success: false, error: 'Unable to register donor' });
  }
});

export default router;
