import express from 'express';
import axios from 'axios';
import { pool } from '../db/dbPool.js';
import { CORE_SERVICES } from '../data/coreServices.js';

const router = express.Router();

router.get("/api/gov/mandi-prices", async (req, res) => {
  const { state, commodity } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001b3bed380e8e94e615b9d89710cdd46f0";
  const resourceId = "9ef84268-d588-465a-a308-a864a43d0070";

  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
      if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
      if (commodity) url += `&filters[commodity]=${encodeURIComponent(commodity as string)}`;
      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (err) {
      console.error("Mandi Prices API failed, falling back to mock");
    }
  }

  res.json({
    status: "ok",
    total: 3,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", market: "Bhopal (F&V)", commodity: commodity || "Wheat", min_price: "2200", max_price: "2450", modal_price: "2350", arrival_date: new Date().toISOString().split("T")[0] },
      { state: state || "Madhya Pradesh", district: "Bhopal", market: "Bhopal", commodity: commodity || "Soyabean", min_price: "4200", max_price: "4600", modal_price: "4500", arrival_date: new Date().toISOString().split("T")[0] }
    ]
  });
});

router.get("/api/gov/hospitals", async (req, res) => {
  const { state, district } = req.query;
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001b3bed380e8e94e615b9d89710cdd46f0";
  const resourceId = "7924619d-71b5-4b47-b861-12c823055428";

  if (apiKey && apiKey !== "MOCK_KEY") {
    try {
      let url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=10`;
      if (state) url += `&filters[state]=${encodeURIComponent(state as string)}`;
      if (district) url += `&filters[district]=${encodeURIComponent(district as string)}`;
      const response = await axios.get(url, { timeout: 5000 });
      return res.json(response.data);
    } catch (err) {
      console.error("Hospitals API failed, falling back to mock");
    }
  }

  res.json({
    status: "ok",
    total: 2,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "Hamidia Hospital", type: "District Hospital", address: "Royal Market Road", pincode: "462001", mobile_number: "0755-2540141" },
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "AIIMS Bhopal", type: "Super Specialty", address: "Saket Nagar", pincode: "462020", mobile_number: "0755-2672322" }
    ]
  });
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
        // Ignore malformed visibility data and keep services visible.
      }
    }
    const visible = CORE_SERVICES.filter((service) => !hiddenServiceIds.includes(service.id));
    res.json({ success: true, data: visible });
  } catch {
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

    if (result.rows.length === 0) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
