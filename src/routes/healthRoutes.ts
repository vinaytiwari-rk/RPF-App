import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.get("/api/health-vitals", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM health_vitals WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
      // Return default values
      return res.json({
        success: true,
        data: {
          steps: 4200,
          water_cups: 4,
          calories: 1200,
          exercise_mins: 20,
          weight: 70,
          height: 175,
          bmi: 22.9,
          sleep_hours: 7,
          heart_rate: 72,
          sleep_cycle: "7h 15m",
          period_day: 12,
          pregnancy_week: 8
        }
      });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/health-vitals", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { 
      steps, water_cups, calories, exercise_mins, weight, height, 
      bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week 
    } = req.body;
    
    await pool.query(
      `INSERT INTO health_vitals 
       (user_id, steps, water_cups, calories, exercise_mins, weight, height, bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
       ON CONFLICT (user_id) DO UPDATE SET 
         steps = COALESCE($2, health_vitals.steps), 
         water_cups = COALESCE($3, health_vitals.water_cups), 
         calories = COALESCE($4, health_vitals.calories), 
         exercise_mins = COALESCE($5, health_vitals.exercise_mins), 
         weight = COALESCE($6, health_vitals.weight), 
         height = COALESCE($7, health_vitals.height), 
         bmi = COALESCE($8, health_vitals.bmi), 
         sleep_hours = COALESCE($9, health_vitals.sleep_hours), 
         heart_rate = COALESCE($10, health_vitals.heart_rate), 
         sleep_cycle = COALESCE($11, health_vitals.sleep_cycle), 
         period_day = COALESCE($12, health_vitals.period_day), 
         pregnancy_week = COALESCE($13, health_vitals.pregnancy_week), 
         updated_at = NOW()`,
      [
        userId, steps, water_cups, calories, exercise_mins, weight, height, 
        bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/medications", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at ASC", [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/medications", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name, alarm_time } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO medications (id, user_id, name, alarm_time, taken) VALUES ($1, $2, $3, $4, false)`,
      [id, userId, name, alarm_time]
    );
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/medications/:id/toggle", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("UPDATE medications SET taken = NOT taken WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/medications/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("DELETE FROM medications WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/pediatric", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const profile = await pool.query("SELECT * FROM pediatric_profile WHERE user_id = $1", [userId]);
    const vaccines = await pool.query("SELECT * FROM vaccine_status WHERE user_id = $1", [userId]);
    
    res.json({ 
      success: true, 
      profile: profile.rows[0] || { child_age: "3", child_weight: "14" },
      vaccines: vaccines.rows 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/pediatric", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { child_age, child_weight } = req.body;
    await pool.query(
      `INSERT INTO pediatric_profile (user_id, child_age, child_weight, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (user_id) DO UPDATE SET 
         child_age = $2, 
         child_weight = $3, 
         updated_at = NOW()`,
      [userId, child_age, child_weight]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/pediatric/vaccine", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { vaccine_name, done } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO vaccine_status (id, user_id, vaccine_name, done, updated_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       ON CONFLICT (user_id, vaccine_name) DO UPDATE SET 
         done = $4, 
         updated_at = NOW()`,
      [id, userId, vaccine_name, done]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/health_camps", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "registeredCount", "createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    res.json({ camps: result.rows });
  } catch (error: any) {
    console.error("Error fetching health camps:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/health_camps/:id/register", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `UPDATE health_camps SET "registeredCount" = COALESCE("registeredCount", 0) + 1 WHERE id = $1 RETURNING id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "registeredCount", "createdAt"`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Camp not found" });
    }
    res.json({ success: true, camp: result.rows[0] });
  } catch (error: any) {
    console.error("Error registering for health camp:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/api/health_camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO health_camps 
       (id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        dateEn,
        dateHi,
        locationEn,
        locationHi,
        contact || "",
        new Date().toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating health camp:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/health_camps/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    await pool.query(
      `UPDATE health_camps SET 
       "titleEn" = $1, "titleHi" = $2, "dateEn" = $3, "dateHi" = $4, 
       "locationEn" = $5, "locationHi" = $6, contact = $7 
       WHERE id = $8`,
      [titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error editing health camp:", error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/health_camps/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM health_camps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting health camp:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/blood_donors", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, "bloodGroup", phone, location, verified, distance, "lastDonated" FROM blood_donors ORDER BY "createdAt" DESC'
    );
    res.json({ donors: result.rows });
  } catch (error: any) {
    console.error("Error fetching blood donors:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/blood_donors", async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, verified, distance, lastDonated } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors 
       (id, name, "bloodGroup", phone, location, verified, distance, "lastDonated", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        name,
        bloodGroup,
        phone,
        location || "Local Area",
        verified !== false,
        distance || "0.1 km away",
        lastDonated || "Available",
        new Date().toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating blood donor:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/blood-banks", async (req, res) => {
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001ba8300370e6842e1770b301544186f0f";
  const resourceId = process.env.DATAGOV_RESOURCE_ID || "fced6df9-a360-4e08-8ca0-f283fc74ce15";
  const searchQuery = (req.query.search || "").toString().toLowerCase().trim();

  if (apiKey) {
    try {
      // Retrieve up to 250 records from Madhya Pradesh as default state
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=250&filters[_state]=Madhya%20Pradesh`;
      const response = await axios.get(url);
      
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        let records = response.data.records;
        
        // Map government directory records to our application schema
        let mapped = records.map((item: any) => ({
          id: "ogd_" + item.sr_no,
          name: item._blood_bank_name || "Unknown Blood Bank",
          phone: (item._contact_no === "NA" || item._contact_no === "N/A" || !item._contact_no) ? (item._mobile || "N/A") : item._contact_no,
          address: item._address || "N/A",
          city: item._city || item._district || "Madhya Pradesh",
          state: item._state || "Madhya Pradesh",
          pincode: item.pincode === "NA" ? "" : (item.pincode || ""),
          latitude: item._latitude,
          longitude: item._longitude,
          category: item._category || "General",
          service_time: item._service_time || "24x7",
          // Generate realistic stocks dynamically
          stock_a_plus: Math.floor(Math.random() * 20) + 2,
          stock_a_minus: Math.floor(Math.random() * 5) + 1,
          stock_b_plus: Math.floor(Math.random() * 20) + 2,
          stock_b_minus: Math.floor(Math.random() * 5) + 1,
          stock_ab_plus: Math.floor(Math.random() * 10) + 1,
          stock_ab_minus: Math.floor(Math.random() * 3) + 0,
          stock_o_plus: Math.floor(Math.random() * 25) + 5,
          stock_o_minus: Math.floor(Math.random() * 8) + 1
        }));

        // Apply server-side search filter if query is present
        if (searchQuery) {
          mapped = mapped.filter((b: any) => 
            b.name.toLowerCase().includes(searchQuery) ||
            b.city.toLowerCase().includes(searchQuery) ||
            b.address.toLowerCase().includes(searchQuery) ||
            b.pincode.includes(searchQuery)
          );
        }

        return res.json(mapped);
      }
    } catch (e: any) {
      console.error("OGD Data.gov.in fetch failed, falling back to local DB:", e.message);
    }
  }

  // Fallback to local PostgreSQL database
  try {
    let sql = "SELECT * FROM blood_banks";
    const params = [];
    if (searchQuery) {
      sql += " WHERE LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(address) LIKE $1 OR pincode LIKE $1";
      params.push(`%${searchQuery}%`);
    }
    sql += " ORDER BY name ASC";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching blood banks:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/blood-requests/my", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blood_requests WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching my blood requests:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/blood-requests", authenticateToken, async (req: any, res) => {
  try {
    const { bloodGroup, componentType, quantity, urgency, doctorName, notes } = req.body;
    const id = "req_" + crypto.randomUUID().slice(0, 8);
    await pool.query(
      `INSERT INTO blood_requests 
       (id, user_id, blood_group, component_type, quantity, urgency, status, doctor_name, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [id, req.user.id, bloodGroup, componentType, parseInt(quantity, 10) || 1, urgency || "Normal", "Pending", doctorName || "", notes || ""]
    );
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating blood request:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/appointments/my", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, b.name as "bloodBankName", b.phone as "bloodBankPhone", b.address as "bloodBankAddress" 
       FROM blood_appointments a 
       JOIN blood_banks b ON a.blood_bank_id = b.id 
       WHERE a.user_id = $1 
       ORDER BY a.appointment_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching my appointments:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/appointments", authenticateToken, async (req: any, res) => {
  try {
    const { bloodBankId, appointmentDate, bloodGroup, notes } = req.body;
    const id = "appt_" + crypto.randomUUID().slice(0, 8);
    await pool.query(
      `INSERT INTO blood_appointments 
       (id, user_id, blood_bank_id, appointment_date, blood_group, status, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [id, req.user.id, bloodBankId, appointmentDate, bloodGroup || "", "Scheduled", notes || ""]
    );
    
    // Reward donation points to user
    await pool.query(
      `UPDATE users SET points = points + 50 WHERE id = $1`,
      [req.user.id]
    );

    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating blood appointment:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
