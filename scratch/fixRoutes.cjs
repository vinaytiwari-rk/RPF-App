const fs = require('fs');

// 1. Fix App.tsx
let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('import GovernmentSchemes')) {
  appContent = appContent.replace(
    'import FoodSupport from "./pages/FoodSupport";',
    'import FoodSupport from "./pages/FoodSupport";\nimport DisasterManagement from "./pages/DisasterManagement";\nimport FarmerSupport from "./pages/FarmerSupport";\nimport SkillsTraining from "./pages/SkillsTraining";\nimport SchemesPage from "./pages/SchemesPage";'
  );
  appContent = appContent.replace(
    '<Route path="/food" element={<FoodSupport />} />',
    '<Route path="/food" element={<FoodSupport />} />\n          <Route path="/farmer" element={<FarmerSupport />} />\n          <Route path="/schemes" element={<SchemesPage />} />\n          <Route path="/skills" element={<SkillsTraining />} />\n          <Route path="/disaster" element={<DisasterManagement />} />'
  );
  fs.writeFileSync('src/App.tsx', appContent);
}

// 2. Fix Home.tsx
let homeContent = fs.readFileSync('src/pages/Home.tsx', 'utf8');
if (!homeContent.includes('farmer: "/farmer"')) {
  homeContent = homeContent.replace(
    'donations: "/donations",',
    'donations: "/donations",\n      farmer: "/farmer",\n      schemes: "/schemes",\n      skills: "/skills",\n      disaster: "/disaster",'
  );
  homeContent = homeContent.replace(
    'donations: "/assets/icons/icon_crowdfunding_1786081270454.jpg",',
    'donations: "/assets/icons/icon_crowdfunding_1786081270454.jpg",\n    crowdfunding: "/assets/icons/icon_crowdfunding_1786081270454.jpg",'
  );
  fs.writeFileSync('src/pages/Home.tsx', homeContent);
}

// 3. Fix Services.tsx
let servicesContent = fs.readFileSync('src/pages/Services.tsx', 'utf8');
if (!servicesContent.includes("svc.id === 'farmer'")) {
  servicesContent = servicesContent.replace(
    /svc\.id === 'donations'\s*\?\s*'\/donations'\s*/,
    "svc.id === 'donations' ? '/donations'\n                            : svc.id === 'farmer' ? '/farmer'\n                            : svc.id === 'schemes' ? '/schemes'\n                            : svc.id === 'skills' ? '/skills'\n                            : svc.id === 'disaster' ? '/disaster'\n"
  );
  servicesContent = servicesContent.replace(
    'donations: "/assets/icons/icon_crowdfunding_1786081270454.jpg",',
    'donations: "/assets/icons/icon_crowdfunding_1786081270454.jpg",\n  crowdfunding: "/assets/icons/icon_crowdfunding_1786081270454.jpg",'
  );
  fs.writeFileSync('src/pages/Services.tsx', servicesContent);
}
console.log('Fixed routing and missing icons');
