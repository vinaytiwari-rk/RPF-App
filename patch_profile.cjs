const fs = require('fs');

let file = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

// Remove getMemberLevel function
file = file.replace(/type Level[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}/, '');

// Remove getBadges function
file = file.replace(/type Badge[\s\S]*?function getBadges[\s\S]*?return \[[\s\S]*?\];[\s\S]*?\}/, '');

// Remove const level and const badges
file = file.replace(/const level = getMemberLevel[\s\S]*?const earnedCount = badges\.filter[^\n]*\n/, '');

// Remove Level badge
file = file.replace(/<div className={`absolute -bottom-2 -right-1[\s\S]*?<\/div>/, '');

// Remove earned badges
file = file.replace(/<div className="flex flex-col">[\s\S]*?<span className="text-sm font-extrabold text-\[#D4AF37\]">\{earnedCount\}<\/span>[\s\S]*?<span className="text-\[9px\] font-bold text-slate-400 uppercase tracking-widest mt-0\.5">Badges<\/span>[\s\S]*?<\/div>[\s\S]*?<div className="w-\[1px\] h-6 bg-white\/10 self-center"><\/div>/, '');

// Remove points
file = file.replace(/<div className="flex flex-col">[\s\S]*?<span className="text-sm font-extrabold text-\[#D4AF37\]">\{level\.points\}<\/span>[\s\S]*?<span className="text-\[9px\] font-bold text-slate-400 uppercase tracking-widest mt-0\.5">Points<\/span>[\s\S]*?<\/div>[\s\S]*?<div className="w-\[1px\] h-6 bg-white\/10 self-center"><\/div>/, '');

// Remove the whole achievements section
file = file.replace(/<div className="glass-card bg-white\/90 p-4 border-gold-soft shadow-gold-premium space-y-3\.5">[\s\S]*?<\/div>[\s\S]*?<\/div>/, '');

fs.writeFileSync('src/pages/Profile.tsx', file);
