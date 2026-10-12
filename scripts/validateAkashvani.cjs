const fs = require('fs');
const path = require('path');
const channels = require(path.join(__dirname, '../src/data/akashvaniChannels.json'));

async function validateAll() {
  console.log(`Checking all ${channels.length} Akashvani stations...`);
  const valid = [];
  const invalid = [];

  // Concurrency pool of 15
  const concurrency = 15;
  let idx = 0;

  async function worker() {
    while (idx < channels.length) {
      const current = channels[idx++];
      try {
        const res = await fetch(current.url, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          valid.push(current);
        } else {
          invalid.push({ name: current.name, url: current.url, status: res.status });
        }
      } catch (e) {
        invalid.push({ name: current.name, url: current.url, error: e.message });
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`Results: ${valid.length} valid, ${invalid.length} invalid.`);
  console.log('Sample invalid stations:', invalid.slice(0, 5));

  // Save only verified active stations
  valid.sort((a, b) => {
    const an = a.name.toLowerCase();
    const bn = b.name.toLowerCase();
    if (an === 'vividh bharati') return -1;
    if (bn === 'vividh bharati') return 1;
    if (an === 'akashvani bhopal') return -1;
    if (bn === 'akashvani bhopal') return 1;
    return a.name.localeCompare(b.name);
  });

  const targetPath = path.join(__dirname, '../src/data/akashvaniChannels.json');
  fs.writeFileSync(targetPath, JSON.stringify(valid, null, 2), 'utf8');
  console.log('Updated akashvaniChannels.json with verified working stations.');
}

validateAll().catch(console.error);
