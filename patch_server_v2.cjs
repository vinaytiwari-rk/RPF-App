const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Add nodemailer import
if (!serverCode.includes('import nodemailer')) {
  serverCode = serverCode.replace(
    'import multer from "multer";',
    'import multer from "multer";\nimport nodemailer from "nodemailer";'
  );
}

const authEndpoints = `
// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================
const transporter = nodemailer.createTransport({
  host: 'mail.appapi.therpfoundation.org',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: 'no-reply@appapi.therpfoundation.org',
    pass: process.env.SMTP_PASSWORD || 'your_smtp_password_here'
  }
});

app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: "Missing email or phone number" });
    
    const isEmail = identifier.includes('@');
    if (!isEmail && identifier.length !== 10) return res.status(400).json({ error: "Invalid identifier" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create otps table if not exists with expiresAt
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS otps (
        identifier VARCHAR(255) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "expiresAt" TIMESTAMP NOT NULL
      )
    \`);
    
    // Save to DB with 5-minute expiry (UPSERT)
    await pool.query(
      \`INSERT INTO otps (identifier, otp, "createdAt", "expiresAt") 
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '5 minutes') 
       ON CONFLICT (identifier) DO UPDATE SET 
       otp = EXCLUDED.otp, 
       "createdAt" = CURRENT_TIMESTAMP,
       "expiresAt" = CURRENT_TIMESTAMP + INTERVAL '5 minutes'\`,
      [identifier, otp]
    );
    
    if (isEmail) {
      await transporter.sendMail({
        from: '"RP Foundation" <no-reply@appapi.therpfoundation.org>',
        to: identifier,
        subject: "Your Jan Seva Login OTP",
        text: \`Your OTP for login is: \${otp}. It is valid for 5 minutes.\`,
        html: \`<b>Your OTP for login is: \${otp}</b><br/>It is valid for 5 minutes.\`,
      });
      console.log(\`[EMAIL MOCK] Email sent to \${identifier}\`);
    } else {
      // TODO: MSG91 API call here
      console.log(\`\n===============================\n[MSG91 MOCK] OTP for \${identifier} is: \${otp}\n===============================\n\`);
    }
    
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    const result = await pool.query('SELECT * FROM otps WHERE identifier = $1 AND otp = $2', [identifier, otp]);
    if (result.rows.length > 0) {
      const record = result.rows[0];
      const now = new Date();
      const expiresAt = new Date(record.expiresAt);
      
      if (now > expiresAt) {
        // Expired
        await pool.query('DELETE FROM otps WHERE identifier = $1', [identifier]);
        return res.status(401).json({ error: "OTP Expired" });
      }
      
      await pool.query('DELETE FROM otps WHERE identifier = $1', [identifier]);
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================================
`;

// Extract existing auth block
const startPattern = '// =============================================================================\r\n// AUTHENTICATION ENDPOINTS';
const endPattern = '// =============================================================================\r\n// JOBS ENDPOINTS';

const startIndex = serverCode.indexOf(startPattern);
const endIndex = serverCode.indexOf(endPattern);

if (startIndex !== -1 && endIndex !== -1) {
  serverCode = serverCode.substring(0, startIndex) + authEndpoints + serverCode.substring(endIndex);
}

fs.writeFileSync('server.ts', serverCode);
