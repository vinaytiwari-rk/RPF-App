const fs = require('fs');
let code = fs.readFileSync('server_new.ts', 'utf-8');

const imports = `
import authRoutes from './src/routes/authRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import grievanceRoutes from './src/routes/grievanceRoutes.js';
import aiRoutes from './src/routes/aiRoutes.js';
import cultureRoutes from './src/routes/cultureRoutes.js';
import janSevaRoutes from './src/routes/janSevaRoutes.js';
`;
code = code.replace(/import adminHqRoutes from .*;/g, match => match + '\n' + imports);

const mounts = `
app.use('/', authRoutes);
app.use('/', healthRoutes);
app.use('/', grievanceRoutes);
app.use('/', aiRoutes);
app.use('/', cultureRoutes);
app.use('/', janSevaRoutes);
`;
code = code.replace(/app\.use\("\/api\/admin\/hq", authenticateToken, requireAdmin\);/g, match => match + '\n' + mounts);

fs.writeFileSync('server_new2.ts', code);
