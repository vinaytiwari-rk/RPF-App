import express from 'express';
import { queryExternalSearch } from '../lib/externalSearch';
import { apiCache, CACHE_TTL } from '../lib/apiCache';
import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import multer from 'multer';

const router = express.Router();

router.get("/api/search/external", async (req, res) => {
  try {
    const q = (req.query.q || req.query.query) as string;
    if (!q) return res.status(400).json({ success: false, error: "Missing search query" });
    const results = await queryExternalSearch(q);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error("External search API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real per-user notifications. CMS notifications are content, not user activity.
router.get("/api/notifications", authenticateToken, async (req, res) => {
  try {
    const userId = String((req as any).user?.id || '').trim();
    if (!userId) return res.status(401).json({ success: false, error: "Authenticated user is required" });

    const result = await pool.query(
      `SELECT id, title, message, type, reference_id, is_read, created_at
       FROM app_notifications
       WHERE recipient_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    res.json({
      notifications: result.rows.map((row: any) => ({
        id: String(row.id),
        type: row.type === 'blood_request' ? 'urgent' : row.type === 'success' ? 'success' : 'info',
        titleEn: row.title,
        titleHi: row.title,
        bodyEn: row.message,
        bodyHi: row.message,
        createdAt: row.created_at,
        read: Boolean(row.is_read),
        referenceId: row.reference_id || null,
      }))
    });
  } catch (err: any) {
    console.error("User notifications API error:", err);
    res.status(500).json({ success: false, error: "Unable to load notifications" });
  }
});

router.post("/api/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const userId = String((req as any).user?.id || '').trim();
    const notificationId = String(req.params.id || '').trim();
    if (!userId || !notificationId) return res.status(400).json({ success: false, error: "Invalid notification" });
    const result = await pool.query(
      `UPDATE app_notifications SET is_read = TRUE
       WHERE id = $1 AND recipient_id = $2
       RETURNING id`,
      [notificationId, userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Notification read API error:", err);
    res.status(500).json({ success: false, error: "Unable to update notification" });
  }
});

router.get("/api/testimonials", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/api/stats", async (req, res) => {
  const cached = apiCache.get("/api/stats");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return res.json(cached.data);
  let beneficiaries = 0, volunteers = 0, healthCamps = 0, campaigns = 0;
  let offsets = { beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 };
  try {
    const cmsRes = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (cmsRes.rows.length > 0 && cmsRes.rows[0].founderMessageEn) {
      const parsed = JSON.parse(cmsRes.rows[0].founderMessageEn);
      if (parsed.statsOffsets) offsets = parsed.statsOffsets;
    }
  } catch (e) {}
  try { const bRes = await pool.query("SELECT COUNT(*) FROM card_applications_v2"); beneficiaries = parseInt(bRes.rows[0].count, 10); } catch (e) {}
  try { const vRes = await pool.query("SELECT COUNT(*) FROM volunteers"); volunteers = parseInt(vRes.rows[0].count, 10); } catch (e) {}
  try { const hRes = await pool.query("SELECT COUNT(*) FROM health_camps"); healthCamps = parseInt(hRes.rows[0].count, 10); } catch (e) {}
  try { const sRes = await pool.query(`SELECT COUNT(*) FROM service_submissions_v2 WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support' OR "serviceName" = 'Campaigns'`); campaigns = parseInt(sRes.rows[0].count, 10); } catch (e) {}
  const data = { beneficiaries: beneficiaries + (offsets.beneficiaries || 0), volunteers: volunteers + (offsets.volunteers || 0), healthCamps: healthCamps + (offsets.healthCamps || 0), campaigns: campaigns + (offsets.campaigns || 0) };
  apiCache.set("/api/stats", { data, timestamp: Date.now() });
  res.json(data);
});

const MOCK_JOBS = [
  { id: "job_01", title: "Primary School Teacher", company: "Bhopal District Schools", location: "Bhopal, MP", type: "Full-Time", salary: "₹18,000 - ₹25,000 / month", description: "Looking for dedicated teachers for local government primary schools." },
  { id: "job_02", title: "Data Entry Operator", company: "Smart City Org", location: "Indore, MP", type: "Contract", salary: "₹12,000 / month", description: "Requires basic computer skills and Hindi typing." },
  { id: "job_03", title: "Nursing Staff", company: "Apollo Seva Hospital", location: "Jabalpur, MP", type: "Full-Time", salary: "₹22,000 - ₹30,000 / month", description: "Urgent hiring for registered nurses for the emergency ward." },
  { id: "job_04", title: "Delivery Executive", company: "Kisan Fresh", location: "Multiple Locations", type: "Part-Time", salary: "₹15,000 + Fuel", description: "Deliver fresh produce directly from farmers to city markets." }
];

router.get('/api/jobs', async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM job_listings ORDER BY posted_at DESC");
    if (result.rows.length === 0) {
      for (const job of MOCK_JOBS) await pool.query("INSERT INTO job_listings (id, title, company, location, type, salary, description) VALUES ($1, $2, $3, $4, $5, $6, $7)", [job.id, job.title, job.company, job.location, job.type, job.salary, job.description]);
      result = await pool.query("SELECT * FROM job_listings ORDER BY posted_at DESC");
    }
    res.json(result.rows);
  } catch (err) { console.error("Error fetching jobs:", err); res.status(500).json({ error: "Failed to fetch jobs" }); }
});

router.get('/api/culture/panchang', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let result = await pool.query("SELECT * FROM panchang_calendar WHERE date = $1", [today]);
    if (result.rows.length === 0) {
      const mockPanchang = { date: today, tithi: "Shukla Paksha Ekadashi", nakshatra: "Rohini", sunrise: "05:42 AM", sunset: "07:11 PM", moonrise: "03:15 PM", moonset: "02:10 AM", festivals: "Nirjala Ekadashi" };
      await pool.query("INSERT INTO panchang_calendar (date, tithi, nakshatra, sunrise, sunset, moonrise, moonset, festivals) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [today, mockPanchang.tithi, mockPanchang.nakshatra, mockPanchang.sunrise, mockPanchang.sunset, mockPanchang.moonrise, mockPanchang.moonset, mockPanchang.festivals]);
      result = await pool.query("SELECT * FROM panchang_calendar WHERE date = $1", [today]);
    }
    res.json(result.rows[0]);
  } catch (err) { console.error("Error fetching panchang:", err); res.status(500).json({ error: "Failed to fetch panchang" }); }
});

router.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });
    await pool.query("INSERT INTO chat_history (session_id, role, content) VALUES ($1, $2, $3)", [sessionId, 'user', message]);
    let responseText = "I'm a helpful AI assistant. I can help you navigate the platform, translate text, or answer basic questions.";
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) responseText = "Namaste! How can I assist you today? You can ask me about Jobs, Panchang, or how to use the RPF platform.";
    else if (lowerMessage.includes('job') || lowerMessage.includes('work')) responseText = "We have several job listings available! You can find them under the 'Jobs & Internships' section. I can also help you build your resume.";
    else if (lowerMessage.includes('panchang') || lowerMessage.includes('calendar') || lowerMessage.includes('festival')) responseText = "You can view today's Tithi, Nakshatra, and auspicious timings in the 'Culture & Heritage' section.";
    else if (lowerMessage.includes('thank')) responseText = "You're welcome! Let me know if you need anything else.";
    else if (lowerMessage.includes('translate')) responseText = "I can translate text between English and Hindi for you. Just type the phrase and ask me to translate it!";
    await new Promise(resolve => setTimeout(resolve, 800));
    await pool.query("INSERT INTO chat_history (session_id, role, content) VALUES ($1, $2, $3)", [sessionId, 'assistant', responseText]);
    res.json({ reply: responseText });
  } catch (err) { console.error("Error in AI chat:", err); res.status(500).json({ error: "Failed to process chat" }); }
});

router.get('/api/ai/chat/history', async (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    const result = await pool.query("SELECT role, content FROM chat_history WHERE session_id = $1 ORDER BY timestamp ASC LIMIT 50", [sessionId]);
    res.json(result.rows);
  } catch (err) { console.error("Error fetching chat history:", err); res.status(500).json({ error: "Failed to fetch chat history" }); }
});

export default router;
