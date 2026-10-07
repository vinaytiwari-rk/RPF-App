const fs = require('fs');

let m = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const navOld = `  const nav = (p: string) => {
    if (user?.role === "guest" && (p === "/services" || p === "/impact" || p === "/activity" || p === "/notifications" || p === "/grievance")) {
      setGuest(true); return;
    }
    navigate(p);
  };`;
const navNew = `  const nav = (p: string) => { navigate(p); };`;
m = m.replace(navOld, navNew);

const modalOld = `      {guest && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#E67817]">
              <LogIn className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your personal community features.</p>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setGuest(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">Close</button>
                <button onClick={() => { setGuest(false); navigate("/login"); }} className="flex-1 rounded-xl bg-[#167C5A] px-4 py-3 text-sm font-semibold text-white">Sign in</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}`;
m = m.replace(modalOld, '');

// If it fails because of spaces, we just remove the lines using lines
let lines = m.split('\n');
let filteredLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('if (user?.role === "guest" &&')) {
        skip = true;
    }
    if (skip && lines[i].includes('navigate(p);')) {
        skip = false;
        filteredLines.push('    navigate(p);');
        continue;
    }
    if (skip && lines[i].includes('};')) {
        skip = false;
        filteredLines.push('  };');
        continue;
    }
    if (skip) continue;

    if (lines[i].includes('{guest && (')) {
        skip = true;
        continue;
    }
    if (skip && lines[i].includes(')}')) {
        skip = false;
        continue;
    }
    if (skip) continue;

    filteredLines.push(lines[i]);
}

fs.writeFileSync('src/layouts/MainLayout.tsx', filteredLines.join('\n'), 'utf8');

// For profile, just force import LogIn
let p = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
if (!p.includes('LogIn,')) {
    p = p.replace('import { \n  Award', 'import { LogIn, \n  Award');
    p = p.replace('import { LogIn } from "lucide-react";', '');
    p = p.replace('import { \n  Award', 'import { LogIn, \n  Award');
    p = p.replace(/import \{.*?Award/s, (match) => {
        if (!match.includes('LogIn')) {
            return match.replace('Award', 'LogIn,\n  Award');
        }
        return match;
    });
}
fs.writeFileSync('src/pages/Profile.tsx', p, 'utf8');
console.log('Lines replaced');
