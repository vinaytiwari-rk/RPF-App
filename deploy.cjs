const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
const incremental = process.env.FTP_INCREMENTAL !== 'false';
const manifestName = '.rpf-deploy-manifest.json';

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
    secureOptions: { rejectUnauthorized: false },
  };
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walkFiles(full));
    else if (entry.isFile()) result.push(full);
  }
  return result;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function addFile(files, localPath, remotePath) {
  if (fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
    files.push({ local: localPath, remote: toPosix(remotePath) });
  }
}

function collectDeploymentFiles() {
  const files = [];

  addFile(files, 'server.cjs', 'server.cjs');
  addFile(files, 'app.js', 'app.js');
  addFile(files, 'index.js', 'index.js');

  for (const local of walkFiles('dist')) {
    const rel = toPosix(path.relative('dist', local));
    addFile(files, local, `dist/${rel}`);
  }

  // Legacy document-root mirrors retained for the existing cPanel layout.
  addFile(files, 'dist/index.html', 'index.html');
  for (const local of walkFiles('dist/assets')) {
    const rel = toPosix(path.relative('dist/assets', local));
    addFile(files, local, `assets/${rel}`);
  }
  addFile(files, 'dist/version.json', 'version.json');

  for (const local of walkFiles('migrations')) {
    const rel = toPosix(path.relative('migrations', local));
    addFile(files, local, `migrations/${rel}`);
  }

  addFile(files, '.htaccess', '.htaccess');
  addFile(files, 'rss-proxy.php', 'rss-proxy.php');

  const seen = new Set();
  return files.filter((file) => {
    if (seen.has(file.remote)) return false;
    seen.add(file.remote);
    return true;
  });
}

function sha256(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function buildManifest(files) {
  const entries = {};
  for (const file of files) {
    entries[file.remote] = await sha256(file.local);
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    files: entries,
  };
}

async function readRemoteManifest(client) {
  const temp = path.join(process.cwd(), '.rpf-remote-manifest.json');
  try {
    await client.downloadTo(temp, manifestName);
    const parsed = JSON.parse(fs.readFileSync(temp, 'utf8'));
    return parsed && parsed.files && typeof parsed.files === 'object' ? parsed.files : {};
  } catch (error) {
    console.log('No previous deployment manifest found; this deployment will establish one.');
    return {};
  } finally {
    try { fs.unlinkSync(temp); } catch {}
  }
}

async function ensureRemoteDirectories(client, remotePaths, rootDir) {
  const dirs = new Set();
  for (const remotePath of remotePaths) {
    const dir = path.posix.dirname(remotePath);
    if (dir !== '.') dirs.add(dir);
  }

  for (const dir of [...dirs].sort()) {
    await client.cd(rootDir);
    await client.ensureDir(dir);
  }
  await client.cd(rootDir);
}

async function uploadChangedFiles(client, files, previousManifest, currentManifest, rootDir) {
  const changed = files.filter((file) => previousManifest[file.remote] !== currentManifest.files[file.remote]);

  if (!changed.length) {
    console.log('Incremental deployment: no application files changed.');
    return changed;
  }

  const groups = new Map();
  for (const file of changed) {
    const dir = path.posix.dirname(file.remote);
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir).push(file);
  }

  await ensureRemoteDirectories(client, changed.map((file) => file.remote), rootDir);

  for (const [dir, group] of groups) {
    await client.cd(remoteDir || '/');
    if (dir !== '.') await client.cd(dir);

    for (const file of group) {
      const name = path.posix.basename(file.remote);
      console.log(`UPLOAD ${file.remote}`);
      await client.uploadFrom(file.local, name);
    }
  }

  await client.cd(remoteDir || '/');
  console.log(`Incremental deployment uploaded ${changed.length} file(s).`);
  return changed;
}

async function removeDeletedFiles(client, previousManifest, currentManifest, rootDir) {
  const deleted = Object.keys(previousManifest).filter((remote) => !currentManifest.files[remote]);
  if (!deleted.length) return;

  await client.cd(remoteDir || '/');
  for (const remote of deleted) {
    try {
      console.log(`REMOVE ${remote}`);
      await client.remove(remote);
    } catch (error) {
      console.warn(`Could not remove obsolete managed file ${remote}: ${error?.message || error}`);
    }
  }
}

async function writeRemoteManifest(client, manifest, rootDir) {
  const localManifest = path.join(process.cwd(), manifestName);
  fs.writeFileSync(localManifest, JSON.stringify(manifest, null, 2));
  try {
    await client.cd(remoteDir || '/');
    await client.uploadFrom(localManifest, manifestName);
  } finally {
    try { fs.unlinkSync(localManifest); } catch {}
  }
}

async function deployOnce() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  client.ftp.timeout = 180000;

  try {
    console.log('Connecting to FTP server...');
    await client.access(connectionOptions());
    if (remoteDir) await client.cd(remoteDir);

    if (!incremental && process.env.FTP_CLEAN_DIST === 'true') {
      const list = await client.list();
      if (list.some((file) => file.name === 'dist' && file.isDirectory)) {
        console.log('Removing old remote dist...');
        await client.removeDir('dist');
      }
    }

    const files = collectDeploymentFiles();
    if (!files.some((file) => file.remote === 'dist/index.html')) {
      throw new Error('Missing dist/index.html after build');
    }

    const currentManifest = await buildManifest(files);
    const rootDir = await client.pwd();
    const previousManifest = incremental ? await readRemoteManifest(client) : {};
    const changed = await uploadChangedFiles(client, files, previousManifest, currentManifest, rootDir);

    if (incremental) {
      await removeDeletedFiles(client, previousManifest, currentManifest, rootDir);
    }

    if (changed.length || !incremental) {
      try {
        fs.writeFileSync('restart.txt', new Date().toISOString());
        await client.ensureDir('tmp');
        await client.uploadFrom('restart.txt', 'restart.txt');
        await client.cd(remoteDir || '/');
        console.log('Passenger restart marker created in tmp/restart.txt');
      } catch (restartErr) {
        console.warn('Passenger restart marker skipped (non-fatal):', restartErr?.message || restartErr);
      }
    }

    await writeRemoteManifest(client, currentManifest, rootDir);

    console.log(`FTP deployment completed. Managed files: ${files.length}; changed: ${changed.length}; incremental: ${incremental}`);
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
