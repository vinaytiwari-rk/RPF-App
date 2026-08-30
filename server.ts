import { Server as SocketIOServer } from 'socket.io';
import http from 'http';

import { sendEmail } from './src/lib/mailer';
import { apiCache, CACHE_TTL } from './src/lib/apiCache';
import { queryExternalSearch } from './src/lib/externalSearch';
import { getGeminiClient, handleOfflineFallback } from './src/lib/gemini';
import { socialPreviewsCache, SOCIAL_CACHE_TTL } from './src/lib/socialCache';
import { resolveConstituency, loadACGeoJson, loadACGeoJsonAsync, MP_CONSTITUENCIES_MOCK } from './src/lib/constituency';
import { USER_PRIVILEGED_FIELDS } from './src/lib/userFields';
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import bcrypt from 'bcryptjs';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import path from "path";
import axios from "axios";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import pg from "pg";
import { authenticateToken, requireAdmin, requireVolunteer, authorizeRole, JWT_SECRET } from "./src/db/middleware.js";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import adminHqRoutes from "./src/routes/adminHqRoutes.js";

import authRoutes from './src/routes/authRoutes.js';
import passwordResetSecure from './src/routes/passwordResetSecure.js';
import livenessRoutes from './src/routes/livenessRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import cultureRoutes from './src/routes/cultureRoutes.js';
import janSevaRoutes from './src/routes/janSevaRoutes.js';

import locationRoutes from './src/routes/locationRoutes.js';
import womenRoutes from './src/routes/womenRoutes.js';
import environmentRoutes from './src/routes/environmentRoutes.js';
import educationRoutes from './src/routes/educationRoutes.js';
import miscRoutes from './src/routes/miscRoutes.js';
import volunteerRoutes from './src/routes/volunteerRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import donationRoutes from './src/routes/donationRoutes.js';
import cmsRoutes from './src/routes/cmsRoutes.js';
import campaignRoutes from './src/routes/campaignRoutes.js';
import submissionRoutes from './src/routes/submissionRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import publicGovRoutes from './src/routes/publicGovRoutes.js';
import publicExternalRoutes from './src/routes/publicExternalRoutes.js';
import adminHqExtraRoutes from './src/routes/adminHqExtraRoutes.js';
import adminDynamicRoutes from './src/routes/adminDynamicRoutes.js';


import { setDbPool } from "./src/controllers/adminHqController.js";
import { runMigrationsOnPool } from "./src/db/migrationRunner.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const allowedOrigins = [
  "https://samahit.rpfoundation.org",
  "https://appapi.therpfoundation.org",
  "http://localhost:5173",
  "http://localhost:3000",
  "capacitor://localhost"
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Relaxed to 500 for development, normal use, and cPanel API resilience
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes" },
});

app.use("/api/auth", limiter);
app.use("/api/support_requests", limiter);
app.use("/api/grievances", limiter);

// AI endpoints call the paid Gemini API and previously had no rate limiting
// at all, so anyone could script requests against them and run up the bill.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: "Too many AI requests from this IP, please try again later" },
});
app.use("/api/ai", aiLimiter);


import jwt from "jsonwebtoken";


// ---- Email sending via SMTP2GO API (replaces nodemailer/SMTP) ----
const SMTP2GO_API_BASE_URL = process.env.SMTP2GO_API_BASE_URL || "https://api.smtp2go.com/v3/";
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
const DEFAULT_SENDER = process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org";

app.use("/api/admin/hq", authenticateToken, requireAdmin);

app.use('/', authRoutes);
app.use('/', passwordResetSecure);
app.use('/', livenessRoutes);
app.use('/', healthRoutes);
app.use('/', grievanceRoutes);
app.use('/', aiRoutes);
app.use('/', cultureRoutes);
app.use('/', janSevaRoutes);

app.use('/', locationRoutes);
app.use('/', womenRoutes);
app.use('/', adminHqRoutes);
app.use('/', environmentRoutes);
app.use('/', educationRoutes);
app.use('/', miscRoutes);
app.use('/', volunteerRoutes);
app.use('/', certificateRoutes);
app.use('/', communityRoutes);
app.use('/', jobRoutes);
app.use('/', donationRoutes);
app.use('/', cmsRoutes);
app.use('/', campaignRoutes);
app.use('/', submissionRoutes);
app.use('/', userRoutes);
app.use('/', uploadRoutes);
app.use(publicGovRoutes);
app.use(publicExternalRoutes);
app.use(adminHqExtraRoutes);
app.use(adminDynamicRoutes);



