const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.ts');
let content = fs.readFileSync(serverPath, 'utf8');

// import
content = content.replace(
  'import adminHqExtraRoutes from \\'./src/routes/adminHqExtraRoutes.js\\';',
  'import adminHqExtraRoutes from \\'./src/routes/adminHqExtraRoutes.js\\';\nimport adminDynamicRoutes from \\'./src/routes/adminDynamicRoutes.js\\';'
);

// use
content = content.replace(
  'app.use(adminHqExtraRoutes);',
  'app.use(adminHqExtraRoutes);\napp.use(adminDynamicRoutes);'
);

fs.writeFileSync(serverPath, content, 'utf8');
console.log('Routes added');
