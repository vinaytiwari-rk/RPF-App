const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchRegex, replacement) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const newContent = content.replace(searchRegex, replacement);
  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log('Updated ' + filePath);
}

// 1. Types.ts
replaceInFile('src/types.ts', /^\s*points:\s*number;\n/gm, '');
replaceInFile('src/types.ts', /^\s*badge:\s*.*?\n/gm, '');
replaceInFile('src/types.ts', /^\s*pointsReward:\s*number;\n/gm, '');

// 2. Profile.tsx
replaceInFile('src/pages/Profile.tsx', /<div className="text-center">[\s\S]*?<span className="text-xs font-black text-\[#FF9933\]">\{user\.points \|\| 0\}<\/span>[\s\S]*?Impact Points<\/span>[\s\S]*?<\/div>[\s\S]*?<div className="w-px h-6 bg-slate-200"><\/div>/gm, '');

// 3. VolunteerDashboard.tsx
replaceInFile('src/pages/VolunteerDashboard.tsx', /points:\s*number;/g, '');
replaceInFile('src/pages/VolunteerDashboard.tsx', /<div className="flex flex-col items-center bg-white\/20 rounded-xl p-2">[\s\S]*?\{user\?\.points \|\| 0\}<\/span>[\s\S]*?Impact<\/span>[\s\S]*?<\/div>/gm, '');
replaceInFile('src/pages/VolunteerDashboard.tsx', /<span className="text-\[10px\] font-black text-slate-400">\+\{task\.points\} Pts<\/span>/g, '');

// 4. authRoutes.ts
replaceInFile('src/routes/authRoutes.ts', /,\s*points,\s*badges/g, '');
replaceInFile('src/routes/authRoutes.ts', /points:\s*0,\s*badges:\s*\[\]/g, '');

// 5. healthRoutes.ts
replaceInFile('src/routes/healthRoutes.ts', /\/\/ Reward donation points to user\s*await pool\.query\([\s\S]*?\);/g, '');

// 6. volunteerRoutes.ts
replaceInFile('src/routes/volunteerRoutes.ts', /,\s*points/g, '');
replaceInFile('src/routes/volunteerRoutes.ts', /points\s*\|\|\s*10,\s*/g, '');
replaceInFile('src/routes/volunteerRoutes.ts', /UPDATE volunteer_tasks SET status = \ WHERE id = \ RETURNING "volunteerId", points/g, 'UPDATE volunteer_tasks SET status =  WHERE id =  RETURNING "volunteerId"');
replaceInFile('src/routes/volunteerRoutes.ts', /const \{ volunteerId, points \} = taskRes\.rows\[0\];/g, 'const { volunteerId } = taskRes.rows[0];');
replaceInFile('src/routes/volunteerRoutes.ts', /if \(status === 'completed'\) \{[\s\S]*?\}/g, '');
replaceInFile('src/routes/volunteerRoutes.ts', /\/\/ Add points as 0 for now since it's missing from volunteers schema\s*const volunteers = result\.rows\.map\(v => \(\{ \.\.\.v, points: 0 \}\)\);/g, 'const volunteers = result.rows;');
replaceInFile('src/routes/volunteerRoutes.ts', /router\.post\("\/api\/volunteers\/:id\/points", authenticateToken, requireAdmin, async \(req, res\) => \{[\s\S]*?\}\);/g, '');

// 7. userRoutes.ts
replaceInFile('src/routes/userRoutes.ts', /,\s*points,\s*badges/g, '');

// 8. server.ts
replaceInFile('server.ts', /points\s+INTEGER\s+DEFAULT\s+0,/g, '');
replaceInFile('server.ts', /badges\s+JSONB\s+DEFAULT\s+'\[\]'::jsonb,/g, '');
replaceInFile('server.ts', /points\s+INTEGER\s+DEFAULT\s+0/g, '');

console.log('Cleanup complete!');
