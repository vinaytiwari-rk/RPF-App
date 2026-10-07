const fs = require('fs');
let m = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Find start and end of nav
let navStart = m.indexOf('const nav = (p: string) => {');
let navEnd = m.indexOf('};', navStart) + 2;
m = m.substring(0, navStart) + 'const nav = (p: string) => { navigate(p); };' + m.substring(navEnd);

// Find start and end of guest modal
let modalStart = m.indexOf('{guest && (');
let modalEnd = m.indexOf(')}', modalStart) + 2;
// Check if the previous `)}` is the right one, actually it could be multiple
let str = m.substring(modalStart, modalStart + 1000);
let endIdx = str.indexOf('        )}') + 10;
if (endIdx > 10) {
    m = m.substring(0, modalStart) + m.substring(modalStart + endIdx);
} else {
    // try another way
    m = m.replace(/\{guest && \([\s\S]+?Sign in<\/button>\n\s+<\/div>\n\s+<\/div>\n\s+<\/motion\.div>\n\s+<\/div>\n\s+\)\}/, '');
}

m = m.replace('const [guest, setGuest] = useState(false); ', '');

fs.writeFileSync('src/layouts/MainLayout.tsx', m, 'utf8');
console.log('Fixed MainLayout without Regex');