// Phase 3: Unified JWT Auth Endpoints






// Exact Pincode to Constituency Mapping Registry for Madhya Pradesh
// --- Shared, lazily-loaded Assembly Constituency boundary dataset (covers all of India) ---
let acGeoJsonData: any = null;
let acGeoJsonLoadAttempted = false;
// Find every Assembly Constituency for a given district from the full India dataset.
// This is what makes Vidhan Sabha resolution work correctly for ANY district/state,
// not just the handful that used to be hardcoded below.
// Resolve constituencies from district and office/locality area keywords
// =============================================================================
// VOLUNTEER REGISTRATION ENDPOINTS (5-STEP FORM)
// =============================================================================



const rpName = 'RP Foundation Jan Seva';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const originUrl = `https://${rpID}`;

const webAuthnChallengeStore = new Map();

// login-multi endpoint removed. Use /api/auth/login directly.

// Basic username format check: 3-20 chars, letters/numbers/underscore/dot only, must start with a letter
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;

// Reserved usernames that should never be allocatable
const RESERVED_USERNAMES = new Set(["admin", "root", "superadmin", "super_admin", "rpf", "support"]);





// SECURITY: This endpoint used to accept a bare {username, password} with no
// verification whatsoever, allowing anyone who knew a username to take over
// that account. It now requires a valid, unexpired password-reset token
// (issued only via /api/auth/forgot-password and emailed to the account's
// registered email address) before any password is changed.





// Admin HQ Credentials API





// ---------------- CERTIFICATE ENGINE ----------------









import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';





// ---------------- END CERTIFICATE ENGINE ----------------

// WEBAUTHN ENDPOINTS







const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


import { getPgPoolConfig } from './src/db/dbPool';

const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://rp_admin:therpfoundation%40321@localhost:5432/rp_db";
const pool = new pg.Pool(getPgPoolConfig(dbUrl));

pool.on('error', (err: any) => {
    console.error('Unexpected error on idle database pool client:', err?.message || err);
});

setDbPool(pool);
void runMigrationsOnPool(pool).catch((err: any) => {
    console.error('Server boot migration error:', err?.message || err);
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (err: any) {
    res.status(503).json({ status: "degraded", error: err.message });
  }
});

// Lazy-loaded Gemini AI client helper
// Unified search helper using a 4-Tier Multi-Engine Search Cluster
// Helper function for elegant server-side fallback when Gemini is unavailable
// 1. AI Chat Endpoint


// 2. AI Auto-Categorize Grievance Endpoint


// 3. AI Government Scheme Matcher


// =============================================================================
// LOCATION SEARCH API (LOCAL GEOJSON)
// =============================================================================
// =============================================================================
// OPEN GOVERNMENT DATA (data.gov.in) INTEGRATIONS
// =============================================================================

// 1. Agriculture: Mandi Prices


// 2. Health: Hospital Directory


// =============================================================================
// DATABASE SCHEMA & MIGRATIONS MANAGED EXCLUSIVELY VIA `npm run migrate`
// =============================================================================


// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================

  





// =============================================================================
// JOBS ENDPOINTS
// =============================================================================








// =============================================================================
// HEALTH PORTAL ENDPOINTS
// =============================================================================


















// =============================================================================
// RELIGIOUS & CULTURE PORTAL ENDPOINTS
// =============================================================================






// =============================================================================
// GRIEVANCES ENDPOINTS
// =============================================================================








// =============================================================================
// CARD APPLICATIONS ENDPOINTS
// =============================================================================










// Per-user card application status filter


// Card PDF Download Endpoint


// Donations Recording API


// Volunteer Task assignment and retrieval APIs






// =============================================================================
// SETTINGS & CMS ENDPOINTS
// =============================================================================

app.use("/api/admin/hq", adminHqRoutes);













// =============================================================================
// CROWDFUNDING CAMPAIGNS ENDPOINTS
// =============================================================================








// =============================================================================
// SOCIAL POSTS ENDPOINTS
// =============================================================================










// =============================================================================
// VOLUNTEERS ENDPOINTS
// =============================================================================








// =============================================================================
// SUBMISSIONS ENDPOINTS
// =============================================================================








// =============================================================================
// USERS ENDPOINTS
// =============================================================================


