import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connStr = "postgresql://rp_admin:therpfoundation%40321@localhost:5432/rp_db";

const pool = new pg.Pool({
  connectionString: connStr.replace(/@base(?=[:\/]|$)/g, '@localhost'),
  ssl: false
});

async function run() {
  try {
    const sql = fs.readFileSync("migrations/20261008_01_system_configs.sql", "utf8");
    await pool.query(sql);
    console.log("Migration executed!");
    
    // Seed right after
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

    for (const [key, value] of Object.entries(defaults)) {
      await pool.query(
        `INSERT INTO system_configs (config_key, config_value) 
         VALUES ($1, $2) 
         ON CONFLICT (config_key) DO NOTHING`,
        [key, value]
      );
    }
    console.log("Seeded default configs!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
