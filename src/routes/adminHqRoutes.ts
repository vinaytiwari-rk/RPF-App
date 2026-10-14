import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { updateServiceContent } from "../controllers/adminHqController.js";
import { pool } from "../db/dbPool.js";
import { authenticateToken, requireAdmin, JWT_SECRET, auditEvent } from "../db/middleware.js";
import adminControlRoutes from "./adminControlRoutes.js";

const router = Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many administrator login attempts. Please try again later." },
});

/**
 * Repair the legacy session-table contract before issuing an administrator token.
 * Some production databases were created with sessions.token VARCHAR(255), which
 * truncates/rejects JWTs. Do not rely on asynchronous boot migrations having finished.
 */
async function ensureAdminSessionSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Older deployments may have a partial sessions table. Inspect first and only
  // perform DDL when a required column/constraint is actually missing or incompatible.
  let columns = await pool.query(
    `SELECT column_name, data_type, is_nullable, column_default, is_identity
       FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'sessions'`
  );
  let byName = new Map(columns.rows.map((row: any) => [row.column_name, row]));
  if (!byName.has("user_id")) await pool.query("ALTER TABLE sessions ADD COLUMN user_id VARCHAR(255)");
  if (!byName.has("token")) await pool.query("ALTER TABLE sessions ADD COLUMN token TEXT");
  if (!byName.has("expires_at")) await pool.query("ALTER TABLE sessions ADD COLUMN expires_at TIMESTAMPTZ");
  if (!byName.has("created_at")) await pool.query("ALTER TABLE sessions ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()");

  columns = await pool.query(
    `SELECT column_name, data_type, is_nullable, column_default, is_identity
       FROM information_schema.columns
      WHERE table_schema = current_schema() AND table_name = 'sessions'`
  );
  byName = new Map(columns.rows.map((row: any) => [row.column_name, row]));
  // Session records may belong to either a citizen/volunteer or an admin_credentials row.
  // Legacy deployments sometimes constrained user_id to users(id) or typed it as UUID,
  // which makes legitimate administrator session inserts fail. The token row is the
  // authorization source, so keep user_id as a text identifier without a users-only FK.
  await pool.query(`
    DO $session_repair$
    DECLARE fk RECORD;
    DECLARE user_id_attnum SMALLINT;
    BEGIN
      SELECT attnum INTO user_id_attnum
        FROM pg_attribute
       WHERE attrelid = 'sessions'::regclass
         AND attname = 'user_id'
         AND NOT attisdropped;
      IF user_id_attnum IS NOT NULL THEN
        FOR fk IN
          SELECT conname
            FROM pg_constraint
           WHERE conrelid = 'sessions'::regclass
             AND contype = 'f'
             AND user_id_attnum = ANY(conkey)
        LOOP
          EXECUTE format('ALTER TABLE sessions DROP CONSTRAINT IF EXISTS %I', fk.conname);
        END LOOP;
      END IF;
    END $session_repair$;
  `);

  const userIdColumn: any = byName.get("user_id");
  if (userIdColumn && userIdColumn.data_type !== "character varying") {
    await pool.query("ALTER TABLE sessions ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::TEXT");
  }

  const tokenColumn: any = byName.get("token");
  const expiryColumn: any = byName.get("expires_at");

  if (tokenColumn?.data_type !== "text") {
    await pool.query("ALTER TABLE sessions ALTER COLUMN token TYPE TEXT USING token::TEXT");
  }
  if (tokenColumn?.is_nullable === "YES") {
    // Rows without tokens can never authenticate a session; remove only these unusable rows.
    await pool.query("DELETE FROM sessions WHERE token IS NULL");
    await pool.query("ALTER TABLE sessions ALTER COLUMN token SET NOT NULL");
  }
  if (expiryColumn?.is_nullable === "YES") {
    // Incomplete legacy sessions are expired immediately, never granted a fresh lifetime.
    await pool.query("UPDATE sessions SET expires_at = NOW() WHERE expires_at IS NULL");
    await pool.query("ALTER TABLE sessions ALTER COLUMN expires_at SET NOT NULL");
  }
  await pool.query("CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)");

  // Return the real legacy id contract so the INSERT matches UUID, text, or serial schemas.
  return byName.get("id") || null;
}

