import jwt from "jsonwebtoken";
import { pool } from "./dbPool.js";

export const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

export const authorizeRole = (requiredRole: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(403).json({ success: false, error: "Access Denied" });
    }
    const userRole = req.user.role;
    if (requiredRole === "super_admin" || requiredRole === "admin") {
      if (userRole !== "super_admin" && userRole !== "admin") {
        return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
      }
    } else if (userRole !== requiredRole) {
      return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
    }
    next();
  };
};

export const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ success: false, error: "No token provided" });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ success: false, error: "Invalid token" });
    
    // Validate session in DB to prevent reuse of logged-out tokens
    try {
      const sessionRes = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);
      if (sessionRes.rows.length === 0 && user.role !== 'super_admin' && user.role !== 'guest') {
        return res.status(401).json({ success: false, error: "Session expired or logged out" });
      }
    } catch (e: any) {
      console.warn("Session validation warning:", e.message);
    }
    
    req.user = user;
    next();
  });
};

export const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, error: "Access Denied: Admin role required" });
  }
  next();
};
