import crypto from "crypto";
import { pool } from "../db/dbPool.js";

export async function ensureEligibleCertificates(userId: string) {
  const rules = await pool.query(`SELECT * FROM certificate_rules WHERE active = TRUE ORDER BY min_hours ASC, min_reports ASC, min_tasks ASC`);
  const hoursRes = await pool.query(`SELECT COALESCE(SUM(duration_minutes),0) / 60.0 AS hours FROM volunteer_duty_sessions WHERE user_id = $1 AND status = 'completed'`, [userId]);
  const reportsRes = await pool.query(`SELECT COUNT(*)::int AS count FROM volunteer_reports WHERE volunteer_id = $1`, [userId]);
  const tasksRes = await pool.query(`SELECT COUNT(*)::int AS count FROM volunteer_tasks WHERE "volunteerId" = $1 AND status = 'completed'`, [userId]);
  const hours = Number(hoursRes.rows[0]?.hours || 0);
  const reports = Number(reportsRes.rows[0]?.count || 0);
  const tasks = Number(tasksRes.rows[0]?.count || 0);
  const volunteer = await pool.query(`SELECT full_name, registration_number FROM volunteers WHERE id = $1 LIMIT 1`, [userId]);
  if (!volunteer.rows[0]) return;
  for (const rule of rules.rows) {
    if (hours < Number(rule.min_hours || 0) || reports < Number(rule.min_reports || 0) || tasks < Number(rule.min_tasks || 0)) continue;
    const exists = await pool.query(`SELECT id FROM certificates WHERE volunteer_id = $1 AND rule_id = $2 LIMIT 1`, [userId, rule.id]);
    if (exists.rows.length) continue;
    const certificateId = `RPF-${String(rule.id).toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0,24)}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    await pool.query(
      `INSERT INTO certificates (id, certificate_id, volunteer_id, rule_id, title, title_hi, recipient_name, role, duty_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [crypto.randomUUID(), certificateId, userId, rule.id, rule.title, rule.title_hi, volunteer.rows[0].full_name, "Verified Volunteer", Math.round(hours * 100) / 100]
    );
  }
}
