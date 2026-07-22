import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update handleAddCustomService to include featured and views
content = re.sub(
    r'color: srvColor, enabled: true',
    r'color: srvColor, enabled: true, featured: false, views: 0',
    content
)

# 2. Update the customServices.map rendering block to include toggles
replacement_map = """
                  {customServices.map((srv, idx) => (
                    <div key={srv.id} className="flex flex-col gap-2 p-3 border border-slate-200 rounded-2xl bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                            {srv.featured ? <Award className="w-4 h-4 text-amber-500" /> : <Heart className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-xs text-slate-800 truncate">{lang === "hi" ? srv.titleHi : srv.titleEn}</p>
                            <p className="text-[9px] text-slate-400 uppercase font-black leading-none mt-0.5">
                              {srv.category} &bull; {srv.views || 0} Views
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteService(srv.id)} className="text-red-600 p-1.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={srv.enabled !== false} 
                            onChange={(e) => {
                               const updated = [...customServices];
                               updated[idx].enabled = e.target.checked;
                               setCustomServices(updated);
                            }} 
                            className="accent-green-500"
                          />
                          Enabled
                        </label>
                        <label className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 cursor-pointer ml-auto">
                          <input 
                            type="checkbox" 
                            checked={srv.featured || false} 
                            onChange={(e) => {
                               const updated = [...customServices];
                               updated[idx].featured = e.target.checked;
                               setCustomServices(updated);
                            }} 
                            className="accent-amber-500"
                          />
                          Featured (Pin to Top)
                        </label>
                      </div>
                    </div>
                  ))}
"""

content = re.sub(
    r'\{customServices\.map\(\(srv\) => \(\n.*?<Trash2 className="w-4 h-4" />\n\s*</button>\n\s*</div>\n\s*\)\)\}',
    replacement_map.strip(),
    content,
    flags=re.DOTALL
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched AdminDashboard.tsx with featured and enabled toggles for Services")
