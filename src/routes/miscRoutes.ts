import express from 'express';
import { queryExternalSearch } from '../lib/externalSearch';
import { apiCache, CACHE_TTL } from '../lib/apiCache';
import { pool } from '../db/dbPool.js';
import { authenticateToken } from '../db/middleware.js';

const router = express.Router();

router.get('/api/search/external', async (req, res) => {
  try {
    const q = (req.query.q || req.query.query) as string;
    if (!q) return res.status(400).json({ success: false, error: 'Missing search query' });
    const results = await queryExternalSearch(q);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error('External search API error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real per-user notifications. CMS notifications are content, not user activity.
router.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = String((req as any).user?.id || '').trim();
    if (!userId) return res.status(401).json({ success: false, error: 'Authenticated user is required' });
    const result = await pool.query(`
      SELECT id, title, message, type, reference_id, is_read, created_at
      FROM app_notifications
      WHERE recipient_id = $1
      ORDER BY created_at DESC
      LIMIT 100`, [userId]);
    res.json({ notifications: result.rows.map((row: any) => ({
      id: String(row.id),
      type: row.type === 'blood_request' ? 'urgent' : row.type === 'success' ? 'success' : 'info',
      titleEn: row.title,
      titleHi: row.title,
      bodyEn: row.message,
      bodyHi: row.message,
      createdAt: row.created_at,
      read: Boolean(row.is_read),
      referenceId: row.reference_id || null,
    })) });
  } catch (err: any) {
    console.error('User notifications API error:', err);
    res.status(500).json({ success: false, error: 'Unable to load notifications' });
  }
});

router.post('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = String((req as any).user?.id || '').trim();
    const notificationId = String(req.params.id || '').trim();
    if (!userId || !notificationId) return res.status(400).json({ success: false, error: 'Invalid notification' });
    const result = await pool.query(`
      UPDATE app_notifications SET is_read = TRUE
      WHERE id = $1 AND recipient_id = $2
      RETURNING id`, [notificationId, userId]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'Notification not found' });
    res.json({ success: true });
  } catch (err: any) {
    console.error('Notification read API error:', err);
    res.status(500).json({ success: false, error: 'Unable to update notification' });
  }
});

router.get('/api/testimonials', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings WHERE id = $1', ['cms_data']);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// Statistics are calculated only from real database records. No synthetic offsets.
router.get('/api/stats', async (_req, res) => {
  const cached = apiCache.get('/api/stats');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);
  try {
    const [beneficiaries, volunteers, healthCamps, campaigns] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM card_applications_v2 WHERE status = 'approved'"),
      pool.query("SELECT COUNT(*) FROM volunteers WHERE status = 'approved'"),
      pool.query('SELECT COUNT(*) FROM health_camps'),
      pool.query(`SELECT COUNT(*) FROM service_submissions_v2 WHERE "serviceName" = 'Campaigns' OR "serviceNameEn" = 'Campaigns'`),
    ]);
    const data = {
      beneficiaries: Number(beneficiaries.rows[0].count),
      volunteers: Number(volunteers.rows[0].count),
      healthCamps: Number(healthCamps.rows[0].count),
      campaigns: Number(campaigns.rows[0].count),
    };
    apiCache.set('/api/stats', { data, timestamp: Date.now() });
    res.json(data);
  } catch (error: any) {
    console.error('Stats API error:', error);
    res.status(500).json({ success: false, error: 'Unable to load verified statistics' });
  }
});

// Jobs must come from the real jobs database. Never seed fabricated listings automatically.
router.get('/api/jobs', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM job_listings ORDER BY posted_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Panchang must not silently invent astronomical/calendar values. Until a verified
// Panchang provider or curated calendar is configured, return an explicit unavailable state.
router.get('/api/culture/panchang', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query('SELECT * FROM panchang_calendar WHERE date = $1', [today]);
    if (!result.rows.length) {
      return res.status(503).json({
        success: false,
        error: 'Verified Panchang data is not available for today.',
        date: today,
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching panchang:', err);
    res.status(500).json({ error: 'Failed to fetch panchang' });
  }
});

// AI chat is implemented by aiRoutes.ts. The legacy canned-response implementation
// previously in this file has been removed so there is only one authoritative AI path.

export default router;
