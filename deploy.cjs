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

async function main() {
  try {
    if (process.env.FTP_CLEAN_DIST === 'true') {
      await withFreshConnection('remote dist cleanup', async (client) => {
        const list = await client.list();
        if (list.some((file) => file.name === 'dist' && file.isDirectory)) await client.removeDir('dist');
      });
    }

    await withFreshConnection('server.cjs upload', (client) => client.uploadFrom('server.cjs', 'server.cjs'));
    if (fs.existsSync('app.js')) {
      await withFreshConnection('app.js upload', (client) => client.uploadFrom('app.js', 'app.js'));
    }
    if (fs.existsSync('index.js')) {
      await withFreshConnection('index.js upload', (client) => client.uploadFrom('index.js', 'index.js'));
    }
    await withFreshConnection('dist upload', (client) => client.uploadFromDir('dist', 'dist'));
    if (fs.existsSync('.htaccess')) {
      await withFreshConnection('.htaccess upload', (client) => client.uploadFrom('.htaccess', '.htaccess'));
      console.log('.htaccess uploaded');
    }
    if (fs.existsSync('rss-proxy.php')) {
      await withFreshConnection('RSS proxy upload', (client) => client.uploadFrom('rss-proxy.php', 'rss-proxy.php'));
      console.log('rss-proxy.php uploaded');
    }

    fs.writeFileSync('restart.txt', new Date().toISOString());
    await withFreshConnection('restart marker upload', async (client) => {
      await client.ensureDir('tmp');
      await client.uploadFrom('restart.txt', 'restart.txt');
    });
    console.log('Server deployment completed.');
  } catch (err) {
    console.error('FTP deployment error after retries:', err);
    process.exitCode = 1;
  }
}

main();
