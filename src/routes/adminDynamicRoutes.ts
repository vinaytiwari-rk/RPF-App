import express from "express";
import { authenticateToken, requireAdmin } from "../db/middleware.js";
import { pool } from "../db/dbPool.js";
import { apiCache, CACHE_TTL } from "../lib/apiCache.js";

import bcrypt from "bcryptjs";
import crypto from "crypto";

const router = express.Router();

router.get("/api/admin-setup", async (req, res) => {
  return res.status(410).json({ success: false, error: "This setup endpoint has been permanently retired for security." });
});

// GET global app settings (ADMIN ONLY)
router.get("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cacheKey = "admin_settings";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, data: cached.data });
    }

    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    if (result.rows.length === 0) {
      return res.json({ success: true, data: {} });
    }
    
    apiCache.set(cacheKey, { data: result.rows[0], timestamp: Date.now() });
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

const ALLOWED_SETTINGS_KEYS = new Set([
  "app_name", "toll_free", "email", "whatsapp", "maintenance_mode",
  "announcement_banner", "hero_banner", "site_title", "support_phone"
]);

// UPDATE global app settings
router.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    let setClause = [];
    let values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_SETTINGS_KEYS.has(key)) continue;
      setClause.push(`"${key}" = $${index}`);
      values.push(value);
      index++;
    }

    if (setClause.length === 0) return res.json({ success: true });

    const query = `UPDATE app_settings SET ${setClause.join(', ')} WHERE id = 1 RETURNING *`;
    const result = await pool.query(query, values);

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
});

// GET announcements (ADMIN ONLY)
router.get("/api/admin/announcements", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM announcements ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch announcements" });
  }
});

// POST announcement
router.post("/api/admin/announcements", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await pool.query("INSERT INTO announcements (title, content) VALUES ($1, $2) RETURNING *", [title, content]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create announcement" });
  }
});

// DELETE announcement
router.delete("/api/admin/announcements/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM announcements WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete announcement" });
  }
});

// GET user by ID
router.get("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const result = await pool.query("SELECT id, username, name, role, email, phone, \"isVolunteer\", \"isDonor\", \"onboardingCompleted\", created_at FROM users WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch user" });
  }
});

// CREATE a user
router.post("/api/admin/users", authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const { name, username, email, phone, role, password, isVolunteer, isDonor } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: "Name is required" });
    }

    const callerRole = String(req.user?.role || "").toLowerCase();
    const assignedRole = String(role || "user").toLowerCase();
    if (assignedRole === "admin" && callerRole !== "admin" && callerRole !== "super_admin" && callerRole !== "superadmin") {
      return res.status(403).json({ success: false, error: "Only Admin can assign admin role" });
    }

    if (phone && phone.trim()) {
      const existingPhone = await pool.query("SELECT id FROM users WHERE phone = $1", [phone.trim()]);
      if (existingPhone.rows.length > 0) {
        return res.status(409).json({ success: false, error: "Phone number is already registered" });
      }
    }
    if (email && email.trim()) {
      const existingEmail = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1)", [email.trim()]);
      if (existingEmail.rows.length > 0) {
        return res.status(409).json({ success: false, error: "Email is already registered" });
      }
    }
    if (username && username.trim()) {
      const existingUsername = await pool.query("SELECT id FROM users WHERE LOWER(username) = LOWER($1)", [username.trim()]);
      if (existingUsername.rows.length > 0) {
        return res.status(409).json({ success: false, error: "Username is already in use" });
      }
    }

    const userId = crypto.randomUUID();
    const passwordHash = password && password.trim() ? await bcrypt.hash(password.trim(), 10) : await bcrypt.hash("RPF@12345", 10);
    const safeUsername = username && username.trim() ? username.trim().toLowerCase() : (phone && phone.trim() ? phone.trim() : `user_${userId.slice(0, 8)}`);

    const result = await pool.query(
      `INSERT INTO users (id, username, name, email, phone, password_hash, role, "isVolunteer", "isDonor", created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING id, username, name, role, email, phone, "isVolunteer", "isDonor", created_at`,
      [
        userId,
        safeUsername,
        name.trim(),
        email && email.trim() ? email.trim() : null,
        phone && phone.trim() ? phone.trim() : null,
        passwordHash,
        assignedRole,
        Boolean(isVolunteer),
        Boolean(isDonor)
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Admin create user error:", error);
    res.status(500).json({ success: false, error: error?.message || "Failed to create user" });
  }
});

