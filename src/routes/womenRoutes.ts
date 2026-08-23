import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken } from '../db/middleware.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/api/women/complaints', authenticateToken, async (req: any, res) => {
  try {
    const userId = String(req.user?.id || '').trim();
    const requestedUserId = String(req.query.userId || userId).trim();
    if (!userId || requestedUserId !== userId) return res.status(403).json({ success: false, error: 'You can only view your own complaints.' });
    const result = await pool.query('SELECT * FROM women_complaints WHERE user_id = $1 ORDER BY "createdAt" DESC', [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/api/women/complaints', authenticateToken, async (req: any, res) => {
  try {
    const { complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous } = req.body || {};
    const userId = req.user.id;
    if (!complaint_type || !description) return res.status(400).json({ success: false, error: 'Complaint type and description are required.' });
    await pool.query(`INSERT INTO women_complaints (user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [userId, is_anonymous ? '' : (complainant_name || ''), is_anonymous ? '' : (complainant_phone || ''), complaint_type, incident_date || null, location || '', description, suspect_details || '', Boolean(is_anonymous)]);
    const dataString = JSON.stringify({ complaintType: complaint_type, incidentDate: incident_date, location, description, suspectDetails: suspect_details, isAnonymous: Boolean(is_anonymous) });
    await pool.query(`INSERT INTO service_submissions_v2 ("userId","citizenName","citizenPhone","serviceName","submissionData",status)
      VALUES ($1,$2,$3,$4,$5,$6)`, [userId, is_anonymous ? 'Anonymous' : (complainant_name || 'Citizen'), is_anonymous ? '' : (complainant_phone || ''), 'Women Support - Incident Complaint', dataString, 'pending']);
    res.status(201).json({ success: true, status: 'pending' });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// RTO vehicle records are returned only when an actual record exists in the database.
// The previous deterministic fake-owner/model generator has been removed.
router.get('/api/rto/vehicle/:plate', async (req, res) => {
  try {
    const formattedPlate = String(req.params.plate || '').replace(/\s+/g, '').toUpperCase();
    if (!formattedPlate) return res.status(400).json({ success: false, error: 'Plate number is required.' });
    const result = await pool.query(`SELECT * FROM rto_vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = $1`, [formattedPlate]);
    if (!result.rows.length) return res.status(503).json({ success: false, error: 'Live RTO verification is not configured and no verified local record exists.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/api/family/group', authenticateToken, async (req: any, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    if (!name) return res.status(400).json({ error: 'Missing group name' });
    const groupId = crypto.randomUUID();
    const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    await pool.query('INSERT INTO family_groups (id,name,invite_code,created_by) VALUES ($1,$2,$3,$4)', [groupId,name,inviteCode,userId]);
    await pool.query('INSERT INTO family_members (id,group_id,user_id,role) VALUES ($1,$2,$3,$4)', [crypto.randomUUID(),groupId,userId,'admin']);
    res.status(201).json({ success: true, data: { groupId, inviteCode } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/api/family/join', authenticateToken, async (req: any, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;
    if (!inviteCode) return res.status(400).json({ error: 'Missing invite code' });
    const groupRes = await pool.query('SELECT id FROM family_groups WHERE invite_code = $1', [String(inviteCode).trim().toUpperCase()]);
    if (!groupRes.rows.length) return res.status(404).json({ error: 'Invalid invite code' });
    const groupId = groupRes.rows[0].id;
    const memberRes = await pool.query('SELECT id FROM family_members WHERE group_id = $1 AND user_id = $2', [groupId,userId]);
    if (!memberRes.rows.length) await pool.query('INSERT INTO family_members (id,group_id,user_id,role) VALUES ($1,$2,$3,$4)', [crypto.randomUUID(),groupId,userId,'member']);
    res.json({ success: true, data: { groupId } });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/api/family/groups', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`SELECT g.* FROM family_groups g JOIN family_members m ON g.id=m.group_id WHERE m.user_id=$1`, [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/api/family/location', authenticateToken, async (req: any, res) => {
  try {
    const { latitude, longitude, battery_level, is_charging } = req.body;
    const userId = req.user.id;
    if (latitude == null || longitude == null) return res.status(400).json({ error: 'Location is required' });
    await pool.query(`INSERT INTO member_locations (id,user_id,latitude,longitude,battery_level,is_charging) VALUES ($1,$2,$3,$4,$5,$6)`, [crypto.randomUUID(),userId,latitude,longitude,battery_level ?? null,Boolean(is_charging)]);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get('/api/family/locations/:groupId', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { groupId } = req.params;
    const membership = await pool.query('SELECT id FROM family_members WHERE group_id=$1 AND user_id=$2', [groupId,userId]);
    if (!membership.rows.length) return res.status(403).json({ success:false, error:'You are not a member of this family group.' });
    const result = await pool.query(`SELECT m.user_id,u.name AS user_name,u.phone,l.latitude,l.longitude,l.battery_level,l.is_charging,l.timestamp
      FROM family_members m JOIN users u ON m.user_id=u.id
      LEFT JOIN LATERAL (SELECT latitude,longitude,battery_level,is_charging,timestamp FROM member_locations WHERE user_id=m.user_id ORDER BY timestamp DESC LIMIT 1) l ON true
      WHERE m.group_id=$1`, [groupId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;
