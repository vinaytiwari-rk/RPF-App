const fs = require('fs');
let c = fs.readFileSync('src/pages/BloodNetwork.tsx', 'utf8');

c = c.replace(
  '<div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black text-red-700">',
  '<div className="flex items-start justify-between gap-3"><div><span className="text-[10px] uppercase font-black text-slate-400">Request No: {req.id.split(\'-\')[0].toUpperCase()}</span><p className="text-lg font-black text-red-700">'
);

fs.writeFileSync('src/pages/BloodNetwork.tsx', c);
