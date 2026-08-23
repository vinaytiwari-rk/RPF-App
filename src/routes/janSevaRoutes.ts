import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/api/cards', authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query('SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 ORDER BY "submittedAt" DESC');
    res.json({ applications: result.rows });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Applying creates a pending application. It never creates an approved/final card.
router.post('/api/cards', authenticateToken, async (req: any, res) => {
  const client = await pool.connect();
  try {
    const { name, gender, dob, address, idType, idNumber } = req.body || {};
    const userId = req.user.id;
    if (![name, gender, dob, address, idType, idNumber].every((v) => String(v ?? '').trim())) return res.status(400).json({ success: false, error: 'All card application fields are required.' });
    if (idType === 'aadhaar') {
      const existing = await client.query('SELECT "cardNo" FROM card_applications_v2 WHERE "idNumber" = $1 AND status <> $2 LIMIT 1', [String(idNumber).trim(), 'rejected']);
      if (existing.rows.length) return res.status(409).json({ success: false, error: 'A card application with this Aadhaar number already exists.' });
    }
    await client.query('BEGIN');
    const id = crypto.randomUUID();
    const submittedAt = new Date().toISOString();
    await client.query(`INSERT INTO card_applications_v2 (id,"userId",name,gender,dob,address,"idType","idNumber",status,"cardNo","submittedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [id,userId,String(name).trim(),String(gender).trim(),dob,String(address).trim(),String(idType).trim(),String(idNumber).trim(),'pending',null,submittedAt]);
    await client.query('UPDATE users SET "janSevaCardStatus"=$1,"janSevaCardNo"=$2 WHERE id=$3', ['pending','',userId]);
    await client.query('COMMIT');
    res.status(201).json({ success: true, status: 'pending', message: 'Jan Seva Card application submitted for verification.' });
  } catch (error: any) { try { await client.query('ROLLBACK'); } catch {} res.status(500).json({ success: false, error: 'Card application could not be saved.' }); }
  finally { client.release(); }
});

router.post('/api/cards/approve', authenticateToken, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId.' });
    await client.query('BEGIN');
    const result = await client.query('SELECT id FROM card_applications_v2 WHERE "userId"=$1 AND status=$2 ORDER BY "submittedAt" DESC LIMIT 1 FOR UPDATE', [userId, 'pending']);
    if (!result.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ success: false, error: 'No pending card application found.' }); }
    await client.query(`CREATE SEQUENCE IF NOT EXISTS jan_seva_card_seq START 1`);
    const seq = await client.query(`SELECT nextval('jan_seva_card_seq') AS n`);
    const cardNo = `JSC/${new Date().getFullYear()}/${String(seq.rows[0].n).padStart(8, '0')}`;
    await client.query('UPDATE card_applications_v2 SET status=$1,"cardNo"=$2 WHERE id=$3', ['approved',cardNo,result.rows[0].id]);
    await client.query('UPDATE users SET "janSevaCardStatus"=$1,"janSevaCardNo"=$2 WHERE id=$3', ['approved',cardNo,userId]);
    await client.query('COMMIT');
    res.json({ success: true, status: 'approved', cardNo });
  } catch (error: any) { try { await client.query('ROLLBACK'); } catch {} res.status(500).json({ success: false, error: 'Card approval failed.' }); }
  finally { client.release(); }
});

router.post('/api/cards/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'Missing userId.' });
    const result = await pool.query('UPDATE card_applications_v2 SET status=$1 WHERE "userId"=$2 AND status=$3 RETURNING id', ['rejected',userId,'pending']);
    if (!result.rows.length) return res.status(404).json({ success: false, error: 'No pending card application found.' });
    await pool.query('UPDATE users SET "janSevaCardStatus"=$1,"janSevaCardNo"=$2 WHERE id=$3', ['rejected','',userId]);
    res.json({ success: true, status: 'rejected' });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.delete('/api/cards/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try { await pool.query('DELETE FROM card_applications_v2 WHERE "userId"=$1', [req.params.userId]); res.json({ success: true }); }
  catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

router.get('/api/cards/my', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query('SELECT "userId",name,gender,dob,address,"idType","idNumber",status,"cardNo","submittedAt" FROM card_applications_v2 WHERE "userId"=$1 ORDER BY "submittedAt" DESC LIMIT 1', [req.user.id]);
    res.json({ success: true, application: result.rows[0] || null });
  } catch (error: any) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;