// SECURITY: previously this had no auth at all and let anyone pass ANY field
// name (including role, points, janSevaCardStatus) for ANY user id — full
// account takeover / privilege escalation. Now it requires login, restricts
// non-admins to editing only their own record, and blocks non-admins from
// touching privileged fields.
// =============================================================================
// HEALTH CAMPS REST ENDPOINTS
// =============================================================================


// Register/participate in a health camp — increments registeredCount atomically








// =============================================================================
// ACTIVE BLOOD DONORS ENDPOINTS
// =============================================================================




// =============================================================================
// BLOOD BANK & APPOINTMENTS / REQUESTS ENDPOINTS
// =============================================================================










// =============================================================================
// JOB APPLICATIONS ENDPOINTS
// =============================================================================


// =============================================================================
// DYNAMIC NOTIFICATIONS & TESTIMONIALS ENDPOINTS (CMS Config backed)
// =============================================================================




// =============================================================================
// STATS ENDPOINT
// =============================================================================



// =============================================================================
// FREE INTERNAL SERVICES (MANDI & DIRECTORY)
// =============================================================================

app.get('/api/mandi-prices', async (req, res) => {
  try {
    // We simulate a self-hosted free price feed using calculated realistic values
    // to prove independence from paid APIs. In a real-world scenario we could 
    // run a cheerio scraper here on agmarknet.
    const basePrices = [
      { commodityEn: 'Wheat (Lokwan)', commodityHi: 'गेहूँ (लोकवन)', price: 2850, trend: '+15' },
      { commodityEn: 'Rice (Basmati)', commodityHi: 'चावल (बासमती)', price: 4200, trend: '-20' },
      { commodityEn: 'Soyabean', commodityHi: 'सोयाबीन', price: 4600, trend: '+50' },
      { commodityEn: 'Onion', commodityHi: 'प्याज', price: 1800, trend: '+10' },
      { commodityEn: 'Potato', commodityHi: 'आलू', price: 1200, trend: '-5' }
    ];
    
    // Add random daily variance
    const livePrices = basePrices.map(item => ({
      ...item,
      livePrice: item.price + Math.floor(Math.random() * 40) - 20
    }));

    res.json({ success: true, data: livePrices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/directory', async (req, res) => {
  try {
    const { category } = req.query;
    let query = "SELECT * FROM directory_services WHERE status = 'active'";
    let params = [];
    if (category) {
      query += " AND category = $1";
      params.push(category);
    }
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =============================================================================
// MULTI-PART FILE UPLOADS CONTROLLERS (Local directory subdomain storage)
// =============================================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.mp3', '.wav', '.m4a', '.ogg', '.webm', '.mp4', '.mov', '.avi', '.mkv', '.3gp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("Only PNG, JPG, JPEG, PDF, MP3, WAV, M4A, OGG, WEBM, MP4, MOV, AVI, and MKV files are allowed"));
    }
    cb(null, true);
  }
});

// Multer upload error handling helper middleware
const handleUploadErrors = (err: any, req: any, res: any, next: any) => {
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
};

async function saveFileLocally(file: Express.Multer.File): Promise<string> {
  const fileExt = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 100000)}${fileExt}`;
  
  const destDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const destFilePath = path.join(destDir, filename);
  await fs.promises.writeFile(destFilePath, file.buffer);
  
  return `/uploads/${filename}`;
}

// General upload endpoint for Admin Panel
app.post("/api/admin/upload", authenticateToken, requireAdmin, upload.single("image"), handleUploadErrors, async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const localUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: localUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});// Profile image management endpoints








// =============================================================================
// SERVE STATIC FILES & APP STARTUP
// =============================================================================

// Serve static assets for uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Serve Flutter web app statically at /app
app.use("/app", express.static(path.join(process.cwd(), "public", "app")));
app.get("/app", (req, res) => {
  res.redirect("/app/");
});

// =============================================================================
// PHASE 6: 21 SERVICES APIs
// =============================================================================

import { CORE_SERVICES } from "./src/data/coreServices.js";









// =============================================================================
// REAL DYNAMIC IMPACT STATISTICS API (POSTGRESQL DB COUNTS)
// =============================================================================

app.get("/api/impact/live-stats", async (req, res) => {
  try {
    const volRes = await pool.query(`SELECT COUNT(*) FROM users WHERE role IN ('volunteer', 'admin', 'super_admin') OR "isVolunteer" = true`);
    const dutyRes = await pool.query(`SELECT COALESCE(SUM(duration_minutes), 0) AS total_minutes FROM volunteer_duty_sessions WHERE status = 'completed'`);
    const reportRes = await pool.query(`SELECT COUNT(*) FROM volunteer_field_reports WHERE approval_status = 'approved'`);
    const grievRes = await pool.query(`SELECT COUNT(*) FROM grievances WHERE status = 'Resolved'`);

    const totalVolunteers = parseInt(volRes.rows[0].count, 10) || 0;
    const totalDutyHours = Math.round((parseInt(dutyRes.rows[0].total_minutes, 10) || 0) / 60);
    const approvedReports = parseInt(reportRes.rows[0].count, 10) || 0;
    const resolvedGrievances = parseInt(grievRes.rows[0].count, 10) || 0;

    res.json({
      success: true,
      stats: {
        totalVolunteers,
        totalDutyHours,
        approvedReports,
        resolvedGrievances,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch live stats" });
  }
});

// 1. Clock-in Duty Session
app.post("/api/volunteers/duty/clock-in", authenticateToken, requireVolunteer, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name || "Volunteer";
    const userPhone = req.user?.phone || "";
    const { initiativeName, lat, lon, notes } = req.body;

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const existing = await pool.query(
      `SELECT * FROM volunteer_duty_sessions WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.json({ success: true, session: existing.rows[0], message: "Already on active duty" });
    }

    const sessionId = "duty_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const result = await pool.query(
      `INSERT INTO volunteer_duty_sessions 
       (id, user_id, user_name, user_phone, initiative_name, clock_in_time, clock_in_lat, clock_in_lon, notes, status)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, 'active')
       RETURNING *`,
      [sessionId, userId, userName, userPhone, initiativeName || "General Seva Drive", lat || null, lon || null, notes || ""]
    );

    res.json({ success: true, session: result.rows[0] });
  } catch (error: any) {
    console.error("Clock-in error:", error);
    res.status(500).json({ success: false, error: "Failed to clock in" });
  }
});

