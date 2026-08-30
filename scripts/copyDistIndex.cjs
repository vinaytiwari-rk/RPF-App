const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, '..', 'dist', 'index.html');
const rootIndex = path.join(__dirname, '..', 'index.html');

if (fs.existsSync(distIndex)) {
  fs.copyFileSync(distIndex, rootIndex);
  console.log('Successfully synced dist/index.html to root index.html for production LiteSpeed serving.');
}
