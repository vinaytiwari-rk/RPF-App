const fs = require('node:fs');

const browser = fs.readFileSync('src/utils/browser.ts', 'utf8');
const registry = fs.readFileSync('src/config/externalLinks.ts', 'utf8');

const checks = [
  ['HTTP(S) validation', /HTTP_URL/.test(browser)],
  ['unsafe scheme blocking', /UNSAFE_URL_SCHEME/.test(browser)],
  ['native browser target', /NATIVE_BROWSER_TARGET/.test(browser)],
  ['session preservation', /clearsessioncache=no/.test(browser) && /clearcache=no/.test(browser)],
  ['external anchor interception', /installExternalLinkInterceptor/.test(browser) && /document\.addEventListener\('click'/.test(browser)],
  ['reusable browser API', /openRPFBrowser/.test(browser)],
  ['registry API', /openRegisteredExternalLink/.test(browser)],
  ['canonical link registry', /EXTERNAL_LINK_REGISTRY/.test(registry)],
  ['no direct system-browser fallback', !/window\.location\s*=/.test(browser) && !/location\.href\s*=/.test(browser)],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
if (failed.length) {
  console.error(`Browser policy check failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log('Browser policy checks passed.');
