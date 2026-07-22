import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Cache Variable
cache_init = """
const app = express();

const apiCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute
"""
content = content.replace("const app = express();", cache_init.strip())

# Patch /api/campaigns
campaigns_find = """app.get("/api/campaigns", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    res.json({ campaigns: result.rows });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});"""

campaigns_replace = """app.get("/api/campaigns", async (req, res) => {
  const cached = apiCache.get("/api/campaigns");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const result = await pool.query(
      'SELECT id, "titleEn", "titleHi", "goalAmount", "raisedAmount", "imageUrl", "imageUrl" AS "coverImgUrl", urgent, "createdAt" FROM campaigns ORDER BY "createdAt" DESC'
    );
    const data = { campaigns: result.rows };
    apiCache.set("/api/campaigns", { data, timestamp: Date.now() });
    res.json(data);
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: error.message });
  }
});"""

content = content.replace(campaigns_find, campaigns_replace)

# Patch /api/stats
stats_find = """app.get("/api/stats", async (req, res) => {
  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;

  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const sRes = await pool.query(`
      SELECT COUNT(*) FROM service_submissions 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {}

  res.json({
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  });
});"""

stats_replace = """app.get("/api/stats", async (req, res) => {
  const cached = apiCache.get("/api/stats");
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  let beneficiaries = 0;
  let volunteers = 0;
  let healthCamps = 0;
  let scholarships = 0;

  try {
    const bRes = await pool.query("SELECT COUNT(*) FROM card_applications");
    beneficiaries = parseInt(bRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const vRes = await pool.query("SELECT COUNT(*) FROM volunteers");
    volunteers = parseInt(vRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const hRes = await pool.query("SELECT COUNT(*) FROM health_camps");
    healthCamps = parseInt(hRes.rows[0].count, 10);
  } catch (e) {}

  try {
    const sRes = await pool.query(`
      SELECT COUNT(*) FROM service_submissions 
      WHERE "serviceName" = 'Scholarships Support' OR "serviceNameEn" = 'Scholarships Support'
    `);
    scholarships = parseInt(sRes.rows[0].count, 10);
  } catch (e) {}

  const data = {
    beneficiaries,
    volunteers,
    healthCamps,
    scholarships
  };
  apiCache.set("/api/stats", { data, timestamp: Date.now() });
  res.json(data);
});"""

content = content.replace(stats_find, stats_replace)

# Inject Indexes
index_code = """
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);
      CREATE INDEX IF NOT EXISTS idx_community_posts_segment ON community_posts(segment);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
"""

content = content.replace('    console.log("Database initialized");', index_code.strip() + '\n    console.log("Database initialized");')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched server.ts")
