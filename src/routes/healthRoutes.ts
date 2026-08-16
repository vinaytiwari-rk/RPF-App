import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// Legacy database-maintenance endpoints are permanently retired.
router.use(['/api/auth/fix-db', '/api/auth/debug-db'], (_req, res) => {
  return res.status(410).json({
    success: false,
    error: 'This database maintenance endpoint has been retired.',
  });
});

// Health data must always represent user-provided or device-provided values.
// Never fabricate a health reading when the user has no stored data.
router.get('/api/health-vitals', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query(
      'SELECT * FROM health_vitals WHERE user_id = $1',
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows[0] || null });
  } catch (error: any) {
    console.error('Error fetching health vitals:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch health data' });
  }
});

router.post('/api/health-vitals', authenticateToken, async (req: any, res: any) => {
  try {
    const {
      steps, water_cups, calories, exercise_mins, weight, height,
      bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week,
    } = req.body || {};

    await pool.query(
      `INSERT INTO health_vitals
       (user_id, steps, water_cups, calories, exercise_mins, weight, height, bmi,
        sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
       ON CONFLICT (user_id) DO UPDATE SET
        steps=COALESCE($2,health_vitals.steps),
        water_cups=COALESCE($3,health_vitals.water_cups),
        calories=COALESCE($4,health_vitals.calories),
        exercise_mins=COALESCE($5,health_vitals.exercise_mins),
        weight=COALESCE($6,health_vitals.weight),
        height=COALESCE($7,health_vitals.height),
        bmi=COALESCE($8,health_vitals.bmi),
        sleep_hours=COALESCE($9,health_vitals.sleep_hours),
        heart_rate=COALESCE($10,health_vitals.heart_rate),
        sleep_cycle=COALESCE($11,health_vitals.sleep_cycle),
        period_day=COALESCE($12,health_vitals.period_day),
        pregnancy_week=COALESCE($13,health_vitals.pregnancy_week),
        updated_at=NOW()`,
      [req.user.id, steps, water_cups, calories, exercise_mins, weight, height,
       bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week]
    );
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving health vitals:', error);
    return res.status(500).json({ success: false, error: 'Unable to save health data' });
  }
});

router.get('/api/medications', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error('Error fetching medications:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch medications' });
  }
});

router.post('/api/medications', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, alarm_time } = req.body || {};
    if (!String(name || '').trim()) {
      return res.status(400).json({ success: false, error: 'Medication name is required' });
    }
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO medications (id,user_id,name,alarm_time,taken) VALUES ($1,$2,$3,$4,false)',
      [id, req.user.id, String(name).trim(), alarm_time || null]
    );
    return res.status(201).json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating medication:', error);
    return res.status(500).json({ success: false, error: 'Unable to save medication' });
  }
});

router.post('/api/medications/:id/toggle', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query(
      'UPDATE medications SET taken = NOT taken WHERE id = $1 AND user_id = $2 RETURNING id,taken',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Medication not found' });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error toggling medication:', error);
    return res.status(500).json({ success: false, error: 'Unable to update medication' });
  }
});

router.delete('/api/medications/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query(
      'DELETE FROM medications WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Medication not found' });
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting medication:', error);
    return res.status(500).json({ success: false, error: 'Unable to delete medication' });
  }
});

router.get('/api/pediatric', authenticateToken, async (req: any, res: any) => {
  try {
    const [profile, vaccines] = await Promise.all([
      pool.query('SELECT * FROM pediatric_profile WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT * FROM vaccine_status WHERE user_id = $1', [req.user.id]),
    ]);
    return res.json({
      success: true,
      profile: profile.rows[0] || null,
      vaccines: vaccines.rows,
    });
  } catch (error: any) {
    console.error('Error fetching pediatric profile:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch child health data' });
  }
});

router.post('/api/pediatric', authenticateToken, async (req: any, res: any) => {
  try {
    const { child_age, child_weight } = req.body || {};
    await pool.query(
      `INSERT INTO pediatric_profile (user_id,child_age,child_weight,updated_at)
       VALUES ($1,$2,$3,NOW())
       ON CONFLICT (user_id) DO UPDATE SET child_age=$2,child_weight=$3,updated_at=NOW()`,
      [req.user.id, child_age ?? null, child_weight ?? null]
    );
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving pediatric profile:', error);
    return res.status(500).json({ success: false, error: 'Unable to save child health data' });
  }
});

