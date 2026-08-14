import { Request, Response } from "express";
import { Pool } from "pg";
import { auditEvent } from "../db/middleware.js";

let pool: Pool;

export const setDbPool = (dbPool: Pool) => {
  pool = dbPool;
};

/**
 * Administrator-only writer for the canonical service_content table.
 * Public reads are intentionally handled by publicGovRoutes.ts so that the
 * administrator router never becomes the public content API.
 */
export const updateServiceContent = async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const { content, action_url } = req.body || {};

  if (!serviceId || typeof serviceId !== "string") {
    return res.status(400).json({ success: false, error: "A valid service ID is required." });
  }

  if (content !== undefined && (typeof content !== "object" || Array.isArray(content) || content === null)) {
    return res.status(400).json({ success: false, error: "Content must be a JSON object." });
  }

  if (action_url !== undefined && action_url !== null && typeof action_url !== "string") {
    return res.status(400).json({ success: false, error: "Action URL must be a string." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO service_content (service_id, content, action_url, updated_at)
       VALUES ($1, $2::jsonb, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (service_id) DO UPDATE SET
         content = EXCLUDED.content,
         action_url = EXCLUDED.action_url,
         updated_at = CURRENT_TIMESTAMP
       RETURNING service_id, content, action_url, updated_at`,
      [serviceId, JSON.stringify(content || {}), action_url ?? null]
    );

    const row = result.rows[0];
    await auditEvent({
      action: "service_content_updated",
      resource: "service_content",
      resourceId: serviceId,
      userId: String(req.user?.id || ""),
      req,
      metadata: { hasContent: content !== undefined, hasActionUrl: action_url !== undefined },
    });

    return res.json({ success: true, data: row, message: "Service content updated successfully." });
  } catch (error) {
    console.error("Error updating service content:", error);
    return res.status(500).json({ success: false, error: "Failed to update service content." });
  }
};
