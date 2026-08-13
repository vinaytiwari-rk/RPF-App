import express from 'express';
import { pool } from '../db/dbPool.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();

const ALLOWED_EMAIL_DOMAINS = new Set(['gmail.com','googlemail.com','yahoo.com','yahoo.co.in','rediffmail.com','rediff.com','zoho.com','peoplesuniversity.edu.in']);
const BLOOD_GROUPS = new Set(['A+','A-','B+','B-','AB+','AB-','O+','O-']);
const VALID_URGENCY = new Set(['Normal','Urgent','Emergency']);
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
const RESERVED_USERNAMES = new Set(['admin','root','superuser','system','moderator','guest','anonymous']);

let schemaReady: Promise<void> | null = null;
const ensureBloodSchema = async () => {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS volunteer_blood_memberships (
          volunteer_id VARCHAR(255) PRIMARY KEY, blood_group VARCHAR(10) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS blood_request_acceptances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), request_id UUID NOT NULL, volunteer_id VARCHAR(255) NOT NULL,
          status VARCHAR(30) NOT NULL DEFAULT 'accepted', expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(request_id, volunteer_id)
        );
        ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS notes TEXT;
        ALTER TABLE blood_requests ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
        CREATE TABLE IF NOT EXISTS app_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(), recipient_id VARCHAR(255) NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL,
          type VARCHAR(50) NOT NULL DEFAULT 'general', reference_id VARCHAR(255), is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255);
        CREATE UNIQUE INDEX IF NOT EXISTS volunteers_username_unique_idx ON volunteers(LOWER(username)) WHERE username IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_blood_request_group_status ON blood_requests(blood_group, status);
        CREATE INDEX IF NOT EXISTS idx_blood_acceptance_expiry ON blood_request_acceptances(expires_at);
        CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON app_notifications(recipient_id, created_at DESC);
      `);
    })().catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
};

const emailAllowed = (email: string) => {
  const value = String(email || '').trim().toLowerCase();
  const match = value.match(/^[^\s@]+@([^\s@]+)$/);
  return !!match && ALLOWED_EMAIL_DOMAINS.has(match[1]);
};
const calculateAge = (dob: string) => {
  const birth = new Date(`${dob}T00:00:00`); if (Number.isNaN(birth.getTime())) return -1;
  const now = new Date(); let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age--;
  return age;
};
const required = (value: unknown) => typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null;

router.post('/api/volunteer-registration/submit', async (req, res) => {
  try {
    const data = req.body || {};
    const requiredFields = ['username','first_name','father_husband_name','mother_name','dob','isd_code','mobile','email','blood_group','country','state','city','password','confirm_password','blood_network_ready'];
    const missing = requiredFields.filter((key) => !required(data[key]) && data[key] !== false);
    if (missing.length) return res.status(400).json({ success:false, error:`Please complete all mandatory fields: ${missing.join(', ')}` });

    const username = String(data.username).trim().toLowerCase();
    if (!USERNAME_REGEX.test(username)) return res.status(400).json({ success:false, error:'User ID must be 3-20 characters, start with a letter, and use only letters, numbers, . or _.' });
    if (RESERVED_USERNAMES.has(username)) return res.status(400).json({ success:false, error:'This User ID is reserved. Please choose another.' });

    const age = calculateAge(String(data.dob));
    if (age < 0) return res.status(400).json({ success:false, error:'Invalid date of birth.' });
    if (age < 16) return res.status(403).json({ success:false, code:'MINOR', error:'You are Minor, Not Eligible Now' });
    const email = String(data.email).trim().toLowerCase();
    if (!emailAllowed(email)) return res.status(400).json({ success:false, error:'Only Gmail, Yahoo, Rediff, Zoho, or @peoplesuniversity.edu.in email addresses are accepted.' });
    const bloodGroup = String(data.blood_group).trim().toUpperCase();
    if (!BLOOD_GROUPS.has(bloodGroup)) return res.status(400).json({ success:false, error:'Invalid blood group.' });
    const password = String(data.password);
    if (password.length < 8) return res.status(400).json({ success:false, error:'Password must be at least 8 characters.' });
    if (password !== String(data.confirm_password)) return res.status(400).json({ success:false, error:'Passwords do not match.' });
    const mobile = String(data.mobile).replace(/\s+/g,'');
    const isd = String(data.isd_code).replace(/[^+\d]/g,'');
    if (!/^\+?\d{1,4}$/.test(isd) || !/^\d{6,15}$/.test(mobile)) return res.status(400).json({ success:false, error:'Invalid ISD code or mobile number.' });

    await ensureBloodSchema();
    const duplicate = await pool.query(`SELECT id FROM volunteers WHERE mobile=$1 OR LOWER(email)=LOWER($2) OR LOWER(username)=LOWER($3) LIMIT 1`, [mobile,email,username]);
    if (duplicate.rows.length) return res.status(409).json({ success:false, error:'This User ID, mobile number, or email is already registered.' });

    const id = crypto.randomUUID();
    const registrationNumber = `RPF/VOL/${new Date().getFullYear().toString().slice(-2)}/${Math.floor(100000+Math.random()*900000)}`;
    const passwordHash = await bcrypt.hash(password,12);
    await pool.query('BEGIN');
    try {
      await pool.query(`INSERT INTO volunteers (id,username,registration_number,full_name,father_husband_name,mother_name,approval_status,dob,mobile,email,blood_group,country,state,city,address,pincode,area_locality,sansad_kshetra,vidhan_sabha,ward_no,password_hash) VALUES ($1,$2,$3,$4,$5,$6,'pending',$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`, [id,username,registrationNumber,String(data.first_name).trim(),String(data.father_husband_name).trim(),String(data.mother_name).trim(),data.dob,mobile,email,bloodGroup,String(data.country).trim(),String(data.state).trim(),String(data.city).trim(),String(data.address||'').trim(),String(data.pincode||'').trim(),String(data.area_locality||'').trim(),String(data.sansad_kshetra||'').trim(),String(data.vidhan_sabha||'').trim(),String(data.ward_no||'').trim(),passwordHash]);
      if (data.blood_network_ready === true || String(data.blood_network_ready).toLowerCase() === 'true') await pool.query(`INSERT INTO volunteer_blood_memberships (volunteer_id,blood_group,is_active) VALUES ($1,$2,TRUE) ON CONFLICT (volunteer_id) DO UPDATE SET blood_group=EXCLUDED.blood_group,is_active=TRUE,updated_at=NOW()`, [id,bloodGroup]);
      await pool.query('COMMIT');
    } catch(err){ await pool.query('ROLLBACK'); throw err; }
    return res.json({success:true,registration_number:registrationNumber,username,blood_network:!!(data.blood_network_ready===true || String(data.blood_network_ready).toLowerCase()==='true')});
  } catch(error:any){ console.error('Volunteer registration error:',error); if(error.code==='23505') return res.status(409).json({success:false,error:'Some of your details are already registered.'}); return res.status(500).json({success:false,error:'Registration failed. Please try again.'}); }
});

router.get('/api/blood-network/access', async (req,res)=>{try{await ensureBloodSchema();const volunteerId=String(req.query.volunteerId||'').trim();if(!volunteerId)return res.status(400).json({success:false,error:'Volunteer ID is required.'});const r=await pool.query(`SELECT v.id,v.full_name,v.blood_group,m.is_active FROM volunteers v JOIN volunteer_blood_memberships m ON m.volunteer_id=v.id WHERE v.id=$1 AND m.is_active=TRUE`,[volunteerId]);if(!r.rows.length)return res.json({success:true,member:false});res.json({success:true,member:true,volunteer:r.rows[0]});}catch(e){res.status(500).json({success:false,error:'Unable to check Blood Donation Network access.'});}});
router.post('/api/blood-network/join',async(req,res)=>{try{await ensureBloodSchema();const volunteerId=String(req.body?.volunteerId||'').trim();const v=await pool.query('SELECT id,blood_group FROM volunteers WHERE id=$1',[volunteerId]);if(!v.rows.length)return res.status(404).json({success:false,error:'Volunteer not found.'});await pool.query(`INSERT INTO volunteer_blood_memberships (volunteer_id,blood_group,is_active) VALUES ($1,$2,TRUE) ON CONFLICT (volunteer_id) DO UPDATE SET blood_group=EXCLUDED.blood_group,is_active=TRUE,updated_at=NOW()`,[volunteerId,v.rows[0].blood_group]);res.json({success:true});}catch(e){res.status(500).json({success:false,error:'Unable to join Blood Donation Network.'});}});
router.post('/api/blood-network/requests',async(req,res)=>{try{await ensureBloodSchema();const {requesterId,patientName,bloodGroup,unitsRequired,hospitalName,contactPhone,locationLat,locationLng,urgency,notes}=req.body||{};if(![requesterId,patientName,bloodGroup,unitsRequired,hospitalName,contactPhone].every(required))return res.status(400).json({success:false,error:'All requisition fields are mandatory.'});const group=String(bloodGroup).toUpperCase();if(!BLOOD_GROUPS.has(group))return res.status(400).json({success:false,error:'Invalid blood group.'});const qty=Number(unitsRequired);if(!Number.isInteger(qty)||qty<1)return res.status(400).json({success:false,error:'Units required must be at least 1.'});const urgencyValue=VALID_URGENCY.has(String(urgency))?String(urgency):'Normal';const rr=await pool.query(`INSERT INTO blood_requests (requester_id,patient_name,blood_group,units_required,hospital_name,location_lat,location_lng,urgency,contact_phone,status,notes,expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open',$10,NOW()+INTERVAL '48 hours') RETURNING *`,[requesterId,String(patientName).trim(),group,qty,String(hospitalName).trim(),locationLat||null,locationLng||null,urgencyValue,String(contactPhone).trim(),String(notes||'').trim()]);const request=rr.rows[0];const matches=await pool.query(`SELECT m.volunteer_id FROM volunteer_blood_memberships m JOIN volunteers v ON v.id=m.volunteer_id WHERE m.is_active=TRUE AND m.blood_group=$1 AND v.id<>$2`,[group,requesterId]);for(const match of matches.rows)await pool.query(`INSERT INTO app_notifications (recipient_id,title,message,type,reference_id) VALUES ($1,$2,$3,'blood_request',$4)`,[match.volunteer_id,'Blood Request Matching Your Group',`${group} blood is required at ${request.hospital_name}. Tap to view and Accept if you are ready to donate.`,request.id]);res.json({success:true,request,matchedVolunteers:matches.rowCount});}catch(e){console.error('Blood request error:',e);res.status(500).json({success:false,error:'Unable to submit blood requisition.'});}});
router.get('/api/blood-network/requests',async(req,res)=>{try{await ensureBloodSchema();await pool.query(`DELETE FROM blood_request_acceptances WHERE expires_at<=NOW()`);const volunteerId=String(req.query.volunteerId||'').trim();const result=await pool.query(`SELECT r.*,COALESCE(json_agg(json_build_object('volunteer_id',a.volunteer_id,'volunteer_name',v.full_name,'status',a.status,'accepted_at',a.created_at,'expires_at',a.expires_at) ORDER BY a.created_at DESC) FILTER (WHERE a.id IS NOT NULL),'[]') AS acceptances FROM blood_requests r LEFT JOIN blood_request_acceptances a ON a.request_id=r.id AND a.expires_at>NOW() AND a.status='accepted' LEFT JOIN volunteers v ON v.id=a.volunteer_id WHERE r.status='open' AND (r.expires_at IS NULL OR r.expires_at>NOW()) GROUP BY r.id ORDER BY r.created_at DESC LIMIT 100`);const m=volunteerId?await pool.query('SELECT blood_group FROM volunteer_blood_memberships WHERE volunteer_id=$1 AND is_active=TRUE',[volunteerId]):{rows:[]};const group=m.rows[0]?.blood_group;const filtered=group?result.rows.filter((r:any)=>r.blood_group===group||r.requester_id===volunteerId):result.rows.filter((r:any)=>r.requester_id===volunteerId);res.json({success:true,requests:filtered});}catch(e){res.status(500).json({success:false,error:'Unable to load blood requisitions.'});}});
router.post('/api/blood-network/requests/:id/accept',async(req,res)=>{try{await ensureBloodSchema();const requestId=String(req.params.id),volunteerId=String(req.body?.volunteerId||'').trim();const rr=await pool.query(`SELECT * FROM blood_requests WHERE id=$1 AND status='open' AND (expires_at IS NULL OR expires_at>NOW())`,[requestId]);if(!rr.rows.length)return res.status(404).json({success:false,error:'This requisition is no longer active.'});const request=rr.rows[0];const member=await pool.query(`SELECT blood_group FROM volunteer_blood_memberships WHERE volunteer_id=$1 AND is_active=TRUE`,[volunteerId]);if(!member.rows.length)return res.status(403).json({success:false,error:'You are not part of the Blood Donation Network.'});if(member.rows[0].blood_group!==request.blood_group)return res.status(403).json({success:false,error:'Only matching blood-group volunteers can accept this request.'});if(request.requester_id===volunteerId)return res.status(400).json({success:false,error:'You cannot accept your own requisition.'});await pool.query(`INSERT INTO blood_request_acceptances (request_id,volunteer_id,status,expires_at) VALUES ($1,$2,'accepted',NOW()+INTERVAL '24 hours') ON CONFLICT (request_id,volunteer_id) DO UPDATE SET status='accepted',expires_at=NOW()+INTERVAL '24 hours'`,[requestId,volunteerId]);const v=await pool.query('SELECT full_name FROM volunteers WHERE id=$1',[volunteerId]);await pool.query(`INSERT INTO app_notifications (recipient_id,title,message,type,reference_id) VALUES ($1,$2,$3,'blood_acceptance',$4)`,[request.requester_id,'Blood Request Accepted',`${v.rows[0]?.full_name||'A volunteer'} has accepted your ${request.blood_group} blood request.`,requestId]);res.json({success:true,message:'Request accepted. The requester has been notified.'});}catch(e){res.status(500).json({success:false,error:'Unable to accept this request.'});}});
router.post('/api/blood-network/requests/:id/cancel',async(req,res)=>{try{await ensureBloodSchema();const requestId=String(req.params.id),actorId=String(req.body?.actorId||'').trim();const r=await pool.query('SELECT requester_id FROM blood_requests WHERE id=$1',[requestId]);if(!r.rows.length)return res.status(404).json({success:false,error:'Request not found.'});if(r.rows[0].requester_id===actorId){await pool.query(`UPDATE blood_requests SET status='cancelled' WHERE id=$1`,[requestId]);await pool.query(`UPDATE blood_request_acceptances SET status='cancelled' WHERE request_id=$1`,[requestId]);}else await pool.query(`UPDATE blood_request_acceptances SET status='cancelled' WHERE request_id=$1 AND volunteer_id=$2`,[requestId,actorId]);res.json({success:true});}catch(e){res.status(500).json({success:false,error:'Unable to cancel.'});}});
router.get('/api/notifications',async(req,res)=>{try{await ensureBloodSchema();const recipientId=String(req.query.recipientId||'').trim();if(!recipientId)return res.status(400).json({success:false,error:'Recipient ID is required.'});const r=await pool.query(`SELECT * FROM app_notifications WHERE recipient_id=$1 ORDER BY created_at DESC LIMIT 100`,[recipientId]);res.json({success:true,notifications:r.rows});}catch(e){res.status(500).json({success:false,error:'Unable to load notifications.'});}});
router.post('/api/notifications/:id/read',async(req,res)=>{try{await ensureBloodSchema();await pool.query('UPDATE app_notifications SET is_read=TRUE WHERE id=$1',[req.params.id]);res.json({success:true});}catch(e){res.status(500).json({success:false,error:'Unable to update notification.'});}});
router.post('/api/donations',async(req,res)=>{try{const {userId,donorName,donorEmail,amount,campaignId}=req.body;const transactionId=`TXN-${Math.floor(10000000+Math.random()*90000000)}`;await pool.query('INSERT INTO donations ("userId","donorName","donorEmail",amount,"campaignId","transactionId",status) VALUES ($1,$2,$3,$4,$5,$6,$7)',[userId||null,donorName,donorEmail||null,amount,campaignId||null,transactionId,'success']);if(userId)await pool.query('UPDATE users SET "isDonor"=true WHERE id=$1',[userId]);if(campaignId)await pool.query('UPDATE campaigns SET raised=COALESCE(raised,0)+$1 WHERE id=$2',[amount,campaignId]);res.json({success:true,transactionId,message:'Donation recorded successfully'});}catch(error:any){res.status(500).json({error:error.message});}});
setInterval(()=>{pool.query(`DELETE FROM blood_request_acceptances WHERE expires_at<=NOW()`).catch(()=>{});},60*60*1000);
export default router;