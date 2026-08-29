import jwt from "jsonwebtoken";
import { pool } from "./dbPool.js";

const configuredSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

export const JWT_SECRET = configuredSecret || "development_only_change_me_please_32_chars";
export const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "superadmin" || value === "super_admin") return "super_admin";
  if (value === "admin") return "admin";
  if (value === "volunteer") return "volunteer";
  if (value === "guest") return "guest";
  return "citizen";
};

export const authorizeRole = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });

  const userRole = normalizeRole(req.user.role);
  const wantedRole = normalizeRole(requiredRole);
  if (!wantedRole) return res.status(500).json({ success: false, error: "Authorization policy is not configured" });

  if (userRole !== wantedRole && userRole !== "super_admin") {
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
        if (sessionRes.rows.length === 0) {
          console.warn("Session missing or expired for token:", token.substring(0, 10));
          // Fail-closed for admin and super_admin users
          if (["admin", "super_admin"].includes(user.role)) {
            return res.status(401).json({ success: false, error: "Session expired or logged out" });
          }
        }
      } catch (sessionErr) {
        console.warn("Session query failed:", sessionErr?.message);
        if (["admin", "super_admin"].includes(user.role)) {
          return res.status(401).json({ success: false, error: "Session validation unavailable" });
        }
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
  if (role !== "admin" && role !== "super_admin") {
    return res.status(403).json({ success: false, error: "Access Denied: Administrator role required" });
  }
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });
  const role = normalizeRole(req.user.role);
  if (role !== "super_admin") {
    return res.status(403).json({ success: false, error: "Access Denied: Super Admin role required" });
  }
  next();
};

export const requireVolunteer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });
  const role = normalizeRole(req.user.role);
  const isVol = req.user.isVolunteer || req.user.is_volunteer;
  if (role !== "volunteer" && role !== "admin" && role !== "super_admin" && !isVol) {
    return res.status(403).json({ success: false, error: "Access Denied: Volunteer role required" });
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
