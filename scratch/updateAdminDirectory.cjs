const fs = require('fs');
let content = fs.readFileSync('D:/rp-foundation/src/pages/GodAdminPanel.tsx', 'utf8');

// Add Directory to Tabs if not exists
if (!content.includes('{ id: \\'directory\\', label: \\'Directory\\', icon: BookOpen }')) {
  content = content.replace(
    /const TABS = \[/,
    \import { BookOpen } from 'lucide-react';\nconst TABS = [\n    { id: 'directory', label: 'Directory', icon: BookOpen },\
  );
  
  content = content.replace(
    /case 'jobs':/,
    \case 'directory':
          return <GenericAdminTab endpoint="/api/directory" title="Directory Services" columns={["name", "category", "contact", "status"]} />;
        case 'jobs':\
  );
}

fs.writeFileSync('D:/rp-foundation/src/pages/GodAdminPanel.tsx', content);
console.log('Updated Admin Panel with Directory');
