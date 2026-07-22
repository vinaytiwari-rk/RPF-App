import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update initDatabase
admin_table_sql = """
    // Create admin_credentials table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_credentials (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'admin',
        username TEXT NOT NULL DEFAULT 'admin',
        password_hash TEXT NOT NULL
      )
    `);
    
    // Seed default admin if missing
    const adminRes = await client.query(`SELECT count(*) FROM admin_credentials`);
    if (parseInt(adminRes.rows[0].count) === 0) {
      const defaultHash = await bcrypt.hash('admin', 10);
      await client.query(`INSERT INTO admin_credentials (id, username, password_hash) VALUES ('admin', 'admin', $1)`, [defaultHash]);
    }
"""
content = content.replace('// Create password_reset_tokens table', admin_table_sql + '\n    // Create password_reset_tokens table')

# 2. Update login-multi
login_multi_old = """      if (identifier === "admin" && password === "admin") {
         return res.json({ success: true, user: { id: "usr_staff_admin", name: "System Administrator", role: "super_admin" } });
      }"""

login_multi_new = """      // Check Admin Credentials first
      const adminRes = await pool.query(`SELECT * FROM admin_credentials WHERE username = $1`, [identifier]);
      if (adminRes.rows.length > 0) {
        const adminUser = adminRes.rows[0];
        const isMatch = await bcrypt.compare(password, adminUser.password_hash);
        if (isMatch) {
          return res.json({ success: true, user: { id: "usr_staff_admin", name: "System Administrator", role: "super_admin" } });
        }
      }"""
content = content.replace(login_multi_old, login_multi_new)

# 3. Add PUT /api/admin/hq/credentials
admin_api = """
// Admin HQ Credentials API
app.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).json({ error: "Missing username or password" });
    
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE admin_credentials SET username = $1, password_hash = $2 WHERE id = 'admin'`,
      [username, hash]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
"""
content = content.replace('app.post("/api/auth/reset-ticket"', admin_api + '\napp.post("/api/auth/reset-ticket"')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated server.ts successfully!")
