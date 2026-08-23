import express from "express";
import { authenticateToken, requireAdmin } from "../db/middleware.js";
import { pool } from "../db/dbPool.js";

const router = express.Router();
const TYPES = new Set(["initiative", "announcement", "banner", "article"]);
const STATUSES = new Set(["draft", "review", "published", "archived"]);
const URL_FIELDS = new Set(["image_url", "link_url"]);

function adminId(req: any) { return String(req.user?.id || req.user?.userId || req.user?.email || ""); }
function validType(type: unknown): type is string { return typeof type === "string" && TYPES.has(type); }
function validStatus(status: unknown): status is string { return typeof status === "string" && STATUSES.has(status); }
function validUrl(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 2048) return null;
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.toString() : null; } catch { return null; }
}
function validDate(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function validSort(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return 0;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}
function validateSchedule(startsAt: string | null, expiresAt: string | null) {
  return !(startsAt && expiresAt && new Date(expiresAt) <= new Date(startsAt));
}
function normalizeEditable(key: string, value: any): { ok: true; value: any } | { ok: false; error: string } {
  if (URL_FIELDS.has(key)) {
    const normalized = validUrl(value);
    if (value !== undefined && value !== null && value !== "" && !normalized) return { ok: false, error: `${key} must be an http(s) URL` };
    return { ok: true, value: normalized };
  }
  if (key === "starts_at" || key === "expires_at") {
    const normalized = validDate(value);
    if (value !== undefined && value !== null && value !== "" && !normalized) return { ok: false, error: `${key} is invalid` };
    return { ok: true, value: normalized };
  }
  if (key === "sort_order") {
    const normalized = validSort(value);
    return normalized === null ? { ok: false, error: "sort_order must be a non-negative integer" } : { ok: true, value: normalized };
  }
  if (key === "metadata") {
    if (value === undefined || value === null) return { ok: true, value: {} };
    if (typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "metadata must be an object" };
    return { ok: true, value };
  }
  if (key === "content_type") return validType(value) ? { ok: true, value } : { ok: false, error: "Invalid content type" };
  if (key === "title_en") {
    const normalized = String(value || "").trim();
    return normalized && normalized.length <= 255 ? { ok: true, value: normalized } : { ok: false, error: "title_en is required" };
  }
  return { ok: true, value: value === undefined ? null : value };
}

router.get("/api/content", async (req, res) => {
  try {
    const type = req.query.type;
    if (type !== undefined && !validType(type)) return res.status(400).json({ success: false, error: "Invalid content type" });
    const values: any[] = [];
    let where = "status='published' AND (starts_at IS NULL OR starts_at <= NOW()) AND (expires_at IS NULL OR expires_at > NOW())";
    if (type) { values.push(type); where += ` AND content_type=$${values.length}`; }
    const result = await pool.query(`SELECT id,content_type,title_en,title_hi,summary_en,summary_hi,body_en,body_hi,image_url,link_url,metadata,sort_order,starts_at,expires_at,published_at FROM governed_content_items WHERE ${where} ORDER BY sort_order ASC, published_at DESC`, values);
    res.json({ success: true, data: result.rows });
  } catch { res.status(500).json({ success: false, error: "Failed to fetch content" }); }
});

router.get("/api/admin/content", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const type = req.query.type, status = req.query.status;
    if (type !== undefined && !validType(type)) return res.status(400).json({ success:false,error:"Invalid content type" });
    if (status !== undefined && !validStatus(status)) return res.status(400).json({ success:false,error:"Invalid content status" });
    const values:any[]=[]; const clauses:string[]=[];
    if(type){values.push(type);clauses.push(`content_type=$${values.length}`)}
    if(status){values.push(status);clauses.push(`status=$${values.length}`)}
    const where=clauses.length?`WHERE ${clauses.join(" AND ")}`:"";
    const result=await pool.query(`SELECT * FROM governed_content_items ${where} ORDER BY updated_at DESC`,values);
    res.json({success:true,data:result.rows});
  } catch { res.status(500).json({success:false,error:"Failed to fetch governed content"}); }
});

router.post("/api/admin/content", authenticateToken, requireAdmin, async (req:any,res) => {
  try {
    const b=req.body||{};
    if(!validType(b.content_type)||!String(b.title_en||"").trim()) return res.status(400).json({success:false,error:"content_type and title_en are required"});
    const actor=adminId(req); if(!actor) return res.status(401).json({success:false,error:"Admin identity required"});
    const startsAt=validDate(b.starts_at), expiresAt=validDate(b.expires_at), sortOrder=validSort(b.sort_order);
    if ((b.starts_at && !startsAt) || (b.expires_at && !expiresAt)) return res.status(400).json({success:false,error:"Invalid content schedule"});
    if (!validateSchedule(startsAt, expiresAt)) return res.status(400).json({success:false,error:"expires_at must be after starts_at"});
    if (sortOrder === null) return res.status(400).json({success:false,error:"sort_order must be a non-negative integer"});
    const imageUrl=validUrl(b.image_url), linkUrl=validUrl(b.link_url);
    if ((b.image_url && !imageUrl) || (b.link_url && !linkUrl)) return res.status(400).json({success:false,error:"image_url and link_url must use http(s)"});
    if (b.metadata !== undefined && (typeof b.metadata !== "object" || b.metadata === null || Array.isArray(b.metadata))) return res.status(400).json({success:false,error:"metadata must be an object"});
    const r=await pool.query(`INSERT INTO governed_content_items (content_type,title_en,title_hi,summary_en,summary_hi,body_en,body_hi,image_url,link_url,metadata,status,sort_order,starts_at,expires_at,created_by,updated_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft',$11,$12,$13,$14,$14) RETURNING *`, [b.content_type,String(b.title_en).trim(),b.title_hi||null,b.summary_en||null,b.summary_hi||null,b.body_en||null,b.body_hi||null,imageUrl,linkUrl,b.metadata||{},sortOrder,startsAt,expiresAt,actor]);
    res.status(201).json({success:true,data:r.rows[0]});
  } catch { res.status(500).json({success:false,error:"Failed to create content"}); }
});

