import express from 'express';
import { pool } from '../db/dbPool.js';
import { authenticateToken } from '../db/middleware.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// --- FUELIO CLONE: Fuel Logs & Expense Tracker ---

router.get("/api/env/fuel", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      "SELECT * FROM fuel_logs WHERE user_id = $1 ORDER BY fill_date DESC",
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/env/fuel", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { odometer, liters, price_per_liter } = req.body;
    
    if (!odometer || !liters || !price_per_liter) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const total_cost = Number(liters) * Number(price_per_liter);
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO fuel_logs (id, user_id, odometer, liters, price_per_liter, total_cost) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userId, odometer, liters, price_per_liter, total_cost]
    );

    res.json({ success: true, id, total_cost });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/api/env/fuel/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("DELETE FROM fuel_logs WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// --- EARTHQUAKES PRO CLONE: Live USGS Data ---
// We proxy this to bypass CORS and potentially cache in the future.

router.get("/api/env/earthquakes", async (req: any, res: any) => {
  try {
    // Fetch M2.5+ Earthquakes from the past 24 hours
    const response = await axios.get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson");
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Error fetching earthquake data:", error.message);
    res.status(500).json({ error: "Failed to fetch earthquake data" });
  }
});

export default router;
