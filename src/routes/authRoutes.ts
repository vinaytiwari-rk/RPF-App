import express from 'express';
import { sendEmail } from '../lib/mailer';

import { pool } from '../db/dbPool.js';
import { authenticateToken, requireAdmin, authorizeRole, JWT_SECRET } from '../db/middleware.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

router.get("/api/auth/fix-db", async (req, res) => {
  try {
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
    await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT \'pending\'');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
    res.send("<h1>Database Patched Successfully!</h1><p>You can now go back and register volunteers.</p>");
  } catch (err: any) {
    res.status(500).send("Error patching db: " + err.message);
  }
});

router.get("/api/auth/debug-db", async (req, res) => {
  try {
    let result: any = {};
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
      result.users_alter = "Success";
    } catch(e:any) {
      result.users_alter_error = e.message;
    }
    
    try {
      await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
      result.vol_alter = "Success";
    } catch(e:any) {
      result.vol_alter_error = e.message;
    }

    try {
      const vol = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['volunteers']);
      result.vol_columns = vol.rows;
      const usr = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1', ['users']);
      result.usr_columns = usr.rows;
    } catch(e:any) {
      result.schema_error = e.message;
    }
    
    res.json({ success: true, result });
  } catch (err: any) {
    res.json({ success: false, code: err.code, message: err.message, stack: err.stack });
  }
});


const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_.]{2,19}$/;
const RESERVED_USERNAMES = new Set(["admin", "root", "superuser", "system", "moderator", "guest", "anonymous"]);
const rpName = 'RP Foundation';
const rpID = 'localhost'; // Should use env var in prod
const originUrl = 'http://localhost:5173';
const webAuthnChallengeStore = new Map();




router.post("/api/auth/register", async (req, res) => {
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

router.post("/api/auth/login", async (req, res) => {
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

router.post("/api/auth/logout", async (req, res) => {
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

router.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    let result = await pool.query(`SELECT id, username, name, role, email, phone, points, badges, avatar, cover FROM users WHERE id = $1`, [userId]);
      
    if (result.rows.length === 0) {
      // Check volunteers table
      const volResult = await pool.query(`SELECT id, username, registration_number, full_name as name, email, mobile as phone, avatar, cover FROM volunteers WHERE id = $1`, [userId]);
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

router.post("/api/auth/profile/update", authenticateToken, async (req: any, res: any) => {
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

router.get("/api/auth/check-username", async (req, res) => {
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

    let volResult = { rows: [] as any[] };
    let userResult = { rows: [] as any[] };

    try {
      volResult = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [username]);
    } catch (e: any) {
      if (e.code === '42703' || e.message.includes('column "username" does not exist')) {
        await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
        volResult = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [username]);
      } else {
        throw e;
      }
    }

    try {
      userResult = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [username]);
    } catch (e: any) {
      if (e.code === '42703' || e.message.includes('column "username" does not exist')) {
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
          userResult = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [username]);
        } catch (alterErr: any) {
          console.warn("Could not patch users table, skipping user check:", alterErr.message);
        }
      } else {
        throw e;
      }
    }

    const available = volResult.rows.length === 0 && userResult.rows.length === 0;
    res.json({ available });
  } catch (err: any) {
    console.error("Check Username Error:", err);
    res.status(500).json({ available: false, error: "Could not check username right now" });
  }
});

router.post("/api/auth/register-volunteer", async (req, res) => {
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

    let usernameRaw = (data.username || "").trim().toLowerCase();
    if (!usernameRaw) {
      usernameRaw = (data.mobile || "").trim().toLowerCase();
    }
    if (!usernameRaw) {
      return res.status(400).json({ error: "Please choose a username or provide a mobile number." });
    }
    const isPhone = /^[0-9+]{10,15}$/.test(usernameRaw);
    if (!isPhone && !USERNAME_REGEX.test(usernameRaw)) {
      return res.status(400).json({ error: "Username must be 3-20 characters (letters, numbers, . or _), starting with a letter." });
    }
    if (RESERVED_USERNAMES.has(usernameRaw)) {
      return res.status(400).json({ error: "This username is reserved. Please choose another." });
    }

    let volCheck = { rows: [] as any[] };
    let userCheck = { rows: [] as any[] };

    try {
      volCheck = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [usernameRaw]);
    } catch (e: any) {
      if (e.code === '42703' || e.message.includes('column "username" does not exist')) {
        await pool.query('ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
        volCheck = await pool.query(`SELECT id FROM volunteers WHERE LOWER(username) = $1`, [usernameRaw]);
      } else {
        throw e;
      }
    }

    try {
      userCheck = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [usernameRaw]);
    } catch (e: any) {
      if (e.code === '42703' || e.message.includes('column "username" does not exist')) {
        try {
          await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE');
          userCheck = await pool.query(`SELECT id FROM users WHERE LOWER(username) = $1`, [usernameRaw]);
        } catch (alterErr: any) {
          console.warn("Could not patch users table, skipping user check:", alterErr.message);
        }
      } else {
        throw e;
      }
    }
    if (volCheck.rows.length > 0 || userCheck.rows.length > 0) {
      return res.status(409).json({ error: "This username is already in use. Please choose another." });
    }

    const id = crypto.randomUUID();
    const yearStr = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
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

router.post("/api/auth/set-password", async (req, res) => {
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

router.post("/api/auth/forgot-password", async (req, res) => {
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

router.post("/api/auth/reset-ticket", async (req, res) => {
  res.json({ success: true, message: "Admin reset ticket created" });
});

router.get('/api/auth/webauthn/register-options', async (req, res) => {
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

router.post('/api/auth/webauthn/register-verify', async (req, res) => {
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
      const { id: credentialID, publicKey: credentialPublicKey, counter } = verification.registrationInfo.credential;
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

router.post('/api/auth/webauthn/login-options', async (req, res) => {
  const { identifier } = req.body;
  const userResult = await pool.query(`SELECT id FROM volunteers WHERE mobile = $1 OR email = $1 OR username = $1`, [identifier]);
  if (userResult.rows.length === 0) return res.status(404).json({error: "User not found"});
  const userId = userResult.rows[0].id;
  
  const passkeysResult = await pool.query(`SELECT "credentialID" FROM passkeys WHERE "userId" = $1`, [userId]);
  const allowCredentials = passkeysResult.rows.map((row: any) => ({
    id: row.credentialID,
    type: 'public-key' as const,
    transports: ['internal', 'hybrid'] as AuthenticatorTransport[],
  }));
  
  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: 'preferred',
  });
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
      credential: {
        id: passkey.credentialID,
        publicKey: new Uint8Array(Buffer.from(passkey.publicKey, 'base64')),
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

router.post("/api/auth/login-email", async (req, res) => {
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

router.post("/api/auth/verify", async (req, res) => {
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

export default router;