router.put("/api/admin/content/:id", authenticateToken, requireAdmin, async (req:any,res) => {
  try {
    const b=req.body||{}, actor=adminId(req); if(!actor)return res.status(401).json({success:false,error:"Admin identity required"});
    const fields=["content_type","title_en","title_hi","summary_en","summary_hi","body_en","body_hi","image_url","link_url","metadata","sort_order","starts_at","expires_at"];
    const entries=fields.filter(k=>Object.prototype.hasOwnProperty.call(b,k));
    if(!entries.length)return res.status(400).json({success:false,error:"No editable fields supplied"});
    const current=await pool.query("SELECT starts_at,expires_at FROM governed_content_items WHERE id=$1",[req.params.id]);
    if(!current.rows.length)return res.status(404).json({success:false,error:"Content not found"});
    const values:any[]=[]; const sets:string[]=[];
    const normalized:any={};
    for(const key of entries){ const result=normalizeEditable(key,b[key]); if(!result.ok)return res.status(400).json({success:false,error:result.error}); normalized[key]=result.value; }
    const startsAt=Object.prototype.hasOwnProperty.call(normalized,"starts_at")?normalized.starts_at:current.rows[0].starts_at;
    const expiresAt=Object.prototype.hasOwnProperty.call(normalized,"expires_at")?normalized.expires_at:current.rows[0].expires_at;
    if(!validateSchedule(startsAt?new Date(startsAt).toISOString():null,expiresAt?new Date(expiresAt).toISOString():null))return res.status(400).json({success:false,error:"expires_at must be after starts_at"});
    for(const key of entries){ values.push(normalized[key]); sets.push(`${key}=$${values.length}`); }
    values.push("draft",actor,req.params.id);
    sets.push(`status=$${values.length-2}`,`updated_by=$${values.length-1}`,"updated_at=NOW()","published_at=NULL","published_by=NULL");
    const r=await pool.query(`UPDATE governed_content_items SET ${sets.join(",")} WHERE id=$${values.length} RETURNING *`,values);
    res.json({success:true,data:r.rows[0]});
  } catch { res.status(500).json({success:false,error:"Failed to update content"}); }
});

router.post("/api/admin/content/:id/review", authenticateToken, requireAdmin, async (req:any,res)=>{ try { const actor=adminId(req); if(!actor)return res.status(401).json({success:false,error:"Admin identity required"}); const r=await pool.query("UPDATE governed_content_items SET status='review',updated_by=$1,updated_at=NOW() WHERE id=$2 AND status='draft' RETURNING *",[actor,req.params.id]); if(!r.rows.length)return res.status(409).json({success:false,error:"Only draft content can move to review"}); res.json({success:true,data:r.rows[0]}); } catch {res.status(500).json({success:false,error:"Failed to submit content for review"});} });
router.post("/api/admin/content/:id/publish", authenticateToken, requireAdmin, async (req:any,res)=>{ try { const actor=adminId(req); if(!actor)return res.status(401).json({success:false,error:"Admin identity required"}); const r=await pool.query("UPDATE governed_content_items SET status='published',published_by=$1,published_at=NOW(),updated_by=$1,updated_at=NOW(),archived_at=NULL WHERE id=$2 AND status='review' RETURNING *",[actor,req.params.id]); if(!r.rows.length)return res.status(409).json({success:false,error:"Only content in review can be published"}); res.json({success:true,data:r.rows[0]}); } catch {res.status(500).json({success:false,error:"Failed to publish content"});} });
router.post("/api/admin/content/:id/archive", authenticateToken, requireAdmin, async (req:any,res)=>{ try { const actor=adminId(req); if(!actor)return res.status(401).json({success:false,error:"Admin identity required"}); const r=await pool.query("UPDATE governed_content_items SET status='archived',archived_at=NOW(),updated_by=$1,updated_at=NOW() WHERE id=$2 AND status IN ('draft','review','published') RETURNING *",[actor,req.params.id]); if(!r.rows.length)return res.status(409).json({success:false,error:"Content cannot be archived from its current state"}); res.json({success:true,data:r.rows[0]}); } catch {res.status(500).json({success:false,error:"Failed to archive content"});} });
router.delete("/api/admin/content/:id", authenticateToken, requireAdmin, async (req,res)=>{ try { const r=await pool.query("DELETE FROM governed_content_items WHERE id=$1 RETURNING id",[req.params.id]); if(!r.rows.length)return res.status(404).json({success:false,error:"Content not found"}); res.json({success:true}); } catch {res.status(500).json({success:false,error:"Failed to delete content"});} });

export default router;
