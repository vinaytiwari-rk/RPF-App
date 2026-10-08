const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');
c = c.replace("app.use('/', authRoutes);\\napp.use('/', supremeCommandRouter);", "app.use('/', authRoutes);\napp.use('/', supremeCommandRouter);");
fs.writeFileSync('server.ts', c, 'utf8');
console.log('Fixed server.ts literal newline');
