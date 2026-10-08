import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connStr = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://rp_admin:therpfoundation%40321@localhost:5432/rp_db";

const pool = new pg.Pool({
  connectionString: connStr.replace(/@base(?=[:\/]|$)/g, '@localhost'),
  ssl: false
});

async function seed() {
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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(defaults)) {
      await client.query(
        `INSERT INTO system_configs (config_key, config_value) 
         VALUES ($1, $2) 
         ON CONFLICT (config_key) DO NOTHING`,
        [key, value]
      );
    }
    await client.query('COMMIT');
    console.log("Seeded system_configs with default values!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Failed to seed configs", err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