router.post("/api/auth/admin-login", adminLoginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
    if (!normalizedIdentifier || !password) {
      await auditEvent({ action: "admin_login_failed", resource: "administrator", req, metadata: { reason: "missing_credentials" } });
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }

    const result = await pool.query(
      `SELECT id, username, password_hash, role FROM admin_credentials WHERE LOWER(username)=LOWER($1) LIMIT 1`,
      [normalizedIdentifier]
    );
    if (!result.rows.length) {
      await auditEvent({ action: "admin_login_failed", resource: "administrator", req, metadata: { reason: "unknown_identifier" } });
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }

    const credential = result.rows[0];
    const storedHash = String(credential.password_hash || "");
    let valid = false;
    let legacySha256 = false;
    if (storedHash.startsWith("$2")) {
      valid = await bcrypt.compare(String(password), storedHash);
    } else if (/^[a-f0-9]{64}$/i.test(storedHash)) {
      // Support existing SHA-256 admin credentials during migration, then upgrade
      // the hash immediately after successful verification.
      const suppliedHash = crypto.createHash("sha256").update(String(password)).digest();
      const storedDigest = Buffer.from(storedHash, "hex");
      legacySha256 = storedDigest.length === suppliedHash.length && crypto.timingSafeEqual(storedDigest, suppliedHash);
      valid = legacySha256;
    }
    if (!valid) {
      await auditEvent({ action: "admin_login_failed", resource: "administrator", req, metadata: { reason: "invalid_password", username: normalizedIdentifier } });
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }

    if (legacySha256) {
      const upgradedHash = await bcrypt.hash(String(password), 12);
      await pool.query("UPDATE admin_credentials SET password_hash = $1 WHERE id = $2", [upgradedHash, credential.id]);
    }

    // Only an explicitly provisioned administrator credential may issue an admin session.
    // Never promote a credential with a missing, malformed, or ordinary-user role.
    const storedRole = String(credential.role || "").trim().toLowerCase();
    if (!["admin", "super_admin", "superadmin"].includes(storedRole)) {
      await auditEvent({
        action: "admin_login_failed",
        resource: "administrator",
        userId: String(credential.id),
        req,
        metadata: { reason: "credential_role_not_authorized", storedRole: storedRole || "missing" },
      });
      return res.status(403).json({ success: false, error: "This account is not authorized for administrator access." });
    }

    // The application has one canonical privileged role: admin.
    const user = { id: String(credential.id), name: "System Administrator", role: "admin" };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "30d" });

    try {
      // Repair/verify the actual database schema synchronously before session persistence.
      const sessionIdColumn = await ensureAdminSessionSchema();
      const sessionIdType = String(sessionIdColumn?.data_type || "").toLowerCase();
      const numericSessionId = ["smallint", "integer", "bigint"].includes(sessionIdType);
      const hasGeneratedSessionId = Boolean(sessionIdColumn?.column_default) || sessionIdColumn?.is_identity === "YES";

      if (numericSessionId && hasGeneratedSessionId) {
        // Legacy SERIAL/IDENTITY schemas must generate their own numeric primary key.
        await pool.query(
          `INSERT INTO sessions(user_id,token,expires_at) VALUES($1,$2,NOW()+INTERVAL '30 days')`,
          [String(user.id), token]
        );
      } else if (numericSessionId) {
        throw new Error("sessions.id is numeric but has no database generator");
      } else {
        // UUID strings work for both UUID and text/varchar primary-key schemas.
        await pool.query(
          `INSERT INTO sessions(id,user_id,token,expires_at) VALUES($1,$2,$3,NOW()+INTERVAL '30 days')`,
          [crypto.randomUUID(), String(user.id), token]
        );
      }
    } catch (e: any) {
      // Keep internal DB details in server logs only; never expose schema details to clients.
      console.error("Administrator session tracking failed:", {
        message: e?.message,
        code: e?.code,
        detail: e?.detail,
        constraint: e?.constraint,
      });
      return res.status(503).json({ success: false, error: "Secure administrator session could not be created. Please retry." });
    }

    await auditEvent({ action: "admin_login_success", resource: "administrator", userId: user.id, req, metadata: { role: "admin" } });
    return res.json({ success: true, user, token });
  } catch (error) {
    console.error("Administrator login error:", error);
    return res.status(500).json({ success: false, error: "Administrator login failed." });
  }
});

router.all("/api/admin-setup", (_req, res) => res.status(410).json({ success: false, error: "Administrator setup endpoint has been retired." }));
const admin = [authenticateToken, requireAdmin] as const;

// Unified Supreme Admin control-plane APIs. Mounted here so all admin control
// endpoints share the same canonical authentication/route registration path.
router.use(adminControlRoutes);

