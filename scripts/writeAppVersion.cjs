const fs = require('fs');
const path = require('path');

const version = process.env.APP_VERSION || process.env.GITHUB_SHA || new Date().toISOString();
const payload = {
  version: String(version),
  generatedAt: new Date().toISOString(),
};

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify(payload), 'utf8');
console.log(`App web version: ${payload.version}`);
