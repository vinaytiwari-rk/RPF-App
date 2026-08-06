const fs = require('fs');
const path = require('path');

function replaceInDir(dir, searchRegex, replaceWith) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath, searchRegex, replaceWith);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (searchRegex.test(content)) {
        const newContent = content.replace(searchRegex, replaceWith);
        fs.writeFileSync(fullPath, newContent);
        console.log('Replaced in ' + fullPath);
      }
    }
  }
}

replaceInDir('D:/rp-foundation/src', /Sehore/g, 'Bhopal');
replaceInDir('D:/rp-foundation/src', /sehore/g, 'bhopal');
