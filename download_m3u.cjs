const fs = require('fs');
const https = require('https');

https.get('https://iptv-org.github.io/iptv/countries/in.m3u', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        fs.writeFileSync('india_tv.m3u', data);
        console.log('Downloaded india_tv.m3u, length:', data.length);
    });
}).on('error', err => console.error(err));
