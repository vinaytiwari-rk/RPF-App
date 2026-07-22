import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables for preview and auto-save
state_additions = """
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save simulation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      setTimeout(() => {
        setIsAutoSaving(false);
        setLastSaved(new Date());
      }, 800);
    }, 5000);
    return () => clearTimeout(timer);
  }, [founderEn, founderHi, aboutTextEn, aboutTextHi, postTextEn, postTextHi]);
"""

content = re.sub(
    r'const \[isSidebarOpen, setIsSidebarOpen\] = useState\(false\);',
    r'const [isSidebarOpen, setIsSidebarOpen] = useState(false);\n' + state_additions,
    content
)

# 2. Add Status Toggle to CMS Slides
cms_slide_status = """
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="text-[10px] font-black uppercase text-slate-500">Status:</label>
                        <select 
                          value={slide.status || "published"}
                          onChange={(e) => {
                            const updated = [...cmsSlides];
                            updated[idx].status = e.target.value;
                            setCmsSlides(updated);
                          }}
                          className="bg-white border border-slate-200 rounded-md text-xs font-bold px-2 py-1"
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                        <button 
                          type="button"
                          onClick={() => setPreviewItem({ type: 'slide', data: slide })}
                          className="ml-auto bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1 rounded-md text-[10px] font-black uppercase transition"
                        >
                          Preview Slide
                        </button>
                      </div>
"""
content = re.sub(
    r'<input type="text" value=\{slide\.image\} onChange=\{e => \{.*?\}\} placeholder="Image URL.*?" className="w-full border border-slate-200 bg-slate-50 p-2 rounded-xl text-\[10px\]" />',
    r'\g<0>\n' + cms_slide_status,
    content,
    flags=re.DOTALL
)

# 3. Render Preview Modal and Auto-save indicator at the end of the file
preview_modal = """
      {/* Auto-Save Toast */}
      {lastSaved && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 text-[10px] font-bold z-50 animate-fadeIn">
          {isAutoSaving ? (
            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Auto-saving...</>
          ) : (
            <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Draft Saved {lastSaved.toLocaleTimeString()}</>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-fadeIn relative">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">Live Preview</span>
              <button onClick={() => setPreviewItem(null)} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-0 bg-slate-100 relative h-64">
              {previewItem.type === 'slide' && (
                <div className="relative w-full h-full flex flex-col justify-end p-6">
                  <img src={previewItem.data.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                  <div className="relative z-10 space-y-1">
                    <h2 className="text-white font-display font-black text-xl leading-tight drop-shadow-md">{previewItem.data.titleEn}</h2>
                    <p className="text-white/90 font-medium text-xs drop-shadow-md">{previewItem.data.subEn}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
"""
content = re.sub(
    r'      </main>\n    </div>\n  \);\n\}',
    preview_modal + '      </main>\n    </div>\n  );\n}',
    content
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched AdminDashboard.tsx with Draft/Preview and Auto-save logic")
