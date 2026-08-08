const fs = require('fs');
const glob = require('glob'); // Not available? Let's just do it manually for src/pages/*.tsx and src/components/*.tsx

const files = [
  'D:/rp-foundation/src/pages/Home.tsx',
  'D:/rp-foundation/src/pages/Profile.tsx',
  'D:/rp-foundation/src/pages/Services.tsx',
  'D:/rp-foundation/src/pages/GodAdminPanel.tsx',
  'D:/rp-foundation/src/components/MainLayout.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace arbitrary colors with theme colors
    content = content.replace(/#000080/g, '#000080'); // Let's keep it simple, actually let's just create CSS components
    
    fs.writeFileSync(file, content);
  }
});
