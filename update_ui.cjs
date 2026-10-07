const fs = require('fs');
let file = fs.readFileSync('src/pages/InternetRadio.tsx', 'utf8');

file = file.replace(
  "import rawChannels from '../data/akashvaniChannels.json';",
  "import rawChannels from '../data/akashvaniChannels.json';\nimport privateFm from '../data/privateFmChannels.json';"
);

file = file.replace(
  "{ id: 'Other'",
  "{ id: 'Private', name: 'Private FM (Global)', nameHi: 'निजी ऍफ़एम' },\n  { id: 'Other'"
);

file = file.replace(/const fallbackStations = rawChannels as RadioStation\[\];/, "const allStationsRaw = [...rawChannels, ...privateFm];\nconst fallbackStations = allStationsRaw as RadioStation[];");

// We also need to map the new 'Private' region in getRegionId
file = file.replace(
    "return 'Other';",
    "if (name.toLowerCase().includes('radio') || name.toLowerCase().includes('fm') || name.toLowerCase().includes('hit')) return 'Private';\n  return 'Other';"
);

fs.writeFileSync('src/pages/InternetRadio.tsx', file, 'utf8');
console.log('Updated InternetRadio.tsx');
