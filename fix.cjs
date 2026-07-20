const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix /api/auth/login block
const loginRegex = /app\.post\("\/api\/auth\/login"[\s\S]*?console\.log\(`\n  ===============================/;
const fixedLogin = `app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create otps table if not exists
    await pool.query(\`
      CREATE TABLE IF NOT EXISTS otps (
        phone VARCHAR(255) PRIMARY KEY,
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
        console.log(\`
  ===============================`;

code = code.replace(loginRegex, fixedLogin);

// Also ensure we remove any ALTER COLUMN try/catch that is currently swallowing errors without actually modifying it correctly
// The one at 762 is actually fine, but let's make sure our CREATE TABLE is always VARCHAR(255) across all occurrences.
code = code.replace(/VARCHAR\(15\)/g, "VARCHAR(255)");

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts!");
