const fs = require('fs');
let gitignore = fs.readFileSync('.gitignore', 'utf8');
if (!gitignore.includes('!.env.production')) {
  gitignore += '\n!.env.production\n';
  fs.writeFileSync('.gitignore', gitignore);
}
