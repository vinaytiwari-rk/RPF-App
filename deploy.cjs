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
  return { host: process.env.FTP_HOST, port: ftpPort, user: process.env.FTP_USER, password: process.env.FTP_PASSWORD, secure: ftpSecure, secureOptions: { rejectUnauthorized: false } };
}

async function withFreshConnection(label, operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    client.ftp.timeout = 180000;
    try {
      console.log(`${label}: attempt ${attempt}/${attempts}`);
      await client.access(connectionOptions());
      if (remoteDir) await client.cd(remoteDir);
      await operation(client);
      return;
    } catch (error) {
      lastError = error;
      console.error(`${label} failed on attempt ${attempt}:`, error?.message || error);
      if (attempt < attempts) await sleep(attempt * 3000);
    } finally { client.close(); }
  }
  throw lastError;
}

async function deployOnce() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 180000;

  try {
    console.log('Connecting to FTP server...');
    await client.access(connectionOptions());
    if (remoteDir) await client.cd(remoteDir);

    if (process.env.FTP_CLEAN_DIST === 'true') {
      const list = await client.list();
      if (list.some((file) => file.name === 'dist' && file.isDirectory)) {
        console.log('Removing old remote dist...');
        await client.removeDir('dist');
      }
    }

    await client.uploadFrom('server.cjs', 'server.cjs');
    if (fs.existsSync('app.js')) await client.uploadFrom('app.js', 'app.js');
    if (fs.existsSync('index.js')) await client.uploadFrom('index.js', 'index.js');

    if (fs.existsSync('dist/index.html')) {
      await client.uploadFrom('dist/index.html', 'index.html');
    } else {
      throw new Error('Missing dist/index.html after build');
    }

    await client.uploadFromDir('dist', 'dist');

    if (fs.existsSync('dist/assets')) {
      await client.uploadFromDir('dist/assets', 'assets');
      console.log('dist/assets mirrored to document-root assets/');
    }

    if (fs.existsSync('dist/version.json')) {
      await client.uploadFrom('dist/version.json', 'version.json');
    }

    if (fs.existsSync('migrations')) {
      await client.uploadFromDir('migrations', 'migrations');
      console.log('migrations directory uploaded');
    }

    if (fs.existsSync('.htaccess')) {
      await client.uploadFrom('.htaccess', '.htaccess');
      console.log('.htaccess uploaded');
    }

    if (fs.existsSync('rss-proxy.php')) {
      await client.uploadFrom('rss-proxy.php', 'rss-proxy.php');
      console.log('rss-proxy.php uploaded');
    }

    try {
      fs.writeFileSync('restart.txt', new Date().toISOString());
      await client.ensureDir('tmp');
      await client.uploadFrom('restart.txt', 'restart.txt');
      console.log('Passenger restart marker created in tmp/restart.txt');
    } catch (restartErr) {
      console.warn('Passenger restart marker skipped (non-fatal):', restartErr?.message || restartErr);
    }

    console.log('FTP deployment completed.');
  } finally {
    client.close();
  }
}

async function main() {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      console.log(`Deployment connection attempt ${attempt}/2`);
      await deployOnce();
      console.log('Server deployment completed.');
      return;
    } catch (err) {
      lastError = err;
      console.error(`FTP deployment failed on attempt ${attempt}:`, err?.message || err);
      if (attempt < 2) {
        console.log('Retrying FTP deployment with a fresh connection...');
        await sleep(3000);
      }
    }
  }
  console.error('FTP deployment failed after retries:', lastError);
  process.exitCode = 1;
}
main();
