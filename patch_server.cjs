const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const authEndpoints = `
// =============================================================================
// AUTHENTICATION ENDPOINTS
// =============================================================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create otps table if not exists
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(15) PRIMARY KEY,
        otp VARCHAR(10) NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);
    
    // Save to DB (UPSERT)
    await pool.query(
      \`INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP\`,
      [phone, otp]
    );
    
    // TODO: Integrate actual SMS Gateway here.
    console.log(\`\n===============================\n[SMS MOCK] OTP for \${phone} is: \${otp}\n===============================\n\`);
    
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
`;

if (!serverCode.includes('/api/auth/login')) {
  serverCode = serverCode.replace('// =============================================================================\r\n// JOBS ENDPOINTS', authEndpoints + '// JOBS ENDPOINTS');
}

// Fix AI Mock Fallback
serverCode = serverCode.replace(
  /if \(\!apiKey \|\| apiKey === "MOCK_KEY"\) \{\s*\/\/\s*Fallback Mock categorization if key is not declared\s*return res\.json\(\{.*\}\);\s*\}/,
  `if (!apiKey || apiKey === "MOCK_KEY") {
    return res.status(503).json({ error: "AI Services are currently unavailable due to missing API configuration." });
  }`
);

fs.writeFileSync('server.ts', serverCode);
