require('dotenv').config();
const ftp = require('basic-ftp');

const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing FTP environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const ftpPort = Number.parseInt(process.env.FTP_PORT || '21', 10);
const ftpSecure = process.env.FTP_SECURE !== 'false';

if (!Number.isInteger(ftpPort) || ftpPort < 1 || ftpPort > 65535) {
  console.error(`Invalid FTP_PORT: ${process.env.FTP_PORT}`);
  process.exit(1);
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 180000;

  try {
    console.log(`Connecting to ${process.env.FTP_HOST}:${ftpPort} using ${ftpSecure ? 'explicit FTPS' : 'plain FTP'}...`);
    await client.access({
      host: process.env.FTP_HOST,
      port: ftpPort,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: ftpSecure,
      secureOptions: { rejectUnauthorized: false }
    });
    console.log('Connected!');

    const list = await client.list();
    const exists = list.some((f) => f.name === 'maps-master');
    if (exists) {
      console.log('Found maps-master directory! Deleting recursively...');
      await client.removeDir('maps-master');
      console.log('Successfully deleted maps-master from cPanel server!');
    } else {
      console.log('maps-master directory does not exist on cPanel server.');
    }
  } catch (err) {
    console.error('cPanel cleanup failed:', err?.message || err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