// 2. Clock-out Duty Session
app.post("/api/volunteers/duty/clock-out", authenticateToken, requireVolunteer, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId, lat, lon, notes } = req.body;

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const sessionRes = await pool.query(
      `SELECT * FROM volunteer_duty_sessions WHERE user_id = $1 AND ($2::text = '' OR id = $2) AND status = 'active' ORDER BY clock_in_time DESC LIMIT 1`,
      [userId, sessionId || ""]
    );

    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: "No active duty session found" });
    }

    const session = sessionRes.rows[0];
    const clockIn = new Date(session.clock_in_time).getTime();
    const now = Date.now();
    const durationMinutes = Math.max(1, Math.round((now - clockIn) / (1000 * 60)));

    const result = await pool.query(
      `UPDATE volunteer_duty_sessions 
       SET clock_out_time = NOW(), duration_minutes = $1, clock_out_lat = $2, clock_out_lon = $3, notes = COALESCE($4, notes), status = 'completed'
       WHERE id = $5 AND user_id = $6 AND status = 'active'
       RETURNING *`,
      [durationMinutes, lat || null, lon || null, notes || null, session.id, userId]
    );

    await pool.query(
      `UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2`,
      [Math.round(durationMinutes * 2), userId]
    );

    res.json({ success: true, session: result.rows[0], durationMinutes });
  } catch (error: any) {
    console.error("Clock-out error:", error);
    res.status(500).json({ success: false, error: "Failed to clock out" });
  }
});

// 3. Get Active Duty Session for Logged-In User
app.get("/api/volunteers/duty/active", authenticateToken, requireVolunteer, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const result = await pool.query(
      `SELECT * FROM volunteer_duty_sessions WHERE user_id = $1 AND status = 'active' ORDER BY clock_in_time DESC LIMIT 1`,
      [userId]
    );

    res.json({ success: true, session: result.rows[0] || null });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch active session" });
  }
});

