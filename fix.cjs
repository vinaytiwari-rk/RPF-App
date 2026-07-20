const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replaceAll('\\\\`', '`').replaceAll('\\\\$', '$');

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts syntax!");
