const ftp = require('basic-ftp');
const fs = require('fs');

const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Deployment configuration is incomplete. Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const remoteDir = String(process.env.FTP_REMOTE_DIR || '').trim().replace(/^\/+|\/+$/g, '');
const ftpPort = Number.parseInt(process.env.FTP_PORT || '21', 10);
const ftpSecure = process.env.FTP_SECURE !== 'false';

if (!Number.isInteger(ftpPort) || ftpPort < 1 || ftpPort > 65535) {
  console.error(`Invalid FTP_PORT: ${process.env.FTP_PORT}`);
  process.exit(1);
}

function connectionOptions() {
  return {
    host: process.env.FTP_HOST,
    port: ftpPort,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: ftpSecure,
    secureOptions: { rejectUnauthorized: false }
  };
}

async function withFreshConnection(label, operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    client.ftp.timeout = 180000;
    try {
      console.log(`${label}: attempt ${attempt}/${attempts}`);
      console.log(`Connecting to ${process.env.FTP_HOST}:${ftpPort} using ${ftpSecure ? 'explicit FTPS' : 'plain FTP'}`);
      await client.access(connectionOptions());
      if (remoteDir) {
        await client.cd(remoteDir);
        console.log(`Using remote directory: ${remoteDir}`);
      }
      await operation(client);
      return;
    } catch (error) {
      lastError = error;
      console.error(`${label} failed on attempt ${attempt}:`, error?.message || error);
      if (attempt < attempts) await sleep(attempt * 3000);
    } finally {
      client.close();
    }
  }
  throw lastError;
}

async function main() {
  try {
    if (process.env.FTP_CLEAN_DIST === 'true') {
      await withFreshConnection('remote dist cleanup', async (client) => {
        const list = await client.list();
        if (list.some((file) => file.name === 'dist' && file.isDirectory)) {
          await client.removeDir('dist');
          console.log('Old remote dist/ folder removed.');
        } else {
          console.log('No remote dist/ folder to remove.');
        }
      });
    } else {
      console.log('Remote dist cleanup disabled; uploading over the existing deployment.');
    }

    await withFreshConnection('server.cjs upload', (client) => client.uploadFrom('server.cjs', 'server.cjs'));
    console.log('server.cjs uploaded');

    await withFreshConnection('dist upload', (client) => client.uploadFromDir('dist', 'dist'));
    console.log('dist/ uploaded');

    fs.writeFileSync('restart.txt', new Date().toISOString());
    await withFreshConnection('restart marker upload', async (client) => {
      await client.ensureDir('tmp');
      await client.uploadFrom('restart.txt', 'restart.txt');
    });

    console.log('Server deployment completed.');
  } catch (err) {
    const message = String(err?.message || err);
    const isDiskFull = err?.code === 552 || message.includes('552') || message.toLowerCase().includes('disk full');
    if (isDiskFull) console.error('\nCRITICAL: FTP ERROR 552 - DISK FULL ON CPANEL SERVER');
    if (err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT') {
      console.error(`\nNETWORK/FTP ENDPOINT ERROR: ${process.env.FTP_HOST}:${ftpPort} is not accepting the configured connection.`);
      console.error('Verify FTP_SERVER, FTP_PORT, FTP_SECURE, and the hosting server firewall/service.');
    }
    console.error('FTP deployment error after retries:', err);
    process.exitCode = 1;
  }
}

main();
