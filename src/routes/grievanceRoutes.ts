import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import crypto from 'crypto';

const router = express.Router();

router.post('/api/support_requests', authenticateToken, async (req: any, res) => {
  try {
    const { citizenName, citizenPhone, requestType, location, description } = req.body || {};
    if (![citizenName, citizenPhone, requestType, description].every((v) => String(v ?? '').trim())) return res.status(400).json({ success: false, error: 'Required support request fields are missing.' });
    const id = crypto.randomUUID();
    await pool.query(`INSERT INTO support_requests (id,"citizenName","citizenPhone","requestType",location,description,status,"createdAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [id,citizenName,citizenPhone,requestType,location || '',description,'Pending',new Date()]);
    res.status(201).json({ success: true, id, status: 'Pending' });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/api/sos_alerts', authenticateToken, async (req: any, res) => {
  try {
    const { citizenName, citizenPhone, location } = req.body || {};
    if (!location) return res.status(400).json({ success: false, error: 'Location is required for an SOS alert.' });
    const id = crypto.randomUUID();
    await pool.query(`INSERT INTO sos_alerts (id,"citizenName","citizenPhone",location,status,"createdAt") VALUES ($1,$2,$3,$4,$5,$6)`, [id,citizenName || req.user.name || 'Citizen',citizenPhone || req.user.phone || '',location,'Received',new Date()]);
    res.status(201).json({ success: true, id, status: 'Received' });
  } catch (err: any) { res.status(500).json({ success: false, error: err.message }); }
});

// Compatibility endpoint used by the SOS page. It persists the alert and returns an explicit server acknowledgement.
router.post('/api/public/sos-alert', authenticateToken, async (req: any, res) => {
  try {
    const { location, lat, lon } = req.body || {};
    if (!location || location === 'Location unavailable') return res.status(400).json({ success: false, error: 'A current location is required.' });
    const id = crypto.randomUUID();
    const storedLocation = lat != null && lon != null ? `${location} [${lat},${lon}]` : String(location);
    await pool.query(`INSERT INTO sos_alerts (id,"citizenName","citizenPhone",location,status,"createdAt") VALUES ($1,$2,$3,$4,$5,$6)`, [id,req.user.name || req.body.userName || 'Citizen',req.user.phone || req.body.userPhone || '',storedLocation,'Received',new Date()]);
    res.status(201).json({ success: true, id, status: 'Received' });
  } catch (err: any) { res.status(500).json({ success: false, error: 'SOS alert could not be recorded.' }); }
});

router.get('/api/grievances', authenticateToken, async (_req, res) => {
  try {
    const result = await pool.query('SELECT id,title,description,category,urgency,location,"reportedBy",status,date,"aiSummary","audioUrl","videoUrl","imageUrl",created_at AS "createdAt" FROM grievances ORDER BY created_at DESC');
    res.json({ grievances: result.rows });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.post('/api/grievances', authenticateToken, async (req: any, res) => {
  try {
    const { title, description, category, urgency, location, aiSummary, audioUrl, videoUrl, imageUrl } = req.body || {};
    if (![title, description, category, urgency].every((v) => String(v ?? '').trim())) return res.status(400).json({ success: false, error: 'Required grievance fields are missing.' });
    const id = crypto.randomUUID();
    const result = await pool.query(`INSERT INTO grievances (id,title,description,category,urgency,location,"reportedBy",status,date,"aiSummary","audioUrl","videoUrl","imageUrl") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`, [id,title,description,category,urgency,location || '',req.user.id,'Pending',new Date().toISOString(),aiSummary || '',audioUrl || '',videoUrl || '',imageUrl || '']);
    res.status(201).json({ success: true, id: result.rows[0].id, status: 'Pending' });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/api/grievances/status', authenticateToken, requireAdmin, async (req, res) => {
  try { const { id, status } = req.body; await pool.query('UPDATE grievances SET status=$1 WHERE id=$2',[status,id]); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});
router.delete('/api/grievances/:id', authenticateToken, requireAdmin, async (req,res)=>{try{await pool.query('DELETE FROM grievances WHERE id=$1',[req.params.id]);res.json({success:true})}catch(error:any){res.status(500).json({success:false,error:error.message})}});

export default router;
