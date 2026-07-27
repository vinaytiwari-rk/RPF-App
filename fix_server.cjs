const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

c = c.replace(/app\.post\("\/api\/cards", async \(req, res\) => \{[\s\S]*?VALUES \(\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9\)[\s\S]*?\]/m, `app.post("/api/cards", async (req, res) => {
    try {
      const { userId, name, gender, dob, address, idType, idNumber, status } = req.body;
      const submittedAt = new Date().toISOString();
      const id = crypto.randomUUID();
      await pool.query(
        \`INSERT INTO card_applications_v2 
         (id, "userId", name, gender, dob, address, "idType", "idNumber", status, "submittedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)\`,
        [
          id,
          userId || "guest",
          name,
          gender,
          dob,
          address,
          idType,
          idNumber,
          status || "pending",
          submittedAt
        ]`);

fs.writeFileSync('server.ts', c);
