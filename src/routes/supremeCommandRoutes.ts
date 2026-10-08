import { Router } from "express";
import { pool } from "../db/dbPool"; // assuming this is the export
import { authenticateToken, requireAdmin } from "../db/middleware"; // adjust imports based on project structure

export const supremeCommandRouter = Router();


supremeCommandRouter.get("/api/supreme/seed", async (req, res) => {
  const defaults = {
    founder_name: "Rohit Pandit",
    founder_image_url: "/assets/founder.png",
    foundation_logo: "/assets/logo.png",
    splash_bg_color: "#ffffff",
    splash_text: "Service. Commitment. Resolve.",
    splash_logo: "/assets/logo.png",
    marquee_type: "rss",
    marquee_rss_url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48",
    thought_type: "rss",
    thought_rss_url: "https://mpinfo.org/RSSFeed/RSSFeed_News.xml",
    drik_panchang_active: "true",
    weather_active: "true",
    cert_volunteer_bg: "/assets/certificate_volunteer.png",
    cert_donor_bg: "/assets/certificate_donor.png",
    module_healthcare: "true",
    module_employment: "true",
    module_utilities: "true",
    module_epaper: "true",
    sos_police: "112",
    sos_ambulance: "102",
    sos_women: "1091",
    policy_privacy_url: "https://therpfoundation.org/privacy",
    policy_terms_url: "https://therpfoundation.org/terms"
  };
  try {
    const fs = require('fs');
    if (fs.existsSync("migrations/20261008_01_system_configs.sql")) {
      await pool.query(fs.readFileSync("migrations/20261008_01_system_configs.sql", "utf8"));
    }
    for (const [k, v] of Object.entries(defaults)) {
      await pool.query('INSERT INTO system_configs (config_key, config_value) VALUES ($1, $2) ON CONFLICT DO NOTHING', [k, String(v)]);
    }
    res.json({success: true, message: "Seeded!"});
  } catch(e) {
    res.status(500).json({error: String(e)});
  }
});

supremeCommandRouter.get("/api/supreme/configs", async (req, res) => {
  try {
    const result = await pool.query('SELECT config_key, config_value FROM system_configs');
    const configs: Record<string, string> = {};
    result.rows.forEach(row => {
      configs[row.config_key] = row.config_value;
    });
    res.json({ success: true, configs });
  } catch (err: any) {
    console.error("Failed to fetch configs", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

supremeCommandRouter.post("/api/supreme/configs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { configs } = req.body;
    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of Object.entries(configs)) {
        await client.query(
          `INSERT INTO system_configs (config_key, config_value) 
           VALUES ($1, $2) 
           ON CONFLICT (config_key) DO UPDATE SET config_value = $2, updated_at = NOW()`,
          [key, String(value)]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error("Failed to save configs", err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});
