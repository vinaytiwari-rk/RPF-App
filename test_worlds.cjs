const https = require('https');

https.get('https://www.worldsradio.com/stations/960cf833-0601-11e8-ae97-52543be04c81', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/https?:\/\/[^\s"'><]+\.(?:m3u8|mp3)/gi);
        console.log('Matches:', match ? match.slice(0, 5) : 'None');
    });
}).on('error', err => console.error(err));
