import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the end of the users CREATE TABLE IF NOT EXISTS block
users_regex = re.compile(r'("registeredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW\(\)\n\s*\)\n\s*`\);)')

schema_updates = """
    // PHASE 2: Unify users table and add missing volunteer/auth columns safely
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
      ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS registration_number VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS father_husband_name TEXT,
      ADD COLUMN IF NOT EXISTS mother_name TEXT,
      ADD COLUMN IF NOT EXISTS dob DATE,
      ADD COLUMN IF NOT EXISTS education JSONB,
      ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
      ADD COLUMN IF NOT EXISTS skills JSONB,
      ADD COLUMN IF NOT EXISTS reason_for_joining TEXT,
      ADD COLUMN IF NOT EXISTS availability VARCHAR(100),
      ADD COLUMN IF NOT EXISTS national_id_1 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS national_id_2 VARCHAR(50),
      ADD COLUMN IF NOT EXISTS country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
      ADD COLUMN IF NOT EXISTS area_locality VARCHAR(255),
      ADD COLUMN IF NOT EXISTS sansad_kshetra VARCHAR(255),
      ADD COLUMN IF NOT EXISTS vidhan_sabha VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ward_no VARCHAR(255);
    `);

    // Ensure default super admin exists
    await client.query(`
      INSERT INTO users (id, name, username, password_hash, role)
      VALUES ('admin', 'System Administrator', 'admin', '$2a$10$D/x31v5.7r7j0U.tH1Mv3ui/b0f1UuVfOaB2b9m8mUoU0F3aXF7u6', 'super_admin')
      ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
    `);

    // Add Tracking Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        token VARCHAR(255) UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        "userId" VARCHAR(255),
        token VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_cms_content (
        id VARCHAR(255) PRIMARY KEY,
        service_id VARCHAR(255) UNIQUE,
        content_html TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
"""

match = users_regex.search(content)
if match:
    new_content = content[:match.end()] + "\n" + schema_updates + content[match.end():]
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched schema successfully")
else:
    print("Regex match failed")
