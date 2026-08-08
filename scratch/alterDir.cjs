const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/server.ts', 'utf8');

content = content.replace(
  /"directory_services table creation"\);/,
  `"directory_services table creation");
    
    // Drop old columns if they exist
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "titleEn"');
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "titleHi"');
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "descEn"');
    await runQuery('ALTER TABLE directory_services DROP COLUMN IF EXISTS "descHi"');
    await runQuery('ALTER TABLE directory_services ADD COLUMN IF NOT EXISTS title TEXT');
    await runQuery('ALTER TABLE directory_services ADD COLUMN IF NOT EXISTS description TEXT');`
);

fs.writeFileSync('D:/rp-foundation/server.ts', content);
console.log('Added ALTER TABLE to server.ts');
