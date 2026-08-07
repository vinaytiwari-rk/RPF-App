const fs = require('fs');

let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// 1. Remove serviceIdToEmoji
homeContent = homeContent.replace(/const serviceIdToEmoji: Record<string, string> = \{[\s\S]*?\};\n\n/m, '');

// 2. Replace serviceIdToGradient with Tricolour variants
const tricolourGradients = `const serviceIdToGradient: Record<string, string> = {
    card: "from-orange-500 via-amber-500 to-yellow-500", // Saffron
    blood: "from-red-600 via-rose-500 to-red-700", // Red (Blood)
    "health-care": "from-green-500 via-emerald-500 to-teal-500", // Green
    environment: "from-green-600 via-emerald-600 to-green-700", // Green
    culture: "from-[#FF9933] via-orange-500 to-amber-600", // Saffron
    schemes: "from-[#000080] via-blue-700 to-indigo-800", // Ashoka Blue
    skills: "from-slate-100 via-slate-200 to-slate-300", // White/Silver
    farmer: "from-green-500 via-emerald-600 to-green-700", // Green
    disaster: "from-[#FF9933] via-orange-600 to-red-500", // Saffron/Red
    jobs: "from-[#000080] via-indigo-600 to-blue-600", // Ashoka Blue
  };`;
homeContent = homeContent.replace(/const serviceIdToGradient: Record<string, string> = \{[\s\S]*?\};\n/m, tricolourGradients + '\n');

// 3. Update quick action gradient and icon
homeContent = homeContent.replace(/<div className="relative w-11 h-11 bg-gradient-to-br from-\[#000080\].*?overflow-hidden">[\s\S]*?<\/div>/m, 
`<div className={\`relative w-11 h-11 bg-gradient-to-br \${action.glowGradient || 'from-slate-200 to-slate-300'} border border-slate-200/50 rounded-lg shadow-sm flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:scale-105 overflow-hidden\`}>
    <div className="absolute inset-0 bg-white/20 mix-blend-overlay rounded-lg"></div>
    <IconComponent className={\`w-6 h-6 z-10 \${action.glowGradient?.includes('slate-100') ? 'text-[#000080]' : 'text-white drop-shadow-sm'}\`} />
</div>`);
fs.writeFileSync('src/pages/Home.tsx', homeContent);


let servicesContent = fs.readFileSync('src/pages/Services.tsx', 'utf8');

// 1. Remove 21 text
servicesContent = servicesContent.replace(/\{isHi \? "21.*?" : "21.*?"\}/, 
  '{isHi ? "RP Civic Services Hub" : "Single Platform"}');

// 2. Fix gradients array
const tricolourServiceGradients = `const serviceGradients = [
                { bg: "from-[#FF9933] via-orange-500 to-amber-500", shadow: "shadow-[0_0_20px_rgba(255,153,51,0.4)] group-hover:shadow-[0_0_30px_rgba(255,153,51,0.6)]" },
                { bg: "from-slate-50 via-slate-100 to-slate-200", shadow: "shadow-[0_0_20px_rgba(226,232,240,0.6)] group-hover:shadow-[0_0_30px_rgba(203,213,225,0.8)]" },
                { bg: "from-[#138808] via-green-600 to-emerald-600", shadow: "shadow-[0_0_20px_rgba(19,136,8,0.4)] group-hover:shadow-[0_0_30px_rgba(19,136,8,0.6)]" },
                { bg: "from-[#000080] via-blue-800 to-indigo-800", shadow: "shadow-[0_0_20px_rgba(0,0,128,0.4)] group-hover:shadow-[0_0_30px_rgba(0,0,128,0.6)]" },
              ];`;
servicesContent = servicesContent.replace(/const serviceGradients = \[[\s\S]*?\];/m, tricolourServiceGradients);

// 3. Remove Emojis mapping
servicesContent = servicesContent.replace(/const serviceIdToEmoji: Record<string, string> = \{[\s\S]*?\};\n/m, '');

// 4. Update the card icon renderer
servicesContent = servicesContent.replace(/\{serviceIdToEmoji\[service\.id\] \? \([\s\S]*?\) \: \([\s\S]*?\)\}/m, 
`<IconComponent className={\`w-10 h-10 transition-transform duration-500 group-hover:scale-110 \${gradient.bg.includes('slate-50') ? 'text-[#000080]' : 'text-white'}\`} />`);

fs.writeFileSync('src/pages/Services.tsx', servicesContent);

console.log('UI theme updated successfully!');
