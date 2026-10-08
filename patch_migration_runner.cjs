const fs = require('fs');
let c = fs.readFileSync('src/db/migrationRunner.ts', 'utf8');

const seedFunc = `
async function seedSystemConfigs(client: any) {
  const defaults = {
    founder_name: "Rohit Pandit",
    founder_image_url: "/assets/founder.png",
    foundation_logo: "/assets/logo.png",
    splash_bg_color: "#ffffff",
    splash_text: "Service. Commitment. Resolve.",
    splash_logo: "/assets/logo.png",
    marquee_type: "rss",
    marquee_rss_url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=2&Regid=3&reg=48",
    thought_type: "rss",
    thought_rss_url: "https://mpinfo.org/RSSFeed/RSSFeed_News.xml",
    drik_panchang_active: "true",
    weather_active: "true",
    cert_volunteer_bg: "/assets/certificate_volunteer.png",
    cert_donor_bg: "/assets/certificate_donor.png",
    module_healthcare: "true",
    module_employment: "true",
    module_utilities: "true",
    module_epaper: "true",
    sos_police: "112",
    sos_ambulance: "102",
    sos_women: "1091",
    policy_privacy_url: "https://therpfoundation.org/privacy",
    policy_terms_url: "https://therpfoundation.org/terms"
  };

  try {
    // Only try to insert if the table exists (it should, migrations ran)
    const checkRes = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'system_configs'");
    if (checkRes.rows.length === 0) return;

    for (const [key, value] of Object.entries(defaults)) {
      await client.query(
        "INSERT INTO system_configs (config_key, config_value) VALUES ($1, $2) ON CONFLICT (config_key) DO NOTHING",
        [key, String(value)]
      );
    }
    console.log("Seeded default system_configs successfully.");
  } catch(e) {
    console.error("Seed failed:", e);
  }
}
`;

c = seedFunc + "\n" + c;

c = c.replace(
  "if (appliedCount > 0) {",
  "await seedSystemConfigs(client);\n    if (appliedCount > 0) {"
);

fs.writeFileSync('src/db/migrationRunner.ts', c);
console.log("Patched migrationRunner.ts");
