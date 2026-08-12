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

// --- RTO Vehicle Trace (VahanX Clone) ---
router.get("/api/rto/vehicle/:plate", async (req, res) => {
  try {
    const { plate } = req.params;
    if (!plate) return res.status(400).json({ error: "Plate number is required" });
    
    const formattedPlate = plate.replace(/\s+/g, '').toUpperCase();
    
    // First, check if we have it in our mocked database
    const result = await pool.query(
      `SELECT * FROM rto_vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = $1`,
      [formattedPlate]
    );

    if (result.rows.length > 0) {
      return res.json({ success: true, data: result.rows[0] });
    }

    // Since real RTO API is paid/restricted, we generate a realistic mock response for ANY valid-looking Indian plate
    // DL 8C AB 1234
    if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/.test(formattedPlate)) {
       return res.status(404).json({ success: false, error: "Vehicle not found. Please check plate number format." });
    }

    // Generate deterministic mock data based on the plate string
    let hash = 0;
    for (let i = 0; i < formattedPlate.length; i++) {
      hash = formattedPlate.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const models = ["Maruti Suzuki Swift", "Hyundai Creta", "Honda City", "Tata Nexon", "Mahindra Scorpio", "Toyota Innova", "Kia Seltos", "Royal Enfield Classic 350", "Honda Activa 6G"];
    const names = ["Rakesh Kumar", "Priya Singh", "Amit Sharma", "Deepak Verma", "Neha Gupta", "Vikram Rathore", "Suresh Patel"];
    const fuelTypes = ["PETROL", "DIESEL", "CNG", "ELECTRIC"];
    
    const model = models[Math.abs(hash) % models.length];
    const nameStr = names[Math.abs(hash) % names.length];
    // Mask name: R***** K****
    const maskedName = nameStr.split(' ').map(n => n[0] + '*'.repeat(n.length - 1)).join(' ');
    
    const regYear = 2010 + (Math.abs(hash) % 14); // 2010 to 2023
    const regDate = new Date(regYear, Math.abs(hash) % 12, Math.abs(hash) % 28 + 1);
    
    const insYear = regYear + 15;
    const insDate = new Date(insYear, Math.abs(hash) % 12, Math.abs(hash) % 28 + 1);

    const mockVehicle = {
      plate_number: plate.toUpperCase(),
      owner_name: maskedName,
      vehicle_model: model,
      registration_date: regDate.toISOString().split('T')[0],
      insurance_validity: insDate.toISOString().split('T')[0],
      fitness_validity: insDate.toISOString().split('T')[0],
      fuel_type: fuelTypes[Math.abs(hash) % fuelTypes.length],
      status: "ACTIVE",
      rto_code: formattedPlate.substring(0, 4)
    };

    // Add a demo flag so the frontend knows this is simulated
    const responseData = { ...mockVehicle, is_demo_data: true, status: "DEMO MODE (NOT REAL)" };
    res.json({ success: true, data: responseData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// --- Family Tracking (GeoZilla Clone) ---
router.post("/api/family/group", async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) return res.status(400).json({ error: "Missing fields" });

    const groupId = crypto.randomUUID();
    const inviteCode = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars

    await pool.query(
      `INSERT INTO family_groups (id, name, invite_code, created_by) VALUES ($1, $2, $3, $4)`,
      [groupId, name, inviteCode, userId]
    );

    // Auto-join the creator
    await pool.query(
      `INSERT INTO family_members (id, group_id, user_id, role) VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), groupId, userId, 'admin']
    );

    res.json({ success: true, data: { groupId, inviteCode } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/family/join", async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;
    if (!inviteCode || !userId) return res.status(400).json({ error: "Missing fields" });

    const groupRes = await pool.query(`SELECT id FROM family_groups WHERE invite_code = $1`, [inviteCode]);
    if (groupRes.rows.length === 0) return res.status(404).json({ error: "Invalid invite code" });
    const groupId = groupRes.rows[0].id;

    // Check if already joined
    const memberRes = await pool.query(`SELECT id FROM family_members WHERE group_id = $1 AND user_id = $2`, [groupId, userId]);
    if (memberRes.rows.length === 0) {
       await pool.query(
        `INSERT INTO family_members (id, group_id, user_id, role) VALUES ($1, $2, $3, $4)`,
        [crypto.randomUUID(), groupId, userId, 'member']
      );
    }

    res.json({ success: true, data: { groupId } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/family/groups", async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await pool.query(
      `SELECT g.* FROM family_groups g 
       JOIN family_members m ON g.id = m.group_id 
       WHERE m.user_id = $1`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/family/location", async (req, res) => {
  try {
    const { userId, latitude, longitude, battery_level, is_charging } = req.body;
    if (!userId || !latitude || !longitude) return res.status(400).json({ error: "Missing fields" });

    await pool.query(
      `INSERT INTO member_locations (id, user_id, latitude, longitude, battery_level, is_charging) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO NOTHING`,
      [crypto.randomUUID(), userId, latitude, longitude, battery_level || null, is_charging || false]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/family/locations/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Get all members in the group, join with users to get their name, and join with their latest location
    const result = await pool.query(
      `SELECT m.user_id, u.name as user_name, u.phone, l.latitude, l.longitude, l.battery_level, l.is_charging, l.timestamp 
       FROM family_members m
       LEFT JOIN users u ON m.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT latitude, longitude, battery_level, is_charging, timestamp 
         FROM member_locations 
         WHERE user_id = m.user_id 
         ORDER BY timestamp DESC 
         LIMIT 1
       ) l ON true
       WHERE m.group_id = $1`,
      [groupId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
