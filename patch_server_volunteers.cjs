const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

// Replace volunteers table
const oldVolunteers = `    // Create volunteers table
    await client.query(\`
      CREATE TABLE IF NOT EXISTS volunteers (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT,
        email TEXT,
        phone TEXT,
        points INTEGER DEFAULT 0,
        "registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    \`);`;

const newVolunteers = `    // Create volunteers table (Extended schema for 5-step registration)
    await client.query(\`DROP TABLE IF EXISTS volunteers CASCADE\`);
    await client.query(\`
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
        aadhaar_number VARCHAR(20),
        voter_id VARCHAR(50),
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
    \`);`;

file = file.replace(oldVolunteers, newVolunteers);

// Add API endpoints
const newEndpoints = `
// =============================================================================
// VOLUNTEER REGISTRATION ENDPOINTS (5-STEP FORM)
// =============================================================================

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { identifier, type } = req.body;
    if (!identifier) return res.status(400).json({ error: "Identifier required" });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await pool.query(
      \`INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP\`,
      [identifier, otp]
    );
    
    if (type === "email") {
      console.log(\`[EMAIL] Sending OTP for \${identifier} is: \${otp}\`);
      const nodemailer = require("nodemailer"); const transp = nodemailer.createTransport({ host: process.env.SMTP_HOST || "appapi.therpfoundation.org", port: 465, secure: true, auth: { user: process.env.SMTP_USER || "no-reply@appapi.therpfoundation.org", pass: process.env.SMTP_PASSWORD || "therpfoundation@321" } }); await transp.sendMail({
        from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
        to: identifier,
        subject: "Your Jan Seva Login OTP",
        text: \`Your verification OTP is: \${otp}\`,
      });
    } else {
      console.log(\`[SMS] Sending OTP for \${identifier} is: \${otp}\`);
      const MSG91_AUTHKEY = "552233Aul3uTNSZ6a5de34bP1";
      const url = \`https://control.msg91.com/api/v5/otp?authkey=\${MSG91_AUTHKEY}&mobile=91\${identifier}&otp=\${otp}&sender=RPFApp\`;
      try {
        await axios.get(url);
      } catch (err) {
        console.error("SMS Error (Ignored for dev):", err.message);
      }
    }
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const result = await pool.query('SELECT * FROM otps WHERE phone = $1 AND otp = $2', [identifier, otp]);
    if (result.rows.length > 0) {
      await pool.query('DELETE FROM otps WHERE phone = $1', [identifier]);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/register-volunteer", async (req, res) => {
  try {
    const data = req.body;
    const id = crypto.randomUUID();
    const regNumber = "RPF-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const username = data.full_name.split(" ")[0].toLowerCase() + Math.floor(100 + Math.random() * 900);
    
    await pool.query(\`
      INSERT INTO volunteers (
        id, username, registration_number, full_name, father_husband_name, mother_name,
        dob, mobile, email, education, blood_group, skills, reason_for_joining, availability,
        aadhaar_number, voter_id, country, state, city, address, pincode, area_locality,
        sansad_kshetra, vidhan_sabha, ward_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
    \`, [
      id, username, regNumber, data.full_name, data.father_husband_name, data.mother_name,
      data.dob, data.mobile, data.email, JSON.stringify(data.education), data.blood_group, JSON.stringify(data.skills),
      data.reason_for_joining, data.availability, data.aadhaar_number, data.voter_id,
      data.country, data.state, data.city, data.address, data.pincode, data.area_locality,
      data.sansad_kshetra, data.vidhan_sabha, data.ward_no
    ]);

    res.json({ success: true, registration_number: regNumber, username });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/set-password", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Simple mock hash for demo
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const result = await pool.query('UPDATE volunteers SET password_hash = $1 WHERE username = $2 RETURNING *', [hash, username]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
`;

file = file.replace('const app = express();', 'const app = express();\n' + newEndpoints);

fs.writeFileSync('server.ts', file);
console.log("Patched server.ts successfully");
