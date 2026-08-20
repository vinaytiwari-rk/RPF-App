const fs = require('node:fs');

const browser = fs.readFileSync('src/utils/browser.ts', 'utf8');
const policy = fs.readFileSync('src/config/browserPolicy.ts', 'utf8');
const registry = fs.readFileSync('src/config/externalLinks.ts', 'utf8');
const browserPage = fs.readFileSync('src/pages/InAppBrowser.tsx', 'utf8');

const includes = (text, value) => text.includes(value);
const hasAny = (text, values) => values.some((value) => includes(text, value));
const registryEntries = (registry.match(/'[^']+':\s*\{\s*id:/g) || []).length;

// Navigation must remain available through the app shell/browser API. The RPF
// Web View intentionally hides duplicate app bottom navigation until the user
// taps for browser controls, so visible Home/Explore/etc. labels are not a CI
// requirement.
const appNavigationPreserved =
  includes(browser, 'openExternalLink') &&
  includes(browser, 'navigate(`/browser?url=') &&
  includes(browserPage, 'useSearchParams') &&
  includes(browserPage, 'frameHistory') &&
  includes(browserPage, "setControls(v=>!v)");

const checks = [
  ['HTTP(S) validation', includes(browser, 'HTTP_URL') && includes(browser, "parsed.protocol !== 'http:'")],
  ['unsafe scheme blocking', includes(browser, 'UNSAFE_URL_SCHEME') && hasAny(browser, ['javascript', 'data', 'file', 'blob', 'intent'])],
  ['safe URL policy', includes(browser, 'isSafeWebUrl') && includes(browser, 'normalizeExternalWebUrl')],
  ['persistent app-shell routing', includes(browser, "navigate(`/browser?url=") && includes(browserPage, 'RPF Web View')],
  ['external anchor interception', includes(browser, 'installExternalLinkInterceptor') && includes(browser, "document.addEventListener('click'")],
  ['reusable browser API', includes(browser, 'openRPFBrowser') && includes(browser, 'openExternalLink')],
  ['registry API', includes(browser, 'openRegisteredExternalLink') && includes(browser, 'getExternalLink')],
  ['canonical link registry', includes(registry, 'EXTERNAL_LINK_REGISTRY') && registryEntries >= 20],
  ['content-type policy', includes(policy, 'classifyContentType') && hasAny(policy, ['application/pdf', 'image/', 'audio/', 'video/'])],
  ['app navigation preserved', appNavigationPreserved],
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
