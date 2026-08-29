const { URL } = require('node:url');

const rawUrl = (process.env.DATABASE_URL || process.env.POSTGRES_URL || '').trim();

console.log('=== SAFE READ-ONLY DATABASE_URL METADATA DIAGNOSTIC ===');
console.log('DATABASE_URL present:', Boolean(process.env.DATABASE_URL));
console.log('POSTGRES_URL present:', Boolean(process.env.POSTGRES_URL));
console.log('Raw string length:', rawUrl.length);

if (!rawUrl) {
  console.error('DIAGNOSTIC ERROR: Neither DATABASE_URL nor POSTGRES_URL environment variable is set.');
  process.exit(1);
}

try {
  // Remove wrapping quotes if present in secret value
  const cleanUrl = rawUrl.replace(/^["']|["']$/g, '');
  const parsed = new URL(cleanUrl);

  console.log('\n--- PARSED SAFE METADATA ---');
  console.log('Protocol:', parsed.protocol);
  console.log('Username present:', Boolean(parsed.username));
  console.log('Password present:', Boolean(parsed.password));
  console.log('Hostname:', parsed.hostname || '(EMPTY / UNPARSED)');
  console.log('Port:', parsed.port || '5432 (default)');
  console.log('Database name:', parsed.pathname ? parsed.pathname.replace('/', '') : '(NONE)');
  console.log('Query parameters:', parsed.search || '(NONE)');
  console.log('sslmode parameter:', parsed.searchParams.get('sslmode') || '(NOT SPECIFIED)');

  if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname === '::1' || !parsed.hostname) {
    console.log('\n⚠️ DIAGNOSTIC WARNING: Connection string hostname resolves to LOCALHOST (' + parsed.hostname + ').');
    console.log('This indicates the configured DATABASE_URL secret points to local PostgreSQL (127.0.0.1:5432) rather than a remote cloud PostgreSQL instance.');
  } else {
    console.log('\n✅ Connection string hostname points to REMOTE HOST: ' + parsed.hostname);
  }
} catch (err) {
  console.error('\nDIAGNOSTIC ERROR: Failed to parse DATABASE_URL with node URL parser:', err.message);
  console.error('First 5 characters of raw URL:', rawUrl.substring(0, 5));
  console.error('Last 5 characters of raw URL:', rawUrl.substring(rawUrl.length - 5));
  process.exit(1);
}