// UPDATE user profile (Role, details, and optional password update)
router.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req: any, res: any) => {
  try {
    const { name, username, role, email, phone, password, isVolunteer, isDonor } = req.body;
    const userId = req.params.id;
    
    const callerRole = String(req.user?.role || "").toLowerCase();
    if (role && callerRole !== "admin" && callerRole !== "super_admin" && callerRole !== "superadmin") {
      return res.status(403).json({ success: false, error: "Only Admin can assign roles" });
    }

    if (phone && phone.trim()) {
      const existingPhone = await pool.query("SELECT id FROM users WHERE phone = $1 AND id != $2", [phone.trim(), userId]);
      if (existingPhone.rows.length > 0) {
        return res.status(409).json({ success: false, error: "Phone number is already used by another account" });
      }
    }
    if (email && email.trim()) {
      const existingEmail = await pool.query("SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2", [email.trim(), userId]);
      if (existingEmail.rows.length > 0) {
        return res.status(409).json({ success: false, error: "Email is already used by another account" });
      }
    }
    if (username && username.trim()) {
      const existingUsername = await pool.query("SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2", [username.trim(), userId]);
      if (existingUsername.rows.length > 0) {
        return res.status(409).json({ success: false, error: "Username is already in use by another account" });
      }
    }

    let passwordHash: string | null = null;
    if (password && typeof password === "string" && password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    let result;
    if (passwordHash) {
      result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name), 
             username = COALESCE($2, username),
             role = COALESCE($3, role), 
             email = $4, 
             phone = $5, 
             password_hash = $6,
             "isVolunteer" = COALESCE($7, "isVolunteer"), 
             "isDonor" = COALESCE($8, "isDonor"),
             updated_at = NOW()
         WHERE id = $9 RETURNING id, username, name, role, email, phone, "isVolunteer", "isDonor"`,
        [name, username, role, email || null, phone || null, passwordHash, isVolunteer, isDonor, userId]
      );
    } else {
      result = await pool.query(
        `UPDATE users 
         SET name = COALESCE($1, name), 
             username = COALESCE($2, username),
             role = COALESCE($3, role), 
             email = $4, 
             phone = $5, 
             "isVolunteer" = COALESCE($6, "isVolunteer"), 
             "isDonor" = COALESCE($7, "isDonor"),
             updated_at = NOW()
         WHERE id = $8 RETURNING id, username, name, role, email, phone, "isVolunteer", "isDonor"`,
        [name, username, role, email || null, phone || null, isVolunteer, isDonor, userId]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to update user profile" });
  }
});

// GET all users
router.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 100));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(
      `SELECT id, username, name, role, email, phone, "isVolunteer", "isDonor", "onboardingCompleted", created_at FROM users ORDER BY id DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// DELETE a user
router.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    // Clean up sessions and related auth
    await pool.query("DELETE FROM sessions WHERE user_id = $1", [userId]).catch(() => {});
    await pool.query("DELETE FROM citizen_auth WHERE user_id = $1", [userId]).catch(() => {});
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || "Failed to delete user" });
  }
});

// GET all volunteers (EXCLUDES password field)
router.get("/api/admin/volunteers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM volunteers");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(
      `SELECT id, full_name as name, username, mobile, email, status, registration_number, "createdAt" FROM volunteers ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch volunteers" });
  }
});

// PUT volunteer status
router.put("/api/admin/volunteers/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query("UPDATE volunteers SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to update volunteer status" });
  }
});

// DELETE a volunteer
router.delete("/api/admin/volunteers/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Volunteer deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete volunteer" });
  }
});

// GET all donations
router.get("/api/admin/donations", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM donations");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM donations ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch donations" });
  }
});

// GET all jan seva cards
router.get("/api/admin/jan-seva-cards", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM card_applications");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM card_applications ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch jan seva cards" });
  }
});

// GET all health camps
router.get("/api/admin/health-camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM health_camps");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM health_camps ORDER BY date DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch health camps" });
  }
});

// POST health camp
router.post("/api/admin/health-camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const result = await pool.query(
      `INSERT INTO health_camps ("titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, title, date, date, location, location]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create health camp" });
  }
});

// DELETE health camp
router.delete("/api/admin/health-camps/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM health_camps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete health camp" });
  }
});

// GET all grievances
router.get("/api/admin/grievances", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM grievances");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM grievances ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch grievances" });
  }
});

// PUT update grievance status
router.put("/api/admin/grievances/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query("UPDATE grievances SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to update grievance" });
  }
});

// GET women complaints
router.get("/api/admin/women_complaints", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM women_complaints");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM women_complaints ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch women complaints" });
  }
});

