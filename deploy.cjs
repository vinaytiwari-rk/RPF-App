const ftp = require('basic-ftp');

const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Deployment configuration is incomplete. Missing environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(label, operation, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      console.log(`${label}: attempt ${attempt}/${attempts}`);
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`${label} failed on attempt ${attempt}:`, error?.message || error);
      if (attempt < attempts) await sleep(attempt * 3000);
    }
  }
  throw lastError;
}

async function main() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  // cPanel/FTPS control connections can be slow to establish in GitHub Actions.
  client.ftp.timeout = 180000;

  try {
    await withRetry('FTP connection', () => client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: process.env.FTP_SECURE !== 'false',
      secureOptions: { rejectUnauthorized: false }
    }));
    console.log('Connected to FTP server!');

    // Clean up old remote dist/ directory to free up disk space from past build assets
    try {
      console.log('Checking remote directory for cleanup...');
      const list = await client.list();
      if (list.some((f) => f.name === 'dist')) {
        console.log('Removing old remote dist/ folder to free disk space...');
        await client.removeDir('dist');
        console.log('Old remote dist/ folder removed successfully.');
      }
    } catch (cleanupErr) {
      console.log('Notice: Remote dist cleanup step skipped/failed:', cleanupErr?.message || cleanupErr);
    }

    await withRetry('server.cjs upload', () => client.uploadFrom('server.cjs', 'server.cjs'));
    console.log('server.cjs uploaded');

    await withRetry('dist upload', () => client.uploadFromDir('dist', 'dist'));
    console.log('dist/ uploaded');

    const fs = require('fs');
    fs.writeFileSync('restart.txt', new Date().toISOString());
    try {
      await client.ensureDir('tmp');
      await client.uploadFrom('restart.txt', 'restart.txt');
      await client.cd('..');
    } catch (error) {
      console.log('Restart marker upload failed:', error?.message || error);
    }

    console.log('Server deployment completed.');
  } catch (err) {
    const isDiskFull = err?.code === 552 || String(err?.message || '').includes('552') || String(err?.message || '').toLowerCase().includes('disk full');
    if (isDiskFull) {
      console.error('\n================================================================');
      console.error('CRITICAL: FTP ERROR 552 - DISK FULL ON CPANEL SERVER');
      console.error('The cPanel hosting account has run out of allocated disk space.');
      console.error('Action Required in cPanel / File Manager:');
      console.error('1. Empty cPanel Trash (.trash directory).');
      console.error('2. Delete old error logs (error_log) or manual backup zip files.');
      console.error('3. Increase Disk Quota for this user in WHM / cPanel.');
      console.error('================================================================\n');
    }
    console.error('FTP deployment error after retries:', err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main();
