const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

function addImport(importLine, after) {
  if (!content.includes(importLine)) content = content.replace(after, `${after}\n${importLine}`);
}
function addUse(useLine, after) {
  if (!content.includes(useLine)) content = content.replace(after, `${after}\n${useLine}`);
}

addImport("import adminDynamicRoutes from './src/routes/adminDynamicRoutes.js';", "import adminHqExtraRoutes from './src/routes/adminHqExtraRoutes.js';");
addImport("import legacyContentGuardRoutes from './src/routes/legacyContentGuardRoutes.js';", "import adminDynamicRoutes from './src/routes/adminDynamicRoutes.js';");
addImport("import governedContentRoutes from './src/routes/governedContentRoutes.js';", "import legacyContentGuardRoutes from './src/routes/legacyContentGuardRoutes.js';");
addImport("import metricsRoutes from './src/routes/metricsRoutes.js';", "import governedContentRoutes from './src/routes/governedContentRoutes.js';");
addUse('app.use(adminDynamicRoutes);', 'app.use(adminHqExtraRoutes);');
addUse('app.use(legacyContentGuardRoutes);', 'app.use(adminDynamicRoutes);');
addUse('app.use(governedContentRoutes);', 'app.use(legacyContentGuardRoutes);');
addUse('app.use(metricsRoutes);', 'app.use(governedContentRoutes);');

fs.writeFileSync(serverPath, content, 'utf8');
console.log('Routes added');
