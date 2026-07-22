import re

new_icon_jsx = """
                <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:shadow-[0_0_30px_rgba(192,38,211,0.8)] transition-all duration-500 animate-pulse"></div>
                  <IconComponent className="w-6 h-6 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
                </div>
"""

# Patch Home.tsx
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

home_content = re.sub(
    r'<div className="relative w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">.*?</div>',
    new_icon_jsx.strip(),
    home_content,
    flags=re.DOTALL
)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

# Patch Services.tsx
with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    services_content = f.read()

services_content = re.sub(
    r'<div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">.*?</div>\n\s*<h4',
    new_icon_jsx.strip() + '\n                    <h4',
    services_content,
    flags=re.DOTALL
)

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(services_content)

print("Patched icons in Home.tsx and Services.tsx")
