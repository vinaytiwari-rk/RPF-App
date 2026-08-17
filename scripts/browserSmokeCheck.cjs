const fs = require('node:fs');

const registry = fs.readFileSync('src/config/externalLinks.ts', 'utf8');
const browser = fs.readFileSync('src/utils/browser.ts', 'utf8');
const policy = fs.readFileSync('src/config/browserPolicy.ts', 'utf8');

const requiredIds = [
  'directory-contact',
  'directory-web',
  'epaper-free-press-journal',
  'epaper-peoples-samachar',
  'factcheck-bhaskar',
  'factcheck-reuters',
];

const failures = [];
for (const id of requiredIds) {
  if (!registry.includes(`'${id}'`)) failures.push(`missing registry id: ${id}`);
}

for (const marker of ['openExternalLink', 'openRPFBrowser', 'openRegisteredExternalLink', 'installExternalLinkInterceptor']) {
  if (!browser.includes(marker)) failures.push(`missing browser API: ${marker}`);
}

for (const marker of ['isSafeWebUrl', 'isAllowedRedirect', 'classifyContentType']) {
  if (!policy.includes(marker)) failures.push(`missing policy API: ${marker}`);
}

if (failures.length) {
  console.error('Browser smoke check FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Browser smoke check PASS: ${requiredIds.length} critical registry entries and core browser APIs present.`);
