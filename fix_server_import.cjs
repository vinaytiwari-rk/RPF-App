const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');
c = c.replace("import authRoutes from './src/routes/authRoutes.js';", "import authRoutes from './src/routes/authRoutes.js';\nimport { supremeCommandRouter } from './src/routes/supremeCommandRoutes.js';");
fs.writeFileSync('server.ts', c, 'utf8');
