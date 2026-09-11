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

// Ensure root index.html has clean src/main.tsx for Vite build
const rootIndexPath = path.resolve(process.cwd(), 'index.html');
if (fs.existsSync(rootIndexPath)) {
  let html = fs.readFileSync(rootIndexPath, 'utf8');
  if (!html.includes('/src/main.tsx')) {
    html = html.replace(/<script type="module"[\s\S]*?<\/script>/, '<script type="module" src="/src/main.tsx"></script>');
    html = html.replace(/<link rel="(?:modulepreload|stylesheet)"[^>]*?href="\/assets\/[^"]*"[^>]*?>/g, '');
    fs.writeFileSync(rootIndexPath, html, 'utf8');
    console.log('Restored clean /src/main.tsx entry point in root index.html');
  }
}
