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

// GET all grievances
router.get("/api/admin/grievances", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM grievances ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
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
    const result = await pool.query("SELECT * FROM women_complaints ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch women complaints" });
  }
});

// GET blood donors
router.get("/api/admin/blood_donors", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM blood_donors ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch blood donors" });
  }
});

// GET blood requests
router.get("/api/admin/blood_requests", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM blood_requests ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch blood requests" });
  }
});

// GET blogs
router.get("/api/admin/blogs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM blogs ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch blogs" });
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
    const result = await pool.query("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch jobs" });
  }
});

// GET campaigns
router.get("/api/admin/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 500");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch campaigns" });
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
