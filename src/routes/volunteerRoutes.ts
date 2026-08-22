import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin } from '../db/middleware.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = express.Router();

async function ensureVolunteerSchema(){
  await pool.query(`CREATE SEQUENCE IF NOT EXISTS volunteer_registration_seq START 1`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending'`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS father_husband_name TEXT`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS mother_name TEXT`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS dob DATE`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS isd_code VARCHAR(20)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS blood_network_ready BOOLEAN`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS country VARCHAR(100)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS state VARCHAR(100)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS pincode VARCHAR(20)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS area_locality VARCHAR(255)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS address TEXT`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS sansad_kshetra VARCHAR(255)`);
  await pool.query(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS vidhan_sabha VARCHAR(255)`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS volunteers_registration_number_unique ON volunteers(registration_number) WHERE registration_number IS NOT NULL`);
}

// The single authoritative volunteer registration endpoint. Registration succeeds only after the complete record is committed.
router.post('/api/volunteer-registration/submit', async (req,res)=>{
  const client=await pool.connect();
  try{
    await ensureVolunteerSchema();
    const d=req.body||{};
    const required=['username','full_name','father_husband_name','mother_name','dob','mobile','email','blood_group','country','state','city','pincode','area_locality','address','password'];
    if(String(d.country||'').toLowerCase()==='india'||String(d.country||'').toUpperCase()==='IN') required.push('sansad_kshetra','vidhan_sabha');
    const missing=required.find(k=>!String(d[k]??'').trim());
    if(missing)return res.status(400).json({success:false,error:`Missing required field: ${missing}`});
    if(String(d.password).length<8)return res.status(400).json({success:false,error:'Password must be at least 8 characters.'});
    if(d.confirm_password!==undefined&&d.password!==d.confirm_password)return res.status(400).json({success:false,error:'Passwords do not match.'});
    const username=String(d.username).trim().toLowerCase();
    const existing=await pool.query(`SELECT id FROM volunteers WHERE LOWER(username)=LOWER($1) OR mobile=$2 OR LOWER(email)=LOWER($3) LIMIT 1`,[username,String(d.mobile).trim(),String(d.email).trim()]);
    if(existing.rows.length)return res.status(409).json({success:false,error:'A volunteer registration already exists with this User ID, mobile number, or email.'});
    await client.query('BEGIN');
    const seq=await client.query(`SELECT nextval('volunteer_registration_seq') AS n`);
    const number=`RPF/VOL/${new Date().getFullYear()}/${String(seq.rows[0].n).padStart(6,'0')}`;
    const id=crypto.randomUUID();
    const passwordHash=await bcrypt.hash(String(d.password),12);
    await client.query(`INSERT INTO volunteers (id,username,registration_number,full_name,father_husband_name,mother_name,dob,isd_code,mobile,email,blood_group,blood_network_ready,country,state,city,pincode,area_locality,address,sansad_kshetra,vidhan_sabha,password_hash,approval_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,'pending')`,[id,username,number,String(d.full_name).trim(),String(d.father_husband_name).trim(),String(d.mother_name).trim(),d.dob,String(d.isd_code||'').trim(),String(d.mobile).trim(),String(d.email).trim(),String(d.blood_group).trim(),Boolean(d.blood_network_ready),String(d.country).trim(),String(d.state).trim(),String(d.city).trim(),String(d.pincode).trim(),String(d.area_locality).trim(),String(d.address).trim(),String(d.sansad_kshetra||'').trim(),String(d.vidhan_sabha||'').trim(),passwordHash]);
    await client.query('COMMIT');
    res.status(201).json({success:true,registration_number:number,approval_status:'pending'});
  }catch(error:any){try{await client.query('ROLLBACK')}catch{};console.error('Volunteer registration error:',error);res.status(500).json({success:false,error:'Registration could not be completed. No partial volunteer record was created.'});}
  finally{client.release()}
});

router.put('/api/volunteers/:id/approve',authenticateToken,requireAdmin,async(req,res)=>{try{const status=req.body.status;if(!['approved','rejected','pending','more_information_required'].includes(status))return res.status(400).json({success:false,error:'Invalid volunteer status'});await pool.query(`UPDATE volunteers SET approval_status=$1 WHERE id=$2`,[status,req.params.id]);res.json({success:true,message:'Volunteer status updated'})}catch(error:any){res.status(500).json({success:false,error:error.message})}});
router.put('/api/volunteers/:id/allocate',authenticateToken,requireAdmin,async(req,res)=>{try{await pool.query(`UPDATE volunteers SET constituency_allocation=$1 WHERE id=$2`,[req.body.allocation,req.params.id]);res.json({success:true,message:'Volunteer allocated'})}catch(error:any){res.status(500).json({success:false,error:error.message})}});

router.get('/api/volunteers/me',authenticateToken,async(req:any,res)=>{try{const result=await pool.query(`SELECT id,registration_number,username,full_name,mobile,email,avatar,"registeredAt",approval_status,country,state,city,pincode,area_locality,address,sansad_kshetra,vidhan_sabha FROM volunteers WHERE id=$1 LIMIT 1`,[req.user.id]);if(!result.rows[0])return res.status(404).json({success:false,error:'Volunteer record not found'});res.json({success:true,volunteer:result.rows[0]})}catch(error:any){res.status(500).json({success:false,error:error.message})}});
router.get('/api/volunteers/me/certificates',authenticateToken,async(req:any,res)=>{try{const result=await pool.query(`SELECT * FROM certificates WHERE volunteer_id=$1 ORDER BY issue_date DESC`,[req.user.id]);res.json({success:true,certificates:result.rows})}catch(error:any){res.status(500).json({error:error.message})}});

router.post('/api/volunteers/report',authenticateToken,async(req:any,res)=>{try{const {check_in_time,check_out_time,report_text,location_lat,location_lng}=req.body;await pool.query(`INSERT INTO volunteer_reports (id,volunteer_id,check_in_time,check_out_time,report_text,location_lat,location_lng) VALUES ($1,$2,$3,$4,$5,$6,$7)`,[crypto.randomUUID(),req.user.id,check_in_time,check_out_time,report_text,location_lat,location_lng]);res.json({success:true,message:'Report submitted'})}catch(error:any){res.status(500).json({success:false,error:error.message})}});

// Legacy shortcut creation is deliberately disabled. All volunteers must use the complete registration flow.
router.post('/api/volunteers',authenticateToken,async(_req,res)=>res.status(410).json({success:false,error:'This legacy volunteer shortcut has been retired. Please use the complete Volunteer Registration form.'}));
router.get('/api/volunteers',async(_req,res)=>{try{const result=await pool.query(`SELECT id,registration_number,full_name AS name,email,mobile AS phone,approval_status AS status,"registeredAt" FROM volunteers ORDER BY "registeredAt" DESC`);res.json({volunteers:result.rows})}catch(error:any){res.status(500).json({error:error.message})}});
router.delete('/api/volunteers/:id',authenticateToken,requireAdmin,async(req,res)=>{try{await pool.query(`DELETE FROM volunteers WHERE id=$1`,[req.params.id]);res.json({success:true})}catch(error:any){res.status(500).json({error:error.message})}});
router.get('/api/public/volunteers',async(req,res)=>{try{const {city,skill}=req.query;const conditions:string[]=[`approval_status='approved'`],params:any[]=[];if(city){params.push(`%${city}%`);conditions.push(`city ILIKE $${params.length}`)}if(skill){params.push(`%${skill}%`);conditions.push(`skills::text ILIKE $${params.length}`)}const result=await pool.query(`SELECT id,full_name AS name,avatar,city,area_locality,skills,availability,role,constituency_allocation,"registeredAt" FROM volunteers WHERE ${conditions.join(' AND ')} ORDER BY full_name ASC`,params);res.json({success:true,data:result.rows})}catch(error:any){res.status(500).json({success:false,error:error.message})}});

export default router;
