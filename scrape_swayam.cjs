const fs = require('fs');
const https = require('https');

const urls = [
    'https://www.swayamprabha.gov.in/ch_allocation/he',
    'https://www.swayamprabha.gov.in/ch_allocation/se',
    'https://www.swayamprabha.gov.in/ch_allocation/ce'
];

async function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function run() {
    let newChannels = [];
    let existingFile = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');
    
    // Get all existing youtube IDs
    const existingIds = new Set();
    const idRegex = /'([a-zA-Z0-9_-]{11})'/g;
    let match;
    while ((match = idRegex.exec(existingFile)) !== null) {
        existingIds.add(match[1]);
    }

    let idCounter = 1;

    for (const url of urls) {
        console.log(`Fetching ${url}...`);
        const html = await fetchHtml(url);
        
        // This is a rough regex to find channel rows in the HTML. 
        // Swayamprabha tables typically have <tr>...<td>Channel Name</td>...href="youtube link"...</tr>
        // A better approach is matching all youtube links and the nearest text.
        // Let's find all youtube embed or watch links.
        const rows = html.split('<tr');
        
        for (const row of rows) {
            if (!row.includes('youtube.com')) continue;
            
            let ytMatch = row.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (!ytMatch) continue;
            const ytId = ytMatch[1];
            
            // Extract the channel name from the row
            // Usually the second or third <td> contains the channel name
            let tds = row.match(/<td[^>]*>(.*?)<\/td>/gs);
            let name = `Swayamprabha Channel`;
            if (tds && tds.length >= 2) {
                // Strip HTML tags from the second TD (usually channel name)
                let text = tds[1].replace(/<[^>]+>/g, '').trim();
                // If it's a number, maybe it's the third TD
                if (/^\d+$/.test(text) && tds.length >= 3) {
                    text = tds[2].replace(/<[^>]+>/g, '').trim();
                }
                
                // Decode HTML entities
                text = text.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
                if (text.length > 3) {
                    name = text;
                }
            }
            
            // Ensure prefix
            if (!name.toLowerCase().includes('swayam prabha') && !name.toLowerCase().includes('channel')) {
                name = `Swayam Prabha: ${name}`;
            }

            if (!existingIds.has(ytId)) {
                existingIds.add(ytId);
                const cleanName = name.replace(/'/g, "");
                newChannels.push(`  ['swayam-${idCounter++}', '${cleanName}', 'https://www.youtube.com/live/${ytId}', '${ytId}', 'Education'],`);
            }
        }
    }

    console.log(`Found ${newChannels.length} missing channels.`);
    if (newChannels.length > 0) {
        let file = fs.readFileSync('src/data/liveTvDefaults.ts', 'utf8');
        file = file.replace(
            /\]\.map\(/,
            newChannels.join('\n') + '\n].map('
        );
        fs.writeFileSync('src/data/liveTvDefaults.ts', file, 'utf8');
        console.log('Added missing channels to LiveTV defaults.');
    }
}

run().catch(console.error);
