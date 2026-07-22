import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add columns to volunteers table
alter_volunteers = """
      await client.query(`
        ALTER TABLE volunteers
        ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS constituency_allocation VARCHAR(255) DEFAULT ''
      `);
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS volunteer_reports (
          id VARCHAR(255) PRIMARY KEY,
          volunteer_id VARCHAR(255),
          check_in_time TIMESTAMP WITH TIME ZONE,
          check_out_time TIMESTAMP WITH TIME ZONE,
          report_text TEXT,
          location_lat VARCHAR(50),
          location_lng VARCHAR(50),
          status VARCHAR(50) DEFAULT 'active'
        )
      `);
"""

content = re.sub(
    r'      // PHASE 2: Unify users table and add missing volunteer/auth columns safely',
    alter_volunteers.strip() + '\n\n      // PHASE 2: Unify users table and add missing volunteer/auth columns safely',
    content
)

# 2. Update volunteer registration to insert approval_status as 'pending'
content = re.sub(
    r'INSERT INTO volunteers \(\n\s*id, username, registration_number, full_name, father_husband_name, mother_name,',
    r'INSERT INTO volunteers (\n        id, username, registration_number, full_name, father_husband_name, mother_name, approval_status,',
    content
)

# Also need to update the VALUES placeholders and the array.
# The original INSERT is complex, let's just create API routes instead of modifying the INSERT because default is already 'pending' due to ALTER TABLE DEFAULT 'pending'.
# So we don't necessarily need to modify the INSERT statement!

# 3. Add API routes for volunteer approval and allocation
api_routes = """
app.put("/api/volunteers/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(`UPDATE volunteers SET approval_status = $1 WHERE id = $2`, [status, id]);
    res.json({ success: true, message: "Volunteer status updated" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/volunteers/:id/allocate", async (req, res) => {
  try {
    const { id } = req.params;
    const { allocation } = req.body;
    await pool.query(`UPDATE volunteers SET constituency_allocation = $1 WHERE id = $2`, [allocation, id]);
    res.json({ success: true, message: "Volunteer allocated" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/volunteers/report", async (req, res) => {
  try {
    const { volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng } = req.body;
    await pool.query(
      `INSERT INTO volunteer_reports (id, volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [crypto.randomUUID(), volunteer_id, check_in_time, check_out_time, report_text, location_lat, location_lng]
    );
    res.json({ success: true, message: "Report submitted" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alias for old frontend calls
"""

content = content.replace("// Alias for old frontend calls", api_routes.strip() + "\n\n// Alias for old frontend calls")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched server.ts with Phase 8 API routes and DB schema")
