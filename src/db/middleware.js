import jwt from "jsonwebtoken";
import { pool } from "./dbPool.js";

const configuredSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

export const JWT_SECRET = configuredSecret || "development_only_change_me_please_32_chars";
const LEGACY_ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin"]);
const CANONICAL_ADMIN_ROLE = "admin";

export const authorizeRole = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });

  const userRole = String(req.user.role || "").trim().toLowerCase();
  const wantedRole = String(requiredRole || "").trim().toLowerCase();

  if (!wantedRole) {
    return res.status(500).json({ success: false, error: "Authorization policy is not configured" });
  }

  if (["admin", "super_admin", "superadmin"].includes(wantedRole)) {
    if (userRole !== CANONICAL_ADMIN_ROLE) {
      return res.status(403).json({ success: false, error: "Access Denied: Administrator role required" });
    }
  } else if (userRole !== wantedRole) {
    return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
  }

  next();
};

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return res.status(401).json({ success: false, error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = { ...decoded };

    if (user.role !== "guest") {
      const sessionRes = await pool.query(
        "SELECT 1 FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1",
        [token]
      );
      if (sessionRes.rows.length === 0) {
        return res.status(401).json({ success: false, error: "Session expired or logged out" });
      }
    }

    // Compatibility for existing tokens: legacy administrator roles are
    // normalized to the single canonical Administrator role for this request.
    if (LEGACY_ADMIN_ROLES.has(String(user.role || "").trim().toLowerCase())) {
      user.role = CANONICAL_ADMIN_ROLE;
    }

    req.user = user;
    req.authToken = token;
    next();
  } catch (error) {
    if (error?.name === "TokenExpiredError") return res.status(401).json({ success: false, error: "Token expired" });
    if (error?.code || error?.message?.includes("sessions")) {
      console.error("Authentication session validation failed:", error);
      return res.status(503).json({ success: false, error: "Authentication service temporarily unavailable" });
    }
    return res.status(403).json({ success: false, error: "Invalid token" });
  }
};

export const requireAdmin = (req, res, next) => {
  const role = String(req.user?.role || "").trim().toLowerCase();
  if (role !== CANONICAL_ADMIN_ROLE) {
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
      `INSERT INTO audit_logs
        (user_id, action, resource, resource_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [userId, action, resource, resourceId, ipAddress, userAgent, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
};
