const fs = require('fs');
const path = require('path');
const channels = require(path.join(__dirname, '../src/data/privateFmChannels.json'));

async function validatePrivateFm() {
  console.log(`Checking all ${channels.length} Private FM stations...`);
  const valid = [];
  const invalid = [];

  const concurrency = 10;
  let idx = 0;

  async function worker() {
    while (idx < channels.length) {
      const current = channels[idx++];
      // Do a HEAD or GET with 4s timeout
      try {
        const res = await fetch(current.url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(4000)
        });
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

  console.log(`Private FM Results: ${valid.length} valid, ${invalid.length} invalid.`);
  console.log('Sample invalid:', invalid.slice(0, 5));

  const targetPath = path.join(__dirname, '../src/data/privateFmChannels.json');
  fs.writeFileSync(targetPath, JSON.stringify(valid, null, 2), 'utf8');
  console.log('Updated privateFmChannels.json with verified working stations.');
}

validatePrivateFm().catch(console.error);
