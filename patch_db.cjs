const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const migrationScript = `
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(255) PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          role TEXT DEFAULT 'citizen',
          "tollFree" TEXT,
          "webUrl" TEXT,
          "founderMessageEn" TEXT,
          "founderMessageHi" TEXT
        )
      \`);

      // Ensure otps table has enough space for emails
      try {
        await pool.query('ALTER TABLE otps ALTER COLUMN phone TYPE VARCHAR(255)');
      } catch(e) {
        // Table might not exist yet
      }
`;
file = file.replace(/CREATE TABLE IF NOT EXISTS settings \([\s\S]*?founderMessageHi" TEXT\s*\)\s*`\);/, migrationScript);

fs.writeFileSync('server.ts', file);
