const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/scripts/scrapeDirectory.cjs', 'utf8');

content = content.replace(
  /connectionString: process\.env\.DATABASE_URL \|\| 'postgresql:\/\/postgres:postgres@localhost:5432\/rp_foundation',/,
  \connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rp_foundation',
  ssl: { rejectUnauthorized: false },\
);

fs.writeFileSync('D:/rp-foundation/scripts/scrapeDirectory.cjs', content);
console.log('Added SSL bypass to seed script');
