import { Router } from "express";
import { pool } from "../db/dbPool"; // assuming this is the export
import { authenticateToken, requireAdmin } from "../db/middleware"; // adjust imports based on project structure

export const supremeCommandRouter = Router();

const PUBLIC_CONFIG_KEYS = [
  "founder_name", "founder_image_url", "foundation_logo", "splash_bg_color", "splash_text", "splash_logo",
  "marquee_type", "marquee_rss_url", "thought_type", "thought_rss_url", "drik_panchang_active", "weather_active",
  "cert_volunteer_bg", "cert_donor_bg", "module_healthcare", "module_employment", "module_utilities", "module_epaper",
  "module_livetv", "livetv_primary_country", "sos_police", "sos_ambulance", "sos_women", "policy_privacy_url", "policy_terms_url"
] as const;

// Seeding changes persistent system state, so it must never be exposed as a public GET endpoint.
supremeCommandRouter.get("/api/supreme/seed", (_req, res) => {
  return res.status(405).json({ success: false, error: "Seeding is a protected administrator action; use POST after administrator login." });
});

supremeCommandRouter.post("/api/supreme/seed", authenticateToken, requireAdmin, async (_req, res) => {
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
    module_livetv: "true",
    livetv_primary_country: "IN",
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
    const result = await pool.query(
      'SELECT config_key, config_value FROM system_configs WHERE config_key = ANY($1::text[])',
      [[...PUBLIC_CONFIG_KEYS]]
    );
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
    if (!configs || typeof configs !== 'object' || Array.isArray(configs)) {
      return res.status(400).json({ success: false, error: "Invalid payload" });
    }
    const entries = Object.entries(configs);
    if (!entries.length || entries.length > 100 || entries.some(([key, value]) =>
      !/^[a-zA-Z0-9_.-]{1,100}$/.test(key) ||
      (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") ||
      String(value).length > 4000
    )) {
      return res.status(400).json({ success: false, error: "Configuration payload contains invalid keys or values." });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [key, value] of entries) {
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
