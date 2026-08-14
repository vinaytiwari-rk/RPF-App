import express from 'express';
import { pool } from '../db/dbPool.js';
import axios from 'axios';
import { CORE_SERVICES } from '../data/coreServices.js';

const router = express.Router();

router.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";

  if (!apiKey) {
    return res.status(503).json({ success: false, error: "Mandi price service is not configured." });
  }

  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
    if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity as string)}`;
    const response = await axios.get(url, { timeout: 5000 });
    return res.json(response.data);
  } catch (error) {
    console.error("Mandi Prices API failed:", error);
    return res.status(503).json({ success: false, error: "Mandi price service is temporarily unavailable." });
  }
});

router.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY;
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428";

  if (!apiKey) {
    return res.status(503).json({ success: false, error: "Government hospital directory is not configured." });
  }

  try {
    let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
    if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
    if (district) url += `&filters[district]=${encodeURIComponent(district as string)}`;
    const response = await axios.get(url, { timeout: 5000 });
    return res.json(response.data);
  } catch (error) {
    console.error("Government hospitals API failed:", error);
    return res.status(503).json({ success: false, error: "Government hospital directory is temporarily unavailable." });
  }
});

router.get("/api/public/services", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let hiddenServiceIds: string[] = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      try {
        const parsed = JSON.parse(result.rows[0].founderMessageEn);
        if (Array.isArray(parsed.hiddenServiceIds)) hiddenServiceIds = parsed.hiddenServiceIds;
      } catch {
        // Ignore malformed visibility metadata and keep services visible.
      }
    }
    const visible = CORE_SERVICES.filter((service) => !hiddenServiceIds.includes(service.id));
    res.json({ success: true, data: visible });
  } catch {
    // CORE_SERVICES is canonical application metadata, not fabricated user data.
    res.json({ success: true, data: CORE_SERVICES });
  }
});

router.get("/api/public/services/:id/content", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT service_id, content, action_url, updated_at FROM service_content WHERE service_id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.json({ success: true, data: null });
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Service content fetch error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
