import { Router } from "express";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pool } from "../db/dbPool.js";
import { authenticateToken, requireAdmin, auditEvent } from "../db/middleware.js";

const router = Router();
const execFileAsync = promisify(execFile);
const admin = [authenticateToken, requireAdmin] as const;

function isSuperAdmin(req: any): boolean {
  const role = String(req.user?.role || "").toLowerCase();
  return role === "super_admin" || role === "superadmin";
}

async function ensureControlTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_cms_versions (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by TEXT,
      label TEXT NOT NULL DEFAULT 'CMS snapshot',
      payload JSONB NOT NULL,
      checksum TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_feature_flags (
      key TEXT PRIMARY KEY,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      description TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by TEXT
    )
  `);
}

router.get("/api/admin/control/overview", ...admin, async (_req, res) => {
  const started = Date.now();
  try {
    await ensureControlTables();
    const db = await pool.query("SELECT NOW() AS server_time");
    const tables = await pool.query(`
      SELECT COUNT(*)::int AS count
      FROM information_schema.tables
      WHERE table_schema = current_schema()
    `);
    const versions = await pool.query("SELECT COUNT(*)::int AS count, MAX(created_at) AS latest FROM admin_cms_versions");
    const flags = await pool.query("SELECT COUNT(*)::int AS count, COUNT(*) FILTER (WHERE enabled)::int AS enabled FROM admin_feature_flags");
    return res.json({
      success: true,
      data: {
        status: "healthy",
        apiLatencyMs: Date.now() - started,
        database: { connected: true, serverTime: db.rows[0]?.server_time },
        schemaTables: tables.rows[0]?.count || 0,
        cmsVersions: versions.rows[0],
        featureFlags: flags.rows[0],
        node: process.version,
        environment: process.env.NODE_ENV || "development",
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Control center diagnostics failed." });
  }
});

router.get("/api/admin/control/cms/versions", ...admin, async (_req, res) => {
  try {
    await ensureControlTables();
    const result = await pool.query(`
      SELECT id, created_at, created_by, label, checksum,
             jsonb_object_length(payload) AS field_count
      FROM admin_cms_versions
      ORDER BY id DESC
      LIMIT 50
    `);
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Unable to load CMS history." });
  }
});

router.post("/api/admin/control/cms/snapshot", ...admin, async (req: any, res) => {
  try {
    await ensureControlTables();
    const payload = req.body?.payload ?? req.body ?? {};
    const label = String(req.body?.label || "CMS snapshot").slice(0, 160);
    const serialized = JSON.stringify(payload);
    const crypto = await import("node:crypto");
    const checksum = crypto.createHash("sha256").update(serialized).digest("hex");
    const existing = await pool.query("SELECT id FROM admin_cms_versions WHERE checksum=$1 LIMIT 1", [checksum]);
    if (existing.rows.length) return res.json({ success: true, id: existing.rows[0].id, duplicate: true });
    const result = await pool.query(
      `INSERT INTO admin_cms_versions(created_by,label,payload,checksum) VALUES($1,$2,$3::jsonb,$4) RETURNING id,created_at`,
      [String(req.user?.id || ""), label, serialized, checksum]
    );
    await auditEvent({ action: "cms_snapshot_created", resource: "cms", resourceId: String(result.rows[0].id), userId: String(req.user?.id || ""), req, metadata: { label, checksum } });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Unable to create CMS snapshot." });
  }
});

router.get("/api/admin/control/cms/versions/:id", ...admin, async (req, res) => {
  try {
    await ensureControlTables();
    const result = await pool.query("SELECT id,created_at,created_by,label,payload,checksum FROM admin_cms_versions WHERE id=$1", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: "CMS version not found." });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Unable to load CMS version." });
  }
});

router.get("/api/admin/control/feature-flags", ...admin, async (_req, res) => {
  try {
    await ensureControlTables();
    const result = await pool.query("SELECT key,enabled,description,updated_at,updated_by FROM admin_feature_flags ORDER BY key");
    return res.json({ success: true, data: result.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Unable to load feature flags." });
  }
});

router.put("/api/admin/control/feature-flags/:key", ...admin, async (req: any, res) => {
  try {
    await ensureControlTables();
    const key = String(req.params.key || "").trim();
    if (!/^[a-zA-Z0-9._-]{1,100}$/.test(key)) return res.status(400).json({ success: false, error: "Invalid feature flag key." });
    const enabled = Boolean(req.body?.enabled);
    const description = req.body?.description == null ? null : String(req.body.description).slice(0, 500);
    const result = await pool.query(
      `INSERT INTO admin_feature_flags(key,enabled,description,updated_by) VALUES($1,$2,$3,$4)
       ON CONFLICT(key) DO UPDATE SET enabled=$2,description=$3,updated_at=NOW(),updated_by=$4
       RETURNING key,enabled,description,updated_at,updated_by`,
      [key, enabled, description, String(req.user?.id || "")]
    );
    await auditEvent({ action: "feature_flag_updated", resource: "feature_flag", resourceId: key, userId: String(req.user?.id || ""), req, metadata: { enabled } });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || "Unable to update feature flag." });
  }
});

router.get("/api/admin/control/database/export", ...admin, async (req: any, res) => {
  if (!isSuperAdmin(req)) return res.status(403).json({ success: false, error: "Super Admin permission required." });
  try {
    const host = process.env.PGHOST || "";
    const port = process.env.PGPORT || "5432";
    const user = process.env.PGUSER || "";
    const database = process.env.PGDATABASE || "";
    const password = process.env.PGPASSWORD || "";
    if (!database || !user) return res.status(503).json({ success: false, error: "Database export is not configured on this server." });
    const args = ["--no-owner", "--no-privileges", "--format=plain", "--host", host, "--port", port, "--username", user, "--dbname", database];
    const { stdout } = await execFileAsync("pg_dump", args, { env: { ...process.env, PGPASSWORD: password }, maxBuffer: 25 * 1024 * 1024 });
    await auditEvent({ action: "database_exported", resource: "database", userId: String(req.user?.id || ""), req });
    res.setHeader("Content-Type", "application/sql; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=rp-foundation-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`);
    return res.send(stdout);
  } catch (error: any) {
    console.error("Admin database export error:", error);
    return res.status(503).json({ success: false, error: "Database export is unavailable on this server. Ensure pg_dump is installed and database credentials are configured." });
  }
});

export default router;
