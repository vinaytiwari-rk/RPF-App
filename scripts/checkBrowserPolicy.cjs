const fs = require('node:fs');

const browser = fs.readFileSync('src/utils/browser.ts', 'utf8');
const registry = fs.readFileSync('src/config/externalLinks.ts', 'utf8');

const has = (pattern) => pattern.test(browser);

const checks = [
  ['HTTP(S) validation', has(/HTTP_URL|https?:\\/\\//)],
  ['unsafe scheme blocking', has(/UNSAFE_URL_SCHEME|javascript|data|file|blob|intent/i)],
  ['native browser target', has(/NATIVE_BROWSER_TARGET|rpf_browser/)],
  ['session preservation', has(/clearsessioncache\\s*=\\s*no/i) && has(/clearcache\\s*=\\s*no/i)],
  ['external anchor interception', has(/installExternalLinkInterceptor/) && has(/addEventListener\\s*\\(\\s*['\"]click['\"]/)],
  ['reusable browser API', has(/openRPFBrowser\\s*=|function\\s+openRPFBrowser|openRPFBrowser/)],
  ['registry API', has(/openRegisteredExternalLink/) && has(/getExternalLink/)],
  ['canonical link registry', /EXTERNAL_LINK_REGISTRY/.test(registry)],
  ['no direct system-browser fallback', !/window\\.location\\s*=/.test(browser) && !/location\\.href\\s*=/.test(browser)],
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`Browser policy check failed: ${failed} check(s).`);
  process.exit(1);
}

console.log(`Browser policy checks passed: ${checks.length}/${checks.length}.`);
