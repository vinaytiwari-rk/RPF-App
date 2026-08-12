const ftp = require('basic-ftp');
async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: 'ftp.therpfoundation.org',
      user: 'RPF_App@appapi.therpfoundation.org',
      password: 'therpfoundation@321',
      secure: true,
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('Connected to FTP server!');
    await client.uploadFrom('server.cjs', 'server.cjs');
    console.log('server.cjs uploaded');
    await client.uploadFromDir('dist', 'dist');
    console.log('dist/ uploaded');
    // restart the server by touching restart.txt
    const fs = require('fs'); 
    fs.writeFileSync('restart.txt', new Date().toISOString());
    try {
      await client.ensureDir('tmp'); // Creates and navigates into tmp
      await client.uploadFrom('restart.txt', 'restart.txt'); // Upload inside tmp
      await client.cd('..'); // Navigate back to root
    } catch (e) {
      console.log('Failed to restart via tmp/restart.txt:', e);
    }
    console.log('Server restarted via tmp/restart.txt');
  } catch (err) {
    console.error('FTP Error:', err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}
main();