// GET blood donors
router.get("/api/admin/blood_donors", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM blood_donors");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM blood_donors ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch blood donors" });
  }
});

// GET blood requests
router.get("/api/admin/blood_requests", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM blood_requests");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM blood_requests ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch blood requests" });
  }
});

// GET blogs
router.get("/api/admin/blogs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM blogs");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM blogs ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch blogs" });
  }
});

// POST blog
router.post("/api/admin/blogs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, author } = req.body;
    const result = await pool.query(
      "INSERT INTO blogs (title, description, author) VALUES ($1, $2, $3) RETURNING *",
      [title, description, author]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create blog" });
  }
});

// DELETE blog
router.delete("/api/admin/blogs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM blogs WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete blog" });
  }
});

// GET jobs
router.get("/api/admin/jobs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM jobs");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
});

// GET campaigns
router.get("/api/admin/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM campaigns");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM campaigns ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch campaigns" });
  }
});

// POST campaign
router.post("/api/admin/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, goalAmount, raisedAmount } = req.body;
    const result = await pool.query(
      `INSERT INTO campaigns ("titleEn", "titleHi", "goalAmount", "raisedAmount") VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, title, goalAmount || 0, raisedAmount || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create campaign" });
  }
});

// DELETE campaign
router.delete("/api/admin/campaigns/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete campaign" });
  }
});

// GET directory
router.get("/api/admin/directory", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM directory_services");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(`SELECT * FROM directory_services ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch directory" });
  }
});

// POST directory
router.post("/api/admin/directory", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, category, contact, status } = req.body;
    const result = await pool.query(
      `INSERT INTO directory_services (name, category, contact, status) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, category, contact, status || 'active']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to create directory entry" });
  }
});

// DELETE directory
router.delete("/api/admin/directory/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM directory_services WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete directory entry" });
  }
});

// --- SCHOLARSHIPS ROUTES ---
router.get("/api/admin/scholarships", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM scholarships ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/scholarships", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO scholarships (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/scholarships/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM scholarships WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- FOOD_SUPPORT ROUTES ---
router.get("/api/admin/food_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM food_support ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/food_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO food_support (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/food_support/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM food_support WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- MEDICINE_SUPPORT ROUTES ---
router.get("/api/admin/medicine_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM medicine_support ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/medicine_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO medicine_support (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/medicine_support/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM medicine_support WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- EDUCATION_AID ROUTES ---
router.get("/api/admin/education_aid", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM education_aid ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/education_aid", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO education_aid (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/education_aid/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM education_aid WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SENIOR_CITIZENS ROUTES ---
router.get("/api/admin/senior_citizens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM senior_citizens ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/senior_citizens", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO senior_citizens (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/senior_citizens/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM senior_citizens WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ANIMAL_WELFARE ROUTES ---
router.get("/api/admin/animal_welfare", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM animal_welfare ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/animal_welfare", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO animal_welfare (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/animal_welfare/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM animal_welfare WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ENVIRONMENT ROUTES ---
router.get("/api/admin/environment", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM environment ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/environment", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO environment (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/environment/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM environment WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- RELIGIOUS_CULTURE ROUTES ---
router.get("/api/admin/religious_culture", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM religious_culture ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/religious_culture", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO religious_culture (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/religious_culture/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM religious_culture WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- DISASTER_MANAGEMENT ROUTES ---
router.get("/api/admin/disaster_management", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM disaster_management ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/disaster_management", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO disaster_management (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/disaster_management/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM disaster_management WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- FARMER_SUPPORT ROUTES ---
router.get("/api/admin/farmer_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM farmer_support ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/farmer_support", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO farmer_support (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/farmer_support/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM farmer_support WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- GOVERNMENT_SCHEMES ROUTES ---
router.get("/api/admin/government_schemes", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM government_schemes ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/government_schemes", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO government_schemes (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/government_schemes/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM government_schemes WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- SKILLS_TRAINING ROUTES ---
router.get("/api/admin/skills_training", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills_training ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/skills_training", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO skills_training (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/skills_training/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM skills_training WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- GLOBAL_GUIDE ROUTES ---
router.get("/api/admin/global_guide", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM global_guide ORDER BY created_at DESC");
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/api/admin/global_guide", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const result = await pool.query(
      "INSERT INTO global_guide (title, description, \"imageUrl\") VALUES ($1, $2, $3) RETURNING *",
      [title, description, imageUrl]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete("/api/admin/global_guide/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM global_guide WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;


