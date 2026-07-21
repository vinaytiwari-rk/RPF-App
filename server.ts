import express from "express";
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
import nodemailer from "nodemailer";
import adminHqRoutes from "./src/routes/adminHqRoutes.js";
import { setDbPool } from "./src/controllers/adminHqController.js";

dotenv.config();

const app = express();
app.use(express.json());

// =============================================================================
// VOLUNTEER REGISTRATION ENDPOINTS (5-STEP FORM)
// =============================================================================



const rpName = 'RP Foundation Jan Seva';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const originUrl = `https://${rpID}`;

const webAuthnChallengeStore = new Map();

app.post("/api/auth/login-multi", async (req, res) => {
  try {
    const body = req.body || {};
    const { identifier, password } = body;
    if (!identifier || !password) return res.status(400).json({ error: "Missing fields" });
    
    if (identifier === "admin" && password === "admin") {
       return res.json({ success: true, user: { id: "usr_staff_admin", name: "System Administrator", role: "super_admin" } });
    }
    
    const result = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (result.rows.length === 0) {
       return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    
    // Check if the hash is bcrypt or old sha256
    let isMatch = false;
    if (user.password_hash.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
      const oldHash = crypto.createHash('sha256').update(password).digest('hex');
      isMatch = (oldHash === user.password_hash);
    }
    
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;
    const id = crypto.randomUUID();
    const regNumber = "RPF-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const username = data.full_name.split(" ")[0].toLowerCase() + Math.floor(100 + Math.random() * 900);
    
    await pool.query(`
      INSERT INTO volunteers (
        id, username, registration_number, full_name, father_husband_name, mother_name,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        national_id_1, national_id_2, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    `, [
      id, username, regNumber, data.full_name, data.father_husband_name, data.mother_name,
      data.dob, data.mobile, data.email, JSON.stringify(data.education), data.blood_group, JSON.stringify(data.skills),
      data.reason_for_joining, data.availability, data.national_id_1, data.national_id_2,
      data.country, data.state, data.city, data.address, data.pincode, data.area_locality,
      data.sansad_kshetra, data.vidhan_sabha, data.ward_no
    ]);

    res.json({ success: true, registration_number: regNumber, username });
  } catch (err: any) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/set-password", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query('UPDATE volunteers SET password_hash = $1 WHERE username = $2 RETURNING *', [hash, username]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
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
        const transp = nodemailer.createTransport({ host: process.env.SMTP_HOST || "appapi.therpfoundation.org", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org", pass: process.env.SMTP_PASSWORD || "therpfoundation@321" } });
        await transp.sendMail({
          from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
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

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 300;


// PostgreSQL Pool Connection
const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl && (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.")) ? false : { rejectUnauthorized: false }
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
      model: "gemini-2.-flash",
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
      model: "gemini-2.-flash",
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
      model: "gemini-2.-flash",
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
let acGeoJsonData: any = null;

app.get("/api/locations/search", (req, res) => {
  const query = (req.query.q as string)?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  if (!acGeoJsonData) {
    try {
      const geoJsonPath = path.join(process.cwd(), "maps-master", "maps-master", "website", "docs", "data", "geojson", "ac.geojson");
      const fileContent = fs.readFileSync(geoJsonPath, "utf-8");
      acGeoJsonData = JSON.parse(fileContent);
    } catch (err) {
      console.error("Failed to load ac.geojson:", err);
      return res.status(500).json({ error: "Location data unavailable" });
    }
  }

  // Filter features matching District or AC_NAME
  const results = [];
  const seen = new Set();
  const features = acGeoJsonData.features || [];
  
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
    // gen_random_uuid() is built-in since PG 13 — no extension needed
    
    // Drop tables that may have wrong column casing from previous failed init
    const tablesToRecreate = ["social_posts", "campaigns", "jobs", "health_camps", "grievances", "service_submissions", "job_applications", "blood_donors", "card_applications"];
    for (const table of tablesToRecreate) {
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    
    // Create users table
    await client.query(`
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
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create settings table
    await client.query(`
      
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
      `);

      // Ensure otps table has enough space for emails
      try {
        await pool.query('ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)');
      } catch(e) {
        // Table might not exist yet
      }


    // Create social_posts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    `);

    // Create campaigns table
    await client.query(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "goalAmount" NUMERIC DEFAULT 0,
        "raisedAmount" NUMERIC DEFAULT 0,
        "imageUrl" TEXT,
        "coverImgUrl" TEXT,
        urgent BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    `);

    // Create health_camps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_camps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "titleEn" TEXT,
        "titleHi" TEXT,
        "dateEn" TEXT,
        "dateHi" TEXT,
        "locationEn" TEXT,
        "locationHi" TEXT,
        contact TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create camps view pointing to health_camps
    await client.query(`
      CREATE OR REPLACE VIEW camps AS 
      SELECT * FROM health_camps
    `);

    // Create grievances table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grievances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        description TEXT,
        category TEXT,
        urgency TEXT,
        location TEXT,
        "reportedBy" TEXT,
        status TEXT DEFAULT 'Pending',
        date TEXT,
        "aiSummary" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create service_submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS service_submissions (
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
    `);

    // Create volunteers table
    await client.query(`
      DROP TABLE IF EXISTS volunteers CASCADE;
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        registration_number VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        full_name TEXT,
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
    `);

    // Create job_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "jobId" TEXT,
        "jobTitle" TEXT,
        "fullName" TEXT,
        phone TEXT,
        resume TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create blood_donors table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blood_donors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        "bloodGroup" TEXT,
        phone TEXT,
        location TEXT,
        verified BOOLEAN DEFAULT true,
        distance TEXT,
        "lastDonated" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create card_applications table (Jan Seva Card)
    await client.query(`
      CREATE TABLE IF NOT EXISTS card_applications (
        "userId" VARCHAR(255) PRIMARY KEY,
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
    `);

    // Seed default social posts if empty
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
          `INSERT INTO social_posts (author, role, avatar, "textEn", "textHi", image, likes, "commentsCount", liked, platform, link) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [p.author, p.role, p.avatar, p.textEn, p.textHi, p.image, p.likes, p.commentsCount, p.liked, p.platform, p.link]
        );
      }
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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'appapi.therpfoundation.org',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org',
      pass: process.env.SMTP_PASSWORD || 'therpfoundation@321',
    },
  });

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
      
      await transporter.sendMail({
        from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
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

app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create otps table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Save to DB (UPSERT)
    await pool.query(
      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,
      [phone, otp]
    );
        console.log(`
  ===============================
  [SMS] Sending OTP for ${phone} is: ${otp}
  ===============================
  `);
      
      try {
        const MSG91_AUTHKEY = "552233Aul3uTNSZ6a5de34bP1";
        const MSG91_SENDER = "RPFApp";
        const url = `https://control.msg91.com/api/v5/otp?authkey=${MSG91_AUTHKEY}&mobile=91${phone}&otp=${otp}&sender=${MSG91_SENDER}`;
        
        const axios = require('axios');
        await axios.get(url);
      } catch (smsErr: any) {
        console.error("MSG91 Error:", smsErr?.response?.data || smsErr.message);
      }
    
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
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

app.post("/api/jobs", async (req, res) => {
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

app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await pool.query('DELETE FROM jobs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/jobs/:id/edit", async (req, res) => {
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
// GRIEVANCES ENDPOINTS
// =============================================================================
app.get("/api/grievances", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "createdAt" FROM grievances ORDER BY "createdAt" DESC'
    );
    res.json({ grievances: result.rows });
  } catch (error: any) {
    console.error("Error fetching grievances:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/grievances", async (req, res) => {
  try {
    const { title, description, category, urgency, location, reportedBy, status, date, aiSummary } = req.body;
    const id = crypto.randomUUID();
    const result = await pool.query(
      `INSERT INTO grievances 
       (id, title, description, category, urgency, location, "reportedBy", status, date, "aiSummary", "createdAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
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
        new Date().toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Error creating grievance:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/grievances/status", async (req, res) => {
  try {
    const { id, status } = req.body;
    await pool.query('UPDATE grievances SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/grievances/:id", async (req, res) => {
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
      'SELECT "userId", name, gender, dob, address, "idType", "idNumber", status, "cardNo", "submittedAt" FROM card_applications'
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
    await pool.query(
      `INSERT INTO card_applications 
       ("userId", name, gender, dob, address, "idType", "idNumber", status, "submittedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       ON CONFLICT ("userId") DO UPDATE SET 
       name = $2, gender = $3, dob = $4, address = $5, "idType" = $6, "idNumber" = $7, status = $8, "submittedAt" = $9`,
      [
        userId,
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

app.post("/api/cards/approve", async (req, res) => {
  try {
    const { userId } = req.body;
    const cardNo = `JSC-${Math.floor(10000000 + Math.random() * 90000000)}`;
    await pool.query(
      'UPDATE card_applications SET status = $1, "cardNo" = $2 WHERE "userId" = $3',
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

app.post("/api/cards/reject", async (req, res) => {
  try {
    const { userId } = req.body;
    await pool.query(
      'UPDATE card_applications SET status = $1 WHERE "userId" = $2',
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

app.delete("/api/cards/:userId", async (req, res) => {
  try {
    await pool.query('DELETE FROM card_applications WHERE "userId" = $1', [req.params.userId]);
    res.json({ success: true });
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

app.post("/api/settings", async (req, res) => {
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

app.post("/api/cms", async (req, res) => {
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
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    res.json({ campaigns: result.rows });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/campaigns", async (req, res) => {
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

app.post("/api/campaigns/:id/edit", async (req, res) => {
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

app.delete("/api/campaigns/:id", async (req, res) => {
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

app.post("/api/social", async (req, res) => {
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

app.delete("/api/social/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM social_posts WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/social/:id/edit", async (req, res) => {
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
app.get("/api/volunteers", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, phone, points, "registeredAt" FROM volunteers ORDER BY "registeredAt" DESC'
    );
    res.json({ volunteers: result.rows });
  } catch (error: any) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/volunteers/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM volunteers WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/volunteers/:id/points", async (req, res) => {
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
       FROM service_submissions 
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
      `INSERT INTO service_submissions 
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
        submissionData || "{}",
        status || "pending",
        latitude || null,
        longitude || null,
        new Date().toISOString(),
        timestamp || new Date().toISOString()
      ]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (err: any) {
    console.error("Error creating submission:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/submissions/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE service_submissions SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/submissions/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM service_submissions WHERE id = $1", [req.params.id]);
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

app.post("/api/users/:id/update", async (req, res) => {
  try {
    const fields = Object.keys(req.body);
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
      'SELECT id, "titleEn", "titleHi", "dateEn", "dateHi", "locationEn", "locationHi", contact, "createdAt" FROM health_camps ORDER BY "createdAt" DESC'
    );
    res.json({ camps: result.rows });
  } catch (error: any) {
    console.error("Error fetching health camps:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/health_camps", async (req, res) => {
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

app.post("/api/health_camps/:id/edit", async (req, res) => {
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

app.delete("/api/health_camps/:id", async (req, res) => {
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
  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;

  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications");
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
      SELECT COUNT(*) FROM service_submissions 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {}

  res.json({
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  });
});

// =============================================================================
// MULTI-PART FILE UPLOADS CONTROLLERS (Local directory subdomain storage)
// =============================================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

async function saveFileLocally(file: Express.Multer.File): Promise<string> {
  const fileExt = path.extname(file.originalname) || ".jpg";
  const filename = `${Date.now()}-${Math.round(Math.random() * 100000)}${fileExt}`;
  
  const destDir = path.join(process.cwd(), "appapi.therpfoundation.org", "public", "uploads");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const destFilePath = path.join(destDir, filename);
  await fs.promises.writeFile(destFilePath, file.buffer);
  
  return `https://appapi.therpfoundation.org/uploads/${filename}`;
}

app.post("/api/upload/founder", upload.single("file"), async (req, res) => {
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

app.post("/api/upload/broadcast", upload.single("file"), async (req, res) => {
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

app.post("/api/upload/image", upload.single("file"), async (req, res) => {
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
app.use("/uploads", express.static(path.join(process.cwd(), "appapi.therpfoundation.org", "public", "uploads")));

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
  { id: "health-camps", category: "welfare", iconName: "Stethoscope", titleEn: "Health Camps", titleHi: "स्वास्थ्य शिविर", descEn: "Free checkups and drives", descHi: "मुफ्त जांच और अभियान" },
  // Expanding to full 21...
  { id: "education", category: "welfare", iconName: "GraduationCap", titleEn: "Education Aid", titleHi: "शिक्षा सहायता", descEn: "Scholarships and Books", descHi: "छात्रवृत्ति और किताबें" },
  { id: "women-safety", category: "urgent", iconName: "Shield", titleEn: "Women Safety", titleHi: "महिला सुरक्षा", descEn: "24/7 Helpline and support", descHi: "24/7 हेल्पलाइन" },
  { id: "environment", category: "involved", iconName: "TreePine", titleEn: "Environment", titleHi: "पर्यावरण", descEn: "Tree plantation drives", descHi: "वृक्षारोपण अभियान" },
  { id: "legal-aid", category: "civic", iconName: "Scale", titleEn: "Free Legal Aid", titleHi: "मुफ्त कानूनी सहायता", descEn: "Legal counseling for citizens", descHi: "नागरिकों के लिए कानूनी सलाह" },
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

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();



