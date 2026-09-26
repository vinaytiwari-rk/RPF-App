const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
const rootIndex = path.join(__dirname, '..', 'index.html');

if (!fs.existsSync(distIndex)) {
  throw new Error('Production build did not generate dist/index.html');
}

console.log('Verified dist/index.html was generated successfully.');
