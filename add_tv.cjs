const fs = require('fs');

const d = JSON.parse(fs.readFileSync('extracted_india_tv.json', 'utf8'));
const allowedCategories = ['News', 'Entertainment', 'Religious', 'Movies', 'Music', 'Sports', 'General', 'Kids', 'Science', 'Documentary', 'Education'];

let newLines = [];
let idCounter = 100;

Object.keys(d).forEach(cat => {
    if (allowedCategories.includes(cat)) {
        d[cat].forEach(ch => {
            // Avoid duplicate DD News etc since they are already in YouTube format
            if (ch.name.toLowerCase().includes('dd news') || ch.name.toLowerCase().includes('sansad')) return;
            
            // Clean up name quotes
            const cleanName = ch.name.replace(/'/g, "").replace(/"/g, "");
            const line = `  ['tv-extract-${idCounter++}','${cleanName}','${ch.url}','','${cat}'],`;
            newLines.push(line);
        });
    }
});

let file = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');

// Insert right before "].map("
file = file.replace(
    /\]\.map\(/,
    newLines.join('\n') + '\n].map('
);

fs.writeFileSync('src/data/liveTvDefaults.ts', file, 'utf8');
console.log(`Added ${newLines.length} TV channels to liveTvDefaults.ts`);
