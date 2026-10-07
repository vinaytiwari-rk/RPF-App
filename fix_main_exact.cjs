const fs = require('fs');
let m = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Replace nav function
m = m.replace(/const nav = \(p: string\) => \{[\s\S]*?navigate\(p\);\n    \};/, 'const nav = (p: string) => { navigate(p); };');

// Remove {guest && ... }
const modalRegex = /\{guest && \([\s\S]*?<\/div>\n        \)\}/;
m = m.replace(modalRegex, '');

// Remove setGuest
m = m.replace(/const \[guest, setGuest\] = useState\(false\);/, '');

fs.writeFileSync('src/layouts/MainLayout.tsx', m, 'utf8');
console.log('Fixed MainLayout');
