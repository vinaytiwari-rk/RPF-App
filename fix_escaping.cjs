const fs = require('fs');
['ImpactStudio.tsx', 'LiveTVStudio.tsx', 'ExploreStudio.tsx', 'ProfileStudio.tsx'].forEach(f => {
  let p = 'src/pages/admin/studios/' + f;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  fs.writeFileSync(p, c);
});
console.log('Fixed escaping');
