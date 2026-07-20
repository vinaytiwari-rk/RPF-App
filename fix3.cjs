const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/phone VARCHAR\(15\) PRIMARY KEY/g, 'phone VARCHAR(255) PRIMARY KEY');

fs.writeFileSync('server.ts', code);
console.log('Fixed VARCHAR(15) in server.ts!');
