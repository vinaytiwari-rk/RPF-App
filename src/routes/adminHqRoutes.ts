import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getServiceContent, updateServiceContent } from "../controllers/adminHqController.js";
import { pool } from "../db/dbPool.js";
import { authenticateToken, requireAdmin, JWT_SECRET } from "../db/middleware.js";

const router = Router();

router.post("/api/auth/admin-login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (String(identifier || "").trim().toLowerCase() !== "admin" || !password) return res.status(401).json({ success:false,error:"Invalid administrator credentials." });
    const result = await pool.query(`SELECT * FROM admin_credentials WHERE LOWER(username)=LOWER($1) LIMIT 1`, ["admin"]);
    if (!result.rows.length) return res.status(401).json({ success:false,error:"Administrator account is not configured." });
    const valid = await bcrypt.compare(String(password), result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ success:false,error:"Invalid administrator credentials." });
    const user={id:"usr_staff_admin",name:"System Administrator",role:"admin"};
    const token=jwt.sign(user,JWT_SECRET,{expiresIn:"7d"});
    try{await pool.query(`INSERT INTO sessions(id,user_id,token,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '7 days') ON CONFLICT(id) DO NOTHING`,[`admin-${Date.now()}`,user.id,token]);}catch(e){console.warn("Administrator session tracking failed:",e);}
    return res.json({success:true,user,token});
  }catch(error){console.error("Administrator login error:",error);return res.status(500).json({success:false,error:"Administrator login failed."});}
});

router.all("/api/admin-setup", (_req,res)=>res.status(410).json({success:false,error:"Administrator setup endpoint has been retired."}));

const admin= [authenticateToken,requireAdmin] as const;

// Reliable volunteer management. These routes are mounted before the legacy admin routes.
router.get("/api/admin/volunteers", ...admin, async (req,res)=>{
  try{
    const page=Math.max(1,Number(req.query.page)||1),limit=Math.min(100,Math.max(1,Number(req.query.limit)||50)),offset=(page-1)*limit;
    const count=await pool.query(`SELECT COUNT(*)::int AS count FROM volunteers`);
    const result=await pool.query(`SELECT id,username,registration_number,full_name AS name,father_husband_name,mother_name,approval_status AS status,dob,mobile,email,blood_group,country,state,city,address,pincode,area_locality,sansad_kshetra,vidhan_sabha,ward_no,created_at FROM volunteers ORDER BY created_at DESC LIMIT $1 OFFSET $2`,[limit,offset]);
    return res.json({success:true,data:result.rows,totalPages:Math.ceil(count.rows[0].count/limit),currentPage:page,totalCount:count.rows[0].count});
  }catch(error){console.error("Admin volunteers error:",error);return res.status(500).json({success:false,error:"Failed to fetch volunteers."});}
});

router.put("/api/admin/volunteers/:id/status", ...admin, async (req,res)=>{
  try{
    const status=String(req.body?.status||'').toLowerCase();
    if(!['pending','approved','rejected','inactive'].includes(status))return res.status(400).json({success:false,error:"Invalid volunteer status."});
    const result=await pool.query(`UPDATE volunteers SET approval_status=$1 WHERE id=$2 RETURNING id,username,registration_number,full_name AS name,approval_status AS status`,[status,req.params.id]);
    if(!result.rows.length)return res.status(404).json({success:false,error:"Volunteer not found."});
    return res.json({success:true,data:result.rows[0]});
  }catch(error){console.error("Admin volunteer status error:",error);return res.status(500).json({success:false,error:"Failed to update volunteer status."});}
});

router.get("/api/admin/blood_donors", ...admin, async (_req,res)=>{
  try{
    const result=await pool.query(`SELECT v.id,v.username,v.full_name AS name,v.mobile,v.email,m.blood_group,m.is_active,CONCAT_WS(', ',v.city,v.state) AS location,m.created_at FROM volunteer_blood_memberships m JOIN volunteers v ON v.id=m.volunteer_id ORDER BY m.updated_at DESC`);
    return res.json({success:true,data:result.rows});
  }catch(error){console.error("Admin blood members error:",error);return res.status(500).json({success:false,error:"Failed to fetch Blood Network members."});}
});

router.get("/api/admin/blood-network/requests", ...admin, async (_req,res)=>{
  try{
    const result=await pool.query(`SELECT r.*,v.full_name AS requester_name,v.mobile AS requester_mobile FROM blood_requests r LEFT JOIN volunteers v ON v.id=r.requester_id ORDER BY r.created_at DESC LIMIT 200`);
    return res.json({success:true,data:result.rows});
  }catch(error){return res.status(500).json({success:false,error:"Failed to fetch Blood Network requisitions."});}
});

router.get("/api/admin/blood-network/summary", ...admin, async (_req,res)=>{
  try{
    const [members,groups,requests]=await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE is_active)::int AS active FROM volunteer_blood_memberships`),
      pool.query(`SELECT blood_group,COUNT(*)::int AS count FROM volunteer_blood_memberships WHERE is_active=TRUE GROUP BY blood_group ORDER BY blood_group`),
      pool.query(`SELECT COUNT(*) FILTER(WHERE status='open')::int AS open,COUNT(*) FILTER(WHERE status='cancelled')::int AS cancelled,COUNT(*)::int AS total FROM blood_requests`)
    ]);
    return res.json({success:true,data:{members:members.rows[0],groups:groups.rows,requests:requests.rows[0]}});
  }catch(error){return res.status(500).json({success:false,error:"Failed to load Blood Network summary."});}
});

router.get("/services/:serviceId/content", getServiceContent);
router.post("/services/:serviceId/content", updateServiceContent);

export default router;
