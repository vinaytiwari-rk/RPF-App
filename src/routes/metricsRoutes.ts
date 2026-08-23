import express from "express";
import { authenticateToken, requireAdmin } from "../db/middleware.js";
import { pool } from "../db/dbPool.js";

const router = express.Router();
const actor = (req: any) => String(req.user?.id || req.user?.userId || req.user?.email || "");
const METRIC_KEY = /^[a-z0-9][a-z0-9._-]{0,99}$/;

function text(value: unknown, max = 255): string | null {
  if (value === undefined || value === null) return null;
  const result = String(value).trim();
  return result && result.length <= max ? result : null;
}
function numberValue(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= 0 ? result : null;
}
function sortValue(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const result = Number(value);
  return Number.isInteger(result) && result >= 0 ? result : null;
}

router.get("/api/metrics", async (_req, res) => {
  try {
    const r = await pool.query("SELECT id,metric_key,label_en,label_hi,value,unit,sort_order,published_at FROM content_metrics WHERE is_published=true ORDER BY sort_order ASC,created_at ASC");
    res.json({ success: true, data: r.rows });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch metrics" });
  }
});

router.get("/api/admin/metrics", authenticateToken, requireAdmin, async (_req, res) => {
  try {
    const r = await pool.query("SELECT * FROM content_metrics ORDER BY updated_at DESC");
    res.json({ success: true, data: r.rows });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch metrics" });
  }
});

router.post("/api/admin/metrics", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const a = actor(req);
    if (!a) return res.status(401).json({ success: false, error: "Admin identity required" });
    const b = req.body || {};
    const metricKey = text(b.metric_key, 100)?.toLowerCase() || "";
    const labelEn = text(b.label_en);
    const value = b.value === undefined ? 0 : numberValue(b.value);
    const sortOrder = b.sort_order === undefined ? 0 : sortValue(b.sort_order);
    if (!METRIC_KEY.test(metricKey)) return res.status(400).json({ success: false, error: "Invalid metric_key" });
    if (!labelEn) return res.status(400).json({ success: false, error: "label_en is required" });
    if (value === null) return res.status(400).json({ success: false, error: "value must be a non-negative number" });
    if (sortOrder === null) return res.status(400).json({ success: false, error: "sort_order must be a non-negative integer" });
    const r = await pool.query(
      "INSERT INTO content_metrics(metric_key,label_en,label_hi,value,unit,sort_order,is_published) VALUES($1,$2,$3,$4,$5,$6,false) RETURNING *",
      [metricKey, labelEn, text(b.label_hi), value, text(b.unit, 50), sortOrder]
    );
    res.status(201).json({ success: true, data: r.rows[0] });
  } catch (error: any) {
    if (error?.code === "23505") return res.status(409).json({ success: false, error: "metric_key already exists" });
    res.status(500).json({ success: false, error: "Failed to create metric" });
  }
});

router.put("/api/admin/metrics/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    const fields = ["metric_key", "label_en", "label_hi", "value", "unit", "sort_order"];
    const entries = fields.filter((key) => Object.prototype.hasOwnProperty.call(b, key));
    if (!entries.length) return res.status(400).json({ success: false, error: "No editable fields supplied" });

    const values: any[] = [];
    const sets: string[] = [];
    for (const key of entries) {
      let value = b[key];
      if (key === "metric_key") {
        value = text(value, 100)?.toLowerCase() || "";
        if (!METRIC_KEY.test(value)) return res.status(400).json({ success: false, error: "Invalid metric_key" });
      } else if (key === "label_en") {
        value = text(value);
        if (!value) return res.status(400).json({ success: false, error: "label_en cannot be empty" });
      } else if (key === "label_hi") value = text(value);
      else if (key === "unit") value = text(value, 50);
      else if (key === "value") {
        value = numberValue(value);
        if (value === null) return res.status(400).json({ success: false, error: "value must be a non-negative number" });
      } else if (key === "sort_order") {
        value = sortValue(value);
        if (value === null) return res.status(400).json({ success: false, error: "sort_order must be a non-negative integer" });
      }
      values.push(value);
      sets.push(`${key}=$${values.length}`);
    }
    sets.push("is_published=false", "published_at=NULL", "published_by=NULL", "updated_at=NOW()");
    values.push(req.params.id);
    const r = await pool.query(`UPDATE content_metrics SET ${sets.join(",")} WHERE id=$${values.length} RETURNING *`, values);
    if (!r.rows.length) return res.status(404).json({ success: false, error: "Metric not found" });
    res.json({ success: true, data: r.rows[0] });
  } catch (error: any) {
    if (error?.code === "23505") return res.status(409).json({ success: false, error: "metric_key already exists" });
    res.status(500).json({ success: false, error: "Failed to update metric" });
  }
});

router.post("/api/admin/metrics/:id/publish", authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const a = actor(req);
    if (!a) return res.status(401).json({ success: false, error: "Admin identity required" });
    const r = await pool.query("UPDATE content_metrics SET is_published=true,published_at=NOW(),published_by=$1,updated_at=NOW() WHERE id=$2 RETURNING *", [a, req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, error: "Metric not found" });
    res.json({ success: true, data: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, error: "Failed to publish metric" });
  }
});

router.post("/api/admin/metrics/:id/unpublish", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query("UPDATE content_metrics SET is_published=false,published_at=NULL,published_by=NULL,updated_at=NOW() WHERE id=$1 RETURNING *", [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, error: "Metric not found" });
    res.json({ success: true, data: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, error: "Failed to unpublish metric" });
  }
});

router.delete("/api/admin/metrics/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query("DELETE FROM content_metrics WHERE id=$1 RETURNING id", [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ success: false, error: "Metric not found" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete metric" });
  }
});

export default router;
