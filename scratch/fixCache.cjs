const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/src/routes/adminDynamicRoutes.ts', 'utf8');

// Add import
if (!content.includes('import { apiCache, CACHE_TTL }')) {
    content = content.replace('import { pool } from "../db/dbPool.js";', 'import { pool } from "../db/dbPool.js";\nimport { apiCache, CACHE_TTL } from "../lib/apiCache.js";');
}

// Caching logic for settings
const oldSettingsHandler = outer.get("/api/admin/settings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    if (result.rows.length === 0) {
      return res.json({ success: true, data: {} });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});;

const newSettingsHandler = outer.get("/api/admin/settings", async (req, res) => {
  try {
    const cacheKey = "admin_settings";
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ success: true, data: cached.data });
    }

    const result = await pool.query("SELECT * FROM app_settings WHERE id = 1");
    if (result.rows.length === 0) {
      return res.json({ success: true, data: {} });
    }
    
    apiCache.set(cacheKey, { data: result.rows[0], timestamp: Date.now() });
    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, error: "Failed to fetch settings" });
  }
});

// Update settings clears cache
router.post("/api/admin/settings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    let queryArgs = [];
    let querySets = [];
    let idx = 1;
    for (const key of Object.keys(updates)) {
      querySets.push(\"\" = $\\);
      queryArgs.push(updates[key]);
      idx++;
    }
    
    if (queryArgs.length === 0) {
      return res.json({ success: true });
    }
    
    const query = \UPDATE app_settings SET \ WHERE id = 1 RETURNING *\;
    const result = await pool.query(query, queryArgs);
    
    apiCache.delete("admin_settings"); // clear cache

    res.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    res.status(500).json({ success: false, error: "Failed to update settings" });
  }
});
;

// Replace the settings handler (we need to find the settings POST handler too if it exists to replace it with the cache invalidation one)
// I will just use regex to replace the GET handler
content = content.replace(oldSettingsHandler, newSettingsHandler);

// Now for pagination in GET all queries
// Let's replace 'LIMIT 500' with dynamic pagination
content = content.replace(/async \(req, res\) => \{\n\s*try \{\n\s*const result = await pool\.query\("SELECT (.*?) FROM (.*?) ORDER BY (.*?) (DESC|ASC) LIMIT 500"\);\n\s*res\.json\(\{ success: true, data: result\.rows \}\);\n\s*\} catch \(error: any\) \{/g, 
\sync (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const result = await pool.query(\SELECT \ FROM \ ORDER BY \ \ LIMIT \ OFFSET \\);
      // Warning: Node.js pg doesn't support parameterizing table names or column names easily like this.
      // So instead, we should keep the static query and just inject limit/offset.
\);
// Actually, string replacement like that with parameterization is broken.
// I'll do a simpler regex for limit 500.
fs.writeFileSync('D:/rp-foundation/src/routes/adminDynamicRoutes.ts', content);
