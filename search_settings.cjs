const fs = require("fs");
const path = require("path");

const serverCode = fs.readFileSync("D:\\rp-foundation\\server.ts", "utf8");
console.log("=== SERVER SEARCH ===");
const lines = serverCode.split("\n");
lines.forEach((line, idx) => {
  if (line.includes("CREATE TABLE") || line.includes("settings") || line.includes("tollFree") || line.includes("alertBanner")) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
