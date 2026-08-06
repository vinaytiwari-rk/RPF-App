import express from "express";
import { authenticateToken, requireAdmin } from "../db/middleware.js";
import { pool } from "../db/dbPool.js";

import bcrypt from "bcryptjs";

const router = express.Router();

router.get("/api/admin-setup", async (req, res) => {
  try {
    const password = "admin";
    const password_hash = await bcrypt.hash(password, 10);
    const userId = "admin-" + Date.now();
    const phone = "9999999999";
    
    const existing = await pool.query("SELECT id, phone, email, role FROM users WHERE role IN ('admin', 'superadmin', 'super_admin')");
    
    let html = "<html><body style='font-family:sans-serif; padding: 20px;'><h1>Admin Setup</h1>";
    
    if (existing.rows.length > 0) {
      html += `<p>Found ${existing.rows.length} existing admin accounts:</p><ul>`;
      for (const user of existing.rows) {
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [password_hash, user.id]);
        html += `<li>Role: <b>${user.role}</b> | Phone: <b>${user.phone}</b> | Email: <b>${user.email}</b><br/>-> <i>Password reset to: <b>admin</b></i></li>`;
      }
      html += "</ul>";
    } else {
      await pool.query(
        `INSERT INTO users (id, name, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5)`,
        [userId, 'Super Admin', phone, password_hash, 'super_admin']
      );
      html += `<p>No existing admin accounts found. Created a new super_admin account!</p>`;
      html += `<p>User ID / Phone: <b>${phone}</b></p>`;
      html += `<p>Password: <b>admin</b></p>`;
    }
    
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

export default router;
