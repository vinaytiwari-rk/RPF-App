const fs = require('fs');
let lines = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8').split('\n');
let newLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const [guest, setGuest] = useState(false);')) {
        continue;
    }
    if (lines[i].includes('{guest && (')) {
        skip = true;
    }
    if (skip) {
        if (lines[i].includes('</motion.div>')) {
            // we know there are 2 more lines to skip
            skip = false;
            i += 2;
        }
        continue;
    }
    newLines.push(lines[i]);
}
fs.writeFileSync('src/layouts/MainLayout.tsx', newLines.join('\n'), 'utf8');
console.log('Fixed');
