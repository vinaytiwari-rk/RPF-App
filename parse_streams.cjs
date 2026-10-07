const fs = require('fs');

const html = fs.readFileSync('akashvani_live.html', 'utf8');
const channels = [];

// Split by 'name: '
const chunks = html.split('name: ');

for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Extract name
    const nameMatch = chunk.match(/^'([^']+)'/);
    if (!nameMatch) continue;
    
    // Extract image
    const imageMatch = chunk.match(/image:\s*'([^']+)'/);
    
    // Extract url
    const urlMatch = chunk.match(/live_url:\s*'([^']+)'/);
    
    if (nameMatch && urlMatch) {
        channels.push({
            name: nameMatch[1],
            image: imageMatch ? imageMatch[1] : "",
            url: urlMatch[1]
        });
    }
}

console.log(`Parsed ${channels.length} channels from HTML.`);

const currentJson = JSON.parse(fs.readFileSync('src/data/akashvaniChannels.json', 'utf8'));
let updatedCount = 0;

const parsedMap = new Map();
channels.forEach(ch => parsedMap.set(ch.name.toLowerCase().trim(), ch));

currentJson.forEach(ch => {
  const chName = ch.name.toLowerCase().trim();
  let found = parsedMap.get(chName);
  
  // Try aliases if not found directly
  if (!found) {
      const aliases = [
          chName.replace('vbs ', 'vividh bharati '),
          chName.replace('vividh bharati ', 'vbs '),
          chName.replace('akashvani ', ''),
          'akashvani ' + chName
      ];
      for (const alias of aliases) {
          if (parsedMap.has(alias)) {
              found = parsedMap.get(alias);
              break;
          }
      }
  }
  
  if (found) {
    if (ch.url !== found.url || ch.image !== found.image) {
      ch.url = found.url;
      ch.image = found.image;
      updatedCount++;
    }
  }
});

console.log(`Updated ${updatedCount} existing channels in JSON.`);

fs.writeFileSync('src/data/akashvaniChannels.json', JSON.stringify(currentJson, null, 2), 'utf8');
