import { Request, Response } from "express";
import { Pool } from "pg";

let pool: Pool;

export const setDbPool = (dbPool: Pool) => {
  pool = dbPool;
};

export const getServiceContent = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM service_cms_content WHERE service_id = $1", [serviceId]);
    if (result.rows.length > 0) {
      res.json({ success: true, data: result.rows[0] });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error: any) {
    console.error("Error fetching service content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateServiceContent = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const { content_blocks, resources, action_buttons, form_config } = req.body;
  try {
    await pool.query(
      `INSERT INTO service_cms_content (service_id, content_blocks, resources, action_buttons, form_config)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (service_id) DO UPDATE SET
         content_blocks = $2,
         resources = $3,
         action_buttons = $4,
         form_config = $5`,
      [
        serviceId, 
        JSON.stringify(content_blocks || {}), 
        JSON.stringify(resources || []), 
        JSON.stringify(action_buttons || {}), 
        JSON.stringify(form_config || {})
      ]
    );
    res.json({ success: true, message: "Service content updated successfully." });
  } catch (error: any) {
    console.error("Error updating service content:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
