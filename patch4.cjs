const fs = require('fs');
let c = fs.readFileSync('src/pages/BloodNetwork.tsx', 'utf8');

c = c.replace(
  '<select value={joinGroup}',
  '<div className="mt-5 text-left"><label className="text-xs font-bold text-slate-500 uppercase">Select Blood Group <span className="text-red-600 ml-0.5">*</span></label><select value={joinGroup}'
);

c = c.replace(
  'className="mt-5 w-full p-3 border rounded-xl text-sm font-bold"',
  'className="mt-1 w-full p-3 border rounded-xl text-sm font-bold"'
);

c = c.replace(
  '</select><button onClick={join}',
  '</select></div><button onClick={join}'
);

fs.writeFileSync('src/pages/BloodNetwork.tsx', c);
