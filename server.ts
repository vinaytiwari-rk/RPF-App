
import { sendEmail } from './src/lib/mailer';
import { apiCache, CACHE_TTL } from './src/lib/apiCache';
import { queryExternalSearch } from './src/lib/externalSearch';
import { getGeminiClient, handleOfflineFallback } from './src/lib/gemini';
import { socialPreviewsCache, SOCIAL_CACHE_TTL } from './src/lib/socialCache';
import { resolveConstituency, loadACGeoJson, MP_CONSTITUENCIES_MOCK } from './src/lib/constituency';
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
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import adminHqRoutes from "./src/routes/adminHqRoutes.js";

import authRoutes from './src/routes/authRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import cultureRoutes from './src/routes/cultureRoutes.js';
import janSevaRoutes from './src/routes/janSevaRoutes.js';

import locationRoutes from './src/routes/locationRoutes.js';
import womenRoutes from './src/routes/womenRoutes.js';
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
import miscRoutes from './src/routes/miscRoutes.js';
import adminHqExtraRoutes from './src/routes/adminHqExtraRoutes.js';


import { setDbPool } from "./src/controllers/adminHqController.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Relaxed to 500 for development, normal use, and cPanel API resilience
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes" },
});

const sanitizePayload = (req: any, res: any, next: any) => {
  const payloadStr = JSON.stringify(req.body);
  if (payloadStr && (payloadStr.includes("DROP TABLE") || payloadStr.includes("SELECT * FROM") || payloadStr.includes("UNION SELECT"))) {
    return res.status(403).json({ success: false, error: "Suspicious payload detected." });
  }
  next();
};

app.use(sanitizePayload);
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


const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

// ---- Email sending via SMTP2GO API (replaces nodemailer/SMTP) ----
const SMTP2GO_API_BASE_URL = process.env.SMTP2GO_API_BASE_URL || "https://api.smtp2go.com/v3/";
const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY;
const DEFAULT_SENDER = process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org";
// JWT Middleware

const authorizeRole = (requiredRole: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(403).json({ success: false, error: "Access Denied" });
    }
    const userRole = req.user.role;
    if (requiredRole === "super_admin" || requiredRole === "admin") {
      if (userRole !== "super_admin" && userRole !== "admin") {
        return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
      }
    } else if (userRole !== requiredRole) {
      return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
    }
    next();
  };
};

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ success: false, error: "No token provided" });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ success: false, error: "Invalid token" });
    
    // Validate session in DB to prevent reuse of logged-out tokens
    try {
      const sessionRes = await pool.query('SELECT * FROM sessions WHERE token = $1', [token]);
      if (sessionRes.rows.length === 0 && user.role !== 'super_admin' && user.role !== 'guest') {
        return res.status(401).json({ success: false, error: "Session expired or logged out" });
      }
    } catch (e: any) {
      console.warn("Session validation warning:", e.message);
    }
    
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ success: false, error: "Access Denied: Admin role required" });
  }
  next();
};

app.use("/api/admin/hq", authenticateToken, requireAdmin);

app.use('/', authRoutes);
app.use('/', healthRoutes);
app.use('/', grievanceRoutes);
app.use('/', aiRoutes);
app.use('/', cultureRoutes);
app.use('/', janSevaRoutes);

app.use('/', locationRoutes);
app.use('/', womenRoutes);
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
app.use('/', publicGovRoutes);
app.use('/', miscRoutes);
app.use('/', adminHqExtraRoutes);



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


// PostgreSQL Pool Connection
const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";
const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});

setDbPool(pool);

// Auto-migrate missing columns for Volunteers Table
pool.query(`
  ALTER TABLE volunteers 
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255) UNIQUE
`).then(() => console.log('Volunteers table migrated automatically'))
  .catch(err => console.error('Auto-migration error:', err));

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0], env: process.env.DATABASE_URL ? "URL Set" : "URL Missing", dbUrl: dbUrl.substring(0, 15) + "..." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack, env: process.env.DATABASE_URL ? "URL Set" : "URL Missing", dbUrl: dbUrl.substring(0, 15) + "..." });
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
// DATABASE SCHEMA & AUTO-INITIALIZATION
// =============================================================================

