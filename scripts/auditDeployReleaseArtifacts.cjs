const assert = require("node:assert/strict");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

execFileSync(process.execPath, ["--check", "deploy.cjs"], { stdio: "inherit" });

const deploySource = fs.readFileSync("deploy.cjs", "utf8");
const androidWorkflow = fs.readFileSync(".github/workflows/android-apk.yml", "utf8");
const webWorkflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");

assert.match(
  deploySource,
  /const includeReleaseArtifacts = process\.env\.DEPLOY_RELEASE_ARTIFACTS === 'true'/,
  "release artifact deployment must be explicitly enabled"
);
assert.match(
  deploySource,
  /if \(!includeReleaseArtifacts && rel === 'updates\/manifest\.json'\) continue;/,
  "normal web deployment must not overwrite the bundled release manifest"
);
assert.match(
  deploySource,
  /if \(includeReleaseArtifacts\) \{[\s\S]*walkFiles\('updates'\)[\s\S]*walkFiles\('download'\)/,
  "only the signed release workflow may upload release manifests and APKs"
);
assert.match(
  deploySource,
  /includeReleaseArtifacts \|\| !isReleaseArtifact\(remote\)/,
  "normal web deployment must preserve remote release APKs and manifests"
);
assert.match(androidWorkflow, /DEPLOY_RELEASE_ARTIFACTS: "true"/);
assert.match(webWorkflow, /npm run audit:deploy-artifacts/);

console.log("PASS deployment keeps release APKs/manifests isolated from normal web deploys");
