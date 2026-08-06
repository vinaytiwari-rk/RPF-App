const fs = require('fs');
const path = require('path');
const godAdminPath = path.join(__dirname, '../src/pages/GodAdminPanel.tsx');
let content = fs.readFileSync(godAdminPath, 'utf8');

const visualStart = content.indexOf("case 'visual':");
const visualEnd = content.indexOf("case 'announcements':", visualStart);

if (visualStart !== -1 && visualEnd !== -1) {
    const visualContent = content.substring(visualStart, visualEnd);
    fs.mkdirSync(path.join(__dirname, '../src/components/admin'), { recursive: true });
    
    // Extract the JSX
    const jsxStart = visualContent.indexOf('<div className="max-w-4xl');
    const jsxEnd = visualContent.lastIndexOf(';');
    const jsx = visualContent.substring(jsxStart, jsxEnd).trim();
    
    const visualSettingsTsx = "import React from 'react';\n" +
"import { Monitor } from 'lucide-react';\n" +
"import FileUpload from '../components/FileUpload';\n\n" +
"interface VisualSettingsProps {\n" +
"    settings: any;\n" +
"    saveSettings: (updates: any) => void;\n" +
"}\n\n" +
"export const VisualSettings: React.FC<VisualSettingsProps> = ({ settings, saveSettings }) => {\n" +
"    return (\n" + jsx + "\n    );\n};\n";
    
    fs.writeFileSync(path.join(__dirname, '../src/components/admin/VisualSettings.tsx'), visualSettingsTsx);
    
    content = content.substring(0, visualStart) + 
              "case 'visual':\n        return <VisualSettings settings={settings} saveSettings={saveSettings} />;\n      " + 
              content.substring(visualEnd);
              
    content = content.replace("import FileUpload from '../components/FileUpload';", "import FileUpload from '../components/FileUpload';\nimport { VisualSettings } from '../components/admin/VisualSettings';");
    
    fs.writeFileSync(godAdminPath, content);
    console.log("SUCCESS");
} else {
    console.log("FAILED");
}
