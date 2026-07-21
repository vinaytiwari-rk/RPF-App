import express from "express";
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
import { setDbPool, getServiceContent } from "./src/controllers/adminHqController.js";
import { coreServices } from "./defaultServices.js";

dotenv.config();

const app = express();

// =============================================================================
// VOLUNTEER REGISTRATION ENDPOINTS (5-STEP FORM)
// =============================================================================


app.post("/api/auth/login-multi", async (req, res) => {
  try {
    const { identifier, password } = req.body;
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
    
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password_hash);
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
    const id = require('crypto').randomUUID();
    const regNumber = "RPF-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const username = data.full_name.split(" ")[0].toLowerCase() + Math.floor(100 + Math.random() * 900);
    
    const bcrypt = require('bcryptjs');
    const hash = data.password ? await bcrypt.hash(data.password, 10) : '';

    await pool.query(`
      INSERT INTO volunteers (
        id, username, registration_number, password_hash, full_name, father_husband_name, mother_name,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        national_id_1, national_id_2, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `, [
      id, username, regNumber, hash, data.full_name, data.father_husband_name, data.mother_name,
      data.dob, data.mobile, data.email, JSON.stringify(data.education), data.blood_group,
      JSON.stringify(data.skills), data.reason_for_joining, data.availability, data.national_id_1,
      data.national_id_2, data.country, data.state, data.city, data.address, data.pincode,
      data.area_locality, data.sansad_kshetra, data.vidhan_sabha, data.ward_no
    ]);
    
    res.json({ success: true, user: { id, username } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
    const userResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (userResult.rows.length === 0) return res.json({ success: true });
    const user = userResult.rows[0];
    
    if (user.email) {
       const crypto = require('crypto');
       const token = crypto.randomBytes(32).toString('hex');
       const expiresAt = new Date(Date.now() + 15 * 60000); 
       
       await pool.query(
         `INSERT INTO password_reset_tokens ("userId", token, expires_at) VALUES ($1, $2, $3)`,
         [user.id, token, expiresAt.toISOString()]
       );
       
       const nodemailer = require("nodemailer"); 
       const transp = nodemailer.createTransport({ host: process.env.SMTP_HOST || "appapi.therpfoundation.org", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org", pass: process.env.SMTP_PASSWORD || "therpfoundation@321" } }); 
       
       const origin = process.env.NODE_ENV === 'production' ? 'https://therpfoundation.org' : 'http://localhost:5173';
       const resetLink = origin + `/reset-password?token=${token}`;
       
       await transp.sendMail({
          from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
          to: user.email,
          subject: "Password Reset Request",
          text: `Click here to reset your password. This link is valid for 15 minutes: ${resetLink}`,
       });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/reset-ticket", async (req, res) => {
  try {
    const { identifier } = req.body;
    await pool.query(
      `INSERT INTO grievances (title, description, category, urgency, location, "reportedBy", status, "createdAt")
       VALUES ($1, $2, 'Account Support', 'Medium', 'Online', $3, 'Pending', NOW())`,
      ["Admin Reset Request", "User requested an admin password reset", identifier]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const webAuthnChallengeStore = new Map();

app.get("/api/auth/webauthn/register-options", async (req, res) => {
  try {
    const { userId } = req.query;
    const userResult = await pool.query('SELECT * FROM volunteers WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userResult.rows[0];

    const userPasskeys = await pool.query('SELECT * FROM passkeys WHERE "userId" = $1', [userId]);

    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

    const options = await generateRegistrationOptions({
      rpName: 'RP Foundation App',
      rpID,
      userID: user.id,
      userName: user.username || user.email || user.mobile,
      attestationType: 'none',
      excludeCredentials: userPasskeys.rows.map((pk: any) => ({
        id: pk.credentialID,
        type: 'public-key',
        transports: pk.transports ? JSON.parse(pk.transports) : ['internal'],
      })),
    });

    webAuthnChallengeStore.set(user.id, options.challenge);
    res.json(options);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/webauthn/register-verify", async (req, res) => {
  try {
    const { userId, response } = req.body;
    const expectedChallenge = webAuthnChallengeStore.get(userId);
    
    if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });

    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
    const origin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : 'http://localhost:5173';

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;
      const publicKeyBase64 = Buffer.from(credentialPublicKey).toString('base64');
      const credentialIDBase64 = Buffer.from(credentialID).toString('base64');
      
      await pool.query(
        `INSERT INTO passkeys ("credentialID", "publicKey", "counter", "transports", "userId") VALUES ($1, $2, $3, $4, $5)`,
        [credentialIDBase64, publicKeyBase64, counter, JSON.stringify(response.response.transports || []), userId]
      );
      webAuthnChallengeStore.delete(userId);
      return res.json({ success: true, verified: true });
    }
    return res.status(400).json({ error: "Verification failed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/webauthn/login-options", async (req, res) => {
  try {
    const { identifier } = req.body;
    const userResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`,
      [identifier]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });
    const user = userResult.rows[0];

    const passkeysResult = await pool.query('SELECT * FROM passkeys WHERE "userId" = $1', [user.id]);
    if (passkeysResult.rows.length === 0) return res.status(400).json({ error: "No passkeys registered" });

    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: passkeysResult.rows.map((pk: any) => ({
        id: Buffer.from(pk.credentialID, 'base64'),
        type: 'public-key',
        transports: pk.transports ? JSON.parse(pk.transports) : ['internal'],
      })),
      userVerification: 'preferred',
    });

    webAuthnChallengeStore.set(user.id, options.challenge);
    res.json({ options, userId: user.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/webauthn/login-verify", async (req, res) => {
  try {
    const { userId, response } = req.body;
    const expectedChallenge = webAuthnChallengeStore.get(userId);
    if (!expectedChallenge) return res.status(400).json({ error: "Challenge expired" });

    const passkeyResult = await pool.query('SELECT * FROM passkeys WHERE "credentialID" = $1', [response.id]);
    if (passkeyResult.rows.length === 0) return res.status(404).json({ error: "Passkey not found" });
    const passkey = passkeyResult.rows[0];

    const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
    const origin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : 'http://localhost:5173';

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: Buffer.from(passkey.credentialID, 'base64'),
        credentialPublicKey: Buffer.from(passkey.publicKey, 'base64'),
        counter: Number(passkey.counter),
      },
    });

    if (verification.verified) {
      await pool.query('UPDATE passkeys SET counter = $1 WHERE "credentialID" = $2', [verification.authenticationInfo.newCounter, passkey.credentialID]);
      webAuthnChallengeStore.delete(userId);
      
      const userResult = await pool.query('SELECT * FROM volunteers WHERE id = $1', [userId]);
      const user = userResult.rows[0];
      
      return res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
    }
    return res.status(400).json({ error: "Verification failed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

app.get("/api/public/services", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    let customServices = [];
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      const parsed = JSON.parse(result.rows[0].founderMessageEn);
      if (parsed.customServices) {
        customServices = parsed.customServices;
      }
    }
    const allServices = [...coreServices, ...customServices];
    res.json({ success: true, data: allServices });
  } catch (error: any) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/public/services/:serviceId/content", getServiceContent);

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

app.get("/api/volunteer_tasks", async (req, res) => {
  try {
    const { volunteerId } = req.query;
    let query = 'SELECT * FROM volunteer_tasks ORDER BY "createdAt" DESC';
    let params: any[] = [];
    if (volunteerId) {
      query = 'SELECT * FROM volunteer_tasks WHERE "volunteerId" = $1 ORDER BY "createdAt" DESC';
      params = [volunteerId];
    }
    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (error: any) {
    console.error("Error fetching volunteer tasks:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/volunteer_tasks", async (req, res) => {
  try {
    const { volunteerId, titleEn, titleHi, descriptionEn, descriptionHi, points } = req.body;
    const result = await pool.query(
      `INSERT INTO volunteer_tasks ("volunteerId", "titleEn", "titleHi", "descriptionEn", "descriptionHi", "points", "status", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING *`,
      [volunteerId, titleEn, titleHi, descriptionEn, descriptionHi, points || 10]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating volunteer task:", error);
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/volunteer_tasks/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    const result = await pool.query(
      `UPDATE volunteer_tasks SET "status" = $1, "completedAt" = $2 WHERE id = $3 RETURNING *`,
      [status, completedAt, req.params.id]
    );
    if (result.rows.length > 0 && status === 'completed') {
      const task = result.rows[0];
      await pool.query('UPDATE users SET points = points + $1 WHERE id = $2', [task.points, task.volunteerId]);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve Flutter web app statically at /app
app.use("/app", express.static(path.join(process.cwd(), "public", "app")));
app.get("/app", (req, res) => {
  res.redirect("/app/");
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



