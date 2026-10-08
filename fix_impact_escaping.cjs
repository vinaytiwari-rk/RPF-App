const fs = require('fs');
let c = fs.readFileSync('src/pages/admin/studios/ImpactStudio.tsx', 'utf8');

c = c.replace(/\\`/g, '`');
c = c.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/admin/studios/ImpactStudio.tsx', c);
console.log('Fixed escaping in ImpactStudio.tsx');
