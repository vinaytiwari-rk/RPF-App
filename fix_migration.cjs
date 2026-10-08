const fs = require('fs');
let c = fs.readFileSync('src/db/migrationRunner.ts', 'utf8');

c = c.replace(/founder_image_url: "\/assets\/founder\.png",/g, 'founder_image_url: "",');
c = c.replace(/foundation_logo: "\/assets\/logo\.png",/g, 'foundation_logo: "",');
c = c.replace(/splash_logo: "\/assets\/logo\.png",/g, 'splash_logo: "",');
c = c.replace(/cert_volunteer_bg: "\/assets\/certificate_volunteer\.png",/g, 'cert_volunteer_bg: "",');
c = c.replace(/cert_donor_bg: "\/assets\/certificate_donor\.png",/g, 'cert_donor_bg: "",');

const updateCommand = `
    // FIX FOR FAKE URLs:
    await client.query("UPDATE system_configs SET config_value = '' WHERE config_value LIKE '/assets/%'");
`;

c = c.replace('console.log("Seeded default system_configs successfully.");', updateCommand + '\n    console.log("Seeded default system_configs successfully.");');

fs.writeFileSync('src/db/migrationRunner.ts', c);
console.log("Patched migrationRunner.ts again!");
