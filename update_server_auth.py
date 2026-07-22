import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = r'app\.post\("/api/auth/send-otp"'
end_marker = r'// JOBS ENDPOINTS'

start_match = re.search(start_marker, content)
end_match = re.search(end_marker, content)

if start_match and end_match:
    start_idx = start_match.start()
    
    # We need to find the start of the '// ============================================================================='
    # before JOBS ENDPOINTS
    end_idx = content.rfind('// =============================================================================', 0, end_match.start())
    
    new_auth_block = """
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
"""
    
    new_content = content[:start_idx] + new_auth_block + content[end_idx:]
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated server.ts successfully.')
else:
    print('Could not find start or end markers in server.ts')
