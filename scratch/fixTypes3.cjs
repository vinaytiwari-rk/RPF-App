const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/src/routes/volunteerRoutes.ts', 'utf8');
content = content.replace(/\[points, volunteerId\]/g, '[10, volunteerId]');
fs.writeFileSync('D:/rp-foundation/src/routes/volunteerRoutes.ts', content);
