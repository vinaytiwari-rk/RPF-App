const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/server.ts', 'utf8');

content = content.replace(/"titleEn" TEXT,/, 'title TEXT,');
content = content.replace(/"titleHi" TEXT,/, 'description TEXT,');
content = content.replace(/"descEn" TEXT,/, '');
content = content.replace(/"descHi" TEXT,/, '');

fs.writeFileSync('D:/rp-foundation/server.ts', content);
console.log('Fixed directory_services columns');
