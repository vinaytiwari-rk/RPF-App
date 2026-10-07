const fs = require('fs');
const lines = fs.readFileSync('india_tv.m3u', 'utf8').split('\n');

const channels = [];
let currentChannel = {};

lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
        // Parse metadata
        const logoMatch = line.match(/tvg-logo="([^"]+)"/);
        const groupMatch = line.match(/group-title="([^"]+)"/);
        const nameParts = line.split(',');
        const name = nameParts[nameParts.length - 1].trim();

        currentChannel = {
            name: name,
            category: groupMatch ? groupMatch[1] : 'Unknown',
            image: logoMatch ? logoMatch[1] : ''
        };
    } else if (line.startsWith('http')) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = {};
    }
});

// Group by category for easier review
const byCategory = {};
channels.forEach(ch => {
    if (!byCategory[ch.category]) byCategory[ch.category] = [];
    byCategory[ch.category].push(ch);
});

fs.writeFileSync('extracted_india_tv.json', JSON.stringify(byCategory, null, 2));
console.log(`Extracted ${channels.length} channels across ${Object.keys(byCategory).length} categories.`);
