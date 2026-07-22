import re

with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """
                  <button key={svc.id} onClick={() => navigate(route)}
                    className={`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col relative
items-center justify-center gap-2 h-28 rounded-2xl transition-all duration-700 ease-in-out hover:border-indigo-400 
hover:shadow-indigo-500/20 hover:shadow-lg translate-y-0 rotate-0 opacity-100 group`}
                    style={{ transitionDelay: `${idx * 25}ms` }}
                  >
                    {svc.featured && (
                       <div className="absolute top-2 right-2 text-amber-500 drop-shadow-md z-20">
                          <LucideIcons.Award className="w-4 h-4 fill-amber-500/20" />
                       </div>
                    )}
                    <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 
transition-transform duration-500 animate-bounce" style={{ animationDuration: '3s' }}>
"""

content = re.sub(
    r'<button key=\{svc\.id\} onClick=\{.*?\}\n\s*className=\{`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col.*?\n.*?\n.*?\n.*?\n\s*<div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110.*?\n',
    replacement.strip() + "\n",
    content,
    flags=re.DOTALL
)

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Services.tsx to show Featured icon")
