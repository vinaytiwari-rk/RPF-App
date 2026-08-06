import express from "express";
import { authenticateToken, requireAdmin } from "../db/middleware.js";
import { pool } from "../db/dbPool.js";

import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/api/admin-setup", async (req, res) => {
  try {
    const password = "admin";
    const password_hash = await bcrypt.hash(password, 10);
    
    // Check if admin_credentials table has an 'admin'
    const existing = await pool.query("SELECT * FROM admin_credentials WHERE username = 'admin'");
    
    let html = "<html><body style='font-family:sans-serif; padding: 20px;'><h1>God Admin Setup</h1>";
    
    if (existing.rows.length > 0) {
      await pool.query("UPDATE admin_credentials SET password_hash = $1 WHERE username = 'admin'", [password_hash]);
      html += `<p>Found existing 'admin' credentials. Password has been successfully reset!</p>`;
    } else {
      await pool.query(
        `INSERT INTO admin_credentials (id, username, password_hash) VALUES ('admin', 'admin', $1)`,
        [password_hash]
      );
      html += `<p>No existing 'admin' credentials found. Created a new admin account!</p>`;
    }
    
    html += `<p>User ID: <b>admin</b></p>`;
    html += `<p>Password: <b>admin</b></p>`;
    html += "<p>You can now go to the <a href='/login'>Login page</a> and enter these credentials.</p></body></html>";
    res.send(html);
  } catch (error: any) {
    res.status(500).send("Database Error: " + error.message);
  }
});

// GET global app settings
router.get("/api/admin/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    if (result.rows.length === 0) {
      return res.json({ success: true, data: {} });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// UPDATE global app settings
router.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    let setClause = [];
    let values = [];
    let index = 1;

    for (const [key, value] of Object.entries(updates)) {
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

// GET announcements
router.get("/api/admin/announcements", async (req, res) => {
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
    const { title, content, is_active } = req.body;
    const result = await pool.query(
      "INSERT INTO announcements (title, content, is_active) VALUES ($1, $2, $3) RETURNING *",
      [title, content, is_active ?? true]
    );
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

// PUT story status
router.put("/api/admin/stories/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid status" });
    }
    const result = await pool.query("UPDATE success_stories SET status = $1 WHERE id = $2 RETURNING *", [status, req.params.id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to update story status" });
  }
});

// PUT update user profile (God-level control)
router.put("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, email, phone, isVolunteer, isDonor } = req.body;
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, email = $3, phone = $4, "isVolunteer" = $5, "isDonor" = $6
       WHERE id = $7 RETURNING id, name, role, email, phone`,
      [name, role, email, phone, isVolunteer, isDonor, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to update user profile" });
  }
});

// GET all users
router.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, role, email, phone, \"isVolunteer\", \"isDonor\", \"onboardingCompleted\" FROM users ORDER BY id DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// DELETE a user
router.delete("/api/admin/users/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

// GET all volunteers
router.get("/api/admin/volunteers", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, username, mobile, email, status, registration_number, \"createdAt\" FROM volunteers ORDER BY \"createdAt\" DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
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

// GET all donations
router.get("/api/admin/donations", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM donations ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch donations" });
  }
});

// GET all jan seva cards
router.get("/api/admin/jan-seva-cards", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM card_applications ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch jan seva cards" });
  }
});

// GET all health camps
router.get("/api/admin/health-camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM health_camps ORDER BY date DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch health camps" });
  }
});

export default router;
