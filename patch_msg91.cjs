const fs = require('fs');

let file = fs.readFileSync('server.ts', 'utf8');

const msg91Implementation = `      // Save to DB (UPSERT)
      await pool.query(
        \`INSERT INTO otps (phone, otp, "createdAt") VALUES ($1, $2, CURRENT_TIMESTAMP) 
         ON CONFLICT (phone) DO UPDATE SET otp = EXCLUDED.otp, "createdAt" = CURRENT_TIMESTAMP\`,
        [phone, otp]
      );
      
      console.log(\`
  ===============================
  [SMS] Sending OTP for \${phone} is: \${otp}
  ===============================
  \`);
      
      try {
        const MSG91_AUTHKEY = "552233Aul3uTNSZ6a5de34bP1";
        const MSG91_SENDER = "RPFApp";
        const url = \`https://control.msg91.com/api/v5/otp?authkey=\${MSG91_AUTHKEY}&mobile=91\${phone}&otp=\${otp}&sender=\${MSG91_SENDER}\`;
        
        const axios = require('axios');
        await axios.get(url);
      } catch (smsErr) {
        console.error("MSG91 Error:", smsErr?.response?.data || smsErr.message);
      }
      
      res.json({ success: true, message: "OTP sent" });`;

file = file.replace(/      \/\/ Save to DB \(UPSERT\)[\s\S]*?res\.json\(\{ success: true, message: "OTP sent" \}\);/, msg91Implementation);

fs.writeFileSync('server.ts', file);
