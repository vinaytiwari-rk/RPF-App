const fs = require('fs');
let file = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');

// The YouTube ID is izXvukZFBtg
const newLine = `  ['tv-custom-ddkisan', 'DD Kisan', 'https://www.youtube.com/live/izXvukZFBtg', 'izXvukZFBtg', 'News'],`;

file = file.replace(
    /\]\.map\(/,
    newLine + '\n].map('
);

fs.writeFileSync('src/data/liveTvDefaults.ts', file, 'utf8');
console.log('Added DD Kisan to Live TV defaults');
