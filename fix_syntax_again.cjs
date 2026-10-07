const fs = require('fs');

let m = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Replace nav function
m = m.replace(/const nav = \(p: string\) => \{[\s\S]*?navigate\(p\);\n  \};/, 'const nav = (p: string) => { navigate(p); };');

// Replace guest modal
m = m.replace(/\{guest && \([\s\S]*?<\/div>\n      \)\}/, '');

fs.writeFileSync('src/layouts/MainLayout.tsx', m, 'utf8');

// Fix Profile.tsx import
let p = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
if (!p.includes('LogIn,')) {
    p = p.replace('import { \n  Award', 'import { \n  LogIn,\n  Award');
}
fs.writeFileSync('src/pages/Profile.tsx', p, 'utf8');

console.log('Fixed');
