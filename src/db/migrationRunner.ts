
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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
function getDirname(): string {
  if (typeof __dirname !== 'undefined') return __dirname;
  try {
    const metaUrl = (import.meta as any)?.url;
    if (metaUrl) return path.dirname(fileURLToPath(metaUrl));
  } catch {}
  return process.cwd();
}

export async function runMigrationsOnPool(pool: any) {
  const currentDir = getDirname();
  const candidates = [
    path.resolve(currentDir, 'migrations'),
    path.resolve(process.cwd(), 'migrations'),
    path.resolve(path.dirname(process.argv[1] || ''), 'migrations'),
  ];
  const migrationsDir = candidates.find(dir => fs.existsSync(dir)) || candidates[0];
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found on server boot. Checked paths:', candidates.join(', '));
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter((name: string) => /^\d{4}[-_]\d{2}[-_]\d{2}.*\.sql$/.test(name))
    .sort();

  if (files.length === 0) {
    console.log('No dated SQL migrations found.');
    return;
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT pg_advisory_lock(84920491)');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    let appliedCount = 0;
    for (const file of files) {
      const checkRes = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
      if (checkRes.rows.length > 0) {
        continue;
      }

      console.log(`Applying server boot migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');

      console.log(`Successfully applied server boot migration: ${file}`);
      appliedCount++;
    }
    await seedSystemConfigs(client);
    if (appliedCount > 0) {
      console.log(`Server boot migration complete: ${appliedCount} file(s) applied successfully.`);
    }
  } catch (err: any) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Server boot database migration failed:', err);
  } finally {
    if (client) {
      await client.query('SELECT pg_advisory_unlock(84920491)').catch(() => {});
      client.release();
    }
  }
}
