import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Environment & Database URL Fallback
db_regex = re.compile(r'const dbUrl = process\.env\.LOCAL_DB_URL \|\| process\.env\.DATABASE_URL;\nconst pool = new pg\.Pool\(\{\n  connectionString: dbUrl,\n  ssl: dbUrl && \(dbUrl\.includes\("localhost"\) \|\| dbUrl\.includes\("127\.0\.0\."\)\) \? false : \{ rejectUnauthorized: false \}\n\}\);')

fallback_db_code = """const dbUrl = process.env.LOCAL_DB_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/rp_foundation";
const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("localhost") || dbUrl.includes("127.0.0.") ? false : { rejectUnauthorized: false }
});"""
content = db_regex.sub(fallback_db_code, content)

# 2. CORS & Middleware Integration
if 'import cors from "cors";' not in content:
    content = content.replace('import express from "express";', 'import express from "express";\nimport cors from "cors";')

middleware_regex = re.compile(r'const app = express\(\);\napp\.use\(express\.json\(\)\);')
new_middleware = """const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));"""
content = middleware_regex.sub(new_middleware, content)

# 3. Static Path & Image Upload Endpoint Repair
upload_regex = re.compile(r'const destDir = path\.join\(process\.cwd\(\), "appapi\.therpfoundation\.org", "public", "uploads"\);\n  if \(\!fs\.existsSync\(destDir\)\) \{\n    fs\.mkdirSync\(destDir, \{ recursive: true \}\);\n  \}\n  \n  const destFilePath = path\.join\(destDir, filename\);\n  await fs\.promises\.writeFile\(destFilePath, file\.buffer\);\n  \n  return `https://appapi\.therpfoundation\.org/uploads/\$\{filename\}`;')

new_upload = """const destDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const destFilePath = path.join(destDir, filename);
  await fs.promises.writeFile(destFilePath, file.buffer);
  
  return `/uploads/${filename}`;"""
content = upload_regex.sub(new_upload, content)

static_upload_regex = re.compile(r'app\.use\("/uploads", express\.static\(path\.join\(process\.cwd\(\), "appapi\.therpfoundation\.org", "public", \n?"uploads"\)\)\);')
new_static_upload = 'app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));'
content = static_upload_regex.sub(new_static_upload, content)

# 4. Missing CMS & Config Endpoint Handling
# We will inject /api/cms/config next to /api/settings
cms_config_code = """
app.get("/api/cms/config", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM settings WHERE id = $1", ["cms_data"]);
    if (result.rows.length > 0 && result.rows[0].founderMessageEn) {
      res.json({ success: true, data: JSON.parse(result.rows[0].founderMessageEn) });
    } else {
      res.json({ success: true, data: {} });
    }
  } catch (error: any) {
    res.json({ success: true, data: {} });
  }
});

app.post("/api/cms/config", async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO settings (id, "founderMessageEn") VALUES ('cms_data', $1) 
       ON CONFLICT (id) DO UPDATE SET "founderMessageEn" = $1`,
      [JSON.stringify(req.body)]
    );
    res.json({ success: true, data: req.body });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
"""
if 'app.get("/api/cms/config"' not in content:
    content = content.replace('app.get("/api/cms", async (req, res) => {', cms_config_code + '\napp.get("/api/cms", async (req, res) => {')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
