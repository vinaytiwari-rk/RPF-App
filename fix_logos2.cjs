const fs = require('fs');
const d = JSON.parse(fs.readFileSync('extracted_india_tv.json', 'utf8'));
const logoMap = {};
Object.keys(d).forEach(cat => d[cat].forEach(ch => {
    if(ch.image) logoMap[ch.name.replace(/'/g, '').replace(/"/g, '')] = ch.image;
}));
let file = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');

file = file.split('\n').map(line => {
    const m = line.match(/\['[^']+',\s*'([^']+)'/);
    if (m) {
        const name = m[1];
        const logo = logoMap[name] || '';
        // If it already has exactly 4 commas separating the array elements...
        if ((line.match(/','/g)||[]).length === 4 && !line.includes(`,'${logo}']`)) {
            return line.replace(/\],?\r?$/, `,'${logo}'],`);
        }
    }
    return line;
}).join('\n');

fs.writeFileSync('src/data/liveTvDefaults.ts', file, 'utf8');
console.log('Logos fixed.');
