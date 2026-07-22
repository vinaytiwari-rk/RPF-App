import re

with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useApp import
content = content.replace(
    'import AIAssistant from "../components/AIAssistant";',
    'import AIAssistant from "../components/AIAssistant";\nimport { useApp } from "../context/AppContext";'
)

# Add useApp hook inside MainLayout
hook_inject = """export default function MainLayout() {
  const { language } = useAuth();
  const { notifications } = useApp();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
"""
content = re.sub(
    r'export default function MainLayout\(\) \{\n\s*const \{ language \} = useAuth\(\);',
    hook_inject.strip(),
    content
)

# Replace static badge in header
badge_inject = """              <div className="relative">
                <button onClick={() => handleNav("/notifications")} className="p-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:shadow-xs transition relative">
                  <Bell className="w-4 h-4" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-black border border-white">
                    {unreadCount}
                  </span>
                )}
              </div>"""

content = re.sub(
    r'<div className="relative">\s*<button onClick=\{\(\) => handleNav\("/notifications"\)\} className="p-1\.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:shadow-xs transition relative">\s*<Bell className="w-4 h-4" />\s*</button>\s*<span className="absolute -top-1\.5 -right-1\.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-\[8px\] font-black border border-white">\s*3\s*</span>\s*</div>',
    badge_inject.strip(),
    content
)

# Replace static badge in mobile bottom nav
badge_inject_mobile = """            <button 
              onClick={() => handleNav("/notifications")}
              className={`flex flex-col items-center gap-1 text-center transition py-1.5 cursor-pointer w-14 relative ${
                location.pathname === "/notifications" ? "text-[#000080]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {location.pathname === "/notifications" && <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#FF9933] rounded-b-sm"></div>}
              <div className="relative">
                <Bell className="w-5 h-5 mt-0.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[7px] font-black border border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold">{language === "hi" ? "अलर्ट" : "Alerts"}</span>
            </button>"""

content = re.sub(
    r'<button\s*onClick=\{\(\) => handleNav\("/notifications"\)\}\s*className=\{`flex flex-col items-center gap-1 text-center transition py-1\.5 cursor-pointer w-14 relative \$\{\s*location\.pathname === "/notifications" \? "text-\[#000080\]" : "text-slate-400 hover:text-slate-600"\s*\}\`\}\s*>\s*\{location\.pathname === "/notifications" && <div className="absolute top-0 left-1/4 right-1/4 h-0\.5 bg-\[#FF9933\] rounded-b-sm"></div>\}\s*<Bell className="w-5 h-5 mt-0\.5" />\s*<span className="text-\[9px\] font-bold">\{language === "hi" \? "[^"]+" : "Alerts"\}</span>\s*</button>',
    badge_inject_mobile.strip(),
    content,
    flags=re.DOTALL
)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched MainLayout.tsx")
