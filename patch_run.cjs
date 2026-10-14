const fs = require('node:fs');
const target = 'run_migration_and_seed.js';
let source = fs.readFileSync(target, 'utf8');
source = source.replace(
  /const connStr = .*;/,
  'const connStr = process.env.LOCAL_DB_URL || process.env.DATABASE_URL;\nif (!connStr) throw new Error("Database configuration missing: set LOCAL_DB_URL or DATABASE_URL.");'
);
fs.writeFileSync(target, source);