router.get("/api/admin/volunteers", ...admin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const offset = (page - 1) * limit;
    const count = await pool.query(`SELECT COUNT(*)::int AS count FROM volunteers`);
    const result = await pool.query(`SELECT id,username,registration_number,full_name AS name,father_husband_name,mother_name,approval_status AS status,dob,mobile,email,blood_group,country,state,city,address,pincode,area_locality,sansad_kshetra,vidhan_sabha,ward_no,created_at FROM volunteers ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    return res.json({ success: true, data: result.rows, totalPages: Math.ceil(count.rows[0].count / limit), currentPage: page, totalCount: count.rows[0].count });
  } catch (error) {
    console.error("Admin volunteers error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch volunteers." });
  }
});

router.put("/api/admin/volunteers/:id/status", ...admin, async (req, res) => {
  try {
    const status = String(req.body?.status || '').toLowerCase();
    if (!['pending', 'approved', 'rejected', 'inactive'].includes(status)) return res.status(400).json({ success: false, error: "Invalid volunteer status." });
    const result = await pool.query(`UPDATE volunteers SET approval_status=$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING id,username,registration_number,full_name AS name,approval_status AS status,updated_at`, [status, req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, error: "Volunteer not found." });
    await auditEvent({ action: "volunteer_status_updated", resource: "volunteer", resourceId: String(req.params.id), userId: String(req.user?.id || ""), req, metadata: { status } });
    return res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Admin volunteer status error:", error);
    return res.status(500).json({ success: false, error: "Failed to update volunteer status." });
  }
});

router.get("/api/admin/blood_donors", ...admin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT v.id,v.username,v.full_name AS name,v.mobile,v.email,m.blood_group,m.is_active,CONCAT_WS(', ',v.city,v.state) AS location,m.created_at FROM volunteer_blood_memberships m JOIN volunteers v ON v.id=m.volunteer_id ORDER BY m.updated_at DESC`);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Admin blood members error:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch Blood Network members." });
  }
});

router.get("/api/admin/blood-network/requests", ...admin, async (_req, res) => {
  try {
    const result = await pool.query(`SELECT r.*,v.full_name AS requester_name,v.mobile AS requester_mobile FROM blood_requests r LEFT JOIN volunteers v ON v.id=r.requester_id ORDER BY r.created_at DESC LIMIT 200`);
    return res.json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch Blood Network requisitions." });
  }
});

router.get("/api/admin/blood-network/summary", ...admin, async (_req, res) => {
  try {
    const [members, groups, requests] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE is_active)::int AS active FROM volunteer_blood_memberships`),
      pool.query(`SELECT blood_group,COUNT(*)::int AS count FROM volunteer_blood_memberships WHERE is_active=TRUE GROUP BY blood_group ORDER BY blood_group`),
      pool.query(`SELECT COUNT(*) FILTER(WHERE status='open')::int AS open,COUNT(*) FILTER(WHERE status='cancelled')::int AS cancelled,COUNT(*)::int AS total FROM blood_requests`)
    ]);
    return res.json({ success: true, data: { members: members.rows[0], groups: groups.rows, requests: requests.rows[0] } });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to load Blood Network summary." });
  }
});

router.get("/api/admin/system/diagnostics", ...admin, async (_req, res) => {
  try {
    const required: Record<string, string[]> = {
      volunteers: ["id", "username", "full_name", "password_hash", "approval_status", "mobile", "email", "blood_group", "created_at", "updated_at"],
      users: ["id", "username", "name", "email", "phone", "role"],
      service_content: ["service_id", "content", "action_url", "updated_at"],
      app_settings: ["id"],
      admin_credentials: ["id", "username", "password_hash"],
      sessions: ["id", "user_id", "token", "expires_at"],
      volunteer_blood_memberships: ["volunteer_id", "blood_group", "is_active"],
      blood_requests: ["id", "requester_id", "blood_group", "status", "created_at"],
      grievances: ["id", "status", "created_at"],
      donations: ["created_at"],
      card_applications: ["created_at"],
      health_camps: ["date"]
    };
    const tables = Object.keys(required);
    const tableRows = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() AND table_name = ANY($1::text[])`, [tables]);
    const presentTables = new Set(tableRows.rows.map((r: any) => r.table_name));
    const columnRows = await pool.query(`SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=current_schema() AND table_name = ANY($1::text[])`, [tables]);
    const columnsByTable: Record<string, Set<string>> = {};
    for (const row of columnRows.rows) (columnsByTable[row.table_name] ||= new Set()).add(row.column_name);
    const checks = tables.map(table => ({ table, present: presentTables.has(table), missing: required[table].filter(column => !columnsByTable[table]?.has(column)) }));
    const failed = checks.filter(check => !check.present || check.missing.length > 0);
    return res.json({ success: failed.length === 0, data: { status: failed.length === 0 ? "healthy" : "attention_required", checks, checkedAt: new Date().toISOString() } });
  } catch (error) {
    console.error("Admin diagnostics error:", error);
    return res.status(500).json({ success: false, error: "Unable to run system diagnostics." });
  }
});

router.put("/services/:serviceId/content", ...admin, updateServiceContent);

export default router;
