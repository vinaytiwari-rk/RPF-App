import express from 'express';
import { sendEmail } from '../lib/mailer';

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET, auditEvent } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
const RESERVED_USERNAMES = new Set(["admin", "root", "superuser", "system", "moderator", "guest", "anonymous"]);
const rpName = 'RP Foundation';
const rpID = process.env.WEBAUTHN_RP_ID?.trim() || (() => { if (process.env.NODE_ENV === 'production') console.error('CRITICAL WARNING: WEBAUTHN_RP_ID missing in production.'); return 'localhost'; })();
const originUrl = process.env.WEBAUTHN_ORIGIN?.trim() || (() => { if (process.env.NODE_ENV === 'production') console.error('CRITICAL WARNING: WEBAUTHN_ORIGIN missing in production.'); return 'http://localhost:5173'; })();
const publicAppUrl = process.env.PUBLIC_APP_URL?.trim() || (() => { if (process.env.NODE_ENV === 'production') console.error('CRITICAL WARNING: PUBLIC_APP_URL missing in production.'); return 'http://localhost:5173'; })();
const webAuthnChallengeStore = new Map();

async function ensureSessionsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`);
}

router.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    const userId = "citizen-" + Date.now();

    await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, 'citizen')`,
      [userId, name, email, phone, password_hash]
    );

    const userPayload = { id: userId, role: 'citizen', name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    await pool.query(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      ["sess-" + Date.now(), userId, token]
    );

    res.json({ success: true, token, user: userPayload });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { phone, identifier, password, role } = req.body;
    if (role === 'guest') {
      const guestId = "guest_" + Date.now() + crypto.randomBytes(3).toString('hex');
      const guestUser = { id: guestId, name: "Guest User", role: "guest" };
      const token = jwt.sign(guestUser, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ success: true, user: guestUser, token });
    }

    const finalIdentifier = identifier || phone;
    if (!finalIdentifier || !password) {
      return res.status(400).json({ success: false, error: "Missing identifier/phone or password" });
    }

    let user = null;
    let isVolunteer = false;
    let validPassword = false;

    const volResult = await pool.query(
      `SELECT * FROM volunteers WHERE mobile = $1 OR LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1) OR LOWER(registration_number) = LOWER($1)`,
      [finalIdentifier]
    );

    if (volResult.rows.length > 0) {
      user = volResult.rows[0];
      isVolunteer = true;
      if (user.password_hash) {
        if (user.password_hash.startsWith('$2')) {
          validPassword = await bcrypt.compare(password, user.password_hash);
        } else {
          const oldHash = crypto.createHash('sha256').update(password).digest('hex');
          validPassword = (oldHash === user.password_hash);
        }
      } else {
        const userResult = await pool.query(`SELECT password_hash FROM users WHERE id = $1`, [user.id]);
        if (userResult.rows.length > 0 && userResult.rows[0].password_hash) {
          validPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
        }
      }
    } else {
      const userResult = await pool.query(
        `SELECT * FROM users WHERE LOWER(email) = LOWER($1) OR phone = $1 OR LOWER(username) = LOWER($1)`,
        [finalIdentifier]
      );
      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
        if (user.password_hash) validPassword = await bcrypt.compare(password, user.password_hash);
      }
    }

    if (!user) return res.status(401).json({ success: false, error: "User not found" });
    if (!validPassword) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const userPayload = isVolunteer
      ? { id: user.id, role: "volunteer", name: user.full_name, phone: user.mobile, email: user.email }
      : { id: user.id, role: user.role || 'citizen', name: user.name, phone: user.phone, email: user.email };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    // A successful password check must not be turned into a failed login by
    // non-critical audit logging. Persist the session first, then audit
    // independently so we can identify the real failing subsystem.
    try {
      await ensureSessionsTable();
      await pool.query(
        `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
        ["sess-" + Date.now() + crypto.randomBytes(4).toString("hex"), userPayload.id, token]
      );
    } catch (sessErr: any) {
      console.error("Session persistence failed during login:", sessErr?.message, sessErr?.code);
      return res.status(503).json({ success: false, error: "Unable to create your login session. Please try again." });
    }

    try {
      await auditEvent({
        userId: user.id,
        action: "login_success",
        req,
        metadata: { role: userPayload.role, identifier: finalIdentifier }
      });
    } catch (auditErr: any) {
      // Audit failure must never block a valid user from signing in.
      console.error("Non-fatal login audit failure:", auditErr?.message, auditErr?.code);
    }

    res.json({ success: true, token, user: userPayload });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      const decoded: any = jwt.decode(token);
      if (decoded && decoded.id) {
         await auditEvent({
           userId: decoded.id,
           action: "logout",
           req
         });
      }
      await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
    }
    res.json({ success: true, message: "Logged out" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    
    // If the user is a guest or admin, do not query the normal users/volunteers tables.
    if (req.user.role === 'guest' || req.user.role === 'admin' || req.user.role === 'super_admin') {
      return res.json({ 
        success: true, 
        user: { 
          id: userId, 
          name: req.user.role === 'guest' ? "Guest User" : "System Admin", 
          role: req.user.role,
          janSevaCardStatus: "none",
          points: 0,
          badges: 0
        } 
      });
    }

    let result = await pool.query(`SELECT id, username, name, role, email, phone, avatar, cover FROM users WHERE id = $1`, [userId]);
    if (result.rows.length === 0) {
      const volResult = await pool.query(`SELECT id, username, registration_number, full_name as name, email, mobile as phone, avatar, cover FROM volunteers WHERE id = $1`, [userId]);
      if (volResult.rows.length === 0) return res.status(404).json({ success: false, error: "User not found" });
      const vol = volResult.rows[0];
      return res.json({ success: true, user: { ...vol, role: "volunteer", isVolunteer: true, volunteerData: vol } });
    }
    const user = result.rows[0];
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

router.post("/api/auth/profile/update", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;
    await pool.query(`UPDATE users SET name = $1, avatar = $2 WHERE id = $3`, [name, avatar, userId]);
    await pool.query(`UPDATE volunteers SET full_name = $1, avatar = $2 WHERE id = $3`, [name, avatar, userId]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/api/auth/check-username", async (req, res) => {
  try {
    const usernameRaw = (req.query.username as string || "").trim();
    const username = usernameRaw.toLowerCase();
    if (!username) return res.status(400).json({ available: false, error: "Username is required" });
    if (!USERNAME_REGEX.test(username)) return res.status(200).json({ available: false, error: "Use 3-20 letters, numbers, . or _, starting with a letter" });
    if (RESERVED_USERNAMES.has(username)) return res.json({ available: false, error: "This username is reserved" });

    const volResult = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [username]);
    const userResult = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [username]);
    res.json({ available: volResult.rows.length === 0 && userResult.rows.length === 0 });
  } catch (err: any) {
    console.error("Check Username Error:", err);
    res.status(500).json({ available: false, error: `DB Error: ${err.message}` });
  }
});

router.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;
    if (!data.full_name || !data.full_name.trim()) return res.status(400).json({ error: "Full name is required." });
    if (!data.mobile || !data.mobile.trim()) return res.status(400).json({ error: "Mobile number is required." });
    if (!data.password || data.password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    let usernameRaw = (data.username || "").trim().toLowerCase();
    if (!usernameRaw) usernameRaw = (data.mobile || "").trim().toLowerCase();
    if (!usernameRaw) return res.status(400).json({ error: "Please choose a username or provide a mobile number." });
    const isPhone = /^[0-9+]{10,15}$/.test(usernameRaw);
    if (!isPhone && !USERNAME_REGEX.test(usernameRaw)) return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, . or _), starting with a letter." });
    if (RESERVED_USERNAMES.has(usernameRaw)) return res.status(400).json({ error: "This username is reserved. Please choose another." });

    const volCheck = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [usernameRaw]);
    const userCheck = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [usernameRaw]);
    if (volCheck.rows.length > 0 || userCheck.rows.length > 0) return res.status(409).json({ error: "This username is already in use. Please choose another." });

    const id = crypto.randomUUID();
    const yearStr = new Date().getFullYear().toString().slice(-2);
    const randomNum = crypto.randomInt(1000, 10000);
    const regNumber = `RPF/VOL/${yearStr}/${randomNum}`;
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
      if (constraint.includes('username')) return res.status(409).json({ error: "This username is already in use. Please choose another." });
      if (constraint.includes('mobile')) return res.status(409).json({ error: "This mobile number is already registered." });
      if (constraint.includes('email')) return res.status(409).json({ error: "This email is already registered." });
      return res.status(409).json({ error: "Some of your details are already registered." });
    }
    if (err.code === '22007' || err.code === '22008') return res.status(400).json({ error: "Date of birth is invalid. Please re-select it." });
    res.status(500).json({ error: err.message || "Registration failed. Please try again." });
  }
});


router.post("/api/auth/reset-ticket", async (req, res) => {
  try {
    const { identifier } = req.body;
    await pool.query(`INSERT INTO admin_reset_tickets (identifier) VALUES ($1)`, [identifier]);
    res.json({ success: true, message: "Admin reset ticket created" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/auth/webauthn/register-options', async (req, res) => {
  try {
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/api/auth/webauthn/register-verify', async (req, res) => {
  const { userId, response } = req.body;
  const expectedChallenge = webAuthnChallengeStore.get(userId);
  if (!expectedChallenge) return res.status(400).json({error: "Challenge expired"});
  try {
    const verification = await verifyRegistrationResponse({ response, expectedChallenge, expectedOrigin: originUrl, expectedRPID: rpID });
    if (verification.verified && verification.registrationInfo) {
      const { id: credentialID, publicKey: credentialPublicKey, counter } = verification.registrationInfo.credential;
      const base64CredID = Buffer.from(credentialID).toString('base64');
      const base64PubKey = Buffer.from(credentialPublicKey).toString('base64');
      await pool.query(`INSERT INTO passkeys ("credentialID", "publicKey", counter, "userId") VALUES ($1, $2, $3, $4)`, [base64CredID, base64PubKey, counter, userId]);
      webAuthnChallengeStore.delete(userId);
      res.json({ success: true });
    } else res.status(400).json({ error: "Verification failed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/api/auth/webauthn/login-options', async (req, res) => {
  const { identifier } = req.body;
  const userResult = await pool.query(`SELECT id FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`, [identifier]);
  if (userResult.rows.length === 0) return res.status(404).json({error: "User not found"});
  const userId = userResult.rows[0].id;
  const passkeysResult = await pool.query(`SELECT "credentialID" FROM passkeys WHERE "userId" = $1`, [userId]);
  const allowCredentials = passkeysResult.rows.map((row: any) => ({ id: row.credentialID, type: 'public-key' as const, transports: ['internal', 'hybrid'] as AuthenticatorTransport[] }));
  const options = await generateAuthenticationOptions({ rpID, allowCredentials, userVerification: 'preferred' });
  webAuthnChallengeStore.set(userId, options.challenge);
  res.json({ options, userId });
});

router.post('/api/auth/webauthn/login-verify', async (req, res) => {
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
      credential: { id: passkey.credentialID, publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')), counter: Number(passkey.counter) },
    });
    if (verification.verified) {
      await pool.query(`UPDATE passkeys SET counter = $1 WHERE "credentialID" = $2`, [verification.authenticationInfo.newCounter, passkey.credentialID]);
      webAuthnChallengeStore.delete(userId);
      const userResult = await pool.query(`SELECT * FROM volunteers WHERE id = $1`, [userId]);
      const user = userResult.rows[0];
      res.json({ success: true, user: { id: user.id, name: user.full_name, phone: user.mobile, email: user.email, role: "volunteer" } });
    } else res.status(400).json({ error: "Verification failed" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/api/auth/login-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) return res.status(400).json({ error: "Invalid email" });

    const otp = crypto.randomInt(100000, 1000000).toString();
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

    await sendEmail({
      to: email,
      subject: "Your Jan Seva Login OTP",
      text: `Your OTP for RP Foundation Jan Seva is: ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">${otp}</span></b><br/><p>It is valid for 10 minutes.</p>`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err: any) {
    console.error("Email send error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/auth/verify", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: "Phone/email and OTP are required" });

    const result = await pool.query(
      `SELECT * FROM otps WHERE phone = $1 AND otp = $2 AND "createdAt" >= NOW() - INTERVAL '10 minutes'`,
      [phone, otp]
    );

    if (result.rows.length > 0) {
      await pool.query('DELETE FROM otps WHERE phone = $1', [phone]);
      return res.json({ success: true });
    }

    await pool.query('DELETE FROM otps WHERE phone = $1 AND "createdAt" < NOW() - INTERVAL \'10 minutes\'', [phone]);
    res.status(401).json({ error: "Invalid or expired OTP" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