// 4. Submit Field Report
app.post("/api/volunteers/reports/submit", authenticateToken, requireVolunteer, async (req: any, res) => {
  try {
    const userId = req.user?.id;
    const userName = req.user?.name || "Volunteer";
    const userPhone = req.user?.phone || "";
    const { title, description, imageUrl, locationName, latitude, longitude } = req.body;

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (!title) return res.status(400).json({ success: false, error: "Title is required" });

    const reportId = "report_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const result = await pool.query(
      `INSERT INTO volunteer_field_reports 
       (id, user_id, user_name, user_phone, title, description, image_url, location_name, latitude, longitude, approval_status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', NOW())
       RETURNING *`,
      [reportId, userId, userName, userPhone, title, description || "", imageUrl || "", locationName || "", latitude || null, longitude || null]
    );

    res.json({ success: true, report: result.rows[0] });
  } catch (error: any) {
    console.error("Report submit error:", error);
    res.status(500).json({ success: false, error: "Failed to submit field report" });
  }
});

// 5. Get Real Volunteer Leaderboard
app.get("/api/volunteers/leaderboard", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.avatar, 
        u.role,
        COALESCE(SUM(s.duration_minutes), 0) AS total_duty_minutes,
        COUNT(DISTINCT r.id) AS approved_reports_count,
        COALESCE(u.points, 0) AS total_points
      FROM users u
      LEFT JOIN volunteer_duty_sessions s ON u.id = s.user_id AND s.status = 'completed'
      LEFT JOIN volunteer_field_reports r ON u.id = r.user_id AND r.approval_status = 'approved'
      WHERE u.role IN ('volunteer', 'admin', 'super_admin') OR u."isVolunteer" = true
      GROUP BY u.id, u.name, u.avatar, u.role, u.points
      ORDER BY total_duty_minutes DESC, total_points DESC
      LIMIT 20
    `);

    res.json({ success: true, leaderboard: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch leaderboard" });
  }
});

// 6. Admin APIs: Get All Live Duty Sessions
app.get("/api/admin/duty-sessions", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM volunteer_duty_sessions ORDER BY clock_in_time DESC LIMIT 100`
    );
    res.json({ success: true, sessions: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch duty sessions" });
  }
});

// 7. Admin APIs: Get & Approve Field Reports
app.get("/api/admin/field-reports", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM volunteer_field_reports ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ success: true, reports: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to fetch field reports" });
  }
});

app.post("/api/admin/field-reports/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reportId, status, adminNotes, points } = req.body;
    if (!reportId) return res.status(400).json({ success: false, error: "Report ID required" });

    const validStatus = status === 'rejected' ? 'rejected' : 'approved';
    const pointsToAward = Math.min(200, Math.max(0, parseInt(points) || 50));

    const result = await pool.query(
      `UPDATE volunteer_field_reports 
       SET approval_status = $1, admin_notes = $2, points_awarded = $3
       WHERE id = $4
       RETURNING *`,
      [validStatus, adminNotes || 'Reviewed by Admin', pointsToAward, reportId]
    );

    if (result.rows.length > 0 && validStatus === 'approved') {
      const report = result.rows[0];
      await pool.query(
        `UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2`,
        [pointsToAward, report.user_id]
      );
    }

    res.json({ success: true, report: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Failed to approve field report" });
  }
});

// Serve static assets in production or integrate Vite in development
async function startServer() {
  // Load GeoJSON data in the background
  loadACGeoJsonAsync().catch(err => console.error("Error loading GeoJSON in background", err));

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: corsOptions
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required to join chat"));
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (!decoded || typeof decoded !== "object" || !decoded.id) return next(new Error("Invalid token"));
      if (decoded.role !== "guest") {
        const sessionRes = await pool.query("SELECT 1 FROM sessions WHERE token = $1 AND expires_at > NOW() LIMIT 1", [token]);
        if (sessionRes.rows.length === 0) return next(new Error("Session expired or revoked"));
      }
      (socket as any).userId = decoded.id;
      (socket as any).userName = decoded.name || "Citizen";
      next();
    } catch {
      return next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("chat_message", async (msg) => {
      const userId = (socket as any).userId;
      const authorName = (socket as any).userName;
      const text = typeof msg?.text === "string" ? msg.text.trim().slice(0, 2000) : "";
      if (!text) return;

      try {
        const result = await pool.query(
          `INSERT INTO community_chat_messages (id, "userId", "authorName", "authorAvatar", text)
           VALUES (gen_random_uuid(), $1, $2, $3, $4)
           RETURNING id, "authorName", "authorAvatar", text, "createdAt"`,
          [userId, authorName, msg?.authorAvatar || null, text]
        );
        io.emit("chat_message", result.rows[0]);
      } catch (e: any) {
        console.error("Failed to persist chat message:", e.message);
      }
    });
    socket.on("disconnect", () => {});
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

}

startServer();




