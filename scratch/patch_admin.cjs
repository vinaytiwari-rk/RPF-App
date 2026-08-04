const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

code = code.replace(/const settingsRes = await fetch\(`?\/api\/settings`?, \{\s*method: "POST",\s*headers: \{ "Content-Type": "application\/json" \},/g, 
`const token = localStorage.getItem("@rpf_token");\n      const settingsRes = await fetch("/api/settings", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token || ""}\` },`);

code = code.replace(/const cmsRes = await fetch\(`?\/api\/cms\/config`?, \{\s*method: "POST",\s*headers: \{ "Content-Type": "application\/json" \},/g, 
`const token = localStorage.getItem("@rpf_token");\n      const cmsRes = await fetch("/api/cms/config", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token || ""}\` },`);

code = code.replace(/const response = await fetch\(`?\/api\/cms\/config`?, \{\s*method: "POST",\s*headers: \{ "Content-Type": "application\/json" \},/g, 
`const token = localStorage.getItem("@rpf_token");\n      const response = await fetch("/api/cms/config", {\n        method: "POST",\n        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token || ""}\` },`);

// For file uploads
code = code.replace(/const res = await fetch\(`?(\/api\/upload\/[a-z]+)`?, \{\s*method: "POST",\s*body: formData\s*\}\);/g, 
`const token = localStorage.getItem("@rpf_token");\n                            const res = await fetch("$1", {\n                              method: "POST",\n                              headers: { "Authorization": \`Bearer \${token || ""}\` },\n                              body: formData\n                            });`);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
console.log('Admin Dashboard patched.');
