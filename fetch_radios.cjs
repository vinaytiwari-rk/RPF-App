const fs = require('fs');
const https = require('https');
const http = require('http');

const RADIO_API = 'https://de1.api.radio-browser.info/json/stations/search?country=India&limit=200&hidebroken=true&order=clickcount&reverse=true';

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'RPF-App/2.5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

function checkStream(url) {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
            // Usually 200 is good, but 302/redirects are also fine
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false); // If it takes too long to respond, skip it
        });
        req.end();
    });
}

async function main() {
    console.log('Fetching stations from Radio-Browser (WorldsRadio backend)...');
    try {
        const stations = await fetchJson(RADIO_API);
        console.log(`Found ${stations.length} Indian stations. Testing their streams...`);
        
        const workingStations = [];
        
        // Process in batches so we don't hit connection limits
        for (let i = 0; i < stations.length; i += 10) {
            const batch = stations.slice(i, i + 10);
            const checks = batch.map(async (st) => {
                const streamUrl = st.url_resolved || st.url;
                if (!streamUrl) return null;
                
                const isWorking = await checkStream(streamUrl);
                if (isWorking) {
                    return {
                        name: st.name.trim(),
                        url: streamUrl,
                        image: st.favicon || 'https://dt89je83l7epy.cloudfront.net/images/air-live.jpg',
                        page: '/channel-private-fm/'
                    };
                }
                return null;
            });
            
            const results = await Promise.all(checks);
            for (const res of results) {
                if (res && workingStations.findIndex(w => w.name === res.name) === -1) {
                    workingStations.push(res);
                }
            }
            process.stdout.write(`\rTested ${Math.min(i + 10, stations.length)} / ${stations.length} | Working: ${workingStations.length}`);
        }
        
        console.log(`\n\nFinal working stations: ${workingStations.length}`);
        
        // We save this as a separate file so we don't touch the sarkari (Akashvani) ones
        fs.writeFileSync('src/data/privateFmChannels.json', JSON.stringify(workingStations, null, 2));
        console.log('Saved to src/data/privateFmChannels.json');
        
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
