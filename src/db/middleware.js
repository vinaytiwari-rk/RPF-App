import jwt from "jsonwebtoken";
import { pool } from "./dbPool.js";

const configuredSecret = process.env.JWT_SECRET?.trim();
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("JWT_SECRET must be configured with at least 32 characters in production.");
}

export const JWT_SECRET = configuredSecret || "development_only_change_me_please_32_chars";

/**
 * Unified 2-Role System:
 * 1. "admin" (Merges admin + superadmin into one)
 * 2. "user"  (Merges citizen + volunteer + user into one)
 * 3. "guest" (Unauthenticated visitors)
 */
export const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();
  if (value === "superadmin" || value === "super_admin" || value === "admin") return "admin";
  if (value === "guest") return "guest";
  return "user";
};

export const authorizeRole = (requiredRole) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });

  const userRole = normalizeRole(req.user.role);
  const wantedRole = normalizeRole(requiredRole);

  if (wantedRole === "admin" && userRole !== "admin") {
    return res.status(403).json({ success: false, error: "Access Denied: Administrator role required" });
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

    if (!decoded.id) return res.status(403).json({ success: false, error: "Invalid token claims" });

    // Master Admin Auto-Resolution for Shri Vinay Tiwari & Authorized System Admins
    const isMasterAdmin = 
      String(decoded.id).toLowerCase() === 'admin' ||
      String(decoded.id) === '751e722c-ba4f-4d36-bc50-2be7376cc38a' ||
      String(decoded.username || '').toLowerCase() === 'vinaytiwari' ||
      String(decoded.email || '').toLowerCase() === 'tiwari.vinay89@gmail.com' ||
      String(decoded.phone || decoded.mobile || '') === '9399945861';

    let normalizedRole = normalizeRole(decoded.role);
    if (isMasterAdmin) {
      normalizedRole = "admin";
    }

    if (normalizedRole === "admin") {
      let isAuthorized = isMasterAdmin;
      if (!isAuthorized) {
        try {
          const credential = await pool.query(
            "SELECT id FROM admin_credentials WHERE (id::text = $1 OR LOWER(username) = LOWER($1)) AND LOWER(COALESCE(role, '')) IN ('admin', 'super_admin', 'superadmin') LIMIT 1",
            [String(decoded.id)]
          );
          if (credential.rows.length > 0) {
            isAuthorized = true;
          }
        } catch (error) {
          console.error("Administrator credential verification failed:", error);
          return res.status(503).json({ success: false, error: "Administrator access could not be verified. Please retry." });
        }
      }
      if (!isAuthorized) {
        return res.status(403).json({ success: false, error: "Administrator credentials are not active for this account." });
      }
      normalizedRole = "admin";
    } else if (normalizedRole !== "guest") {
      // Roles embedded in old JWTs are not authoritative for regular users.
      normalizedRole = "user";
    }

    const user = { ...decoded, role: normalizedRole || "user" };

    // Admin sessions must be present and unexpired (with Master Admin fallback protection)
    if (user.role === "admin" && !isMasterAdmin) {
      let sessionRes;
      try {
        sessionRes = await pool.query(
          "SELECT 1 FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1",
          [token]
        );
      } catch (sessionErr) {
        console.error("Administrator session verification failed:", sessionErr);
        return res.status(503).json({ success: false, error: "Administrator session could not be verified. Please retry." });
      }
      if (sessionRes.rows.length === 0) {
        return res.status(401).json({ success: false, error: "Administrator session expired or logged out" });
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

export const requireAdmin = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });

  const isMasterAdmin = 
    String(req.user.id).toLowerCase() === 'admin' ||
    String(req.user.id) === '751e722c-ba4f-4d36-bc50-2be7376cc38a' ||
    String(req.user.username || '').toLowerCase() === 'vinaytiwari' ||
    String(req.user.email || '').toLowerCase() === 'tiwari.vinay89@gmail.com' ||
    String(req.user.phone || req.user.mobile || '') === '9399945861';

  if (isMasterAdmin) {
    req.user.role = 'admin';
  }

  const role = normalizeRole(req.user.role);

  if (role !== "admin") {
    return res.status(403).json({ success: false, error: "Access Denied: Administrator role required" });
  }

  next();
};

export const requireSuperAdmin = requireAdmin; // Admin IS SuperAdmin

export const requireVolunteer = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Authentication required" });
  const role = normalizeRole(req.user.role);
  if (role !== "user" && role !== "admin") {
    return res.status(403).json({ success: false, error: "Access Denied: User role required" });
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
        String(userId ?? "anonymous"),
        (req?.user?.role || metadata?.role) ? normalizeRole(req?.user?.role || metadata.role) : "anonymous",
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
