const fs = require('fs');

const d = JSON.parse(fs.readFileSync('extracted_india_tv.json', 'utf8'));
// Create a map of channel name to logo
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

// Update Type
file = file.replace(
    'export type LiveTvChannel = { id: string; name: string; url: string; videoId?: string; category: string; enabled?: boolean; order?: number };',
    'export type LiveTvChannel = { id: string; name: string; url: string; videoId?: string; category: string; logo?: string; enabled?: boolean; order?: number };'
);

// We need to parse each line in the array and add the logo if available
const lines = file.split('\n');
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("['")) {
        // Find the channel name. The format is ['id', 'Name', ...]
        const match = line.match(/\['[^']+',\s*'([^']+)'/);
        if (match) {
            const name = match[1];
            let logo = logoMap[name] || '';
            // Make sure the line ends with ']' or '],' and doesn't already have a 6th element
            // We can just regex replace the end of the array `],` with `, 'logo'],`
            if (line.match(/',\s*'[^']*'\],$/)) { // already has 5 elements
                lines[i] = line.replace(/\],$/, `, '${logo}'],`);
            }
        }
    }
}

file = lines.join('\n');

// Update map function
file = file.replace(
    /\]\.map\(\(\[id,name,url,videoId,category\], order\) => \(\{ id, name, url, videoId: videoId \|\| undefined, category, enabled: true, order \}\)\);/g,
    '].map(([id,name,url,videoId,category,logo], order) => ({ id, name, url, videoId: videoId || undefined, category, logo: logo || undefined, enabled: true, order }));'
);

fs.writeFileSync('src/data/liveTvDefaults.ts', file, 'utf8');
console.log('Logos added to liveTvDefaults.ts');
