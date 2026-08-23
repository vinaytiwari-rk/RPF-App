const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

execFileSync(process.execPath, [path.resolve(__dirname, 'patchPhase1Admin.cjs')], { stdio: 'inherit' });

const version = process.env.APP_VERSION || process.env.GITHUB_SHA || new Date().toISOString();
const payload = {
  version: String(version),
  generatedAt: new Date().toISOString(),
};

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify(payload), 'utf8');
console.log(`App web version: ${payload.version}`);