async function initDatabase() {
  let client;
  try {
    console.log("Initializing local PostgreSQL schema...");
    client = await pool.connect();

    const runQuery = async (queryText: string, params: any[] = [], label: string = "") => {
      try {
        await client.query(queryText, params);
      } catch (err: any) {
        console.warn(`[DB INIT WARNING] Failed to execute query for: ${label || 'unknown'}. Error: ${err.message}`);
      }
    };

    // Create users table with all 30+ columns
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        points INTEGER DEFAULT 0,
        badges INTEGER DEFAULT 0,
        "janSevaCardStatus" TEXT DEFAULT 'none',
        "janSevaCardNo" TEXT DEFAULT '',
        "isVolunteer" BOOLEAN DEFAULT false,
        "isDonor" BOOLEAN DEFAULT false,
        "onboardingCompleted" BOOLEAN DEFAULT false,
        password_hash VARCHAR(255),
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "users table creation");

    // Phase 2: ALTER TABLE queries for existing databases that lack these columns
    const columnsToAlter = [
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "username", type: "VARCHAR(255) UNIQUE" },
      { name: "registration_number", type: "VARCHAR(255) UNIQUE" },
      { name: "father_husband_name", type: "TEXT" },
      { name: "mother_name", type: "TEXT" },
      { name: "dob", type: "DATE" },
      { name: "education", type: "JSONB" },
      { name: "blood_group", type: "VARCHAR(10)" },
      { name: "skills", type: "JSONB" },
      { name: "reason_for_joining", type: "TEXT" },
      { name: "availability", type: "VARCHAR(100)" },
      { name: "national_id_1", type: "VARCHAR(50)" },
      { name: "national_id_2", type: "VARCHAR(50)" },
      { name: "country", type: "VARCHAR(100)" },
      { name: "state", type: "VARCHAR(100)" },
      { name: "city", type: "VARCHAR(100)" },
      { name: "address", type: "TEXT" },
      { name: "pincode", type: "VARCHAR(20)" },
      { name: "area_locality", type: "VARCHAR(255)" },
      { name: "sansad_kshetra", type: "VARCHAR(255)" },
      { name: "vidhan_sabha", type: "VARCHAR(255)" },
      { name: "ward_no", type: "VARCHAR(255)" }
    ];

    for (const col of columnsToAlter) {
      await runQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`, [], `users alter column ${col.name}`);
      await runQuery(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`, [], `volunteers alter column ${col.name}`);
    }

    // Ensure avatar and cover columns exist on users and volunteers
    await runQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT`, [], "users add avatar column");
    await runQuery(`ALTER TABLE users ADD COLUMN IF NOT EXISTS cover TEXT`, [], "users add cover column");
    await runQuery(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS avatar TEXT`, [], "volunteers add avatar column");
    await runQuery(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS cover TEXT`, [], "volunteers add cover column");

    // Ensure default super admin exists
    await runQuery(`
      INSERT INTO users (id, name, username, password_hash, role)
      VALUES ('admin', 'System Administrator', 'admin', '$2a$10$D/x31v5.7r7j0U.tH1Mv3ui/b0f1UuVfOaB2b9m8mUoU0F3aXF7u6', 'super_admin')
      ON CONFLICT (id) DO UPDATE SET role = 'super_admin'
    `, [], "default super admin insert");

    // Create tracking tables
    await runQuery(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        token VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "sessions table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255),
        token VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE
      )
    `, [], "password_reset_tokens table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'admin',
        username TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL
      )
    `, [], "admin_credentials table creation");

    try {
      const adminCredRes = await pool.query(`SELECT count(*) FROM admin_credentials`);
      if (parseInt(adminCredRes.rows[0].count) === 0) {
        const defaultHash = await bcrypt.hash("admin", 10);
        await pool.query(
          `INSERT INTO admin_credentials (id, username, password_hash) VALUES ('admin', 'admin', $1)`,
          [defaultHash]
        );
        console.warn("[SECURITY] admin_credentials seeded with default password 'admin' — change this immediately via the Admin Dashboard.");
      }
    } catch (e: any) {
      console.warn("admin_credentials seed check failed:", e.message);
    }

    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_content (
        id SERIAL PRIMARY KEY,
        service_id VARCHAR(255) UNIQUE,
        content_en TEXT,
        content_hi TEXT,
        action_label_en TEXT,
        action_label_hi TEXT,
        action_url TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "service_content table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        role TEXT DEFAULT 'citizen',
        "tollFree" TEXT,
        "webUrl" TEXT,
        "founderMessageEn" TEXT,
        "founderMessageHi" TEXT,
        "helplinesMarquee" TEXT
      )
    `, [], "settings table creation");

    await runQuery('ALTER TABLE settings ADD COLUMN IF NOT EXISTS "helplinesMarquee" TEXT;', [], "alter settings helplinesMarquee");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS dynamic_settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "dynamic_settings table creation");

    await runQuery(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_id VARCHAR(255),
        admin_name VARCHAR(255),
        action VARCHAR(255),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "audit_logs table creation");

    // Ensure otps table exists
    await runQuery(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, [], "otps table creation");

    // Ensure otps table has enough space for emails
    await runQuery('ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)', [], "otps alter column phone size");

    // Create social_posts table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY,
        author TEXT,
        role TEXT,
        avatar TEXT,
        "textEn" TEXT,
        "textHi" TEXT,
        image TEXT,
        likes INTEGER DEFAULT 0,
        "commentsCount" INTEGER DEFAULT 0,
        liked BOOLEAN DEFAULT false,
        platform TEXT,
        link TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "social_posts table creation");

    // Create campaigns table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY,
        "titleEn" TEXT,
        "titleHi" TEXT,
        "goalAmount" NUMERIC DEFAULT 0,
        "raisedAmount" NUMERIC DEFAULT 0,
        "imageUrl" TEXT,
        "coverImgUrl" TEXT,
        urgent BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "campaigns table creation");

    // Create jobs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY,
        "titleEn" TEXT,
        "titleHi" TEXT,
        company TEXT,
        "locEn" TEXT,
        "locHi" TEXT,
        salary TEXT,
        "typeEn" TEXT,
        "typeHi" TEXT,
        "postedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "jobs table creation");

    // Create health_camps table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS health_camps (
        id UUID PRIMARY KEY,
        "titleEn" TEXT,
        "titleHi" TEXT,
        "dateEn" TEXT,
        "dateHi" TEXT,
        "locationEn" TEXT,
        "locationHi" TEXT,
        contact TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "health_camps table creation");

    await runQuery(`ALTER TABLE health_camps ADD COLUMN IF NOT EXISTS "registeredCount" INTEGER DEFAULT 0`, [], "health_camps registeredCount column");

    // Create camps view pointing to health_camps
    await runQuery(`
      CREATE OR REPLACE VIEW camps AS 
      SELECT * FROM health_camps
    `, [], "camps view creation");

    // Create grievances table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS grievances (
        id UUID PRIMARY KEY,
        title TEXT,
        description TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        "reportedBy" TEXT,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        "aiSummary" TEXT,
        "audioUrl" TEXT,
        "videoUrl" TEXT,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "grievances table creation");

    // Add audioUrl, videoUrl, and imageUrl columns to grievances if not exists
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "audioUrl" TEXT', [], "grievance audioUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "videoUrl" TEXT', [], "grievance videoUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "imageUrl" TEXT', [], "grievance imageUrl migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "date" TEXT', [], "grievance date migration");
    await runQuery('ALTER TABLE grievances ADD COLUMN IF NOT EXISTS "aiSummary" TEXT', [], "grievance aiSummary migration");

    // Create service_submissions_v2 table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_submissions_v2 (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT,
        "serviceNameEn" TEXT,
        "serviceName" TEXT,
        "citizenName" TEXT,
        "citizenPhone" TEXT,
        "submissionData" TEXT,
        status TEXT DEFAULT 'pending',
        latitude NUMERIC,
        longitude NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "service_submissions_v2 table creation");

    // Create health_vitals table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS health_vitals (
        user_id VARCHAR(255) PRIMARY KEY,
        steps INTEGER DEFAULT 0,
        water_cups INTEGER DEFAULT 0,
        calories INTEGER DEFAULT 0,
        exercise_mins INTEGER DEFAULT 0,
        weight NUMERIC DEFAULT 0,
        height NUMERIC DEFAULT 0,
        bmi NUMERIC DEFAULT 0,
        sleep_hours NUMERIC DEFAULT 0,
        heart_rate INTEGER DEFAULT 72,
        sleep_cycle VARCHAR(100) DEFAULT '7h 15m',
        period_day INTEGER DEFAULT 12,
        pregnancy_week INTEGER DEFAULT 8,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "health_vitals table creation");

    // Create medications table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS medications (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255),
        name TEXT,
        alarm_time VARCHAR(50),
        taken BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "medications table creation");

    // Create pediatric_profile table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS pediatric_profile (
        user_id VARCHAR(255) PRIMARY KEY,
        child_age VARCHAR(50),
        child_weight VARCHAR(50),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "pediatric_profile table creation");

    // Create vaccine_status table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS vaccine_status (
        id UUID PRIMARY KEY,
        user_id VARCHAR(255),
        vaccine_name TEXT,
        done BOOLEAN DEFAULT false,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, vaccine_name)
      )
    `, [], "vaccine_status table creation");

    // Create event_rsvps table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS event_rsvps (
        user_id VARCHAR(255),
        event_title TEXT,
        registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, event_title)
      )
    `, [], "event_rsvps table creation");

    // Create volunteers table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
        avatar TEXT,
        father_husband_name TEXT,
        mother_name TEXT,
        dob DATE,
        mobile VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        education JSONB,
        blood_group VARCHAR(10),
        skills JSONB,
        reason_for_joining TEXT,
        availability VARCHAR(100),
        national_id_1 VARCHAR(50),
        national_id_2 VARCHAR(50),
        country VARCHAR(100),
        state VARCHAR(100),
        city VARCHAR(100),
        address TEXT,
        pincode VARCHAR(20),
        area_locality VARCHAR(255),
        sansad_kshetra VARCHAR(255),
        vidhan_sabha VARCHAR(255),
        ward_no VARCHAR(255),
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "volunteers table creation");

    // Create job_applications table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY,
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "job_applications table creation");

    // Create blood_donors table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY,
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_donors table creation");

    // Create card_applications_v2 table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS card_applications_v2 (
        id UUID PRIMARY KEY, "userId" VARCHAR(255),
        name TEXT,
        gender TEXT,
        dob TEXT,
        address TEXT,
        "idType" TEXT,
        "idNumber" TEXT,
        status TEXT DEFAULT 'pending',
        "cardNo" TEXT DEFAULT '',
        "submittedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "card_applications_v2 table creation");

    // Create donations table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255),
        "donorName" TEXT NOT NULL,
        "donorEmail" TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        "campaignId" INTEGER,
        "transactionId" VARCHAR(255) UNIQUE,
        status TEXT DEFAULT 'success',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "donations table creation");

    // Create volunteer_tasks table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS volunteer_tasks (
        id SERIAL PRIMARY KEY,
        "volunteerId" VARCHAR(255) NOT NULL,
        "titleEn" TEXT NOT NULL,
        "titleHi" TEXT NOT NULL,
        "descriptionEn" TEXT,
        "descriptionHi" TEXT,
        points INTEGER DEFAULT 10,
        status TEXT DEFAULT 'assigned',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "volunteer_tasks table creation");
    // Create passkeys table (WebAuthn credentials)
    await runQuery(`
      CREATE TABLE IF NOT EXISTS passkeys (
        "credentialID" TEXT PRIMARY KEY,
        "publicKey" TEXT NOT NULL,
        counter INTEGER NOT NULL,
        "userId" VARCHAR(255) NOT NULL
      )
    `, [], "passkeys table creation");

    // Create street_ratings table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS street_ratings (
        id SERIAL PRIMARY KEY,
        location_name TEXT NOT NULL,
        latitude NUMERIC NOT NULL,
        longitude NUMERIC NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        notes TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "street_ratings table creation");

    // Create women_complaints table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS women_complaints (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        complainant_name TEXT,
        complainant_phone TEXT,
        complaint_type TEXT NOT NULL,
        incident_date TEXT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        suspect_details TEXT,
        is_anonymous BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'Pending Review',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "women_complaints table creation");

    // Create success_stories table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "imageUrl" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "success_stories table creation");

    // Create blogs table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        "authorName" TEXT NOT NULL,
        "authorId" VARCHAR(255) NOT NULL,
        approved BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "publishedAt" TIMESTAMP WITH TIME ZONE
      )
    `, [], "blogs table creation");



    // Seed default social posts if empty
    try {
      const postsCount = await client.query("SELECT COUNT(*) FROM social_posts");
      if (parseInt(postsCount.rows[0].count, 10) === 0) {
        console.log("Seeding default social_posts into PostgreSQL...");
        const DEFAULT_POSTS = [
          {
            author: "Rohit Pandit",
            role: "Founder, RP Foundation",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            textEn: "Sharing highlights from our weekend tree plantation drive in Karond, Bhopal. Over 500 saplings planted! 🌳 Let's build a greener tomorrow.",
            textHi: "करौंद, भोपाल में हमारे सप्ताहांत वृक्षारोपण अभियान की कुछ झलकियाँ। 500 से अधिक पौधे लगाए गए! 🌳 आइए एक हरित कल का निर्माण करें।",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
            likes: 412,
            commentsCount: 18,
            liked: false,
            platform: "instagram",
            link: "https://www.instagram.com/therohitpandit/"
          },
          {
            author: "RP Foundation",
            role: "Official Page",
            avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80",
            textEn: "Successful free eye checkup camp conducted today at Sehore district. Over 200 patients received free consultations and medicines. 🩺💙",
            textHi: "सीहोर जिला अस्पताल में आज सफल निःशुल्क नेत्र जांच शिविर आयोजित किया गया। 200 से अधिक मरीजों को निःशुल्क परामर्श और दवाएं दी गईं। 🩺💙",
            image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
            likes: 580,
            commentsCount: 34,
            liked: false,
            platform: "facebook",
            link: "https://www.facebook.com/rpfofficial"
          }
        ];
        for (const p of DEFAULT_POSTS) {
          await client.query(
            `INSERT INTO social_posts (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [crypto.randomUUID(), p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
          );
        }
      }
    } catch (e) {
      console.warn("Seeding social posts failed:", e);
    }

    // Create blood_banks table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_banks (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        stock_a_plus INTEGER DEFAULT 10,
        stock_a_minus INTEGER DEFAULT 5,
        stock_b_plus INTEGER DEFAULT 12,
        stock_b_minus INTEGER DEFAULT 4,
        stock_ab_plus INTEGER DEFAULT 8,
        stock_ab_minus INTEGER DEFAULT 2,
        stock_o_plus INTEGER DEFAULT 15,
        stock_o_minus INTEGER DEFAULT 6
      )
    `, [], "blood_banks table creation");

    // Create blood_requests table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_requests (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        blood_group VARCHAR(10) NOT NULL,
        component_type VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        urgency VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        doctor_name TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_requests table creation");

    // Create blood_appointments table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS blood_appointments (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        blood_bank_id VARCHAR(255) NOT NULL,
        appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
        blood_group VARCHAR(10),
        status VARCHAR(20) DEFAULT 'Scheduled',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `, [], "blood_appointments table creation");

    // Seed default blood banks if table is empty
    try {
      const bankCount = await client.query("SELECT COUNT(*) FROM blood_banks");
      if (parseInt(bankCount.rows[0].count, 10) === 0) {
        console.log("Seeding default blood banks...");
        const DEFAULT_BANKS = [
          {
            id: "bank_bhopal_redcross",
            name: "Bhopal Red Cross Blood Bank",
            email: "bhopal.redcross@bloodbank.org",
            phone: "+91-755-2550108",
            address: "Link Road No. 1, near Shivaji Nagar",
            city: "Bhopal",
            state: "Madhya Pradesh",
            pincode: "462016",
            stock_a_plus: 15, stock_a_minus: 3, stock_b_plus: 22, stock_b_minus: 5,
            stock_ab_plus: 8, stock_ab_minus: 1, stock_o_plus: 28, stock_o_minus: 7
          },
          {
            id: "bank_indore_civil",
            name: "Indore Central Blood Bank",
            email: "indore.civil@bloodbank.org",
            phone: "+91-731-2430200",
            address: "MY Hospital Campus, Residency Area",
            city: "Indore",
            state: "Madhya Pradesh",
            pincode: "452001",
            stock_a_plus: 12, stock_a_minus: 4, stock_b_plus: 18, stock_b_minus: 3,
            stock_ab_plus: 5, stock_ab_minus: 2, stock_o_plus: 20, stock_o_minus: 5
          },
          {
            id: "bank_sehore_public",
            name: "Sehore District Hospital Blood Bank",
            email: "sehore.hospital@bloodbank.org",
            phone: "+91-756-2224444",
            address: "District Hospital, Main Road",
            city: "Sehore",
            state: "Madhya Pradesh",
            pincode: "466001",
            stock_a_plus: 8, stock_a_minus: 2, stock_b_plus: 10, stock_b_minus: 2,
            stock_ab_plus: 3, stock_ab_minus: 1, stock_o_plus: 12, stock_o_minus: 3
          }
        ];
        for (const b of DEFAULT_BANKS) {
          await client.query(
            `INSERT INTO blood_banks (id, name, email, phone, address, city, state, pincode, stock_a_plus, stock_a_minus, stock_b_plus, stock_b_minus, stock_ab_plus, stock_ab_minus, stock_o_plus, stock_o_minus) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [b.id, b.name, b.email, b.phone, b.address, b.city, b.state, b.pincode, b.stock_a_plus, b.stock_a_minus, b.stock_b_plus, b.stock_b_minus, b.stock_ab_plus, b.stock_ab_minus, b.stock_o_plus, b.stock_o_minus]
          );
        }
      }
    } catch (e) {
      console.warn("Seeding blood banks failed:", e);
    }

    console.log("PostgreSQL schema initialization completed successfully.");
  } catch (err: any) {
    console.error("Database connection or schema init error (non-fatal):", err.message);
  } finally {
    if (client) {
      client.release();
    }
  }
}


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







// Profile image management endpoints








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









// Serve static assets in production or integrate Vite in development
async function startServer() {

  // Initialize Database tables and views
  await initDatabase();

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
  // Do not exit the process, just log it
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit the process, just log it
});

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();



