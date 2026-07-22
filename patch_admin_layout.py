import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add DataTable import
content = re.sub(
    r'import \{ (.*?) \} from "lucide-react";',
    r'import { \1, Menu, X, LayoutDashboard, ChevronRight } from "lucide-react";\nimport { DataTable } from "../components/admin/DataTable";',
    content
)

# 2. Add Sidebar State to top of component
content = re.sub(
    r'export default function AdminDashboard\(\) \{',
    'export default function AdminDashboard() {\n  const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n',
    content
)

# 3. Replace the layout wrapper
new_layout = """
  const tabs = [
    { key: "analytics", label: lang === "hi" ? "एनालिटिक्स" : "Insights", icon: BarChart2 },
    { key: "cms", label: lang === "hi" ? "बैनर CMS" : "Banners CMS", icon: Image },
    { key: "settings", label: lang === "hi" ? "ग्लोबल कंट्रोल" : "Global Control", icon: Settings },
    { key: "services", label: lang === "hi" ? "21+ सेवाएं" : "Services Node", icon: Grid },
    { key: "cards", label: lang === "hi" ? "कार्ड्स सूची" : "Cards Registry", icon: Users },
    { key: "grievances", label: lang === "hi" ? "शिकायत कक्ष" : "Grievances", icon: AlertTriangle },
    { key: "campaigns", label: lang === "hi" ? "दान अभियान" : "Campaigns", icon: Heart },
    { key: "volunteers", label: lang === "hi" ? "स्वयंसेवक" : "Volunteers", icon: Award },
    { key: "certs", label: "Certificates", icon: Award },
    { key: "comms", label: lang === "hi" ? "घोषणाएं" : "Comms & Stories", icon: Bell }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600 animate-pulse" />
            <h1 className="font-display font-black text-sm tracking-widest uppercase text-slate-800">Admin HQ</h1>
          </div>
          <button className="md:hidden p-2 bg-slate-100 rounded-lg text-slate-500" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key as any); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key 
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <t.icon className={`w-4 h-4 ${activeTab === t.key ? "text-indigo-200" : "text-slate-400"}`} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => navigate(-1)} className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
            <ArrowLeft className="w-4 h-4" /> Exit Admin
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-30 shadow-sm flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-4 h-4" />
            </button>
            
            {/* BREADCRUMBS */}
            <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1 hover:text-indigo-600 cursor-pointer"><LayoutDashboard className="w-3 h-3" /> Dashboard</span>
              <ChevronRight className="w-3 h-3 mx-1" />
              <span className="text-indigo-600">{tabs.find(t => t.key === activeTab)?.label}</span>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
          <div className="max-w-6xl mx-auto">
"""

content = re.sub(
    r'  return \(\n    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto border-x border-slate-200 shadow-2xl">.*?<div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">',
    new_layout,
    content,
    flags=re.DOTALL
)

# Replace the Grievance map with DataTable
grievance_table = """
        {activeTab === "grievances" && (
          <div className="space-y-3 animate-fadeIn h-full">
            <DataTable 
              data={grievances} 
              searchKey="title"
              columns={[
                { key: 'title', label: 'Issue Title' },
                { key: 'description', label: 'Description' },
                { key: 'status', label: 'Status', render: (row: any) => (
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${
                    row.status === "Resolved" || row.status === "resolved" ? "bg-green-50 border-green-200 text-green-700" : row.status === "In Progress" || row.status === "in-progress" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-amber-50 border-amber-200 text-amber-700"
                  }`}>{row.status}</span>
                )},
                { key: 'citizenName', label: 'Citizen', render: (row: any) => row.citizenName || "Anonymous" },
                { key: 'actions', label: 'Actions', render: (row: any) => (
                  <div className="flex gap-2">
                    {(row.status === "Pending" || row.status === "pending") && (
                      <button onClick={() => handleUpdateGrievance(row.id, "In Progress")} className="bg-blue-600 text-white px-3 py-1 rounded-md text-[10px] font-black">Triage</button>
                    )}
                    {(row.status !== "Resolved" && row.status !== "resolved") && (
                      <button onClick={() => handleUpdateGrievance(row.id, "Resolved")} className="bg-green-600 text-white px-3 py-1 rounded-md text-[10px] font-black">Resolve</button>
                    )}
                  </div>
                )}
              ]}
            />
          </div>
        )}
"""
content = re.sub(
    r'\{activeTab === "grievances" && \(.*?</div>\n          \)}',
    grievance_table.strip(),
    content,
    flags=re.DOTALL
)

# Add closing tags
content = re.sub(
    r'      </div>\n    </div>\n  \);\n\}',
    '          </div>\n        </div>\n      </main>\n    </div>\n  );\n}',
    content
)


with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Applied God Level CMS Admin UI!")
