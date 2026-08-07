const fs = require('fs');

// Fix Home.tsx
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

home = home.replace(/const serviceIdToEmoji: Record<string, string> = \{[\s\S]*?\};\n\n/m, '');

home = home.replace(/const serviceIdToGradient: Record<string, string> = \{[\s\S]*?\};\n/m, 
`const serviceIdToGradient: Record<string, string> = {
    card: "from-orange-500 via-amber-500 to-yellow-500", 
    blood: "from-red-600 via-rose-500 to-red-700", 
    "health-care": "from-green-500 via-emerald-500 to-teal-500", 
    environment: "from-green-600 via-emerald-600 to-green-700", 
    culture: "from-[#FF9933] via-orange-500 to-amber-600", 
    schemes: "from-[#000080] via-blue-700 to-indigo-800", 
    skills: "from-slate-100 via-slate-200 to-slate-300", 
    farmer: "from-green-500 via-emerald-600 to-green-700", 
    disaster: "from-[#FF9933] via-orange-600 to-red-500", 
    jobs: "from-[#000080] via-indigo-600 to-blue-600", 
  };\n`);

const oldHomeIconBlock2 = /<div className="relative w-11 h-11 bg-gradient-to-br from-\[#000080\].*?overflow-hidden">\s*<div className="absolute inset-0 bg-white\/20 mix-blend-overlay rounded-lg"><\/div>\s*\{\s*serviceIdToEmoji\[action.id\] \? \([\s\S]*?\) : \([\s\S]*?\)\s*\}\s*<\/div>/m;

const replacementIconBlock = `<div className={\`relative w-11 h-11 bg-gradient-to-br \${action.glowGradient || 'from-slate-200 to-slate-300'} border border-slate-200/50 rounded-lg shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:scale-105 overflow-hidden\`}>
    <div className="absolute inset-0 bg-white/20 mix-blend-overlay rounded-lg"></div>
    <IconComponent className={\`w-6 h-6 z-10 \${action.glowGradient?.includes('slate-100') ? 'text-[#000080]' : 'text-white drop-shadow-sm'}\`} />
</div>`;

home = home.replace(oldHomeIconBlock2, replacementIconBlock);

fs.writeFileSync('src/pages/Home.tsx', home);

// Fix Services.tsx
let srv = fs.readFileSync('src/pages/Services.tsx', 'utf8');

srv = srv.replace(/const serviceIdToEmoji: Record<string, string> = \{[\s\S]*?\};\n\n/m, '');
srv = srv.replace(/\{isHi \? "21.*?" : "21.*?"\}/m, '{isHi ? "RP Civic Services Hub" : "Single Platform"}');

const oldGradients = /const gradients = \[[\s\S]*?\];/m;
srv = srv.replace(oldGradients, 
`const gradients = [
                { bg: "from-[#FF9933] via-orange-500 to-amber-500", shadow: "shadow-[0_0_20px_rgba(255,153,51,0.4)] group-hover:shadow-[0_0_30px_rgba(255,153,51,0.6)]" },
                { bg: "from-slate-50 via-slate-100 to-slate-200", shadow: "shadow-[0_0_20px_rgba(226,232,240,0.6)] group-hover:shadow-[0_0_30px_rgba(203,213,225,0.8)]" },
                { bg: "from-[#138808] via-green-600 to-emerald-600", shadow: "shadow-[0_0_20px_rgba(19,136,8,0.4)] group-hover:shadow-[0_0_30px_rgba(19,136,8,0.6)]" },
                { bg: "from-[#000080] via-blue-800 to-indigo-800", shadow: "shadow-[0_0_20px_rgba(0,0,128,0.4)] group-hover:shadow-[0_0_30px_rgba(0,0,128,0.6)]" },
              ];`);

const oldSrvIconBlock = /<div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl shadow-sm flex[\s\S]*?<\/div>/m;
srv = srv.replace(oldSrvIconBlock, 
`<div className={\`w-12 h-12 bg-gradient-to-br \${currentGradient.bg} border border-slate-200/50 rounded-xl shadow-sm flex items-center justify-center transition-all duration-300 overflow-hidden relative group-hover:scale-110 \${currentGradient.shadow}\`}>
    <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
    <IconComponent className={\`w-6 h-6 z-10 \${currentGradient.bg.includes('slate-50') ? 'text-[#000080]' : 'text-white'}\`} />
</div>`);

fs.writeFileSync('src/pages/Services.tsx', srv);
console.log('UI theme updated successfully!');
