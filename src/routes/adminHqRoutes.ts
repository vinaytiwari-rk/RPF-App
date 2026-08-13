import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getServiceContent, updateServiceContent } from "../controllers/adminHqController.js";
import { pool } from "../db/dbPool.js";
import { JWT_SECRET } from "../db/middleware.js";

const router = Router();

router.post("/api/auth/admin-login", async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (String(identifier || "").trim().toLowerCase() !== "admin" || !password) {
      return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    }
    const result = await pool.query(`SELECT * FROM admin_credentials WHERE LOWER(username)=LOWER($1) LIMIT 1`, ["admin"]);
    if (!result.rows.length) return res.status(401).json({ success: false, error: "Administrator account is not configured." });
    const row = result.rows[0];
    const valid = await bcrypt.compare(String(password), row.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: "Invalid administrator credentials." });
    const user = { id: "usr_staff_admin", name: "System Administrator", role: "admin" };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    try {
      await pool.query(`INSERT INTO sessions (id,user_id,token,expires_at) VALUES ($1,$2,$3,NOW()+INTERVAL '7 days') ON CONFLICT (id) DO NOTHING`, [`admin-${Date.now()}`, user.id, token]);
    } catch (sessionError) {
      console.warn("Administrator session tracking failed:", sessionError);
    }
    return res.json({ success: true, user, token });
  } catch (error: any) {
    console.error("Administrator login error:", error);
    return res.status(500).json({ success: false, error: "Administrator login failed." });
  }
});

router.all("/api/admin-setup", (_req, res) => res.status(410).json({ success: false, error: "Administrator setup endpoint has been retired." }));

router.get("/services/:serviceId/content", getServiceContent);
router.post("/services/:serviceId/content", updateServiceContent);

export default router;
