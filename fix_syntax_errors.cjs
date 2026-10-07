const fs = require('fs');

let m = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// The block is:
//     if (user?.role === "guest" && (p === "/services" || p === "/impact" || p === "/activity" || p === "/notifications" || p === "/grievance")) {
//       setGuest(true); return;
//     }
m = m.replace(/if \(user\?.role === "guest"[^}]+?\}\n/g, '');

// The block is:
//       {guest && (
//         <div className="fixed inset-0...
//         </div>
//       )}
m = m.replace(/\{guest && \([\s\S]+?<\/div>\n      \)\}/g, '');
m = m.replace(/const \[guest, setGuest\] = useState\(false\);/g, '');

fs.writeFileSync('src/layouts/MainLayout.tsx', m, 'utf8');

let p = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
if (!p.includes('LogIn')) {
  p = p.replace('import { \n  Award', 'import { LogIn, \n  Award');
}
fs.writeFileSync('src/pages/Profile.tsx', p, 'utf8');
console.log('Fixed');
