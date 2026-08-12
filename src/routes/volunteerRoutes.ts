import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.put("/api/volunteers/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(`UPDATE volunteers SET approval_status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true, message: "Volunteer status updated" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/api/volunteers/:id/allocate", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { allocation } = req.body;
    await pool.query(`UPDATE volunteers SET constituency_allocation = $1 WHERE id = $2`, [allocation, id]);
    res.json({ success: true, message: "Volunteer allocated" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/api/volunteers/report", authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng } = req.body;
    await pool.query(
      `INSERT INTO volunteer_reports (id, volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng]
    );
    res.json({ success: true, message: "Report submitted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/volunteers/me/certificates", async (req, res) => {
  try {
    const { volunteer_id } = req.query;
    const result = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 ORDER BY issue_date DESC`, [volunteer_id]);
    res.json({ success: true, certificates: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/volunteer_tasks", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { volunteerId, titleEn, titleHi, descriptionEn, descriptionHi } = req.body;
    await pool.query(
      'INSERT INTO volunteer_tasks ("volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [volunteerId, titleEn, titleHi, descriptionEn, descriptionHi || 10, 'assigned']
    );
    res.json({ success: true, message: "Task assigned successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/volunteer_tasks", async (req, res) => {
  try {
    const volunteerId = req.query.volunteerId as string;
    if (!volunteerId) {
      return res.status(400).json({ error: "Missing volunteerId parameter" });
    }
    const result = await pool.query(
      'SELECT id, "volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", status, "createdAt" FROM volunteer_tasks WHERE "volunteerId" = $1',
      [volunteerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/api/volunteer_tasks/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const taskRes = await pool.query(
      'UPDATE volunteer_tasks SET status = $1 WHERE id = $2 RETURNING "volunteerId"',
      [status, id]
    );
    
    if (taskRes.rows.length > 0 && status === "completed") {
      const { volunteerId } = taskRes.rows[0];
      await pool.query(
        'UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2',
        [10, volunteerId]
      );
    }
    
    res.json({ success: true, message: "Task status updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/volunteers", authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, skills } = req.body;
    const userId = req.user.id;

    // Update the user record to reflect they are now a volunteer
    await pool.query(`UPDATE users SET "isVolunteer" = true WHERE id = $1`, [userId]);

    // Check if they are already in the volunteers table
    const volCheck = await pool.query(`SELECT id FROM volunteers WHERE id = $1`, [userId]);
    if (volCheck.rows.length === 0) {
      // Get user's email and username to copy over
      const userRes = await pool.query(`SELECT username, email FROM users WHERE id = $1`, [userId]);
      const username = userRes.rows[0]?.username || `user_${userId.slice(-6)}`;
      const email = userRes.rows[0]?.email || null;
      const regNumber = "RPF-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

      await pool.query(
        `INSERT INTO volunteers (id, username, registration_number, full_name, mobile, email, skills, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, username, regNumber, name || "Citizen", phone || "", email, JSON.stringify(skills ? skills.split(", ") : []), 'approved']
      );
    } else {
      await pool.query(
        `UPDATE volunteers SET skills = $1, full_name = $2, mobile = $3 WHERE id = $4`,
        [JSON.stringify(skills ? skills.split(", ") : []), name || "Citizen", phone || "", userId]
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating volunteer record:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/volunteers", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name as name, email, mobile as phone, approval_status as status, "registeredAt" FROM volunteers ORDER BY "registeredAt" DESC'
    );
    const volunteers = result.rows;
    res.json({ volunteers });
  } catch (error: any) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/volunteers/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recent public chat history, so refreshing the page doesn't lose the
// conversation (previously there was no persistence at all).
router.get("/api/community/chat/messages", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "authorName", "authorAvatar", text, "createdAt"
       FROM community_chat_messages
       ORDER BY "createdAt" DESC
       LIMIT 50`
    );
    res.json({ success: true, data: result.rows.reverse() });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fetch approved volunteers for the public directory/network + chat sidebar.
// NOTE: this used to join on `v.user_id = u.id` and select `v.role`,
// `v.constituency_allocation` — none of which existed on the volunteers
// table, so this endpoint has been throwing a SQL error (and silently
// returning nothing to the app) since it was written. It's rewritten here
// to read directly from the volunteers table (which already has the
// volunteer's own name/avatar/city/skills — no join needed), and only
// exposes public-safe fields — never phone, email, address, DOB, or
// national ID numbers.
router.get("/api/public/volunteers", async (req, res) => {
  try {
    const { city, skill } = req.query;
    const conditions: string[] = [`approval_status = 'approved'`];
    const params: any[] = [];

    if (city) {
      params.push(`%${city}%`);
      conditions.push(`city ILIKE $${params.length}`);
    }
    if (skill) {
      params.push(`%${skill}%`);
      conditions.push(`skills::text ILIKE $${params.length}`);
    }

    const result = await pool.query(
      `SELECT id, full_name AS name, avatar, city, area_locality, skills, availability, role, constituency_allocation, "registeredAt"
       FROM volunteers
       WHERE ${conditions.join(" AND ")}
       ORDER BY full_name ASC`,
      params
    );
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

