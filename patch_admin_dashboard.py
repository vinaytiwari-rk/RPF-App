import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Service CMS tab icon
if "id: 'services'" not in content:
    content = content.replace(
        "{ id: 'cms', label: 'Web CMS', icon: Globe },",
        "{ id: 'cms', label: 'Web CMS', icon: Globe },\n    { id: 'services', label: 'Services CMS', icon: Box },"
    )

    if "import { " in content and "Box" not in content:
        content = content.replace("Globe,", "Globe, Box,")

# Add Service CMS Render logic
service_cms_logic = """
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-6">
            <h3 className="font-bold text-[#000080] mb-4 text-base">Service Content Editor</h3>
            <p className="text-xs text-slate-500 mb-6">Select a service to edit its dynamic content. The changes will reflect immediately on the frontend.</p>
            
            <div className="text-center text-slate-400 py-12 text-sm">
              Service CMS Editor Interface goes here.
              <br />
              <span className="text-[10px] mt-2 block">(To be fully implemented)</span>
            </div>
          </div>
        </div>
      )}
"""
if "activeTab === 'services'" not in content:
    content = content.replace(
        "      {activeTab === 'cms' && (",
        service_cms_logic.strip() + "\n\n      {activeTab === 'cms' && ("
    )

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched AdminDashboard.tsx")
