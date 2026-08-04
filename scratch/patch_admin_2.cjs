const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Patch fetch("/api/cms/config") calls
code = code.replace(
  /fetch\("\/api\/cms\/config",\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/g,
  `fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${localStorage.getItem("@rpf_token") || ""}\` }`
);

// Patch fetch("/api/upload/*") calls that lack Authorization
code = code.replace(
  /fetch\("(\/api\/upload\/[a-z]+)",\s*\{\s*method:\s*"POST",\s*body:\s*formData\s*\}/g,
  `fetch("$1", {
                              method: "POST",
                              headers: { "Authorization": \`Bearer \${localStorage.getItem("@rpf_token") || ""}\` },
                              body: formData
                            }`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('Admin Dashboard patched more robustly.');
