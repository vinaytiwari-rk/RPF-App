const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLoginStart = 'app.post("/api/auth/login", async (req, res) => {\n  try {\n    const { phone } = req.body;\n    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });\n    \n    // Save to DB (UPSERT)\n    await pool.query(\n      `INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) \n       ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP`,\n      [phone, otp]\n    );';

const newLoginStart = `app.post("/api/auth/login", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length !== 10) return res.status(400).json({ error: "Invalid phone number" });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
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
    );`;

code = code.replace(oldLoginStart, newLoginStart);
fs.writeFileSync('server.ts', code);
console.log('Fixed server.ts otp variable!');
