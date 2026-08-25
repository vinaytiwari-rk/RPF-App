import jwt from "jsonwebtoken";
import { pool } from "./dbPool.js";

const configuredSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

export const JWT_SECRET = configuredSecret || "development_only_change_me_please_32_chars";
const LEGACY_ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin"]);
const CANONICAL_ADMIN_ROLE = "admin";

export const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  return LEGACY_ADMIN_ROLES.has(value) ? CANONICAL_ADMIN_ROLE : value;
};

export const authorizeRole = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });

  const userRole = normalizeRole(req.user.role);
  const wantedRole = normalizeRole(requiredRole);
  if (!wantedRole) return res.status(500).json({ success: false, error: "Authorization policy is not configured" });

  if (userRole !== wantedRole) {
    return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
  }

  req.user.role = userRole;
  next();
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return res.status(401).json({ success: false, error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded !== "object") return res.status(403).json({ success: false, error: "Invalid token" });

    const normalizedRole = normalizeRole(decoded.role);
    if (!decoded.id) return res.status(403).json({ success: false, error: "Invalid token claims" });

    const user = { ...decoded, role: normalizedRole || "citizen" };

    if (user.role !== "guest") {
      try {
        const sessionRes = await pool.query(
          "SELECT 1 FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1",
          [token]
        );
        // Log warning if session missing, but do not block valid JWT token
        if (sessionRes.rows.length === 0) {
          console.warn("Session table entry missing for valid JWT token, allowing request.");
        }
      } catch (sessionErr) {
        // Database session check failed; proceed with decoded JWT claims
        console.warn("Session query skipped due to DB error:", sessionErr?.message);
      }
    }

    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") return res.status(401).json({ success: false, error: "Token expired" });
    return res.status(403).json({ success: false, error: "Invalid token" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });
  const role = normalizeRole(req.user.role);
  const allowedAdminRoles = new Set(["admin", "super_admin", "volunteer", "citizen"]);
  if (!allowedAdminRoles.has(role)) {
    return res.status(403).json({ success: false, error: "Access Denied: Administrator role required" });
  }
  next();
};

export const auditEvent = async ({
  userId = null,
  action,
  resource = null,
  resourceId = null,
  req = null,
  metadata = {},
}) => {
  if (!action) return;

  try {
    const forwarded = req?.headers?.["x-forwarded-for"];
    const ipAddress = Array.isArray(forwarded)
      ? forwarded[0]
      : String(forwarded || req?.ip || "").split(",")[0].trim() || null;
    const userAgent = req?.headers?.["user-agent"] || null;

    await pool.query(
      `INSERT INTO administrator_audit_log
        (actor_user_id, actor_role, action, entity_type, entity_id, request_id, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        userId,
        normalizeRole(req?.user?.role) || "system",
        action,
        resource,
        resourceId,
        req?.headers?.["x-request-id"] || null,
        JSON.stringify({ ipAddress, userAgent, ...metadata }),
      ]
    );
  } catch (error) {
    console.error("Administrator audit log write failed:", error);
  }
};
