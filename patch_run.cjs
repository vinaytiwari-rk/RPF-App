const fs = require('fs');
let c = fs.readFileSync('run_migration_and_seed.js', 'utf8');
c = c.replace(/const connStr =.*/, 'const connStr = "postgresql://rp_admin:therpfoundation%40321@localhost:5432/rp_db";');
fs.writeFileSync('run_migration_and_seed.js', c);
