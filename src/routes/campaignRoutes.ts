import express from 'express';
import { apiCache, CACHE_TTL } from '../lib/apiCache';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import crypto from 'crypto';

const router = express.Router();

function invalidateCampaignCache() {
  apiCache.delete('/api/campaigns');
}

function invalidateMetricsCache() {
  apiCache.delete('/api/metrics');
}

function getAdminId(req: any): string | null {
  return req.user?.id || req.user?.userId || null;
}

// Public: only administrator-published campaigns are visible to users.
router.get('/api/campaigns', async (_req, res) => {
  const cached = apiCache.get('/api/campaigns');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);
  try {
    const result = await pool.query(`SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt", "updatedAt", "publishedAt" FROM campaigns WHERE published = TRUE ORDER BY "createdAt" DESC`);
    const data = { campaigns: result.rows };
    apiCache.set('/api/campaigns', { data, timestamp: Date.now() });
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching published campaigns:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: view both drafts and published campaigns.
router.get('/api/admin/campaigns', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt", "updatedAt", published, "publishedAt", "publishedBy" FROM campaigns ORDER BY "createdAt" DESC`);
    res.json({ campaigns: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: every new campaign starts as a draft.
router.post('/api/campaigns', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    if (!String(titleEn || '').trim()) return res.status(400).json({ error: 'Campaign title is required' });
    const id = crypto.randomUUID();
    await pool.query(`INSERT INTO campaigns (id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt", "updatedAt", published) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW(),FALSE)`, [id, String(titleEn).trim(), titleHi ? String(titleHi).trim() : null, Number(goalAmount) || 0, Number(raisedAmount) || 0, imageUrl || '', imageUrl || '', !!urgent]);
    invalidateCampaignCache();
    res.status(201).json({ success: true, id, status: 'DRAFT' });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: editing a campaign always returns it to draft and requires republishing.
router.post('/api/campaigns/:id/edit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    if (!String(titleEn || '').trim()) return res.status(400).json({ error: 'Campaign title is required' });
    const result = await pool.query(`UPDATE campaigns SET "titleEn"=$1,"titleHi"=$2,"goalAmount"=$3,"raisedAmount"=$4,"imageUrl"=$5,"coverImgUrl"=$6,urgent=$7,"updatedAt"=NOW(),published=FALSE,"publishedAt"=NULL,"publishedBy"=NULL WHERE id=$8 RETURNING id`, [String(titleEn).trim(), titleHi ? String(titleHi).trim() : null, Number(goalAmount) || 0, Number(raisedAmount) || 0, imageUrl || '', imageUrl || '', !!urgent, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Campaign not found' });
    invalidateCampaignCache();
    res.json({ success: true, status: 'DRAFT' });
  } catch (error: any) {
    console.error('Error editing campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: explicit publication action. Only this route makes a campaign public.
router.post('/api/campaigns/:id/publish', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const publisherId = getAdminId(req);
    if (!publisherId) return res.status(401).json({ error: 'Authenticated administrator identity is required to publish' });
    const result = await pool.query(`UPDATE campaigns SET published=TRUE,"publishedAt"=NOW(),"publishedBy"=$1,"updatedAt"=NOW() WHERE id=$2 RETURNING id,published,"publishedAt","publishedBy"`, [publisherId, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Campaign not found' });
    invalidateCampaignCache();
    res.json({ success: true, status: 'PUBLISHED', campaign: result.rows[0] });
  } catch (error: any) {
    console.error('Error publishing campaign:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/campaigns/:id/unpublish', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`UPDATE campaigns SET published=FALSE,"publishedAt"=NULL,"publishedBy"=NULL,"updatedAt"=NOW() WHERE id=$1 RETURNING id,published`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Campaign not found' });
    invalidateCampaignCache();
    res.json({ success: true, status: 'DRAFT', campaign: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/api/campaigns/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM campaigns WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Campaign not found' });
    invalidateCampaignCache();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public metrics: only explicitly published, database-backed metrics are exposed.
router.get('/api/metrics', async (_req, res) => {
  const cached = apiCache.get('/api/metrics');
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);
  try {
    const result = await pool.query(`SELECT id, metric_key, label_en, label_hi, value, unit, sort_order, updated_at, published_at FROM content_metrics WHERE is_published=TRUE ORDER BY sort_order ASC, created_at ASC`);
    const data = { metrics: result.rows };
    apiCache.set('/api/metrics', { data, timestamp: Date.now() });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin metrics: includes drafts so an admin can review before publication.
router.get('/api/admin/metrics', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT id, metric_key, label_en, label_hi, value, unit, is_published, sort_order, created_at, updated_at, published_at, published_by FROM content_metrics ORDER BY sort_order ASC, created_at ASC`);
    res.json({ metrics: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/admin/metrics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { metricKey, labelEn, labelHi, value, unit, sortOrder } = req.body;
    if (!/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(String(metricKey || ''))) return res.status(400).json({ error: 'metricKey must use only letters, numbers, underscores or hyphens' });
    if (!String(labelEn || '').trim()) return res.status(400).json({ error: 'English label is required' });
    if (!Number.isFinite(Number(value))) return res.status(400).json({ error: 'Metric value must be numeric' });
    const result = await pool.query(`INSERT INTO content_metrics (metric_key,label_en,label_hi,value,unit,is_published,sort_order,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,FALSE,$6,NOW(),NOW()) RETURNING *`, [String(metricKey).trim(), String(labelEn).trim(), labelHi ? String(labelHi).trim() : null, Number(value), unit ? String(unit).trim() : null, Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0]);
    invalidateMetricsCache();
    res.status(201).json({ success: true, status: 'DRAFT', metric: result.rows[0] });
  } catch (error: any) {
    if (error?.code === '23505') return res.status(409).json({ error: 'metricKey already exists' });
    res.status(500).json({ error: error.message });
  }
});

// Editing always returns a metric to draft so changed numbers cannot silently remain public.
router.put('/api/admin/metrics/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { metricKey, labelEn, labelHi, value, unit, sortOrder } = req.body;
    if (!/^[a-z0-9][a-z0-9_-]{0,99}$/i.test(String(metricKey || ''))) return res.status(400).json({ error: 'metricKey must use only letters, numbers, underscores or hyphens' });
    if (!String(labelEn || '').trim()) return res.status(400).json({ error: 'English label is required' });
    if (!Number.isFinite(Number(value))) return res.status(400).json({ error: 'Metric value must be numeric' });
    const result = await pool.query(`UPDATE content_metrics SET metric_key=$1,label_en=$2,label_hi=$3,value=$4,unit=$5,sort_order=$6,is_published=FALSE,published_at=NULL,published_by=NULL,updated_at=NOW() WHERE id=$7 RETURNING *`, [String(metricKey).trim(), String(labelEn).trim(), labelHi ? String(labelHi).trim() : null, Number(value), unit ? String(unit).trim() : null, Number.isInteger(Number(sortOrder)) ? Number(sortOrder) : 0, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Metric not found' });
    invalidateMetricsCache();
    res.json({ success: true, status: 'DRAFT', metric: result.rows[0] });
  } catch (error: any) {
    if (error?.code === '23505') return res.status(409).json({ error: 'metricKey already exists' });
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/admin/metrics/:id/publish', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) return res.status(401).json({ error: 'Authenticated administrator identity is required to publish' });
    const result = await pool.query(`UPDATE content_metrics SET is_published=TRUE,published_at=NOW(),published_by=$1,updated_at=NOW() WHERE id=$2 RETURNING *`, [adminId, req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Metric not found' });
    invalidateMetricsCache();
    res.json({ success: true, status: 'PUBLISHED', metric: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/admin/metrics/:id/unpublish', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`UPDATE content_metrics SET is_published=FALSE,published_at=NULL,published_by=NULL,updated_at=NOW() WHERE id=$1 RETURNING *`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Metric not found' });
    invalidateMetricsCache();
    res.json({ success: true, status: 'DRAFT', metric: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/api/admin/metrics/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM content_metrics WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Metric not found' });
    invalidateMetricsCache();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
