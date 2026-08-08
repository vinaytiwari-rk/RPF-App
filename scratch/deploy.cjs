const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('cd /home/vfpmlbpv/appapi.therpfoundation.org/rp-foundation && git pull origin main && source /home/vfpmlbpv/nodevenv/appapi.therpfoundation.org/rp-foundation/24/bin/activate && npm run build && mkdir -p tmp && touch tmp/restart.txt', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '198.54.120.30',
  port: 21098,
  username: 'vfpmlbpv',
  password: 'therpfoundation@321'
});
