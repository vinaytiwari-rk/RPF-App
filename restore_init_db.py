import re

with open('init_db.ts', 'r', encoding='utf-8') as f:
    init_db_content = f.read()

new_tables = """
    // Create passkeys table for WebAuthn
    await client.query(`
      CREATE TABLE IF NOT EXISTS passkeys (
        "credentialID" TEXT PRIMARY KEY,
        "publicKey" TEXT NOT NULL,
        "counter" BIGINT NOT NULL,
        "transports" TEXT,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create password_reset_tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

"""

init_db_content = init_db_content.replace('console.log("Database initialized successfully!");', new_tables + 'console.log("Database initialized successfully!");')

with open('server.ts', 'r', encoding='utf-8') as f:
    server_content = f.read()

match = re.search(r'// =============================================================================\n\s*// JOBS ENDPOINTS', server_content)
if match:
    new_server_content = server_content[:match.start()] + "\n// DATABASE SCHEMA & AUTO-INITIALIZATION\n" + init_db_content + "\n" + server_content[match.start():]
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(new_server_content)
    print('Successfully restored initDatabase in server.ts')
else:
    print('Could not find JOBS ENDPOINTS marker in server.ts')
