const fs = require('fs');

const d = JSON.parse(fs.readFileSync('extracted_india_tv.json', 'utf8'));
const logoMap = {};
Object.keys(d).forEach(cat => {
    d[cat].forEach(ch => {
        if (ch.image) {
            const cleanName = ch.name.replace(/'/g, "").replace(/"/g, "");
            logoMap[cleanName] = ch.image;
        }
    });
});

let file = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');

const lines = file.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("['")) {
        // match: ['id','Name','url','videoId','category'],
        // we can just split by ',' carefully or use regex
        // Since names might have commas, regex is safer. Or just string replacement.
        const match = line.match(/\['[^']+',\s*'([^']+)'/);
        if (match) {
            const name = match[1];
            let logo = logoMap[name] || '';
            
            // if it ends with ], let's append logo before ],
            if (line.endsWith('],') || line.endsWith('], ') || line.endsWith('],\\r')) {
                // To avoid appending multiple times
                const commaCount = (line.match(/','/g) || []).length;
                if (commaCount === 3 || commaCount === 4) { 
                    // ['id','name','url','vid','cat'], => 4 inner commas 
                    lines[i] = line.replace(/\],?\r?$/, `,'${logo}'],`);
                }
            }
        }
    }
}

file = lines.join('\n');
fs.writeFileSync('src/data/liveTvDefaults.ts', file, 'utf8');
console.log('Logos successfully added.');
