const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

const emailEndpoint = `
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
      
      await pool.query(\`
        CREATE TABLE IF NOT EXISTS otps (
          phone VARCHAR(255) PRIMARY KEY,
          otp VARCHAR(10) NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      \`);
      
      await pool.query(
        \`INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP\`,
        [email, otp]
      );
      
      console.log(\`[EMAIL] Sending OTP for \${email} is: \${otp}\`);
      
      await transporter.sendMail({
        from: '"RP Foundation" <' + (process.env.SMTP_USER || 'no-reply@appapi.therpfoundation.org') + '>',
        to: email,
        subject: "Your Jan Seva Login OTP",
        text: \`Your OTP for RP Foundation Jan Seva is: \${otp}. It is valid for 10 minutes.\`,
        html: \`<b>Your OTP for RP Foundation Jan Seva is: <span style="color: #FF9933; font-size: 1.5em;">\${otp}</span></b><br/><p>It is valid for 10 minutes.</p>\`,
      });
      
      res.json({ success: true, message: "OTP sent" });
    } catch (err) {
      console.error("Email send error:", err);
      res.status(500).json({ error: err.message });
    }
  });
`;

file = file.replace(/app\.post\("\/api\/auth\/login", async \(req, res\) => \{/, emailEndpoint + '\napp.post("/api/auth/login", async (req, res) => {');

fs.writeFileSync('server.ts', file);
