const fs = require('node:fs');

const browser = fs.readFileSync('src/utils/browser.ts', 'utf8');
const registry = fs.readFileSync('src/config/externalLinks.ts', 'utf8');

// Keep this gate intentionally structural rather than dependent on exact
// formatting/escaping of TypeScript regular expressions.
const includes = (text, value) => text.includes(value);
const hasAny = (text, values) => values.some((value) => includes(text, value));

const checks = [
  ['HTTP(S) validation', includes(browser, 'HTTP_URL') && includes(browser, "parsed.protocol !== 'http:'")],
  ['unsafe scheme blocking', includes(browser, 'UNSAFE_URL_SCHEME') && hasAny(browser, ['javascript', 'data', 'file', 'blob', 'intent'])],
  ['native browser target', includes(browser, 'NATIVE_BROWSER_TARGET') && includes(browser, 'rpf_browser')],
  ['session preservation', includes(browser, 'clearcache=no') && includes(browser, 'clearsessioncache=no')],
  ['external anchor interception', includes(browser, 'installExternalLinkInterceptor') && includes(browser, "document.addEventListener('click'")],
  ['reusable browser API', includes(browser, 'openRPFBrowser')],
  ['registry API', includes(browser, 'openRegisteredExternalLink') && includes(browser, 'getExternalLink')],
  ['canonical link registry', includes(registry, 'EXTERNAL_LINK_REGISTRY')],
  ['no direct system-browser fallback', !includes(browser, 'window.location =') && !includes(browser, 'location.href =')],
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
