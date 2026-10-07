const fs = require('fs');

let file = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');
const lines = file.split('\n');

let removedCount = 0;
const newLines = lines.filter(line => {
    // Check if the line is part of the channel array and contains http://
    if (line.trim().startsWith("['") && line.includes("'http://")) {
        removedCount++;
        return false; // remove it
    }
    return true; // keep it
});

fs.writeFileSync('src/data/liveTvDefaults.ts', newLines.join('\n'), 'utf8');
console.log(`Removed ${removedCount} insecure (http://) channels.`);