router.post('/api/pediatric/vaccine', authenticateToken, async (req: any, res: any) => {
  try {
    const { vaccine_name, done } = req.body || {};
    if (!String(vaccine_name || '').trim()) {
      return res.status(400).json({ success: false, error: 'Vaccine name is required' });
    }
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO vaccine_status (id,user_id,vaccine_name,done,updated_at)
       VALUES ($1,$2,$3,$4,NOW())
       ON CONFLICT (user_id,vaccine_name) DO UPDATE SET done=$4,updated_at=NOW()`,
      [id, req.user.id, String(vaccine_name).trim(), Boolean(done)]
    );
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving vaccine status:', error);
    return res.status(500).json({ success: false, error: 'Unable to save vaccine status' });
  }
});

router.get('/api/health_camps', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,"titleEn","titleHi","dateEn","dateHi","locationEn","locationHi",contact,"registeredCount","createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    return res.json({ camps: result.rows });
  } catch (error: any) {
    console.error('Error fetching health camps:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch health camps' });
  }
});

router.post('/api/health_camps/:id/register', authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `UPDATE health_camps SET "registeredCount"=COALESCE("registeredCount",0)+1
       WHERE id=$1
       RETURNING id,"titleEn","titleHi","dateEn","dateHi","locationEn","locationHi",contact,"registeredCount","createdAt"`,
      [req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Camp not found' });
    return res.json({ success: true, camp: result.rows[0] });
  } catch (error: any) {
    console.error('Error registering for health camp:', error);
    return res.status(500).json({ success: false, error: 'Unable to register for camp' });
  }
});

router.post('/api/health_camps', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body || {};
    if (!titleEn && !titleHi) return res.status(400).json({ success: false, error: 'Camp title is required' });
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO health_camps (id,"titleEn","titleHi","dateEn","dateHi","locationEn","locationHi",contact,"createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [id,titleEn || '',titleHi || '',dateEn || null,dateHi || null,locationEn || '',locationHi || '',contact || '',new Date().toISOString()]
    );
    return res.status(201).json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating health camp:', error);
    return res.status(500).json({ success: false, error: 'Unable to create health camp' });
  }
});

router.post('/api/health_camps/:id/edit', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body || {};
    const result = await pool.query(
      `UPDATE health_camps SET "titleEn"=$1,"titleHi"=$2,"dateEn"=$3,"dateHi"=$4,"locationEn"=$5,"locationHi"=$6,contact=$7 WHERE id=$8 RETURNING id`,
      [titleEn || '',titleHi || '',dateEn || null,dateHi || null,locationEn || '',locationHi || '',contact || '',req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Camp not found' });
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error editing health camp:', error);
    return res.status(500).json({ success: false, error: 'Unable to update health camp' });
  }
});

router.delete('/api/health_camps/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM health_camps WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Camp not found' });
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting health camp:', error);
    return res.status(500).json({ success: false, error: 'Unable to delete health camp' });
  }
});

router.get('/api/blood_donors', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,name,"bloodGroup",phone,location,verified,distance,"lastDonated" FROM blood_donors ORDER BY "createdAt" DESC'
    );
    return res.json({ donors: result.rows });
  } catch (error: any) {
    console.error('Error fetching blood donors:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch blood donors' });
  }
});

// Registration is protected. Server-controlled fields such as verified, distance
// and lastDonated cannot be forged by a client during registration.
router.post('/api/blood_donors', authenticateToken, async (req: any, res: any) => {
  try {
    const { name, bloodGroup, phone, location, lastDonated } = req.body || {};
    if (!String(name || '').trim() || !String(bloodGroup || '').trim() || !String(phone || '').trim()) {
      return res.status(400).json({ success: false, error: 'Name, blood group and phone are required' });
    }
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors (id,name,"bloodGroup",phone,location,verified,distance,"lastDonated","createdAt")
       VALUES ($1,$2,$3,$4,$5,false,NULL,$6,$7)`,
      [id,String(name).trim(),String(bloodGroup).trim(),String(phone).trim(),String(location || '').trim(),lastDonated || null,new Date().toISOString()]
    );
    return res.status(201).json({ success: true, id, verified: false });
  } catch (error: any) {
    console.error('Error creating blood donor:', error);
    return res.status(500).json({ success: false, error: 'Unable to register as blood donor' });
  }
});

