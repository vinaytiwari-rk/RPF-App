require('dotenv').config();
const ftp = require('basic-ftp');

const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing FTP environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 180000;

  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE !== 'false',
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('Connected!');

    const list = await client.list();
    console.log('Current directories/files on server:', list.map(f => f.name));

    const exists = list.some(f => f.name === 'maps-master');
    if (exists) {
      console.log('Found maps-master directory! Deleting recursively...');
      await client.removeDir('maps-master');
      console.log('Successfully deleted maps-master from cPanel server!');
    } else {
      console.log('maps-master directory does not exist on cPanel server.');
    }
  } catch (err) {
    console.error('Error occurred:', err.message || err);
  } finally {
    client.close();
  }
}

main();
