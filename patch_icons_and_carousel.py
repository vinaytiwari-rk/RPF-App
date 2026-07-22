import re

# 1. Patch Home.tsx
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

buttons_regex = re.compile(r'<div className="flex gap-2">.*?</div>', re.DOTALL)
home_content = buttons_regex.sub('', home_content, count=1)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

# 2. Patch Services.tsx
with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    svc_content = f.read()

old_button_class = 'className={`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col \nitems-center justify-center gap-2 h-28 rounded-2xl transition-all duration-700 ease-in-out hover:border-indigo-300 \ntranslate-y-0 rotate-0 opacity-100`}'
# Just in case the newline parsing is weird, let's use a regex
button_class_regex = re.compile(r'className=\{`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col[^`]*`\}')
svc_content = button_class_regex.sub('className={`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col items-center justify-center gap-2 h-28 rounded-2xl transition-all duration-700 ease-in-out hover:border-indigo-400 hover:shadow-indigo-500/20 hover:shadow-lg translate-y-0 rotate-0 opacity-100 group`}', svc_content)

icon_old_regex = re.compile(r'<div className=\{`w-9 h-9 rounded-full flex items-center justify-center \$\{svc\.color \|\| \n?"bg-indigo-50 text-indigo-600"\} shadow-inner`\}>\s*<IconComponent className="w-4\.5 h-4\.5" />\s*</div>', re.DOTALL)

icon_new = """
                    <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                      <div className="absolute inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.8)] transition-shadow duration-500"></div>
                      <IconComponent className="w-5 h-5 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" style={{ animationDuration: '3s' }} />
                    </div>
"""

svc_content = icon_old_regex.sub(icon_new.strip(), svc_content)

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(svc_content)

print("Patched UI successfully")
