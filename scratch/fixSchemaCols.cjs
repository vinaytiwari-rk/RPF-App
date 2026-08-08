const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/server.ts', 'utf8');

// First remove the broken SELECT COUNT... ALTER TABLE block if it exists
content = content.replace(/await runQuery\(`SELECT COUNT\(\*\) AS total FROM \(ALTER TABLE users[\s\S]*?`\);/g, "");

const additionalAlters = `
    // ADD MULTI-LINGUAL & NEW COLUMNS TO EXISTING TABLES
    const multiLingualCols = [
      { table: 'users', col: 'address', type: 'TEXT' },
      { table: 'users', col: 'gender', type: 'TEXT' },
      { table: 'users', col: 'dob', type: 'TEXT' },
      { table: 'users', col: 'blood_group', type: 'TEXT' },
      { table: 'users', col: 'onboardingCompleted', type: 'BOOLEAN DEFAULT false' },
      { table: 'users', col: 'points', type: 'INTEGER DEFAULT 0' },
      { table: 'users', col: 'janSevaCardStatus', type: 'TEXT DEFAULT \\'none\\'' },
      { table: 'users', col: 'janSevaCardNo', type: 'TEXT DEFAULT \\'\\'' },
      { table: 'users', col: 'isVolunteer', type: 'BOOLEAN DEFAULT false' },
      { table: 'users', col: 'isDonor', type: 'BOOLEAN DEFAULT false' },
      { table: 'users', col: 'registration_number', type: 'VARCHAR(255) UNIQUE' },
      
      { table: 'jobs', col: 'titleEn', type: 'TEXT' },
      { table: 'jobs', col: 'titleHi', type: 'TEXT' },
      { table: 'jobs', col: 'locEn', type: 'TEXT' },
      { table: 'jobs', col: 'locHi', type: 'TEXT' },
      
      { table: 'campaigns', col: 'titleEn', type: 'TEXT' },
      { table: 'campaigns', col: 'titleHi', type: 'TEXT' },
      { table: 'campaigns', col: 'descriptionEn', type: 'TEXT' },
      { table: 'campaigns', col: 'descriptionHi', type: 'TEXT' },
      
      { table: 'health_camps', col: 'titleEn', type: 'TEXT' },
      { table: 'health_camps', col: 'titleHi', type: 'TEXT' },
      { table: 'health_camps', col: 'dateEn', type: 'TEXT' },
      { table: 'health_camps', col: 'dateHi', type: 'TEXT' },
      { table: 'health_camps', col: 'locationEn', type: 'TEXT' },
      { table: 'health_camps', col: 'locationHi', type: 'TEXT' },
      { table: 'health_camps', col: 'descriptionEn', type: 'TEXT' },
      { table: 'health_camps', col: 'descriptionHi', type: 'TEXT' },
      
      { table: 'social_posts', col: 'contentEn', type: 'TEXT' },
      { table: 'social_posts', col: 'contentHi', type: 'TEXT' }
    ];

    for (const item of multiLingualCols) {
      await runQuery(\`ALTER TABLE \${item.table} ADD COLUMN IF NOT EXISTS "\${item.col}" \${item.type}\`, [], \`\${item.table} add \${item.col}\`);
    }

    // Attempt to migrate existing data where possible (e.g. title to titleEn)
    const migrateCols = [
      { table: 'jobs', old: 'title', new: 'titleEn' },
      { table: 'jobs', old: 'location', new: 'locEn' },
      { table: 'campaigns', old: 'title', new: 'titleEn' },
      { table: 'campaigns', old: 'description', new: 'descriptionEn' },
      { table: 'health_camps', old: 'title', new: 'titleEn' },
      { table: 'health_camps', old: 'date', new: 'dateEn' },
      { table: 'health_camps', old: 'location', new: 'locationEn' },
      { table: 'health_camps', old: 'description', new: 'descriptionEn' },
      { table: 'social_posts', old: 'content', new: 'contentEn' }
    ];

    for (const item of migrateCols) {
      // Just try to update. If old column doesn't exist anymore, it fails silently (which is fine).
      await runQuery(\`UPDATE \${item.table} SET "\${item.new}" = "\${item.old}" WHERE "\${item.new}" IS NULL AND "\${item.old}" IS NOT NULL\`, [], \`\${item.table} migrate \${item.old} to \${item.new}\`);
    }
`;

if (!content.includes('multiLingualCols')) {
  content = content.replace(/await runQuery\(`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS cover TEXT`, \[\], "volunteers add cover column"\);/, 
  `await runQuery(\`ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS cover TEXT\`, [], "volunteers add cover column");\n${additionalAlters}`);
  fs.writeFileSync('D:/rp-foundation/server.ts', content);
  console.log('Schema migration added to server.ts');
} else {
  console.log('Already added');
}
