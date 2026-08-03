import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/women/complaints", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const result = await pool.query(
      `SELECT * FROM women_complaints WHERE user_id = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/women/complaints", async (req, res) => {
  try {
    const { user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous } = req.body;
    
    // Save to PostgreSQL table
    await pool.query(
      `INSERT INTO women_complaints (user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user_id || "guest",
        complainant_name || "",
        complainant_phone || "",
        complaint_type,
        incident_date,
        location,
        description,
        suspect_details || "",
        is_anonymous || false
      ]
    );

    // Save duplicate to service_submissions_v2 for Admin portal unified views
    const dataString = JSON.stringify({
      complaintType: complaint_type,
      incidentDate: incident_date,
      location,
      description,
      suspectDetails: suspect_details,
      isAnonymous: is_anonymous
    });

    await pool.query(
      `INSERT INTO service_submissions_v2 ("userId", "citizenName", "citizenPhone", "serviceName", "submissionData", status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user_id || "guest",
        is_anonymous ? "Anonymous" : (complainant_name || "Citizen"),
        is_anonymous ? "" : (complainant_phone || ""),
        "Women Support - Incident Complaint",
        dataString,
        "pending"
      ]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
