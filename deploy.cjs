const ftp = require('basic-ftp');

const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Deployment configuration is incomplete. Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 120000;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE !== 'false',
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('Connected to FTP server!');

    await client.uploadFrom('server.cjs', 'server.cjs');
    console.log('server.cjs uploaded');

    await client.uploadFromDir('dist', 'dist');
    console.log('dist/ uploaded');

    const fs = require('fs');
    fs.writeFileSync('restart.txt', new Date().toISOString());
    try {
      await client.ensureDir('tmp');
      await client.uploadFrom('restart.txt', 'restart.txt');
      await client.cd('..');
    } catch (error) {
      console.log('Restart marker upload failed:', error);
    }

    console.log('Server deployment completed.');
  } catch (err) {
    console.error('FTP deployment error:', err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
