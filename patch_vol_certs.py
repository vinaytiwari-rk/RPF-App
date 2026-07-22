import re

with open('src/pages/VolunteerDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state for Certificates
state_vars = """
  const [activeTab, setActiveTab] = useState<"tasks" | "certificates">("tasks");
  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (user && activeTab === "certificates") {
      fetch(`/api/volunteers/me/certificates?volunteer_id=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCertificates(data.certificates);
          }
        });
    }
  }, [user, activeTab]);
"""
content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + state_vars)

# 2. Add Tabs UI and Certificates List
tabs_ui = """
      <div className="flex border-b border-slate-200 mb-4 bg-white sticky top-[68px] z-10 px-4">
        <button 
          onClick={() => setActiveTab("tasks")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition ${activeTab === 'tasks' ? 'border-[#000080] text-[#000080]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          My Tasks
        </button>
        <button 
          onClick={() => setActiveTab("certificates")}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1 ${activeTab === 'certificates' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          <Award className="w-4 h-4" /> Certificates
        </button>
      </div>

      <div className="px-4 pb-24 space-y-4">
        {activeTab === "tasks" && (
          loading ? (
"""

content = content.replace('<div className="p-4 pb-24 space-y-4">', tabs_ui)

# 3. Add Certificates rendering block
# Use double backslashes for JS regex in Python strings!
certs_block = """
        )}

        {activeTab === "certificates" && (
          <div className="space-y-4 animate-fadeIn">
            {certificates.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                <Award className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="font-display font-black text-slate-700">No Certificates Yet</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Complete tasks to earn certificates of appreciation!</p>
              </div>
            ) : (
              certificates.map((cert) => (
                <div key={cert.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-black text-sm text-slate-800 truncate">
                      {cert.service_id.replace(/-/g, ' ').toUpperCase()}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      Issued: {new Date(cert.issue_date).toLocaleDateString()}
                    </p>
                  </div>
                  <a 
                    href={`/api/certificates/download/${cert.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-50 text-[#000080] hover:bg-slate-100 rounded-xl transition shadow-sm border border-slate-200"
                  >
                    <FileText className="w-5 h-5" />
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </div>
"""

# Now simply replace instead of re.sub
old_end = "            )\n          )\n        )}\n      </div>"
content = content.replace(old_end, certs_block)

with open('src/pages/VolunteerDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched VolunteerDashboard.tsx successfully!")
