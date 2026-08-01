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
import { setDbPool } from "./src/controllers/adminHqController.js";

dotenv.config();

const app = express();
app.set('trust proxy', 1);

const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute
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

async function sendEmail({ to, subject, text, html, from }: { to: string | string[], subject: string, text?: string, html?: string, from?: string }) {
  if (!SMTP2GO_API_KEY) {
    console.error("SMTP2GO_API_KEY not set in environment — cannot send email");
    throw new Error("Email service not configured");
  }
  const toList = Array.isArray(to) ? to : [to];
  const payload: any = {
    sender: from || `RP Foundation <${DEFAULT_SENDER}>`,
    to: toList,
    subject,
  };
  if (text) payload.text_body = text;
  if (html) payload.html_body = html;

  const url = new URL("email/send", SMTP2GO_API_BASE_URL).toString();
  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "X-Smtp2go-Api-Key": SMTP2GO_API_KEY,
      "Accept": "application/json",
    },
  });
  if (response.data?.data?.failed) {
    console.error("SMTP2GO send failures:", response.data.data.failures);
  }
  return response.data;
}

// JWT Middleware

const authorizeRole = (requiredRole: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== requiredRole) {
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

// Phase 3: Unified JWT Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    const userId = "citizen-" + Date.now();
    
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, 'citizen')`,
      [userId, name, email, phone, password_hash]
    );

    const userPayload = { id: userId, role: 'citizen', name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    
    // Track session
    await pool.query(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      ["sess-" + Date.now(), userId, token]
    );

    res.json({ success: true, token, user: userPayload });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, identifier, password, role } = req.body;
    
    // Mode A: Guest Login
    if (role === 'guest') {
      const guestId = "guest_" + Date.now() + Math.random().toString(36).slice(2, 6);
      const guestUser = { id: guestId, name: "Guest User", role: "guest" };
      const token = jwt.sign(guestUser, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user: guestUser, token });
    }
    
    // Mode B: OTP Request (if phone is present and password is not)
    if (phone && !password) {
      if (phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save/UPSERT OTP
      await pool.query(
        `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
        [phone, otp]
      );
      
      console.log(`[SMS] Sending OTP for ${phone} is: ${otp}`);
      try {
        const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;
        const MSG91_SENDER = process.env.MSG91_SENDER || "RPFApp";
        if (!MSG91_AUTHKEY) {
          console.error("MSG91_AUTHKEY not set in environment — skipping SMS send");
        } else {
          const url = `https://control.msg91.com/api/v5/otp?authkey=${MSG91_AUTHKEY}&mobile=91${phone}&otp=${otp}&sender=${MSG91_SENDER}`;
          await axios.get(url);
        }
      } catch (smsErr: any) {
        console.error("MSG91 Error:", smsErr?.response?.data || smsErr.message);
      }
      return res.json({ success: true, message: "OTP sent" });
    }
    
    // Mode C: Password Auth
    const finalIdentifier = identifier || phone;
    if (!finalIdentifier || !password) {
      return res.status(400).json({ success: false, error: "Missing identifier/phone or password" });
    }

    // Admin login: single source of truth is admin_credentials table
    // (kept in sync by PUT /api/admin/hq/credentials — no hardcoded bypass)
    if (finalIdentifier === "admin") {
      const adminCredRes = await pool.query(
        `SELECT * FROM admin_credentials WHERE username = $1`,
        [finalIdentifier]
      );
      if (adminCredRes.rows.length > 0) {
        const adminRow = adminCredRes.rows[0];
        const adminPasswordValid = await bcrypt.compare(password, adminRow.password_hash);
        if (adminPasswordValid) {
          const adminUser = { id: "usr_staff_admin", name: "System Administrator", role: "super_admin" };
          const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '7d' });
          return res.json({ success: true, user: adminUser, token });
        }
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
      // No admin_credentials row found — fall through to users table below
    }

    let user = null;
    let isVolunteer = false;
    let validPassword = false;

    // Check volunteers table first
    const volResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [finalIdentifier]
    );

    if (volResult.rows.length > 0) {
      user = volResult.rows[0];
      isVolunteer = true;
      if (user.password_hash.startsWith('$2')) {
        validPassword = await bcrypt.compare(password, user.password_hash);
      } else {
        const oldHash = crypto.createHash('sha256').update(password).digest('hex');
        validPassword = (oldHash === user.password_hash);
      }
    } else {
      // Check users table
      const userResult = await pool.query(
        `SELECT * FROM users WHERE email = $1 OR phone = $1 OR username = $1`,
        [finalIdentifier]
      );
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        validPassword = await bcrypt.compare(password, user.password_hash);
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const userPayload = isVolunteer
      ? { id: user.id, role: "volunteer", name: user.full_name, phone: user.mobile, email: user.email }
      : { id: user.id, role: user.role || 'citizen', name: user.name, phone: user.phone, email: user.email };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    // Track session
    try {
      await pool.query(
        `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')
         ON CONFLICT (id) DO NOTHING`,
        ["sess-" + Date.now(), user.id, token]
      );
    } catch (e) {
      console.warn("Session tracking failed (ignoring):", e.message);
    }

    res.json({ success: true, token, user: userPayload });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/search/external", async (req, res) => {
  try {
    const q = (req.query.q || req.query.query) as string;
    if (!q) {
      return res.status(400).json({ success: false, error: "Missing search query" });
    }
    const results = await queryExternalSearch(q);
    res.json({ success: true, data: results });
  } catch (error: any) {
    console.error("External search API error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Exact Pincode to Constituency Mapping Registry for Madhya Pradesh
const PINCODE_CONSTITUENCY_MAP: Record<string, { vidhan_sabha: string, vidhan_sabhas: string[], sansad_kshetra: string }> = {
  "462038": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Bhopal Uttar", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462001": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462002": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462003": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462008": { vidhan_sabha: "Bhopal Uttar", vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya"], sansad_kshetra: "Bhopal" },
  "462010": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462011": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462018": { vidhan_sabha: "Narela", vidhan_sabhas: ["Narela", "Govindpura"], sansad_kshetra: "Bhopal" },
  "462021": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462022": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462023": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462024": { vidhan_sabha: "Govindpura", vidhan_sabhas: ["Govindpura", "Narela"], sansad_kshetra: "Bhopal" },
  "462026": { vidhan_sabha: "Bhopal Madhya", vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462004": { vidhan_sabha: "Bhopal Madhya", vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462007": { vidhan_sabha: "Bhopal Madhya", vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462016": { vidhan_sabha: "Bhopal Dakshin-Pashchim", vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"], sansad_kshetra: "Bhopal" },
  "462030": { vidhan_sabha: "Bhopal Dakshin-Pashchim", vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur"], sansad_kshetra: "Bhopal" },
  "462009": { vidhan_sabha: "Huzur", vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "462042": { vidhan_sabha: "Huzur", vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim"], sansad_kshetra: "Bhopal" },
  "466001": { vidhan_sabha: "Budhni", vidhan_sabhas: ["Budhni", "Ichhawar"], sansad_kshetra: "Vidisha" },
  "452001": { vidhan_sabha: "Indore-1", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452002": { vidhan_sabha: "Indore-2", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452003": { vidhan_sabha: "Indore-3", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452004": { vidhan_sabha: "Indore-4", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452010": { vidhan_sabha: "Indore-5", vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau"], sansad_kshetra: "Indore" },
  "452011": { vidhan_sabha: "Rau", vidhan_sabhas: ["Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5"], sansad_kshetra: "Indore" },
  "453441": { vidhan_sabha: "Mhow", vidhan_sabhas: ["Mhow", "Rau"], sansad_kshetra: "Dhar" }
};

// --- Shared, lazily-loaded Assembly Constituency boundary dataset (covers all of India) ---
let acGeoJsonData: any = null;
let acGeoJsonLoadAttempted = false;

function loadACGeoJson() {
  if (acGeoJsonData || acGeoJsonLoadAttempted) return acGeoJsonData;
  acGeoJsonLoadAttempted = true;
  try {
    const geoJsonPath = path.join(process.cwd(), "maps-master", "maps-master", "website", "docs", "data", "geojson", "ac.geojson");
    if (fs.existsSync(geoJsonPath)) {
      const fileContent = fs.readFileSync(geoJsonPath, "utf-8");
      acGeoJsonData = JSON.parse(fileContent);
      console.log(`[AC GeoJSON] Loaded ${acGeoJsonData?.features?.length || 0} constituency features`);
    } else {
      console.warn("[AC GeoJSON] File not found at", geoJsonPath, "- falling back to limited built-in dataset");
    }
  } catch (err: any) {
    console.error("[AC GeoJSON] Failed to load:", err.message);
  }
  return acGeoJsonData;
}

// Find every Assembly Constituency for a given district from the full India dataset.
// This is what makes Vidhan Sabha resolution work correctly for ANY district/state,
// not just the handful that used to be hardcoded below.
function findConstituenciesByDistrict(district: string, state?: string) {
  const geoJson = loadACGeoJson();
  if (!geoJson || !Array.isArray(geoJson.features)) return null;

  const targetDistrict = district.trim().toLowerCase();
  const targetState = state ? state.trim().toLowerCase() : null;

  const seen = new Set<string>();
  const matches: { vidhan_sabha: string, sansad_kshetra: string }[] = [];

  for (const feature of geoJson.features) {
    const props = feature.properties;
    if (!props) continue;
    const dist = (props.DIST_NAME || "").toLowerCase();
    const st = (props.ST_NAME || "").toLowerCase();

    if (dist !== targetDistrict) continue;
    if (targetState && !st.includes(targetState) && !targetState.includes(st)) continue;

    const acName = props.AC_NAME;
    if (!acName || seen.has(acName)) continue;
    seen.add(acName);
    matches.push({ vidhan_sabha: acName, sansad_kshetra: props.PC_NAME || "" });
  }

  return matches.length > 0 ? matches : null;
}

// Resolve constituencies from district and office/locality area keywords
function resolveConstituency(pincode: string, district: string, areas: string[], state?: string) {
  // 1. Check exact pincode map (highest confidence, hand-verified entries)
  if (PINCODE_CONSTITUENCY_MAP[pincode]) {
    return PINCODE_CONSTITUENCY_MAP[pincode];
  }

  const areaString = areas.join(" ").toLowerCase();

  // 2. Use the full India AC dataset, matched by district - this covers every
  // district/state, not just the ones previously hardcoded.
  const geoMatches = findConstituenciesByDistrict(district, state);
  if (geoMatches) {
    const vidhan_sabhas = geoMatches.map(m => m.vidhan_sabha);
    const sansad_kshetra = geoMatches[0]?.sansad_kshetra || (district + " Lok Sabha constituency");

    // If only one AC exists in this district, it's an exact match
    if (geoMatches.length === 1) {
      return { vidhan_sabha: geoMatches[0].vidhan_sabha, vidhan_sabhas, sansad_kshetra };
    }

    // Try to narrow down using the post-office/area names for this pincode
    const nameMatch = geoMatches.find(m => areaString.includes(m.vidhan_sabha.toLowerCase()));
    if (nameMatch) {
      return { vidhan_sabha: nameMatch.vidhan_sabha, vidhan_sabhas, sansad_kshetra };
    }

    // Multiple ACs and no confident match - let the user pick from the dropdown
    return { vidhan_sabha: "", vidhan_sabhas, sansad_kshetra };
  }

  // 3. Legacy heuristic matching for Bhopal/Indore (kept as a safety net in case
  // the geojson dataset is unavailable on this server)
  if (district.toLowerCase() === "bhopal") {
    if (areaString.includes("narela") || areaString.includes("m.l. nagar") || areaString.includes("ml nagar") || areaString.includes("eintkhedi")) {
      return {
        vidhan_sabha: "Narela",
        vidhan_sabhas: ["Narela", "Bhopal Uttar", "Govindpura", "Bhopal Madhya", "Bhopal Dakshin-Pashchim", "Huzur"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("govindpura") || areaString.includes("piplani") || areaString.includes("industrial area") || areaString.includes("bhel")) {
      return {
        vidhan_sabha: "Govindpura",
        vidhan_sabhas: ["Govindpura", "Narela", "Bhopal Uttar", "Bhopal Madhya", "Bhopal Dakshin-Pashchim", "Huzur"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("huzur") || areaString.includes("bairagarh") || areaString.includes("lalghati") || areaString.includes("gandhi nagar")) {
      return {
        vidhan_sabha: "Huzur",
        vidhan_sabhas: ["Huzur", "Bhopal Dakshin-Pashchim", "Bhopal Uttar", "Bhopal Madhya", "Govindpura", "Narela"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("dakshin") || areaString.includes("pashchim") || areaString.includes("tt nagar") || areaString.includes("new market") || areaString.includes("arera")) {
      return {
        vidhan_sabha: "Bhopal Dakshin-Pashchim",
        vidhan_sabhas: ["Bhopal Dakshin-Pashchim", "Bhopal Madhya", "Huzur", "Bhopal Uttar", "Govindpura", "Narela"],
        sansad_kshetra: "Bhopal"
      };
    }
    if (areaString.includes("madhya") || areaString.includes("jehangirabad") || areaString.includes("chola") || areaString.includes("aishbagh")) {
      return {
        vidhan_sabha: "Bhopal Madhya",
        vidhan_sabhas: ["Bhopal Madhya", "Bhopal Uttar", "Bhopal Dakshin-Pashchim", "Narela", "Govindpura", "Huzur"],
        sansad_kshetra: "Bhopal"
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: ["Bhopal Uttar", "Bhopal Madhya", "Bhopal Dakshin-Pashchim", "Narela", "Govindpura", "Huzur"],
      sansad_kshetra: "Bhopal"
    };
  }

  if (district.toLowerCase() === "indore") {
    if (areaString.includes("mhow")) {
      return {
        vidhan_sabha: "Mhow",
        vidhan_sabhas: ["Mhow", "Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5"],
        sansad_kshetra: "Dhar"
      };
    }
    if (areaString.includes("rau") || areaString.includes("rajendra nagar")) {
      return {
        vidhan_sabha: "Rau",
        vidhan_sabhas: ["Rau", "Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Mhow"],
        sansad_kshetra: "Indore"
      };
    }
    return {
      vidhan_sabha: "",
      vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau", "Mhow"],
      sansad_kshetra: "Indore"
    };
  }

  // 4. Fallback to generic district matching against the small built-in list
  const matches = MP_CONSTITUENCIES_MOCK.filter(c => c.district.toLowerCase() === district.toLowerCase());
  const sansad_kshetra = matches.length > 0 ? matches[0].sansad_kshetra : (district + " Lok Sabha constituency");
  const vidhan_sabhas = matches.map(c => c.vidhan_sabha);

  return {
    vidhan_sabha: vidhan_sabhas.length === 1 ? vidhan_sabhas[0] : "",
    vidhan_sabhas: vidhan_sabhas.length > 0 ? vidhan_sabhas : [district + " Assembly Constituency"],
    sansad_kshetra
  };
}

app.get("/api/locations/pincode", async (req, res) => {
  const pincode = req.query.p as string;
  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ success: false, error: "Invalid pincode" });
  }

  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001ba8300370e6842e1770b301544186f0f";
  const resourceId = process.env.DATAGOV_RESOURCE_ID_PINCODE || "5c2f62fe-5afa-4119-a499-fec9d604d5bd";

  if (apiKey) {
    try {
      // Query the official OGD Pincode Directory API
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&filters[pincode]=${pincode}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.records && Array.isArray(response.data.records) && response.data.records.length > 0) {
        const records = response.data.records;
        const first = records[0];
        
        // Extract all post offices/local areas for this pincode
        const areas = records.map((r: any) => r.officename);
        
        // Capitalize names properly
        const state = first.statename.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const district = first.district.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const city = first.divisionname ? first.divisionname.replace(" Division", "") : district;

        // Resolve constituencies accurately
        const resolution = resolveConstituency(pincode, district, areas, state);

        const liveData = {
          pincode,
          state,
          district,
          city,
          vidhan_sabha: resolution.vidhan_sabha,
          vidhan_sabhas: resolution.vidhan_sabhas,
          sansad_kshetra: resolution.sansad_kshetra,
          areas,
          latitude: first.latitude,
          longitude: first.longitude
        };

        return res.json({ success: true, data: liveData });
      }
    } catch (error: any) {
      console.error("OGD Pincode Directory API failed, trying fallback:", error.message);
    }
  }

  try {
    const response = await axios.get("https://api.postalpincode.in/pincode/" + pincode, { timeout: 4000 });
    const data = response.data;
    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
      const office = data[0].PostOffice[0];
      const areas = data[0].PostOffice.map((po: any) => po.Name);
      
      const district = office.District;
      const resolution = resolveConstituency(pincode, district, areas, office.State);

      const liveData = {
        pincode,
        state: office.State,
        district,
        city: office.Block && office.Block !== "NA" ? office.Block : district,
        vidhan_sabha: resolution.vidhan_sabha,
        vidhan_sabhas: resolution.vidhan_sabhas,
        sansad_kshetra: resolution.sansad_kshetra,
        areas: areas
      };
      return res.json({ success: true, data: liveData });
    }
  } catch (error) {
    console.error("Live postal API query failed, falling back to mock:", error.message);
  }
  
  // Fallback mock
  const mockData = {
    pincode,
    state: "Madhya Pradesh",
    district: "Indore",
    city: "Indore",
    vidhan_sabha: "Indore-1",
    vidhan_sabhas: ["Indore-1", "Indore-2", "Indore-3", "Indore-4", "Indore-5", "Rau", "Mhow"],
    sansad_kshetra: "Indore",
    areas: ["Vijay Nagar BO", "Palasia BO", "Bhawarkuan BO", "Rajwada SO"]
  };
  
  res.json({ success: true, data: mockData });
});

app.get("/api/locations/helplines", async (req, res) => {
  const { pincode } = req.query;
  if (!pincode) {
    return res.status(400).json({ error: "Pincode is required" });
  }

  const mpHelplines = [
    {
      name: "One Stop Centre (OSC) - Sehore",
      address: "District Hospital Campus, Sehore, Madhya Pradesh - 466001",
      phone: "07562224455",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "One Stop Centre (OSC) - Bhopal",
      address: "J.P. Hospital Campus, 1250 Hospital Rd, Tulsi Nagar, Bhopal, MP - 462003",
      phone: "07552550181",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "One Stop Centre (OSC) - Indore",
      address: "M.Y. Hospital Campus, Indore, Madhya Pradesh - 452001",
      phone: "07312520181",
      type: "One Stop Centre",
      helpline: "181 / 1091"
    },
    {
      name: "Mahila Thana (Women Police Station) - Bhopal",
      address: "Jahangirabad, Bhopal, Madhya Pradesh - 462008",
      phone: "07552443801",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "Mahila Thana (Women Police Station) - Sehore",
      address: "Kotwali Campus, Sehore, Madhya Pradesh - 466001",
      phone: "07562227091",
      type: "Police Helpline",
      helpline: "1091 / 100"
    },
    {
      name: "District Police Headquarters Helpdesk - Sehore",
      address: "SP Office, Sehore, Madhya Pradesh - 466001",
      phone: "07562227202",
      type: "Police Helpline",
      helpline: "100 / 112"
    }
  ];

  const nationalHelplines = [
    {
      name: "National Commission for Women Helpline",
      address: "New Delhi, India (24/7 National Coverage)",
      phone: "14490",
      type: "National Helpline",
      helpline: "14490"
    },
    {
      name: "Student & Women Helpline (181)",
      address: "State Capital Helpdesk, India",
      phone: "181",
      type: "State Helpline",
      helpline: "181"
    },
    {
      name: "All India Women Helpline (1091)",
      address: "National Coverage",
      phone: "1091",
      type: "National Helpline",
      helpline: "1091"
    },
    {
      name: "Emergency Response Support System (112)",
      address: "National Unified Emergency Response",
      phone: "112",
      type: "Unified Helpline",
      helpline: "112"
    }
  ];

  const pinStr = String(pincode);
  let resolvedLocal = [];
  if (pinStr.startsWith("466")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Sehore"));
  } else if (pinStr.startsWith("462") || pinStr.startsWith("461")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Bhopal") || h.name.includes("Sehore"));
  } else if (pinStr.startsWith("452") || pinStr.startsWith("451") || pinStr.startsWith("450")) {
    resolvedLocal = mpHelplines.filter(h => h.name.includes("Indore"));
  } else {
    if (pinStr.startsWith("45") || pinStr.startsWith("46") || pinStr.startsWith("47") || pinStr.startsWith("48")) {
      resolvedLocal = mpHelplines;
    }
  }

  res.json({
    success: true,
    data: [...resolvedLocal, ...nationalHelplines]
  });
});

app.get("/api/locations/street_ratings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM street_ratings ORDER BY \"createdAt\" DESC");
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/locations/street_ratings", async (req, res) => {
  try {
    const { location_name, latitude, longitude, rating, notes } = req.body;
    await pool.query(
      `INSERT INTO street_ratings (location_name, latitude, longitude, rating, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [location_name, latitude || 0, longitude || 0, rating || 3, notes || ""]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/women/complaints", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const result = await pool.query(
      `SELECT * FROM women_complaints WHERE user_id = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/women/complaints", async (req, res) => {
  try {
    const { user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous } = req.body;
    
    // Save to PostgreSQL table
    await pool.query(
      `INSERT INTO women_complaints (user_id, complainant_name, complainant_phone, complaint_type, incident_date, location, description, suspect_details, is_anonymous) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        user_id || "guest",
        complainant_name || "",
        complainant_phone || "",
        complaint_type,
        incident_date,
        location,
        description,
        suspect_details || "",
        is_anonymous || false
      ]
    );

    // Save duplicate to service_submissions_v2 for Admin portal unified views
    const dataString = JSON.stringify({
      complaintType: complaint_type,
      incidentDate: incident_date,
      location,
      description,
      suspectDetails: suspect_details,
      isAnonymous: is_anonymous
    });

    await pool.query(
      `INSERT INTO service_submissions_v2 ("userId", "citizenName", "citizenPhone", "serviceName", "submissionData", status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user_id || "guest",
        is_anonymous ? "Anonymous" : (complainant_name || "Citizen"),
        is_anonymous ? "" : (complainant_phone || ""),
        "Women Support - Incident Complaint",
        dataString,
        "pending"
      ]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/volunteers/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(`UPDATE volunteers SET approval_status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true, message: "Volunteer status updated" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/volunteers/:id/allocate", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { allocation } = req.body;
    await pool.query(`UPDATE volunteers SET constituency_allocation = $1 WHERE id = $2`, [allocation, id]);
    res.json({ success: true, message: "Volunteer allocated" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/volunteers/report", authenticateToken, async (req, res) => {
  try {
    const { volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng } = req.body;
    await pool.query(
      `INSERT INTO volunteer_reports (id, volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng]
    );
    res.json({ success: true, message: "Report submitted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
       await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
    }
    res.json({ success: true, message: "Logged out" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    let result = await pool.query(`SELECT id, name, role, email, phone, points, badges, avatar FROM users WHERE id = $1`, [userId]);
    
    if (result.rows.length === 0) {
      // Check volunteers table
      const volResult = await pool.query(`SELECT id, full_name as name, email, mobile as phone, avatar FROM volunteers WHERE id = $1`, [userId]);
      if (volResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      
      const vol = volResult.rows[0];
      return res.json({ 
        success: true, 
        user: {
          ...vol,
          role: "volunteer",
          isVolunteer: true,
          volunteerData: vol,
          points: 0,
          badges: []
        }
      });
    }
    
    const user = result.rows[0];
    
    // Check if user is also a volunteer (by phone/email)
    if (user.phone || user.email) {
      const volResult = await pool.query(`SELECT * FROM volunteers WHERE mobile = $1 OR email = $2`, [user.phone, user.email]);
      if (volResult.rows.length > 0) {
        user.volunteerData = volResult.rows[0];
        user.isVolunteer = true;
      }
    }
    
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/profile/update", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;
    
    // Update users table
    await pool.query(
      `UPDATE users SET name = $1, avatar = $2 WHERE id = $3`,
      [name, avatar, userId]
    );
    
    // Update volunteers table
    await pool.query(
      `UPDATE volunteers SET full_name = $1, avatar = $2 WHERE id = $3`,
      [name, avatar, userId]
    );
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});


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

app.get("/api/auth/check-username", async (req, res) => {
  try {
    const usernameRaw = (req.query.username as string || "").trim();
    const username = usernameRaw.toLowerCase();

    if (!username) {
      return res.status(400).json({ available: false, error: "Username is required" });
    }
    if (!USERNAME_REGEX.test(username)) {
      return res.status(200).json({ available: false, error: "Use 3-20 letters, numbers, . or _, starting with a letter" });
    }
    if (RESERVED_USERNAMES.has(username)) {
      return res.json({ available: false, error: "This username is reserved" });
    }

    const [volResult, userResult] = await Promise.all([
      pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [username]),
      pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [username]),
    ]);

    const available = volResult.rows.length === 0 && userResult.rows.length === 0;
    res.json({ available });
  } catch (err: any) {
    console.error("Check Username Error:", err);
    res.status(500).json({ available: false, error: "Could not check username right now" });
  }
});

app.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;

    if (!data.full_name || !data.full_name.trim()) {
      return res.status(400).json({ error: "Full name is required." });
    }
    if (!data.mobile || !data.mobile.trim()) {
      return res.status(400).json({ error: "Mobile number is required." });
    }
    if (!data.password || data.password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const usernameRaw = (data.username || "").trim().toLowerCase();
    if (!usernameRaw) {
      return res.status(400).json({ error: "Please choose a username." });
    }
    if (!USERNAME_REGEX.test(usernameRaw)) {
      return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, . or _), starting with a letter." });
    }
    if (RESERVED_USERNAMES.has(usernameRaw)) {
      return res.status(400).json({ error: "This username is reserved. Please choose another." });
    }

    const [volCheck, userCheck] = await Promise.all([
      pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [usernameRaw]),
      pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [usernameRaw]),
    ]);
    if (volCheck.rows.length > 0 || userCheck.rows.length > 0) {
      return res.status(409).json({ error: "This username is already in use. Please choose another." });
    }

    const id = crypto.randomUUID();
    const regNumber = "RPF-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const safeDob = data.dob && data.dob.trim() ? data.dob : null;

    await pool.query(`
      INSERT INTO volunteers (
        id, username, registration_number, full_name, father_husband_name, mother_name, approval_status,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        national_id_1, national_id_2, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no, password_hash
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
      )
    `, [
      id, usernameRaw, regNumber, data.full_name, data.father_husband_name, data.mother_name,
      'pending', safeDob, data.mobile, data.email || null, JSON.stringify(data.education || []), data.blood_group, JSON.stringify(data.skills || []),
      data.reason_for_joining, data.availability, data.national_id_1 || null, data.national_id_2 || null,
      data.country, data.state, data.city, data.address, data.pincode, data.area_locality || null,
      data.sansad_kshetra, data.vidhan_sabha, data.ward_no, passwordHash
    ]);

    res.json({ success: true, registration_number: regNumber, username: usernameRaw });
  } catch (err: any) {
    console.error("Register Error:", err);

    if (err.code === '23505') {
      const constraint = (err.constraint || '').toLowerCase();
      if (constraint.includes('username')) {
        return res.status(409).json({ error: "This username is already in use. Please choose another." });
      }
      if (constraint.includes('mobile')) {
        return res.status(409).json({ error: "This mobile number is already registered." });
      }
      if (constraint.includes('email')) {
        return res.status(409).json({ error: "This email is already registered." });
      }
      return res.status(409).json({ error: "Some of your details are already registered." });
    }
    if (err.code === '22007' || err.code === '22008') {
      return res.status(400).json({ error: "Date of birth is invalid. Please re-select it." });
    }

    res.status(500).json({ error: err.message || "Registration failed. Please try again." });
  }
});

// SECURITY: This endpoint used to accept a bare {username, password} with no
// verification whatsoever, allowing anyone who knew a username to take over
// that account. It now requires a valid, unexpired password-reset token
// (issued only via /api/auth/forgot-password and emailed to the account's
// registered email address) before any password is changed.
app.post("/api/auth/set-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Reset token and new password are required" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const tokenRes = await pool.query(
      `SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()`,
      [token]
    );
    if (tokenRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    const userId = tokenRes.rows[0].userId;

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query('UPDATE volunteers SET password_hash = $1 WHERE id = $2 RETURNING id', [hash, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Consume the token so it cannot be replayed
    await pool.query(`DELETE FROM password_reset_tokens WHERE token = $1`, [token]);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
    const result = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.email) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await pool.query(
          `INSERT INTO password_reset_tokens ("userId", token, expires_at) VALUES ($1, $2, $3)`,
          [user.id, token, expiresAt.toISOString()]
        );
        await sendEmail({
          to: user.email,
          subject: "Password Reset Request",
          text: `Click here to reset: https://${rpID}/reset-password?token=${token}`,
        });
      }
    }
    res.json({ success: true }); // Always return success for security
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// Admin HQ Credentials API
app.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const body = req.body || {};
    const { username, newPassword } = body;
    if (!username || !newPassword) return res.status(400).json({ error: "Missing username or password" });
    
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin'`,
      [username, hash]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/reset-ticket", async (req, res) => {
  res.json({ success: true, message: "Admin reset ticket created" });
});


// ---------------- CERTIFICATE ENGINE ----------------

app.get("/api/admin/hq/certificates/signatures/:service_id", async (req, res) => {
  try {
    const { service_id } = req.params;
    const result = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [service_id]);
    if (result.rows.length === 0) {
      return res.json({ success: true, data: { service_id, signatory_1_name: 'Rohit Pandit', signatory_1_designation: 'Founder', signatory_2_name: '', signatory_2_designation: '' } });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/admin/hq/certificates/signatures", async (req, res) => {
  try {
    const { service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation } = req.body;
    await pool.query(`
      INSERT INTO service_signatures (service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (service_id) DO UPDATE SET
      signatory_1_name = EXCLUDED.signatory_1_name,
      signatory_1_designation = EXCLUDED.signatory_1_designation,
      signatory_2_name = EXCLUDED.signatory_2_name,
      signatory_2_designation = EXCLUDED.signatory_2_designation
    `, [service_id, signatory_1_name, signatory_1_designation, signatory_2_name, signatory_2_designation]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/admin/hq/certificates/issue", async (req, res) => {
  try {
    const { volunteer_id, service_id } = req.body;
    const certId = "RP-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    
    // Validate volunteer
    const volRes = await pool.query(`SELECT id FROM volunteers WHERE id = $1 OR username = $1 OR registration_number = $1`, [volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const realVolId = volRes.rows[0].id;

    // Check if already issued
    const existing = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 AND service_id = $2`, [realVolId, service_id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Certificate already issued for this service." });

    const result = await pool.query(
      `INSERT INTO certificates (certificate_id, volunteer_id, service_id) VALUES ($1, $2, $3) RETURNING *`,
      [certId, realVolId, service_id]
    );
    res.json({ success: true, certificate: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/volunteers/me/certificates", async (req, res) => {
  try {
    const { volunteer_id } = req.query;
    const result = await pool.query(`SELECT * FROM certificates WHERE volunteer_id = $1 ORDER BY issue_date DESC`, [volunteer_id]);
    res.json({ success: true, certificates: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';


app.get("/api/certificates/verify/:certificate_id", async (req, res) => {
  try {
    const certId = req.params.certificate_id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found or invalid." });
    
    const cert = certRes.rows[0];
    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];

    res.json({
      success: true,
      data: {
        certificate_id: cert.certificate_id,
        volunteer_name: vol.full_name,
        registration_number: vol.registration_number,
        service_name: cert.service_id.replace(/-/g, ' ').toUpperCase(),
        issue_date: cert.issue_date,
        location: `${vol.city}, ${vol.state}`
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/certificates/download/:id", async (req, res) => {
  try {
    const certId = req.params.id;
    const certRes = await pool.query(`SELECT * FROM certificates WHERE id = $1 OR certificate_id = $1`, [certId]);
    if (certRes.rows.length === 0) return res.status(404).json({ error: "Certificate not found" });
    const cert = certRes.rows[0];

    const volRes = await pool.query(`SELECT full_name, registration_number, city, state FROM volunteers WHERE id = $1`, [cert.volunteer_id]);
    if (volRes.rows.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const vol = volRes.rows[0];

    let sigs = { signatory_1_name: 'Rohit Pandit', signatory_1_designation: 'Founder', signatory_2_name: '', signatory_2_designation: '' };
    const sigRes = await pool.query(`SELECT * FROM service_signatures WHERE service_id = $1`, [cert.service_id]);
    if (sigRes.rows.length > 0) sigs = sigRes.rows[0];

    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Draw Border
    page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: rgb(0.1, 0.3, 0.6), borderWidth: 4 });
    page.drawRectangle({ x: 25, y: 25, width: width - 50, height: height - 50, borderColor: rgb(0.8, 0.6, 0.2), borderWidth: 2 });


    // Draw Content
    const logoPath = path.join(process.cwd(), 'public', 'assets', 'logo.png');
    if (require('fs').existsSync(logoPath)) {
      const logoImageBytes = require('fs').readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoImageBytes);
      const logoDims = logoImage.scale(0.15); // Scale down logo
      page.drawImage(logoImage, {
        x: width / 2 - logoDims.width / 2,
        y: height - logoDims.height - 35,
        width: logoDims.width,
        height: logoDims.height,
      });
    }

    page.drawText('RP FOUNDATION', { x: width / 2 - 120, y: height - 120, size: 30, font, color: rgb(0.1, 0.2, 0.5) });
    page.drawText('CERTIFICATE OF APPRECIATION', { x: width / 2 - 200, y: height - 160, size: 24, font, color: rgb(0.8, 0.6, 0.2) });

    page.drawText('CERTIFICATE OF APPRECIATION', { x: width / 2 - 200, y: height - 160, size: 24, font, color: rgb(0.8, 0.6, 0.2) });
    
    page.drawText(`Certificate ID: ${cert.certificate_id}`, { x: 50, y: height - 80, size: 10, font: fontNormal });
    page.drawText(`Date: ${new Date(cert.issue_date).toLocaleDateString()}`, { x: width - 150, y: height - 80, size: 10, font: fontNormal });

    page.drawText('This is proudly presented to', { x: width / 2 - 100, y: height - 230, size: 14, font: fontItalic });
    
    // Name
    const nameWidth = font.widthOfTextAtSize(vol.full_name, 36);
    page.drawText(vol.full_name, { x: (width - nameWidth) / 2, y: height - 320, size: 36, font, color: rgb(0.1, 0.1, 0.1) });
    
    page.drawText(`Reg No: ${vol.registration_number} | ${vol.city}, ${vol.state}`, { x: width / 2 - 120, y: height - 320, size: 12, font: fontNormal });

    page.drawText(`In recognition of their outstanding contribution and dedication to the`, { x: width / 2 - 200, y: height - 400, size: 14, font: fontNormal });
    
    const serviceName = cert.service_id.replace(/-/g, ' ').toUpperCase() + " SERVICE";
    const svcWidth = font.widthOfTextAtSize(serviceName, 18);
    page.drawText(serviceName, { x: (width - svcWidth) / 2, y: height - 400, size: 18, font, color: rgb(0.1, 0.3, 0.6) });

    // Signatures
    page.drawLine({ start: { x: 100, y: 120 }, end: { x: 300, y: 120 }, thickness: 1, color: rgb(0,0,0) });
    page.drawText(sigs.signatory_1_name, { x: 110, y: 100, size: 12, font });
    page.drawText(sigs.signatory_1_designation, { x: 110, y: 85, size: 10, font: fontItalic, color: rgb(0.3, 0.3, 0.3) });

    if (sigs.signatory_2_name) {
      page.drawLine({ start: { x: width - 300, y: 120 }, end: { x: width - 100, y: 120 }, thickness: 1, color: rgb(0,0,0) });
      page.drawText(sigs.signatory_2_name, { x: width - 290, y: 100, size: 12, font });
      page.drawText(sigs.signatory_2_designation, { x: width - 290, y: 85, size: 10, font: fontItalic, color: rgb(0.3, 0.3, 0.3) });
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificate_${cert.certificate_id}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------- END CERTIFICATE ENGINE ----------------

// WEBAUTHN ENDPOINTS
app.get('/api/auth/webauthn/register-options', async (req, res) => {
  const userId = req.query.userId as string;
  const userResult = await pool.query(`SELECT username, full_name FROM volunteers WHERE id = $1`, [userId]);
  if (userResult.rows.length === 0) return res.status(404).json({error: "User not found"});
  const user = userResult.rows[0];
  
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new Uint8Array(Buffer.from(userId)),
    userName: user.username,
    userDisplayName: user.full_name,
    attestationType: 'none',
    authenticatorSelection: { residentKey: 'required', userVerification: 'preferred' }
  });
  webAuthnChallengeStore.set(userId, options.challenge);
  res.json(options);
});

app.post('/api/auth/webauthn/register-verify', async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({error: "Challenge expired"});
  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: originUrl,
      expectedRPID: rpID,
    });
    if (verification.verified && verification.registrationInfo) {
      const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
      const base64CredID = Buffer.from(credentialID).toString('base64');
      const base64PubKey = Buffer.from(credentialPublicKey).toString('base64');
      await pool.query(
        `INSERT INTO passkeys ("credentialID", "publicKey", counter, "userId") VALUES ($1, $2, $3, $4)`,
        [base64CredID, base64PubKey, counter, userId]
      );
      webAuthnChallengeStore.delete(userId);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Verification failed" });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/webauthn/login-options', async (req, res) => {
  const { identifier } = req.body;
  const userResult = await pool.query(`SELECT id FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`, [identifier]);
  if (userResult.rows.length === 0) return res.status(404).json({error: "User not found"});
  const userId = userResult.rows[0].id;
  
  const passkeysResult = await pool.query(`SELECT "credentialID" FROM passkeys WHERE "userId" = $1`, [userId]);
  const allowCredentials = passkeysResult.rows.map((row: any) => ({
    id: new Uint8Array(Buffer.from(row.credentialID, 'base64')),
    type: 'public-key' as const,
    transports: ['internal', 'hybrid'] as AuthenticatorTransportFuture[],
  }));
  
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
  });
  webAuthnChallengeStore.set(userId, options.challenge);
  res.json({ options, userId });
});

app.post('/api/auth/webauthn/login-verify', async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({error: "Challenge expired"});
  try {
    const passkeyResult = await pool.query(`SELECT * FROM passkeys WHERE "credentialID" = $1 AND "userId" = $2`, [response.id, userId]);
    if (passkeyResult.rows.length === 0) return res.status(404).json({error: "Passkey not found"});
    const passkey = passkeyResult.rows[0];
    
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: originUrl,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(Buffer.from(passkey.credentialID, 'base64')),
        credentialPublicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')),
        counter: Number(passkey.counter),
      },
    });
    if (verification.verified) {
      await pool.query(`UPDATE passkeys SET counter = $1 WHERE "credentialID" = $2`, [verification.authenticationInfo.newCounter, passkey.credentialID]);
      webAuthnChallengeStore.delete(userId);
      const userResult = await pool.query(`SELECT * FROM volunteers WHERE id = $1`, [userId]);
      const user = userResult.rows[0];
      res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
    } else {
      res.status(400).json({ error: "Verification failed" });
    }
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;


// PostgreSQL Pool Connection
const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";
const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0], env: process.env.DATABASE_URL ? "URL Set" : "URL Missing", dbUrl: dbUrl.substring(0, 15) + "..." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message, stack: error.stack, env: process.env.DATABASE_URL ? "URL Set" : "URL Missing", dbUrl: dbUrl.substring(0, 15) + "..." });
  }
});

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY or GOOGLE_SEARCH_API_KEY environment variable is not set. AI Features will use mock mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Unified search helper using a 4-Tier Multi-Engine Search Cluster
async function queryExternalSearch(searchQuery: string): Promise<{ title: string, link: string, url: string, snippet: string, displayLink: string }[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const targetDomains = [
    "gov.in",
    "nic.in",
    "mp.gov.in",
    "bhaskar.com",
    "jagran.com",
    "ndtv.com",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "wikipedia.org"
  ];

  const browserHeaders = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Upgrade-Insecure-Requests": "1"
  };

  
// =============================================================================
// MISSING SUPABASE MIGRATION ENDPOINTS
// =============================================================================

// --- community_posts ---
app.get("/api/community_posts", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM community_posts ORDER BY "createdAt" DESC');
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/community_posts", async (req, res) => {
  try {
    const { authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO community_posts (id, "authorName", "authorPhone", "authorRole", "textEn", "textHi", segment, location, "imageUrl", likes, "likedByMe", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, authorName, authorPhone, authorRole, textEn, textHi, segment, location, imageUrl, likes, likedByMe, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/community_posts/:id", async (req, res) => {
  try {
    const { likes, likedByMe } = req.body;
    await pool.query('UPDATE community_posts SET likes = $1, "likedByMe" = $2 WHERE id = $3', [likes, likedByMe, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- success_stories ---
app.get("/api/success-stories", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM success_stories ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/success-stories", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: "Title and Content are required" });
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO success_stories (id, title, content, "imageUrl", "createdAt") VALUES ($1, $2, $3, $4, NOW())`,
      [id, title, content, imageUrl || null]
    );
    res.json({ success: true, message: "Success story created successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/success-stories/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM success_stories WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Success story deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- blogs ---
// Public endpoint - get approved blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs WHERE approved = true ORDER BY "publishedAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint - get all blogs (approved & unapproved)
app.get("/api/blogs/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY "createdAt" DESC');
    res.json({ success: true, data: result.rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User endpoint - post new blog
app.post("/api/blogs", authenticateToken, async (req: any, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: "Title and Content are required" });
    const id = crypto.randomUUID();
    
    // Author name & ID from request token user
    const authorName = req.user.displayName || req.user.name || "Anonymous Volunteer";
    const authorId = req.user.id;

    await pool.query(
      `INSERT INTO blogs (id, title, content, "authorName", "authorId", approved, "createdAt") VALUES ($1, $2, $3, $4, $5, false, NOW())`,
      [id, title, content, authorName, authorId]
    );
    res.json({ success: true, message: "Blog post submitted for admin approval" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint - approve blog
app.put("/api/blogs/:id/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE blogs SET approved = true, "publishedAt" = NOW() WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Blog approved successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint - delete/reject blog
app.delete("/api/blogs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: "Blog deleted/rejected successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Social Live Link Previews with Exabase ---
interface SocialCacheEntry {
  data: any;
  timestamp: number;
}

const socialPreviewsCache: { [url: string]: SocialCacheEntry } = {};
const SOCIAL_CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

app.get("/api/social-previews", async (req, res) => {
  try {
    const apiKey = process.env.EXABASE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, error: "Exabase API key not configured on server" });
    }

    let targetUrls = [
      "https://www.instagram.com/rpfoundationofficial/",
      "https://www.instagram.com/therohitpandit/",
      "https://www.facebook.com/rpfofficial",
      "https://x.com/rpfoundation15",
      "https://www.youtube.com/@rpfoundationofficial"
    ];

    // Retrieve live social media links configured in database settings
    try {
      const cmsDataRes = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
      if (cmsDataRes.rows.length > 0 && cmsDataRes.rows[0].founderMessageEn) {
        const parsed = JSON.parse(cmsDataRes.rows[0].founderMessageEn);
        if (parsed.socialDirectory && Array.isArray(parsed.socialDirectory) && parsed.socialDirectory.length > 0) {
          targetUrls = parsed.socialDirectory.map((item: any) => item.url).filter(Boolean);
        }
      }
    } catch (e: any) {
      console.warn("[EXABASE] Failed to dynamically load social links from DB settings, using defaults:", e.message);
    }

    const results = [];

    for (const url of targetUrls) {
      const now = Date.now();
      const cached = socialPreviewsCache[url];

      if (cached && (now - cached.timestamp < SOCIAL_CACHE_TTL)) {
        results.push(cached.data);
        continue;
      }

      try {
        console.log(`[EXABASE] Fetching live preview for: ${url}`);
        const response = await axios.get(
          `https://api.exabase.io/v2/link?url=${encodeURIComponent(url)}`,
          {
            headers: {
              "X-Api-Key": apiKey
            },
            timeout: 8000
          }
        );

        const previewData = response.data;
        const imgObj = previewData.image;
        const imageUrl = (imgObj && typeof imgObj === "object" ? imgObj.url : imgObj) || previewData.imageUrl || previewData.ImageUrl || "";
        
        const normalized = {
          url,
          title: previewData.title || previewData.Title || url,
          description: previewData.description || previewData.Description || "",
          image: imageUrl,
          siteName: previewData.siteName || previewData.SiteName || ""
        };

        socialPreviewsCache[url] = {
          data: normalized,
          timestamp: now
        };

        results.push(normalized);
      } catch (err: any) {
        console.warn(`[EXABASE WARNING] Failed to fetch live preview for ${url}:`, err.message);
        if (cached) {
          results.push(cached.data);
        } else {
          results.push({
            url,
            title: url.includes("instagram") ? (url.includes("therohitpandit") ? "Rohit Pandit Instagram" : "RP Foundation Instagram") : 
                   url.includes("facebook") ? "RP Foundation Facebook" :
                   url.includes("youtube") ? "RP Foundation YouTube" : "RP Foundation Twitter/X",
            description: "Visit our official social media page for live updates, campaigns and community achievements.",
            image: "",
            siteName: url.includes("instagram") ? "Instagram" : 
                      url.includes("facebook") ? "Facebook" :
                      url.includes("youtube") ? "YouTube" : "Twitter/X"
          });
        }
      }
    }

    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- support_requests (FoodSupport) ---
app.post("/api/support_requests", async (req, res) => {
  try {
    const { citizenName, citizenPhone, requestType, location, description, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO support_requests (id, "citizenName", "citizenPhone", "requestType", location, description, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, citizenName, citizenPhone, requestType, location, description, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- sos_alerts (WomenSafety) ---
app.post("/api/sos_alerts", async (req, res) => {
  try {
    const { citizenName, citizenPhone, location, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO sos_alerts (id, "citizenName", "citizenPhone", location, status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, citizenName, citizenPhone, location, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- scholarships ---
app.post("/api/scholarships", async (req, res) => {
  try {
    const { studentName, phone, educationLevel, status, createdAt } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO scholarships (id, "studentName", phone, "educationLevel", status, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, studentName, phone, educationLevel, status, createdAt || new Date()]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
  // TIER 1: Tavily AI (Primary)
  // ═══════════════════════════════════════════════════════════════
  if (tavilyKey) {
    try {
      console.log(`[Search/Tier-1/Tavily] Querying: "${searchQuery}"`);
      const response = await axios.post(
        "https://api.tavily.com/search",
        {
          api_key: tavilyKey,
          query: searchQuery,
          include_domains: targetDomains,
          max_results: 5
        },
        {
          timeout: 4000
        }
      );

      const items = response.data.results ?? [];
      if (items.length > 0) {
        return items.slice(0, 3).map((item: any) => {
          let host = "";
          try {
            host = new URL(item.url).hostname;
          } catch {
            host = "tavily.com";
          }
          return {
            title: (item.title ?? "").slice(0, 120),
            link: item.url ?? "",
            url: item.url ?? "",
            snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
            displayLink: host
          };
        });
      }
    } catch (err: any) {
      console.warn(`[Search/Tier-1/Tavily] Failed: ${err.message}. Cascading to Tier 2...`);
    }
  } else {
    console.warn(`[Search/Tier-1/Tavily] TAVILY_API_KEY is not set. Cascading to Tier 2...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: DuckDuckGo HTML Scraper
  // ═══════════════════════════════════════════════════════════════
  try {
    const constrainedQuery = `${searchQuery} site:gov.in`;
    console.log(`[Search/Tier-2/DDG-Scraper] Querying: "${constrainedQuery}"`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(constrainedQuery)}`;
    
    const response = await axios.get(ddgUrl, {
      headers: browserHeaders,
      timeout: 4500
    });

    const $ = cheerio.load(response.data);
    const results: { title: string, link: string, url: string, snippet: string, displayLink: string }[] = [];

    $(".result").each((_, el) => {
      if (results.length >= 3) return;

      const title = $(el).find(".result__title").text().trim();
      const rawLink = $(el).find(".result__url").attr("href");
      const snippet = $(el).find(".result__snippet").text().trim();

      if (title && rawLink) {
        let link = rawLink;
        if (rawLink.startsWith("//")) {
          link = "https:" + rawLink;
        } else if (rawLink.startsWith("/l/?kh=")) {
          try {
            const urlObj = new URL("https://html.duckduckgo.com" + rawLink);
            const uddg = urlObj.searchParams.get("uddg");
            if (uddg) {
              link = decodeURIComponent(uddg);
            }
          } catch {
            // fallback
          }
        }

        let host = "duckduckgo.com";
        try {
          host = new URL(link).hostname;
        } catch {
          // fallback
        }

        results.push({
          title: title.slice(0, 120),
          link,
          url: link,
          snippet: snippet.replace(/\n/g, " ").slice(0, 260),
          displayLink: host
        });
      }
    });

    if (results.length > 0) {
      return results;
    }
    console.warn(`[Search/Tier-2/DDG-Scraper] No results found or blocked. Cascading to Tier 3...`);
  } catch (err: any) {
    console.warn(`[Search/Tier-2/DDG-Scraper] Failed: ${err.message}. Cascading to Tier 3...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: SearXNG Public Instance Cluster
  // ═══════════════════════════════════════════════════════════════
  try {
    console.log(`[Search/Tier-3/SearXNG] Dynamic instance lookup...`);
    const spaceRes = await axios.get("https://searx.space/data/instances.json", {
      timeout: 3000
    });
    const instances = spaceRes.data?.instances || {};
    const healthyUrls: string[] = [];
    for (const [domain, info] of Object.entries(instances)) {
      const details = info as any;
      if (details.http?.status_code === 200 && details.uptime?.uptimeDay > 95) {
        const url = domain.startsWith("http") ? domain : `https://${domain}`;
        healthyUrls.push(url.endsWith("/") ? url : url + "/");
      }
    }

    if (healthyUrls.length > 0) {
      // Try the top 3 healthy SearXNG instances in order
      for (const instanceUrl of healthyUrls.slice(0, 3)) {
        const searchUrl = `${instanceUrl}search`;
        try {
          console.log(`[Search/Tier-3/SearXNG] Trying instance: ${searchUrl}`);
          const res = await axios.get(searchUrl, {
            params: {
              q: `${searchQuery} site:gov.in`,
              format: "json"
            },
            headers: browserHeaders,
            timeout: 3500
          });

          if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
            const items = res.data.results || [];
            if (items.length > 0) {
              return items.slice(0, 3).map((item: any) => {
                let host = "searxng.org";
                try {
                  host = new URL(item.url).hostname;
                } catch {
                  // fallback
                }
                return {
                  title: (item.title ?? "").slice(0, 120),
                  link: item.url ?? "",
                  url: item.url ?? "",
                  snippet: (item.content ?? "").replace(/\n/g, " ").slice(0, 260),
                  displayLink: host
                };
              });
            }
          }
        } catch (err: any) {
          console.warn(`[Search/Tier-3/SearXNG] Instance ${searchUrl} failed: ${err.message}`);
        }
      }
    }
    console.warn(`[Search/Tier-3/SearXNG] Cluster search failed or rate-limited. Cascading to Tier 4...`);
  } catch (err: any) {
    console.warn(`[Search/Tier-3/SearXNG] Dynamic discovery failed: ${err.message}. Cascading to Tier 4...`);
  }

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: Wikipedia & Open Knowledge API
  // ═══════════════════════════════════════════════════════════════
  try {
    console.log(`[Search/Tier-4/Wikipedia] Querying: "${searchQuery}"`);
    const wikiUrl = "https://en.wikipedia.org/w/api.php";
    const res = await axios.get(wikiUrl, {
      params: {
        action: "query",
        list: "search",
        srsearch: searchQuery,
        format: "json",
        utf8: 1,
        origin: "*"
      },
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      },
      timeout: 4000
    });

    const items = res.data?.query?.search || [];
    if (items.length > 0) {
      return items.slice(0, 3).map((item: any) => ({
        title: item.title,
        link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        snippet: (item.snippet ?? "").replace(/<span class="searchmatch">/g, "").replace(/<\/span>/g, "").slice(0, 260),
        displayLink: "en.wikipedia.org"
      }));
    }
  } catch (err: any) {
    console.error("[Search/Tier-4/Wikipedia] Failed completely:", err.message);
  }

  return [];
}

// Helper function for elegant server-side fallback when Gemini is unavailable
async function handleOfflineFallback(message: string, language: string, res: any) {
  const query = message.toLowerCase();
  
  // Auto-detect Hindi (either Devanagari or common Hinglish words)
  const hasDevanagari = /[\u0900-\u097F]/.test(message);
  const commonHinglish = ["kya", "hai", "kaise", "kab", "karo", "naam", "sewa", "chahiye", "chal", "raha", "hoga", "apna", "banao", "madad", "namaste", "namaskar", "aaj"];
  const isHinglish = commonHinglish.some(word => query.includes(word));
  const isHi = language === "hi" || hasDevanagari || isHinglish;

  // General Status Check ("aaj kya chal raha hai" / "today")
  if (query.includes("aaj") || query.includes("today") || query.includes("kya chal") || query.includes("status") || query.includes("whats up")) {
    const reply = isHi
      ? "नमस्ते! आज आरपी फाउंडेशन के तहत **पर्यावरण संरक्षण अभियान**, **निःशुल्क स्वास्थ्य जांच शिविर**, और **जन सेवा कार्ड पंजीकरण** की सेवाएं सक्रिय रूप से चल रही हैं। आप इनमें से किस सेवा के बारे में जानकारी प्राप्त करना चाहते हैं?"
      : "Hello! Today at the RP Foundation, our **Environment Protection Drive**, **Free Health Checkup Camps**, and **Jan Seva Card Registrations** are actively running. Which service would you like to know more about?";
    return res.json({ response: reply });
  }

  // RP Foundation Motive / Purpose Check
  if (query.includes("motive") || query.includes("purpose") || query.includes("dhyey") || query.includes("aim") || (query.includes("rp") && query.includes("kya")) || (query.includes("foundation") && query.includes("kya"))) {
    const reply = isHi
      ? "**आरपी फाउंडेशन (RP Foundation)** एक गैर-सरकारी संगठन (NGO) है जो समाज कल्याण, स्वास्थ्य सहायता, निःशुल्क शिक्षा सहयोग, सामुदायिक स्वयंसेवा और डिजिटल सशक्तिकरण (जैसे जन सेवा कार्ड) के लिए समर्पित है। हमारा ध्येय **'सेवा, समर्पण, संकल्प'** है।"
      : "**RP Foundation** is a non-governmental organization (NGO) dedicated to social welfare, healthcare assistance, educational support, community volunteering, and digital empowerment (such as the Jan Seva Card). Our motto is **'Service, Dedication, Resolve'**.";
    return res.json({ response: reply });
  }

  // Founder Check
  if (query.includes("founder") || query.includes("sanchalak") || query.includes("kisne banaya") || query.includes("founder kon") || query.includes("rohit")) {
    const reply = isHi
      ? "आरपी फाउंडेशन (RP Foundation) के संस्थापक **रोहित पंडित** (रोहित सर) हैं। उनके नेतृत्व में फाउंडेशन समाज के गरीब और पिछड़े वर्गों की सहायता के लिए कई कल्याणकारी योजनाएं चला रहा है।"
      : "RP Foundation was founded by **Rohit Pandit** (Rohit Sir). Under his guidance, the foundation carries out multiple community welfare programs, health camps, and free education drives.";
    return res.json({ response: reply });
  }

  // 1. Simple Keyword Matcher on server side
  if (query.includes("card") || query.includes("कार्ड") || query.includes("jan seva") || query.includes("जन सेवा")) {
    const reply = isHi 
      ? "**जन सेवा कार्ड** आरपी फाउंडेशन का आपका digital identity pass है।\n\n📋 **आवेदन के चरण:**\n1. Go to *Services → Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy.\n4. Once approved, download your QR-enabled digital pass."
      : "**Jan Seva Card** is your digital identity pass from RP Foundation.\n\n📋 **Steps to Apply:**\n1. Go to *Services → Jan Seva Card*.\n2. Fill Name, DOB and upload a valid ID document.\n3. Your Aadhaar is masked for privacy — never stored as plain text.\n4. Once approved, download your QR-enabled digital pass.";
    return res.json({ response: reply });
  }

  if (query.includes("blood") || query.includes("रक्त") || query.includes("ब्लड") || query.includes("donor")) {
    const reply = isHi
      ? "**रक्त नेटवर्क (Blood Network)** — आपातकालीन या स्वैच्छिक रक्तदान।\n\n🩸 **रक्त अनुरोध:** आवश्यक ग्रुप, अस्पताल का नाम और यूनिट दर्ज करें।\n🩸 **रक्तदाता पंजीकरण:** ब्लड टाइप और अंतिम दान तिथि सबमिट करें।"
      : "**Blood Network** — Emergency or voluntary blood donation.\n\n🩸 **Request Blood:** Post your required group, hospital name and units needed.\n🩸 **Register as Donor:** Submit blood type, last donation date.";
    return res.json({ response: reply });
  }

  if (query.includes("volunteer") || query.includes("स्वयंसेवक") || query.includes("seva")) {
    const reply = isHi
      ? "**RP Foundation में स्वयंसेवक बनें।**\n\n🤝 **कैसे जुड़ें:**\n1. *सेवाएं → स्वयंसेवक अवसर* पर जाएं।\n2. कौशल श्रेणी चुनें: शिक्षण, IT, क्षेत्र कार्य, स्वास्थ्य।\n3. सप्ताहांत अभियानों, भोजन शिविरों के लिए साइन अप करें।"
      : "**Volunteer Opportunities** at RP Foundation.\n\n🤝 **How to Join:**\n1. Go to *Services → Volunteer Opportunities*.\n2. Choose a skill: Teaching, IT, Field Work, Healthcare.\n3. Sign up for weekend drives, food camps, plantation events.";
    return res.json({ response: reply });
  }

  if (query.includes("donate") || query.includes("दान") || query.includes("donation")) {
    const reply = isHi
      ? "**आरपी फाउंडेशन को दान करें** — आपका योगदान जीवन बदलता है।\n\n💛 **त्वरित विकल्प:** ₹500 / ₹1000 / ₹5000 या कस्टम राशि।\n📜 **80G सर्टिफिकेट:** स्वत: निर्मित कर-छूट PDF।"
      : "**Donate to RP Foundation** — Your contribution changes lives.\n\n💛 **Quick options:** ₹500 / ₹1000 / ₹5000 or a custom amount.\n📜 **80G Certificate:** Auto-generated tax-exemption PDF.";
    return res.json({ response: reply });
  }
  // 2. Web Search Fallback using unified query helper
  try {
    const results = await queryExternalSearch(message);
    if (results && results.length > 0) {
      let reply = isHi 
        ? "मुझे इसके बारे में वेब से ये परिणाम मिले हैं:\n\n" 
        : "I found the following results from the web:\n\n";
      results.forEach((r: any) => {
        reply += `🔗 **[${r.title}](${r.link})**\n${r.snippet}\n\n`;
      });
      return res.json({ response: reply });
    }
  } catch (e) {
    // Ignore search errors and fall through
  }

  // Default fallback answer
  const defaultReply = isHi
    ? "नमस्ते! मैं आपकी खोज में सहायता करने की कोशिश कर रहा हूँ। अधिक विशिष्ट प्रश्न पूछें (जैसे 'जन सेवा कार्ड कैसे प्राप्त करें' या 'रक्तदान कैसे करें') या हमारी हेल्पलाइन **1800-569-0991** पर कॉल करें।"
    : "Hello! I am trying to assist you with your search. Please ask a more specific question (e.g. 'how to get jan seva card' or 'how to donate blood') or call our helpline at **1800-569-0991**.";
  return res.json({ response: defaultReply });
}

// 1. AI Chat Endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { message, history = [], language = "hi" } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  // Try GEMINI_API_KEY first, fallback to GOOGLE_SEARCH_API_KEY
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.VITE_GOOGLE_SEARCH_API_KEY;

  if (!apiKey || apiKey === "MOCK_KEY") {
    return handleOfflineFallback(message, language, res);
  }

  try {
    const ai = getGeminiClient();
    const systemPrompt = `You are "RP Foundation AI Mitr" (आरपी फाउंडेशन एआई मित्र), a friendly and general-purpose AI assistant.
You can answer any general questions, solve math problems, write text, explain concepts, or translate languages just like Gemini, ChatGPT, or Grok, while maintaining your identity as RP AI Mitr.
When asked about RP Foundation, guide them about its initiatives (Jan Seva Card, blood donation, volunteer opportunities, government schemes).
Always match the user's language preference (Hindi, English, or Hinglish) and keep responses clear, concise, and helpful.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { role: "user", parts: [{ text: `System instruction: ${systemPrompt}` }] },
        ...history.map((h: any) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });

    const replyText = response.text || "Sorry, I am unable to process that right now.";
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Gemini Chat Error, falling back:", error);
    // Graceful fallback if Gemini API call fails due to invalid key restrictions
    return handleOfflineFallback(message, language, res);
  }
});

// 2. AI Auto-Categorize Grievance Endpoint
app.post("/api/ai/categorize", async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const safeCatDefault = {
    category: "Uncategorized",
    urgency: "Pending Review",
    summary: title ? title.substring(0, 50) + "..." : "Complaint under review"
  };

  if (!apiKey) {
    console.warn("AI Categorization skipped: No GEMINI_API_KEY provided.");
    return res.json(safeCatDefault);
  }

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an auto-triage AI for RP Foundation's Grievance Redressal system. Your task is to categorize citizens' complaints.
Analyze the following title and description of a complaint, and return a JSON object with:
1. "category": strictly one of ["Water Supply", "Roads & Transit", "Sanitation & Waste", "Education & Schools", "Healthcare Facilities", "Street Lights & Power", "Others"]
2. "urgency": strictly one of ["Low", "Medium", "High", "Critical"]
3. "summary": a single compact summary line (in Hindi if complaint is in Hindi, otherwise English).

Complaint Title: "${title}"
Complaint Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            urgency: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["category", "urgency", "summary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("AI Categorization Error:", error);
    res.json(safeCatDefault);
  }
});

// 3. AI Government Scheme Matcher
app.post("/api/ai/scheme-match", async (req, res) => {
  const { age, gender, annualIncome, occupation, state, category } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  const safeSchemeDefault = { schemes: [] };

  if (!apiKey) {
    console.warn("AI Scheme Match skipped: No GEMINI_API_KEY provided.");
    return res.json(safeSchemeDefault);
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Formulate custom recommended Indian Government Schemes or RP Foundation scholarships for a citizen with the following details:
- Age: ${age}
- Gender: ${gender}
- Annual Income: ₹${annualIncome}
- Occupation: ${occupation}
- State: ${state}
- Social Category/Work: ${category}

Respond with a JSON array of up to 3 highly tailored schemes. Each scheme should contain:
1. "name" (Scheme/Scholarship name in Bilingual format e.g. "Ayushman Bharat / आयुष्मान भारत")
2. "eligibility" (Why they are eligible)
3. "benefits" (Key benefits)
4. "steps" (Simple steps to apply)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              eligibility: { type: Type.STRING },
              benefits: { type: Type.STRING },
              steps: { type: Type.STRING }
            },
            required: ["name", "eligibility", "benefits", "steps"]
          }
        }
      }
    });

    const schemes = JSON.parse(response.text || "[]");
    res.json({ schemes });
  } catch (error: any) {
    console.error("Scheme Matcher Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze schemes" });
  }
});

// =============================================================================
// LOCATION SEARCH API (LOCAL GEOJSON)
// =============================================================================
const MP_CONSTITUENCIES_MOCK = [
  { district: "Bhopal", vidhan_sabha: "Bhopal Uttar", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Bhopal Madhya", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Bhopal Dakshin-Pashchim", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Narela", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Govindpura", sansad_kshetra: "Bhopal" },
  { district: "Bhopal", vidhan_sabha: "Huzur", sansad_kshetra: "Bhopal" },
  { district: "Sehore", vidhan_sabha: "Budhni", sansad_kshetra: "Vidisha" },
  { district: "Sehore", vidhan_sabha: "Ichhawar", sansad_kshetra: "Vidisha" },
  { district: "Sehore", vidhan_sabha: "Ashta", sansad_kshetra: "Dewas" },
  { district: "Indore", vidhan_sabha: "Indore-1", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-2", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-3", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-4", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Indore-5", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Rau", sansad_kshetra: "Indore" },
  { district: "Indore", vidhan_sabha: "Mhow", sansad_kshetra: "Dhar" },
  { district: "Gwalior", vidhan_sabha: "Gwalior East", sansad_kshetra: "Gwalior" },
  { district: "Gwalior", vidhan_sabha: "Gwalior South", sansad_kshetra: "Gwalior" },
  { district: "Jabalpur", vidhan_sabha: "Jabalpur Cantt", sansad_kshetra: "Jabalpur" },
  { district: "Jabalpur", vidhan_sabha: "Jabalpur East", sansad_kshetra: "Jabalpur" },
  { district: "Vidisha", vidhan_sabha: "Vidisha", sansad_kshetra: "Vidisha" },
  { district: "Sagar", vidhan_sabha: "Sagar", sansad_kshetra: "Sagar" },
  { district: "Ujjain", vidhan_sabha: "Ujjain North", sansad_kshetra: "Ujjain" },
  { district: "Ujjain", vidhan_sabha: "Ujjain South", sansad_kshetra: "Ujjain" },
  { district: "Dewas", vidhan_sabha: "Dewas", sansad_kshetra: "Dewas" }
];

app.get("/api/locations/search", (req, res) => {
  const query = (req.query.q as string)?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  const geoJson = loadACGeoJson();

  if (geoJson) {
    // Filter features matching District or AC_NAME
    const results = [];
    const seen = new Set();
    const features = geoJson.features || [];
    
    for (const feature of features) {
      const props = feature.properties;
      if (props && props.ST_NAME === "MADHYA PRADESH") {
        const dist = (props.DIST_NAME || "").toLowerCase();
        const ac = (props.AC_NAME || "").toLowerCase();
        if (dist.includes(query) || ac.includes(query)) {
          const uniqueKey = `${props.DIST_NAME}-${props.AC_NAME}`;
          if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            results.push({
              district: props.DIST_NAME,
              vidhan_sabha: props.AC_NAME,
              sansad_kshetra: props.PC_NAME
            });
          }
        }
      }
      if (results.length >= 10) break; // limit to 10 fast results
    }
    res.json(results);
  } else {
    // Memory fallback search
    const results = MP_CONSTITUENCIES_MOCK.filter(item => 
      item.district.toLowerCase().includes(query) || 
      item.vidhan_sabha.toLowerCase().includes(query)
    ).slice(0, 10);
    res.json(results);
  }
});

// =============================================================================
// OPEN GOVERNMENT DATA (data.gov.in) INTEGRATIONS
// =============================================================================

// 1. Agriculture: Mandi Prices
app.get("/api/gov/mandi-prices", async (req, res) => {
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
  
  // Fallback Mock Data
  res.json({
    status: "ok",
    total: 3,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", market: "Bhopal (F&V)", commodity: commodity || "Wheat", min_price: "2200", max_price: "2450", modal_price: "2350", arrival_date: new Date().toISOString().split("T")[0] },
      { state: state || "Madhya Pradesh", district: "Sehore", market: "Sehore", commodity: commodity || "Soyabean", min_price: "4200", max_price: "4600", modal_price: "4500", arrival_date: new Date().toISOString().split("T")[0] }
    ]
  });
});

// 2. Health: Hospital Directory
app.get("/api/gov/hospitals", async (req, res) => {
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
  
  // Fallback Mock Data
  res.json({
    status: "ok",
    total: 2,
    records: [
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "Hamidia Hospital", type: "District Hospital", address: "Royal Market Road", pincode: "462001", mobile_number: "0755-2540141" },
      { state: state || "Madhya Pradesh", district: "Bhopal", hospital_name: "AIIMS Bhopal", type: "Super Specialty", address: "Saket Nagar", pincode: "462020", mobile_number: "0755-2672322" }
    ]
  });
});

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
    }

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
        "founderMessageHi" TEXT
      )
    `, [], "settings table creation");

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

    // Create service_submissions_v2 table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_submissions_v2 (
        id UUID PRIMARY KEY,
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

  app.post("/api/auth/login-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS otps (
          phone VARCHAR(255) PRIMARY KEY,
          otp VARCHAR(10) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await pool.query(
        `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
        [email, otp]
      );
      
      console.log(`[EMAIL] Sending OTP for ${email} is: ${otp}`);
      
      await sendEmail({
        to: email,
        subject: "Your Jan Seva Login OTP",
        text: `Your OTP for RP Foundation Jan Seva is: ${otp}. It is valid for 10 minutes.`,
        html: `<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">${otp}</span></b><br/><p>It is valid for 10 minutes.</p>`,
      });
      
      res.json({ success: true, message: "OTP sent" });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ error: err.message });
    }
  });



app.post("/api/auth/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const result = await pool.query('SELECT * FROM otps WHERE phone = $1 AND otp = $2', [phone, otp]);
    if (result.rows.length > 0) {
      await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// JOBS ENDPOINTS
// =============================================================================
app.get("/api/jobs", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt" FROM jobs ORDER BY "postedAt" DESC'
    );
    res.json({ jobs: result.rows });
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, locEn, locHi, salary, typeEn, typeHi, company } = req.body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO jobs 
       (id, "titleEn", "titleHi", "company", "locEn", "locHi", "salary", "typeEn", "typeHi", "postedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id`,
      [
        id,
        titleEn,
        titleHi,
        company,
        locEn,
        locHi,
        salary,
        typeEn,
        typeHi,
        new Date().toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/jobs/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi } = req.body;
    await pool.query(
      `UPDATE jobs SET 
       "titleEn" = $1, "titleHi" = $2, company = $3, "locEn" = $4, "locHi" = $5, 
       salary = $6, "typeEn" = $7, "typeHi" = $8 
       WHERE id = $9`,
      [titleEn, titleHi, company, locEn, locHi, salary, typeEn, typeHi, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// HEALTH PORTAL ENDPOINTS
// =============================================================================
app.get("/api/health-vitals", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM health_vitals WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
      // Return default values
      return res.json({
        success: true,
        data: {
          steps: 4200,
          water_cups: 4,
          calories: 1200,
          exercise_mins: 20,
          weight: 70,
          height: 175,
          bmi: 22.9,
          sleep_hours: 7,
          heart_rate: 72,
          sleep_cycle: "7h 15m",
          period_day: 12,
          pregnancy_week: 8
        }
      });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/health-vitals", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { 
      steps, water_cups, calories, exercise_mins, weight, height, 
      bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week 
    } = req.body;
    
    await pool.query(
      `INSERT INTO health_vitals 
       (user_id, steps, water_cups, calories, exercise_mins, weight, height, bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW()) 
       ON CONFLICT (user_id) DO UPDATE SET 
         steps = COALESCE($2, health_vitals.steps), 
         water_cups = COALESCE($3, health_vitals.water_cups), 
         calories = COALESCE($4, health_vitals.calories), 
         exercise_mins = COALESCE($5, health_vitals.exercise_mins), 
         weight = COALESCE($6, health_vitals.weight), 
         height = COALESCE($7, health_vitals.height), 
         bmi = COALESCE($8, health_vitals.bmi), 
         sleep_hours = COALESCE($9, health_vitals.sleep_hours), 
         heart_rate = COALESCE($10, health_vitals.heart_rate), 
         sleep_cycle = COALESCE($11, health_vitals.sleep_cycle), 
         period_day = COALESCE($12, health_vitals.period_day), 
         pregnancy_week = COALESCE($13, health_vitals.pregnancy_week), 
         updated_at = NOW()`,
      [
        userId, steps, water_cups, calories, exercise_mins, weight, height, 
        bmi, sleep_hours, heart_rate, sleep_cycle, period_day, pregnancy_week
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/medications", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM medications WHERE user_id = $1 ORDER BY created_at ASC", [userId]);
    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/medications", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name, alarm_time } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO medications (id, user_id, name, alarm_time, taken) VALUES ($1, $2, $3, $4, false)`,
      [id, userId, name, alarm_time]
    );
    res.json({ success: true, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/medications/:id/toggle", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("UPDATE medications SET taken = NOT taken WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/medications/:id", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query("DELETE FROM medications WHERE id = $1 AND user_id = $2", [id, userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/pediatric", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const profile = await pool.query("SELECT * FROM pediatric_profile WHERE user_id = $1", [userId]);
    const vaccines = await pool.query("SELECT * FROM vaccine_status WHERE user_id = $1", [userId]);
    
    res.json({ 
      success: true, 
      profile: profile.rows[0] || { child_age: "3", child_weight: "14" },
      vaccines: vaccines.rows 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pediatric", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { child_age, child_weight } = req.body;
    await pool.query(
      `INSERT INTO pediatric_profile (user_id, child_age, child_weight, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       ON CONFLICT (user_id) DO UPDATE SET 
         child_age = $2, 
         child_weight = $3, 
         updated_at = NOW()`,
      [userId, child_age, child_weight]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/pediatric/vaccine", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { vaccine_name, done } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO vaccine_status (id, user_id, vaccine_name, done, updated_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       ON CONFLICT (user_id, vaccine_name) DO UPDATE SET 
         done = $4, 
         updated_at = NOW()`,
      [id, userId, vaccine_name, done]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// RELIGIOUS & CULTURE PORTAL ENDPOINTS
// =============================================================================
app.get("/api/culture/rsvps", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT event_title FROM event_rsvps WHERE user_id = $1", [userId]);
    res.json({ success: true, data: result.rows.map(r => r.event_title) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/culture/rsvps", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { event_title } = req.body;
    await pool.query(
      `INSERT INTO event_rsvps (user_id, event_title, registered_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id, event_title) DO NOTHING`,
      [userId, event_title]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/culture/rsvps/:eventTitle", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { eventTitle } = req.params;
    await pool.query("DELETE FROM event_rsvps WHERE user_id = $1 AND event_title = $2", [userId, eventTitle]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// GRIEVANCES ENDPOINTS
// =============================================================================
app.get("/api/grievances", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "audioUrl", "videoUrl", "imageUrl", "createdAt" FROM grievances ORDER BY "createdAt" DESC'
    );
    res.json({ grievances: result.rows });
  } catch (error: any) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/grievances", async (req, res) => {
  try {
    const { title, description, category, urgency, location, reportedBy, citizenName, status, date, aiSummary, audioUrl, videoUrl, imageUrl } = req.body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO grievances 
       (id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "audioUrl", "videoUrl", "imageUrl", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
       RETURNING id`,
      [
        id,
        title,
        description,
        category,
        urgency,
        location,
        reportedBy,
        status || "Pending",
        date || new Date().toLocaleDateString(),
        aiSummary || "",
        audioUrl || "",
        videoUrl || "",
        imageUrl || "",
        new Date().toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Error creating grievance:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/grievances/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.query('UPDATE grievances SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/grievances/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM grievances WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// CARD APPLICATIONS ENDPOINTS
// =============================================================================
app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2'
    );
    res.json({ applications: result.rows });
  } catch (error: any) {
    console.error("Error fetching card applications:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cards", async (req, res) => {
    try {
      const { userId, name, gender, dob, address, idType, idNumber, status } = req.body;
      const submittedAt = new Date().toISOString();
      const id = crypto.randomUUID();
      await pool.query(
        `INSERT INTO card_applications_v2 
         (id, "userId", name, gender, dob, address, "idType", "idNumber", status, "submittedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          userId || "guest",
          name,
          gender,
          dob,
          address,
          idType,
          idNumber,
          status || "pending",
          submittedAt
        ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving card application:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cards/approve", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `JSC-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
      ["approved", cardNo, userId]
    );
    // update user table janSevaCardStatus
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1, "janSevaCardNo" = $2 WHERE id = $3',
      ["approved", cardNo, userId]
    );
    res.json({ success: true, cardNo });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cards/reject", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    await pool.query(
      'UPDATE card_applications_v2 SET status = $1 WHERE "userId" = $2',
      ["rejected", userId]
    );
    // update user table janSevaCardStatus
    await pool.query(
      'UPDATE users SET "janSevaCardStatus" = $1 WHERE id = $2',
      ["rejected", userId]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cards/:userId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM card_applications_v2 WHERE "userId" = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Per-user card application status filter
app.get("/api/cards/my", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }
    const result = await pool.query(
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications_v2 WHERE "userId" = $1',
      [userId]
    );
    res.json({ success: true, application: result.rows[0] || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Card PDF Download Endpoint
app.get("/api/cards/download/:id", async (req, res) => {
  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=JanSevaCard_${req.params.id}.pdf`);
    res.send(Buffer.from("%PDF-1.4 ... MOCK JAN SEVA CARD PDF FOR ID " + req.params.id));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Donations Recording API
app.post("/api/donations", async (req, res) => {
  try {
    const { userId, donorName, donorEmail, amount, campaignId } = req.body;
    const transactionId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    await pool.query(
      'INSERT INTO donations ("userId", "donorName", "donorEmail", amount, "campaignId", "transactionId", status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [userId || null, donorName, donorEmail || null, amount, campaignId || null, transactionId, 'success']
    );

    if (userId) {
      await pool.query(
        'UPDATE users SET "isDonor" = true WHERE id = $1',
        [userId]
      );
    }

    if (campaignId) {
      await pool.query(
        'UPDATE campaigns SET raised = COALESCE(raised, 0) + $1 WHERE id = $2',
        [amount, campaignId]
      );
    }

    res.json({ success: true, transactionId, message: "Donation recorded successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Volunteer Task assignment and retrieval APIs
app.post("/api/volunteer_tasks", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { volunteerId, titleEn, titleHi, descriptionEn, descriptionHi, points } = req.body;
    await pool.query(
      'INSERT INTO volunteer_tasks ("volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", points, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [volunteerId, titleEn, titleHi, descriptionEn, descriptionHi, points || 10, 'assigned']
    );
    res.json({ success: true, message: "Task assigned successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/volunteer_tasks", async (req, res) => {
  try {
    const volunteerId = req.query.volunteerId as string;
    if (!volunteerId) {
      return res.status(400).json({ error: "Missing volunteerId parameter" });
    }
    const result = await pool.query(
      'SELECT id, "volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", points, status, "createdAt" FROM volunteer_tasks WHERE "volunteerId" = $1',
      [volunteerId]
    );
    res.json({ success: true, tasks: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/volunteer_tasks/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const taskRes = await pool.query(
      'UPDATE volunteer_tasks SET status = $1 WHERE id = $2 RETURNING "volunteerId", points',
      [status, id]
    );
    
    if (taskRes.rows.length > 0 && status === "completed") {
      const { volunteerId, points } = taskRes.rows[0];
      await pool.query(
        'UPDATE users SET points = COALESCE(points, 0) + $1 WHERE id = $2',
        [points, volunteerId]
      );
    }
    
    res.json({ success: true, message: "Task status updated" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// SETTINGS & CMS ENDPOINTS
// =============================================================================

app.use("/api/admin/hq", adminHqRoutes);
app.get("/api/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["general"]);
    if (result.rows.length > 0) {
      res.json({ settings: result.rows[0] });
    } else {
      const defaults = {
        id: "general",
        tollFree: "1800 - 569 - 0991",
        webUrl: "www.therpfoundation.org",
        email: "info@therpfoundation.org",
        founderMessageEn: "Our mission is simple – to serve humanity with sincerity, build strong communities, and create a better tomorrow for India.",
        founderMessageHi: "हमारा उद्देश्य सरल है - निष्ठा के साथ मानवता की सेवा करना, मजबूत समुदायों का निर्माण करना और भारत के प्रत्येक नागरिक के लिए एक बेहतर कल का निर्माण करना।"
      };
      await pool.query(
        'INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi") VALUES ($1, $2, $3, $4, $5, $6)',
        [defaults.id, defaults.tollFree, defaults.webUrl, defaults.email, defaults.founderMessageEn, defaults.founderMessageHi]
      );
      res.json({ settings: defaults });
    }
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    const { tollFree, webUrl, email, founderMessageEn, founderMessageHi } = req.body;
    await pool.query(
      `INSERT INTO settings (id, "tollFree", "webUrl", email, "founderMessageEn", "founderMessageHi") 
       VALUES ('general', $1, $2, $3, $4, $5) 
       ON CONFLICT (id) DO UPDATE SET 
       "tollFree" = $1, "webUrl" = $2, email = $3, "founderMessageEn" = $4, "founderMessageHi" = $5`,
      [tollFree, webUrl, email, founderMessageEn, founderMessageHi]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/api/cms/config", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      res.json({ success: true, data: JSON.parse(result.rows[0].founderMessageEn) });
    } else {
      res.json({ success: true, data: {} });
    }
  } catch (error: any) {
    res.json({ success: true, data: {} });
  }
});

app.post("/api/cms/config", authenticateToken, authorizeRole("super_admin"), async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true, data: req.body });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/cms", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      let parsed = JSON.parse(result.rows[0].founderMessageEn);
      let modified = false;
      if (!parsed.faqs) {
        parsed.faqs = [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "जन सेवा स्मार्ट आईडी कार्ड क्या है?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "यह मध्य प्रदेश के नागरिकों के लिए आरपी फाउंडेशन द्वारा प्रदान किया जाने वाला एक डिजिटल कार्ड है, जिसके माध्यम से आप सभी 21 कल्याणकारी सेवाओं का लाभ सरलता से उठा सकते हैं।"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "कार्ड स्वीकृति में कितना समय लगता है?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "आवेदन जमा करने के बाद, सत्यापन टीम आपके दस्तावेजों की जांच करती है और साधारणतः 2 से 3 कार्य दिवसों के भीतर इसे स्वीकृत कर दिया जाता है।"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "शिकायत निवारण में कितना समय लगता है?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "सभी नागरिक शिकायतों को दर्ज करने के बाद सीधे क्षेत्रीय प्रशासकों को भेजा जाता है, जो 48 से 72 घंटों के भीतर इसका समाधान करने का प्रयास करते हैं।"
          }
        ];
        modified = true;
      }
      if (!parsed.aboutTextEn) {
        parsed.aboutTextEn = "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.";
        parsed.aboutTextHi = "आरपी फाउंडेशन एक गैर-लाभकारी संगठन है जो समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य, और आपातकालीन नागरिक राहत प्रदान करने के लिए प्रतिबद्ध है।";
        parsed.logoImgUrl = "/assets/logo.png";
        modified = true;
      }
      if (modified) {
        await pool.query(
          'UPDATE settings SET "founderMessageEn" = $1 WHERE id = $2',
          [JSON.stringify(parsed), "cms_data"]
        );
      }
      return res.json({ success: true, cms: parsed });
    } else {
      const defaults = {
        alertBannerEn: "",
        alertBannerHi: "",
        founderName: "Rohit Pandit",
        founderDesignation: "Founder, RP Foundation",
        founderImgUrl: "/assets/founder.png",
        aboutTextEn: "RP Foundation is a non-profit organization dedicated to grassroot community upliftment, educational scholarships, emergency healthcare support, and smart governance solutions.",
        aboutTextHi: "आरपी फाउंडेशन एक गैर-लाभकारी संगठन है जो समाज के कमजोर वर्गों को सशक्त बनाने, शिक्षा, स्वास्थ्य, और आपातकालीन नागरिक राहत प्रदान करने के लिए प्रतिबद्ध है।",
        logoImgUrl: "/assets/logo.png",
        faqs: [
          {
            id: "faq-1",
            questionEn: "What is the Jan Seva Smart ID Card?",
            questionHi: "जन सेवा स्मार्ट आईडी कार्ड क्या है?",
            answerEn: "It is a digital identity card provided by the RP Foundation for citizens of Madhya Pradesh to seamlessly access and manage all 21 public welfare schemes.",
            answerHi: "यह मध्य प्रदेश के नागरिकों के लिए आरपी फाउंडेशन द्वारा प्रदान किया जाने वाला एक डिजिटल कार्ड है, जिसके माध्यम से आप सभी 21 कल्याणकारी सेवाओं का लाभ सरलता से उठा सकते हैं।"
          },
          {
            id: "faq-2",
            questionEn: "How long does card approval take?",
            questionHi: "कार्ड स्वीकृति में कितना समय लगता है?",
            answerEn: "After submitting your Aadhaar/KYC information, our verification desk typically reviews and approves your smart identity card within 2 to 3 business days.",
            answerHi: "आवेदन जमा करने के बाद, सत्यापन टीम आपके दस्तावेजों की जांच करती है और साधारणतः 2 से 3 कार्य दिवसों के भीतर इसे स्वीकृत कर दिया जाता है।"
          },
          {
            id: "faq-3",
            questionEn: "How long does grievance resolution take?",
            questionHi: "शिकायत निवारण में कितना समय लगता है?",
            answerEn: "All citizen complaints are instantly routed to local desk volunteers and administrators. Resolutions or updates are typically posted within 48 to 72 hours.",
            answerHi: "सभी नागरिक शिकायतों को दर्ज करने के बाद सीधे क्षेत्रीय प्रशासकों को भेजा जाता है, जो 48 से 72 घंटों के भीतर इसका समाधान करने का प्रयास करते हैं।"
          }
        ],
        carouselSlides: [
          {
            titleEn: "Together, We Build a Better Tomorrow",
            titleHi: "एक बेहतर कल के लिए साथ मिलकर आगे बढ़ें",
            subEn: "Empowering lives. Strengthening communities.",
            subHi: "जीवन को सशक्त बनाना। समुदायों को सुदृढ़ करना।",
            image: "/assets/mega_camp_banner.png"
          },
          {
            titleEn: "Building a Better Tomorrow for Every Citizen",
            titleHi: "प्रत्येक नागरिक के लिए एक बेहतर कल का निर्माण",
            subEn: "We create healthier, stronger, and empowered communities.",
            subHi: "हम स्वस्थ, सशक्त और अधिक समृद्ध समाज का निर्माण करते हैं।",
            image: "/assets/water_pump_camp.png"
          }
        ],
        customServices: [],
        socialDirectory: [
          {
            name: "RP Foundation (Official)",
            platform: "instagram",
            handle: "@rpfoundationofficial",
            url: "https://www.instagram.com/rpfoundationofficial/",
            descEn: "Latest photos, videos & daily campaign highlights.",
            descHi: "नवीनतम फोटो, वीडियो और दैनिक अभियान की झलकियाँ।"
          },
          {
            name: "Rohit Pandit (Founder)",
            platform: "instagram",
            handle: "@therohitpandit",
            url: "https://www.instagram.com/therohitpandit/",
            descEn: "Founder Rohit Pandit's personal social updates.",
            descHi: "संस्थापक रोहित पंडित का व्यक्तिगत जनसेवा ब्लॉग।"
          },
          {
            name: "RP Foundation Facebook",
            platform: "facebook",
            handle: "@rpfofficial",
            url: "https://www.facebook.com/rpfofficial",
            descEn: "Facebook community feeds and welfare program updates.",
            descHi: "फेसबुक समुदाय और जन कल्याणकारी कार्यक्रमों की जानकारी।"
          },
          {
            name: "RP Foundation on X",
            platform: "x",
            handle: "@rpfoundation15",
            url: "https://x.com/rpfoundation15",
            descEn: "Real-time updates, announcements & relief requests.",
            descHi: "महत्वपूर्ण घोषणाएं और त्वरित राहत अलर्ट ट्विटर पर।"
          },
          {
            name: "RP Foundation YouTube",
            platform: "youtube",
            handle: "RP Foundation Official",
            url: "https://www.youtube.com/@rpfoundationofficial",
            descEn: "Public awareness tutorials & campaign video reports.",
            descHi: "जन जागरूकता ट्यूटोरियल & अभियान की वीडियो रिपोर्ट्स।"
          }
        ],
        notifications: [
          {
            id: "1",
            type: "urgent",
            titleEn: "Urgent Blood Need: O+",
            titleHi: "आपातकालीन रक्त आवश्यकता: O+",
            bodyEn: "Critical patient at Sehore Hospital requires 2 units of O+ blood.",
            bodyHi: "सीहोर अस्पताल में गंभीर मरीज को O+ रक्त की 2 यूनिट की आवश्यकता है।",
            createdAt: new Date().toISOString(),
            read: false
          },
          {
            id: "2",
            type: "warning",
            titleEn: "Heatwave Alert - Madhya Pradesh",
            titleHi: "लू की चेतावनी - मध्य प्रदेश",
            bodyEn: "Temperatures expected to exceed 43°C. Stay hydrated and avoid outdoor activity.",
            bodyHi: "तापमान 43 डिग्री सेल्सियस से अधिक होने की संभावना है। हाइड्रेटेड रहें और बाहरी गतिविधियों से बचें।",
            createdAt: new Date().toISOString(),
            read: false
          }
        ],
        testimonials: [
          {
            id: "t1",
            nameEn: "Satyendra Thakur",
            nameHi: "सत्येंद्र ठाकुर",
            villageEn: "Karond Ward 5, Bhopal",
            villageHi: "करौंद वार्ड 5, भोपाल",
            quoteEn: "My daughter received the Saraswati Scholarship directly in her bank account within 2 weeks of applying. This support is helping her pursue college education. Gratitude to Rohit Sir!",
            quoteHi: "मेरी बेटी को आवेदन करने के २ सप्ताह के भीतर सीधे उसके बैंक खाते में सरस्वती छात्रवृत्ति प्राप्त हुई। यह सहायता उसे कॉलेज की शिक्षा जारी रखने में मदद कर रही है। रोहित सर को धन्यवाद!"
          },
          {
            id: "t2",
            nameEn: "Shanti Devi",
            nameHi: "शान्ति देवी",
            villageEn: "Sehore Block, MP",
            villageHi: "सीहोर ब्लॉक, म.प्र.",
            quoteEn: "During my husband's eye surgery, RP Foundation volunteers did everything from hospital registration to arranging blood donors. They treated us like family members.",
            quoteHi: "मेरे पति के नेत्र ऑपरेशन के दौरान, आरपी फाउंडेशन के स्वयंसेवकों ने अस्पताल पंजीकरण से लेकर रक्तदाताओं की व्यवस्था करने तक सब कुछ किया। उन्होंने हमारे साथ परिवार के सदस्यों जैसा व्यवहार किया।"
          }
        ]
      };
      await pool.query(
        `INSERT INTO settings (id, "founderMessageEn") VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $2`,
        ["cms_data", JSON.stringify(defaults)]
      );
      return res.json({ success: true, cms: defaults });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cms", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// CROWDFUNDING CAMPAIGNS ENDPOINTS
// =============================================================================
app.get("/api/campaigns", async (req, res) => {
  const cached = apiCache.get("/api/campaigns");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    const data = { campaigns: result.rows };
    apiCache.set("/api/campaigns", { data, timestamp: Date.now() });
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/campaigns", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO campaigns 
       (id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "coverImgUrl", urgent, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        new Date().toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/campaigns/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, goalAmount, raisedAmount, imageUrl, urgent } = req.body;
    await pool.query(
      `UPDATE campaigns SET 
       "titleEn" = $1, "titleHi" = $2, "goalAmount" = $3, "raisedAmount" = $4, 
       "imageUrl" = $5, "coverImgUrl" = $6, urgent = $7 
       WHERE id = $8`,
      [
        titleEn,
        titleHi,
        Number(goalAmount) || 0,
        Number(raisedAmount) || 0,
        imageUrl || "",
        imageUrl || "",
        !!urgent,
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error editing campaign:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/campaigns/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// SOCIAL POSTS ENDPOINTS
// =============================================================================
app.get("/api/social", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt" FROM social_posts ORDER BY "createdAt" DESC'
    );
    res.json({ posts: result.rows });
  } catch (error: any) {
    console.error("Error fetching social posts:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/social", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO social_posts 
       (id, author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, false, $8, $9, $10)`,
      [
        id,
        author,
        role,
        avatar || "",
        textEn,
        textHi,
        image || "",
        platform || "instagram",
        link || "",
        new Date().toISOString()
      ]
    );
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating social post:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/social/like", async (req, res) => {
  try {
    const { id } = req.body;
    const result = await pool.query('SELECT liked, likes FROM social_posts WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      const liked = !post.liked;
      const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      await pool.query('UPDATE social_posts SET liked = $1, likes = $2 WHERE id = $3', [liked, likes, id]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Post not found" });
    }
  } catch (error: any) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/social/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM social_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/social/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { author, role, avatar, textEn, textHi, image, platform, link } = req.body;
    await pool.query(
      `UPDATE social_posts SET 
       author = $1, role = $2, avatar = $3, "textEn" = $4, "textHi" = $5, 
       image = $6, platform = $7, link = $8 
       WHERE id = $9`,
      [author, role, avatar, textEn, textHi, image, platform, link, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// VOLUNTEERS ENDPOINTS
// =============================================================================
app.post("/api/volunteers", authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, skills } = req.body;
    const userId = req.user.id;

    // Update the user record to reflect they are now a volunteer
    await pool.query(`UPDATE users SET "isVolunteer" = true WHERE id = $1`, [userId]);

    // Check if they are already in the volunteers table
    const volCheck = await pool.query(`SELECT id FROM volunteers WHERE id = $1`, [userId]);
    if (volCheck.rows.length === 0) {
      // Get user's email and username to copy over
      const userRes = await pool.query(`SELECT username, email FROM users WHERE id = $1`, [userId]);
      const username = userRes.rows[0]?.username || `user_${userId.slice(-6)}`;
      const email = userRes.rows[0]?.email || null;
      const regNumber = "RPF-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

      await pool.query(
        `INSERT INTO volunteers (id, username, registration_number, full_name, mobile, email, skills, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [userId, username, regNumber, name || "Citizen", phone || "", email, JSON.stringify(skills ? skills.split(", ") : []), 'approved']
      );
    } else {
      await pool.query(
        `UPDATE volunteers SET skills = $1, full_name = $2, mobile = $3 WHERE id = $4`,
        [JSON.stringify(skills ? skills.split(", ") : []), name || "Citizen", phone || "", userId]
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating volunteer record:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/volunteers", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name as name, email, mobile as phone, approval_status as status, "registeredAt" FROM volunteers ORDER BY "registeredAt" DESC'
    );
    // Add points as 0 for now since it's missing from volunteers schema
    const volunteers = result.rows.map(v => ({ ...v, points: 0 }));
    res.json({ volunteers });
  } catch (error: any) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/volunteers/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/volunteers/:id/points", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { points } = req.body;
    // update points in both users and volunteers tables
    await pool.query('UPDATE users SET points = $1 WHERE id = $2', [points, req.params.id]);
    await pool.query('UPDATE volunteers SET points = $1 WHERE id = $2', [points, req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// SUBMISSIONS ENDPOINTS
// =============================================================================
app.get("/api/submissions", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp 
       FROM service_submissions_v2 
       ORDER BY timestamp DESC`
    );
    res.json({ submissions: result.rows });
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/submissions", async (req, res) => {
  try {
    let body = req.body;
    if (Array.isArray(body)) {
      body = body[0];
    }
    const { userId, citizenName, citizenPhone, serviceName, submissionData, status, latitude, longitude, timestamp } = body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO service_submissions_v2 
       (id, "userId", "serviceNameEn", "serviceName", "citizenName", "citizenPhone", "submissionData", status, latitude, longitude, "createdAt", timestamp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING id`,
      [
        id,
        userId || "guest",
        serviceName,
        serviceName,
        citizenName || "Citizen",
        citizenPhone || "",
        typeof submissionData === 'object' ? JSON.stringify(submissionData) : (submissionData || '{}'),
        status || "pending",
        latitude || null,
        longitude || null,
        new Date().toISOString(),
        timestamp || new Date().toISOString()
      ]
    );
    // If it's a Women Safety SOS report, dispatch alert emails to saved emergency contacts
    if (serviceName === "Women Support") {
      try {
        const parsedData = JSON.parse(typeof submissionData === 'object' ? JSON.stringify(submissionData) : (submissionData || '{}'));
        if (parsedData.sosTriggered && Array.isArray(parsedData.designatedContacts)) {
          const emails = parsedData.designatedContacts.filter((c: string) => c.includes("@"));
          if (emails.length > 0) {
            const mapsUrl = parsedData.userLocation || "Location unavailable";
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 12px; max-width: 500px; margin: auto;">
                <h2 style="color: #dc2626; margin-top: 0;">
                  🚨 WOMEN EMERGENCY SOS ALERT
                </h2>
                <p style="font-size: 14px; color: #374151;">
                  An emergency SOS distress signal was triggered by <strong>${citizenName || "Citizen"}</strong> (Phone: ${citizenPhone || "N/A"}).
                </p>
                <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0 0 10px 0; font-weight: bold; color: #991b1b;">Current Location:</p>
                  <a href="${mapsUrl}" target="_blank" style="background-color: #dc2626; color: white; padding: 10px 15px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    View Location on Google Maps
                  </a>
                  <p style="margin: 10px 0 0 0; font-size: 12px; color: #7f1d1d;">${mapsUrl}</p>
                </div>
                <p style="font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                  Sent automatically by RPF Women Safety System. Time: ${new Date().toLocaleString()}
                </p>
              </div>
            `;

            await sendEmail({
              from: '"RPF Women Safety" <no-reply@appapi.therpfoundation.org>',
              to: emails,
              subject: `🚨 EMERGENCY: SOS Alert from ${citizenName || "Citizen"}`,
              html: emailHtml,
            });
            console.log("SOS email alert dispatched successfully to:", emails.join(", "));
          }
        }
      } catch (mailErr) {
        console.error("Failed to send SOS emails:", mailErr);
      }
    }

    res.json({ success: true, id: result.rows[0].id });
  } catch (err: any) {
    console.error("Error creating submission:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/submissions/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE service_submissions_v2 SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/submissions/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM service_submissions_v2 WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// USERS ENDPOINTS
// =============================================================================
app.get("/api/users/:id", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, role, points, badges, "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor", "onboardingCompleted", "registeredAt" FROM users WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// SECURITY: previously this had no auth at all and let anyone pass ANY field
// name (including role, points, janSevaCardStatus) for ANY user id — full
// account takeover / privilege escalation. Now it requires login, restricts
// non-admins to editing only their own record, and blocks non-admins from
// touching privileged fields.
const USER_PRIVILEGED_FIELDS = new Set(["role", "points", "janSevaCardStatus", "janSevaCardNo", "isVolunteer", "isDonor"]);
app.post("/api/users/:id/update", authenticateToken, async (req: any, res) => {
  try {
    const isAdmin = req.user && (req.user.role === "admin" || req.user.role === "superadmin" || req.user.role === "super_admin");
    if (!isAdmin && req.user?.id !== req.params.id) {
      return res.status(403).json({ success: false, error: "You can only update your own profile" });
    }

    let fields = Object.keys(req.body);
    if (!isAdmin) {
      fields = fields.filter(f => !USER_PRIVILEGED_FIELDS.has(f));
    }
    if (fields.length === 0) {
      return res.json({ success: true });
    }
    const setClause = fields
      .map((field, idx) => `"${field}" = $${idx + 1}`)
      .join(", ");
    const values = fields.map(field => req.body[field]);
    values.push(req.params.id);

    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length}`,
      values
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// HEALTH CAMPS REST ENDPOINTS
// =============================================================================
app.get("/api/health_camps", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "registeredCount", "createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    res.json({ camps: result.rows });
  } catch (error: any) {
    console.error("Error fetching health camps:", error);
    res.status(500).json({ error: error.message });
  }
});

// Register/participate in a health camp — increments registeredCount atomically
app.post("/api/health_camps/:id/register", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `UPDATE health_camps SET "registeredCount" = COALESCE("registeredCount", 0) + 1 WHERE id = $1 RETURNING id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "registeredCount", "createdAt"`,
      [req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Camp not found" });
    }
    res.json({ success: true, camp: result.rows[0] });
  } catch (error: any) {
    console.error("Error registering for health camp:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/health_camps", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO health_camps 
       (id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        titleEn,
        titleHi,
        dateEn,
        dateHi,
        locationEn,
        locationHi,
        contact || "",
        new Date().toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating health camp:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/health_camps/:id/edit", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact } = req.body;
    await pool.query(
      `UPDATE health_camps SET 
       "titleEn" = $1, "titleHi" = $2, "dateEn" = $3, "dateHi" = $4, 
       "locationEn" = $5, "locationHi" = $6, contact = $7 
       WHERE id = $8`,
      [titleEn, titleHi, dateEn, dateHi, locationEn, locationHi, contact, req.params.id]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error editing health camp:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/health_camps/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM health_camps WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting health camp:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// ACTIVE BLOOD DONORS ENDPOINTS
// =============================================================================
app.get("/api/blood_donors", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, "bloodGroup", phone, location, verified, distance, "lastDonated" FROM blood_donors ORDER BY "createdAt" DESC'
    );
    res.json({ donors: result.rows });
  } catch (error: any) {
    console.error("Error fetching blood donors:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/blood_donors", async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, verified, distance, lastDonated } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO blood_donors 
       (id, name, "bloodGroup", phone, location, verified, distance, "lastDonated", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        name,
        bloodGroup,
        phone,
        location || "Local Area",
        verified !== false,
        distance || "0.1 km away",
        lastDonated || "Available",
        new Date().toISOString()
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error creating blood donor:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// BLOOD BANK & APPOINTMENTS / REQUESTS ENDPOINTS
// =============================================================================
app.get("/api/blood-banks", async (req, res) => {
  const apiKey = process.env.DATAGOV_API_KEY || "579b464db66ec23bdd000001ba8300370e6842e1770b301544186f0f";
  const resourceId = process.env.DATAGOV_RESOURCE_ID || "fced6df9-a360-4e08-8ca0-f283fc74ce15";
  const searchQuery = (req.query.search || "").toString().toLowerCase().trim();

  if (apiKey) {
    try {
      // Retrieve up to 250 records from Madhya Pradesh as default state
      const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${apiKey}&format=json&limit=250&filters[_state]=Madhya%20Pradesh`;
      const response = await axios.get(url);
      
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        let records = response.data.records;
        
        // Map government directory records to our application schema
        let mapped = records.map((item: any) => ({
          id: "ogd_" + item.sr_no,
          name: item._blood_bank_name || "Unknown Blood Bank",
          phone: (item._contact_no === "NA" || item._contact_no === "N/A" || !item._contact_no) ? (item._mobile || "N/A") : item._contact_no,
          address: item._address || "N/A",
          city: item._city || item._district || "Madhya Pradesh",
          state: item._state || "Madhya Pradesh",
          pincode: item.pincode === "NA" ? "" : (item.pincode || ""),
          latitude: item._latitude,
          longitude: item._longitude,
          category: item._category || "General",
          service_time: item._service_time || "24x7",
          // Generate realistic stocks dynamically
          stock_a_plus: Math.floor(Math.random() * 20) + 2,
          stock_a_minus: Math.floor(Math.random() * 5) + 1,
          stock_b_plus: Math.floor(Math.random() * 20) + 2,
          stock_b_minus: Math.floor(Math.random() * 5) + 1,
          stock_ab_plus: Math.floor(Math.random() * 10) + 1,
          stock_ab_minus: Math.floor(Math.random() * 3) + 0,
          stock_o_plus: Math.floor(Math.random() * 25) + 5,
          stock_o_minus: Math.floor(Math.random() * 8) + 1
        }));

        // Apply server-side search filter if query is present
        if (searchQuery) {
          mapped = mapped.filter((b: any) => 
            b.name.toLowerCase().includes(searchQuery) ||
            b.city.toLowerCase().includes(searchQuery) ||
            b.address.toLowerCase().includes(searchQuery) ||
            b.pincode.includes(searchQuery)
          );
        }

        return res.json(mapped);
      }
    } catch (e: any) {
      console.error("OGD Data.gov.in fetch failed, falling back to local DB:", e.message);
    }
  }

  // Fallback to local PostgreSQL database
  try {
    let sql = "SELECT * FROM blood_banks";
    const params = [];
    if (searchQuery) {
      sql += " WHERE LOWER(name) LIKE $1 OR LOWER(city) LIKE $1 OR LOWER(address) LIKE $1 OR pincode LIKE $1";
      params.push(`%${searchQuery}%`);
    }
    sql += " ORDER BY name ASC";
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching blood banks:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/blood-requests/my", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM blood_requests WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching my blood requests:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/blood-requests", authenticateToken, async (req: any, res) => {
  try {
    const { bloodGroup, componentType, quantity, urgency, doctorName, notes } = req.body;
    const id = "req_" + crypto.randomUUID().slice(0, 8);
    await pool.query(
      `INSERT INTO blood_requests 
       (id, user_id, blood_group, component_type, quantity, urgency, status, doctor_name, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [id, req.user.id, bloodGroup, componentType, parseInt(quantity, 10) || 1, urgency || "Normal", "Pending", doctorName || "", notes || ""]
    );
    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating blood request:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/appointments/my", authenticateToken, async (req: any, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, b.name as "bloodBankName", b.phone as "bloodBankPhone", b.address as "bloodBankAddress" 
       FROM blood_appointments a 
       JOIN blood_banks b ON a.blood_bank_id = b.id 
       WHERE a.user_id = $1 
       ORDER BY a.appointment_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching my appointments:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/appointments", authenticateToken, async (req: any, res) => {
  try {
    const { bloodBankId, appointmentDate, bloodGroup, notes } = req.body;
    const id = "appt_" + crypto.randomUUID().slice(0, 8);
    await pool.query(
      `INSERT INTO blood_appointments 
       (id, user_id, blood_bank_id, appointment_date, blood_group, status, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [id, req.user.id, bloodBankId, appointmentDate, bloodGroup || "", "Scheduled", notes || ""]
    );
    
    // Reward donation points to user
    await pool.query(
      `UPDATE users SET points = points + 50 WHERE id = $1`,
      [req.user.id]
    );

    res.json({ success: true, id });
  } catch (error: any) {
    console.error("Error creating blood appointment:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// JOB APPLICATIONS ENDPOINTS
// =============================================================================
app.post("/api/job_applications", async (req, res) => {
  try {
    const { jobId, jobTitle, fullName, phone, resume } = req.body;
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO job_applications (id, "jobId", "jobTitle", "fullName", phone, resume, "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, jobId, jobTitle, fullName, phone, resume || "", new Date().toISOString()]
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error saving job application:", error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// DYNAMIC NOTIFICATIONS & TESTIMONIALS ENDPOINTS (CMS Config backed)
// =============================================================================
app.get("/api/notifications", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ notifications: parsed.notifications || [] });
    }
    res.json({ notifications: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/testimonials", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      return res.json({ testimonials: parsed.testimonials || [] });
    }
    res.json({ testimonials: [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
// STATS ENDPOINT
// =============================================================================
app.get("/api/stats", async (req, res) => {
  const cached = apiCache.get("/api/stats");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;

  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications_v2");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const sRes = await pool.query(`
      SELECT COUNT(*) FROM service_submissions_v2 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {}

  const data = {
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  };
  apiCache.set("/api/stats", { data, timestamp: Date.now() });
  res.json(data);
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

app.post("/api/upload/founder", authenticateToken, requireAdmin, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Founder image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload/broadcast", authenticateToken, requireAdmin, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Broadcast image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload/image", authenticateToken, upload.single("file"), handleUploadErrors, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = await saveFileLocally(req.file);
    res.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Generic image upload failed:", error);
    res.status(500).json({ error: error.message });
  }
});

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

const CORE_SERVICES = [
  { id: "card", category: "welfare", iconName: "ShieldCheck", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", descEn: "Apply for Foundational ID", descHi: "बुनियादी आईडी के लिए आवेदन" },
  { id: "blood", category: "urgent", iconName: "Heart", titleEn: "Blood Network", titleHi: "रक्त नेटवर्क", descEn: "Emergency Blood Donor Requests", descHi: "आपातकालीन रक्तदाता अनुरोध" },
  { id: "donations", category: "involved", iconName: "HandCoins", titleEn: "Donations", titleHi: "दान", descEn: "Support our causes directly", descHi: "हमारे कारणों का समर्थन करें" },
  { id: "grievance", category: "civic", iconName: "AlertTriangle", titleEn: "Grievances", titleHi: "शिकायतें", descEn: "Report Civic Issues", descHi: "नागरिक समस्याओं की रिपोर्ट" },
  { id: "volunteers", category: "involved", iconName: "Users", titleEn: "Volunteering", titleHi: "स्वयंसेवा", descEn: "Join the RP Force", descHi: "आरपी फोर्स से जुड़ें" },
  { id: "health-care", category: "welfare", iconName: "HeartPulse", titleEn: "Health Care", titleHi: "स्वास्थ्य सेवा", descEn: "Track health metrics & seek care", descHi: "स्वास्थ्य मापन एवं चिकित्सा" },
  // Expanding to full 21...
  { id: "education", category: "welfare", iconName: "GraduationCap", titleEn: "Education Aid", titleHi: "शिक्षा सहायता", descEn: "Scholarships and Books", descHi: "छात्रवृत्ति और किताबें" },
  { id: "women-safety", category: "urgent", iconName: "Shield", titleEn: "Women Safety", titleHi: "महिला सुरक्षा", descEn: "24/7 Helpline and support", descHi: "24/7 हेल्पलाइन" },
  { id: "environment", category: "involved", iconName: "TreePine", titleEn: "Environment", titleHi: "पर्यावरण", descEn: "Tree plantation drives", descHi: "वृक्षारोपण अभियान" },
  { id: "culture", category: "civic", iconName: "Landmark", titleEn: "Religious & Culture", titleHi: "धर्म और संस्कृति", descEn: "Festivals, sacred texts & live feeds", descHi: "त्यौहार, ग्रंथ और मंदिर लाइव" },
];

app.get("/api/public/services", (req, res) => {
  res.json({ success: true, data: CORE_SERVICES });
});

app.get("/api/public/services/:id/content", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM service_content WHERE service_id = $1`, [id]);
    
    if (result.rows.length === 0) {
      // Return a 200 with success true, but data null so the frontend handles it properly without throwing error
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/api/admin/hq/services/:id/content", async (req, res) => {
  try {
    const body = req.body || {};
    const { id } = req.params;
    const { content_en, content_hi, action_label_en, action_label_hi, action_url } = body;
    
    await pool.query(`
      INSERT INTO service_content (service_id, content_en, content_hi, action_label_en, action_label_hi, action_url, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (service_id) DO UPDATE SET 
        content_en = EXCLUDED.content_en,
        content_hi = EXCLUDED.content_hi,
        action_label_en = EXCLUDED.action_label_en,
        action_label_hi = EXCLUDED.action_label_hi,
        action_url = EXCLUDED.action_url,
        updated_at = CURRENT_TIMESTAMP
    `, [id, content_en, content_hi, action_label_en, action_label_hi, action_url]);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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



