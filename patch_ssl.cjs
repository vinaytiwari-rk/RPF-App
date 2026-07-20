const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const oldSsl = 'ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") ? false : { rejectUnauthorized: false }';
const newSsl = 'ssl: dbUrl && (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.")) ? false : { rejectUnauthorized: false }';

if (serverCode.includes(oldSsl)) {
  serverCode = serverCode.replace(oldSsl, newSsl);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Successfully patched SSL config.");
} else {
  console.log("Could not find the target string.");
}
