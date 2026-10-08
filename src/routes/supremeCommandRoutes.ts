import { Router } from "express";
import { pool } from "../db/dbPool"; // assuming this is the export
import { authenticateToken, requireAdmin } from "../db/middleware"; // adjust imports based on project structure

export const supremeCommandRouter = Router();

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
