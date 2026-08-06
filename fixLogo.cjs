const fs = require('fs');
const path = require('path');

const files = [
  'src/components/SplashScreen.tsx',
  'src/components/LoginScreen.tsx',
  'src/layouts/MainLayout.tsx',
  'src/pages/JanSevaCard.tsx',
  'src/pages/Profile.tsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // If useApp is not imported, we may skip or handle carefully.
  // MainLayout already has useApp. Profile already has useApp.
  
  if (file === 'src/components/SplashScreen.tsx') {
    if (!content.includes('useApp')) {
      content = content.replace('import React', 'import React from "react";\\nimport { useApp } from "../context/AppContext";\\n//');
      content = content.replace('export default function SplashScreen(', 'export default function SplashScreen(');
      content = content.replace('const t =', 'const { globalSettings } = useApp();\\n  const t =');
    }
    content = content.replace('src="/assets/logo.png"', 'src={globalSettings?.logo_image || "/assets/logo.png"}');
  }

  if (file === 'src/components/LoginScreen.tsx') {
    if (!content.includes('useApp')) {
      content = content.replace('import React', 'import React from "react";\\nimport { useApp } from "../context/AppContext";\\n//');
      content = content.replace('const { login, language } = useAuth();', 'const { login, language } = useAuth();\\n  const { globalSettings } = useApp();');
    }
    content = content.replace('src="/assets/logo.png"', 'src={globalSettings?.logo_image || "/assets/logo.png"}');
  }

  if (file === 'src/layouts/MainLayout.tsx') {
    content = content.replace('src="/assets/logo.png"', 'src={globalSettings?.logo_image || "/assets/logo.png"}');
  }

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Logos updated');
