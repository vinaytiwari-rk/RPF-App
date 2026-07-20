const fs = require('fs');

let file = fs.readFileSync('src/components/JanSevaCardComp.tsx', 'utf8');

// Remove getBadgeConfig function completely
file = file.replace(/\s*\/\/ Badge tier color mappings[\s\S]*?const badgeConfig = getBadgeConfig\(\);/, `  const badgeConfig = {
    bg: "from-[#0f4c81] via-[#155e9c] to-[#0f4c81] border-[#FF9933]",
    text: "text-[#FF9933]",
    glow: "shadow-[#0f4c81]/20",
    label: lang === "hi" ? "सक्रिय नागरिक" : "Active Citizen",
  };`);

// Remove the Gamification progress tracking section
file = file.replace(/\{\/\* Gamification progress tracking \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}\s*$/, '    </div>\n  );\n}\n');

// Also remove the "POINTS" column in the Card Body
file = file.replace(/<div>\s*<p className="text-\[8px\] text-white\/60 font-mono tracking-wider uppercase">\{lang === "hi" \? "प्रभाव पॉइंट्स" : "POINTS"\}<\/p>\s*<p className="text-\[11px\] font-bold text-\[#FF9933\] flex items-center gap-0\.5">\s*<Award className="w-3 h-3 text-\[#FF9933\]" \/>\s*\{profile\.points\}\s*<\/p>\s*<\/div>/, '');

fs.writeFileSync('src/components/JanSevaCardComp.tsx', file);