router.get('/api/blood-banks', async (req, res) => {
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = process.env.DATAGOV_RESOURCE_ID || 'fced6df9-a360-4e08-8ca0-f283fc74ce15';
  const searchQuery = String(req.query.search || '').toLowerCase().trim();

  if (apiKey) {
    try {
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=250&filters[_state]=Madhya%20Pradesh`;
      const response = await axios.get(url, { timeout: 10000 });
      if (Array.isArray(response.data?.records)) {
        let mapped = response.data.records.map((item: any) => ({
          id: `ogd_${item.sr_no}`,
          name: item._blood_bank_name || 'Unknown Blood Bank',
          phone: item._contact_no && !['NA','N/A'].includes(item._contact_no) ? item._contact_no : (item._mobile || 'N/A'),
          address: item._address || 'N/A',
          city: item._city || item._district || 'Madhya Pradesh',
          state: item._state || 'Madhya Pradesh',
          pincode: item.pincode === 'NA' ? '' : (item.pincode || ''),
          latitude: item._latitude,
          longitude: item._longitude,
          category: item._category || 'General',
          service_time: item._service_time || '24x7',
          stock_a_plus: null, stock_a_minus: null, stock_b_plus: null, stock_b_minus: null,
          stock_ab_plus: null, stock_ab_minus: null, stock_o_plus: null, stock_o_minus: null,
        }));
        if (searchQuery) {
          mapped = mapped.filter((b: any) =>
            b.name.toLowerCase().includes(searchQuery) ||
            b.city.toLowerCase().includes(searchQuery) ||
            b.address.toLowerCase().includes(searchQuery) ||
            b.pincode.includes(searchQuery)
          );
        }
        return res.json(mapped);
      }
    } catch (error: any) {
      console.error('Data.gov.in blood-bank lookup failed:', error?.message || error);
    }
  }

  try {
    let sql = 'SELECT * FROM blood_banks';
    const params: string[] = [];
    if (searchQuery) {
      sql += ' WHERE LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(address) LIKE $1 OR pincode LIKE $1';
      params.push(`%${searchQuery}%`);
    }
    sql += ' ORDER BY name ASC';
    const result = await pool.query(sql, params);
    return res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching blood banks:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch blood banks' });
  }
});

router.get('/api/blood-requests/my', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM blood_requests WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    return res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching blood requests:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch blood requests' });
  }
});

router.post('/api/blood-requests', authenticateToken, async (req: any, res: any) => {
  try {
    const { bloodGroup, componentType, quantity, urgency, doctorName, notes } = req.body || {};
    if (!bloodGroup || !componentType) return res.status(400).json({ success: false, error: 'Blood group and component type are required' });
    const id = `req_${crypto.randomUUID().slice(0,8)}`;
    await pool.query(
      `INSERT INTO blood_requests (id,user_id,blood_group,component_type,quantity,urgency,status,doctor_name,notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [id,req.user.id,bloodGroup,componentType,parseInt(quantity,10) || 1,urgency || 'Normal','Pending',doctorName || '',notes || '']
    );
    return res.status(201).json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating blood request:', error);
    return res.status(500).json({ success: false, error: 'Unable to create blood request' });
  }
});

router.get('/api/appointments/my', authenticateToken, async (req: any, res: any) => {
  try {
    const result = await pool.query(
      `SELECT a.*, b.name AS "bloodBankName", b.phone AS "bloodBankPhone", b.address AS "bloodBankAddress"
       FROM blood_appointments a JOIN blood_banks b ON a.blood_bank_id=b.id
       WHERE a.user_id=$1 ORDER BY a.appointment_date DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ success: false, error: 'Unable to fetch appointments' });
  }
});

router.post('/api/appointments', authenticateToken, async (req: any, res: any) => {
  try {
    const { bloodBankId, appointmentDate, bloodGroup, notes } = req.body || {};
    if (!bloodBankId || !appointmentDate) return res.status(400).json({ success: false, error: 'Blood bank and appointment date are required' });
    const id = `appt_${crypto.randomUUID().slice(0,8)}`;
    await pool.query(
      `INSERT INTO blood_appointments (id,user_id,blood_bank_id,appointment_date,blood_group,status,notes,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [id,req.user.id,bloodBankId,appointmentDate,bloodGroup || '','Scheduled',notes || '']
    );
    return res.status(201).json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ success: false, error: 'Unable to create appointment' });
  }
});

// WHO ICD credentials must live in environment variables, never in source control.
router.get('/api/health/dictionary', async (req: any, res: any) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, error: 'Query is required' });
  const clientId = process.env.WHO_ICD_CLIENT_ID;
  const clientSecret = process.env.WHO_ICD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(503).json({ success: false, error: 'Health dictionary service is not configured' });
  }
  try {
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await axios.post(
      'https://icdaccessmanagement.who.int/connect/token',
      'grant_type=client_credentials&scope=icdapi_access',
      { headers: { Authorization: `Basic ${authString}`, 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 }
    );
    const searchRes = await axios.get(
      `https://id.who.int/icd/release/11/2024-01/mms/search?q=${encodeURIComponent(query)}`,
      { headers: { Authorization: `Bearer ${tokenRes.data.access_token}`, Accept: 'application/json', 'API-Version': 'v2', 'Accept-Language': 'en' }, timeout: 10000 }
    );
    return res.json({ success: true, data: searchRes.data?.destinationEntities?.slice(0,10) || [] });
  } catch (error: any) {
    console.error('ICD API error:', error?.response?.data || error?.message || error);
    return res.status(502).json({ success: false, error: 'Health dictionary service unavailable' });
  }
});

export default router;
