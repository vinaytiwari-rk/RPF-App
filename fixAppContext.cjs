const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'AppContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add globalSettings to AppContextType
content = content.replace(
  '  settings: Settings;',
  '  settings: Settings;\n  globalSettings: any;\n  announcements: any[];'
);

// Add state to AppProvider
content = content.replace(
  '  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);',
  '  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);\n  const [globalSettings, setGlobalSettings] = useState<any>({});\n  const [announcements, setAnnouncements] = useState<any[]>([]);'
);

// Add fetch to fetchAllData
const fetchGlobalSettings = \
      // Fetch dynamic global settings
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const d = await res.json();
          if (d.data) {
            setGlobalSettings(d.data);
            // Apply CSS Variables
            const root = document.documentElement;
            if (d.data.primary_color) root.style.setProperty('--color-primary', d.data.primary_color);
            if (d.data.secondary_color) root.style.setProperty('--color-secondary', d.data.secondary_color);
            if (d.data.font_family) root.style.setProperty('--font-primary', d.data.font_family);
          }
        }
      } catch(e) {}

      // Fetch announcements
      try {
        const res = await fetch("/api/admin/announcements");
        if (res.ok) {
          const d = await res.json();
          if (d.data) setAnnouncements(d.data);
        }
      } catch(e) {}\

content = content.replace(
  '// 1. Settings',
  fetchGlobalSettings + '\\n\\n      // 1. Settings'
);

// Add to context value
content = content.replace(
  '    <AppContext.Provider\\n      value={{\\n        loading,\\n        settings,',
  '    <AppContext.Provider\\n      value={{\\n        loading,\\n        settings,\\n        globalSettings,\\n        announcements,'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('AppContext updated');
