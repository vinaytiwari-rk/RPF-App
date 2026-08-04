const fs = require('fs');
let code = fs.readFileSync('server_new.ts', 'utf-8');

const imports = `
import locationRoutes from './src/routes/locationRoutes.js';
import womenRoutes from './src/routes/womenRoutes.js';
import volunteerRoutes from './src/routes/volunteerRoutes.js';
import certificateRoutes from './src/routes/certificateRoutes.js';
import communityRoutes from './src/routes/communityRoutes.js';
import jobRoutes from './src/routes/jobRoutes.js';
import donationRoutes from './src/routes/donationRoutes.js';
import cmsRoutes from './src/routes/cmsRoutes.js';
import campaignRoutes from './src/routes/campaignRoutes.js';
import submissionRoutes from './src/routes/submissionRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import publicGovRoutes from './src/routes/publicGovRoutes.js';
import miscRoutes from './src/routes/miscRoutes.js';
import adminHqExtraRoutes from './src/routes/adminHqExtraRoutes.js';
`;
code = code.replace(/import janSevaRoutes from .*/g, match => match + '\n' + imports);

const mounts = `
app.use('/', locationRoutes);
app.use('/', womenRoutes);
app.use('/', volunteerRoutes);
app.use('/', certificateRoutes);
app.use('/', communityRoutes);
app.use('/', jobRoutes);
app.use('/', donationRoutes);
app.use('/', cmsRoutes);
app.use('/', campaignRoutes);
app.use('/', submissionRoutes);
app.use('/', userRoutes);
app.use('/', uploadRoutes);
app.use('/', publicGovRoutes);
app.use('/', miscRoutes);
app.use('/', adminHqExtraRoutes);
`;
code = code.replace(/app\.use\('\/', janSevaRoutes\);/g, match => match + '\n' + mounts);

fs.writeFileSync('server_new3.ts', code);
