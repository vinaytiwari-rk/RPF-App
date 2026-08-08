const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

// Replace serviceIdToGradient block
home = home.replace(
  /const serviceIdToGradient: Record<string, string> = \{[\s\S]*?\};\n/m,
  `const serviceIdToImage: Record<string, string> = {
    card: "/assets/icons/icon_card_1786081347500.jpg",
    blood: "/assets/icons/icon_blood_1786081356967.jpg",
    "health-care": "/assets/logo.png", 
    environment: "/assets/icons/icon_environment_1786081257147.jpg",
    culture: "/assets/icons/icon_culture_1786081280063.jpg",
    schemes: "/assets/icons/icon_schemes_1786081320637.jpg",
    skills: "/assets/icons/icon_skills_1786081334087.jpg",
    farmer: "/assets/icons/icon_farmer_1786081176892.jpg",
    disaster: "/assets/icons/icon_disaster_1786081291322.jpg",
    jobs: "/assets/logo.png", 
    donations: "/assets/icons/icon_crowdfunding_1786081270454.jpg",
    volunteers: "/assets/logo.png", 
    animals: "/assets/icons/icon_animal_1786081244906.jpg",
    food: "/assets/icons/icon_food_1786081367715.jpg",
    medicine: "/assets/logo.png", 
    "women-safety": "/assets/logo.png", 
    seniors: "/assets/icons/icon_senior_1786081168198.jpg",
    education: "/assets/logo.png", 
    scholarships: "/assets/logo.png", 
    grievance: "/assets/logo.png", 
    countries: "/assets/logo.png", 
  };

  const serviceIdToBorder: Record<string, string> = {
    card: "border-green-600",
    blood: "border-red-600",
    "health-care": "border-green-600",
    environment: "border-green-600",
    culture: "border-amber-600",
    schemes: "border-[#000080]",
    skills: "border-orange-500",
    farmer: "border-green-600",
    disaster: "border-red-600",
    jobs: "border-[#000080]",
    donations: "border-[#000080]",
    volunteers: "border-orange-500",
    animals: "border-[#000080]",
    food: "border-orange-500",
    medicine: "border-[#000080]",
    "women-safety": "border-[#000080]",
    seniors: "border-orange-500",
    education: "border-orange-500",
    scholarships: "border-[#000080]",
    grievance: "border-[#000080]",
    countries: "border-[#000080]"
  };\n`
);

// Find the quick action mapping and fix it to not use glowGradient
home = home.replace(
  /glowGradient: serviceIdToGradient\[s\.id\] \|\| ".*?"/g,
  `imgSrc: serviceIdToImage[s.id] || "/assets/logo.png", borderColor: serviceIdToBorder[s.id] || "border-slate-300"`
);

// Replace rendering of the quick action block
home = home.replace(
  /<div\s+key=\{action\.id\}\s+onClick=\{.*?\}.*\s+className="flex flex-col items-center justify-center p-0\.5.*?">[\s\S]*?<\/div>\s*<span className="text-\[9px\] font-black text-slate-700 leading-tight w-full truncate">[\s\S]*?<\/span>\s*<\/div>/g,
  `<div 
                key={action.id}
                onClick={() => navigate(action.route)}
                className={\`flex flex-col items-center justify-center p-2 bg-white border-2 \${action.borderColor} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative w-full h-full gap-1.5\`}
              >
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                  <img src={action.imgSrc} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" alt="" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight w-full truncate text-center">
                  {isHi ? action.titleHi : action.titleEn}
                </span>
              </div>`
);

fs.writeFileSync('src/pages/Home.tsx', home);
console.log('Home updated!');
