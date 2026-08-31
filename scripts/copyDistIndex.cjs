const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
const rootIndex = path.join(__dirname, '..', 'index.html');

if (!fs.existsSync(distIndex)) {
  throw new Error('Production build did not generate dist/index.html');
}

fs.copyFileSync(distIndex, rootIndex);
console.log('Successfully synced the generated dist/index.html to root index.html for production LiteSpeed serving.');
