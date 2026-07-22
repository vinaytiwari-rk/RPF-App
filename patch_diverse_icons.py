import re

gradient_logic = """
            const gradients = [
              { bg: "from-amber-400 via-orange-500 to-red-500", shadow: "shadow-[0_0_20px_rgba(249,115,22,0.6)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]" },
              { bg: "from-cyan-400 via-teal-500 to-emerald-500", shadow: "shadow-[0_0_20px_rgba(20,184,166,0.6)] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]" },
              { bg: "from-blue-500 via-indigo-500 to-cyan-500", shadow: "shadow-[0_0_20px_rgba(99,102,241,0.6)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.8)]" },
              { bg: "from-fuchsia-500 via-purple-600 to-indigo-600", shadow: "shadow-[0_0_20px_rgba(168,85,247,0.6)] group-hover:shadow-[0_0_30px_rgba(192,38,211,0.8)]" },
              { bg: "from-pink-500 via-rose-500 to-red-500", shadow: "shadow-[0_0_20px_rgba(244,63,94,0.6)] group-hover:shadow-[0_0_30px_rgba(225,29,72,0.8)]" },
              { bg: "from-lime-400 via-green-500 to-teal-500", shadow: "shadow-[0_0_20px_rgba(34,197,94,0.6)] group-hover:shadow-[0_0_30px_rgba(20,184,166,0.8)]" },
            ];
            const currentGradient = gradients[idx % gradients.length];
"""

new_icon_jsx = """
                <div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${currentGradient.bg} rounded-full ${currentGradient.shadow} transition-all duration-500 animate-pulse`}></div>
                  <IconComponent className="w-6 h-6 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" />
                </div>
"""

# Patch Home.tsx
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

home_content = re.sub(
    r'const IconComponent = \(LucideIcons as any\)\[action\.iconName \|\| "Compass"\] \|\| Compass;',
    gradient_logic.strip() + '\n            const IconComponent = (LucideIcons as any)[action.iconName || "Compass"] || Compass;',
    home_content
)

home_content = re.sub(
    r'<div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 animate-bounce" style=\{\{ animationDuration: \'3s\' \}\}>\s*<div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 rounded-full shadow-\[0_0_20px_rgba\(168,85,247,0\.6\)\] group-hover:shadow-\[0_0_30px_rgba\(192,38,211,0\.8\)\] transition-all duration-500 animate-pulse"></div>\s*<IconComponent className="w-6 h-6 text-white relative z-10 drop-shadow-\[0_0_10px_rgba\(255,255,255,1\)\]" />\s*</div>',
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
    r'const IconComponent = \(LucideIcons as any\)\[svc\.iconName \|\| "Compass"\] \|\| Compass;',
    gradient_logic.strip() + '\n                const IconComponent = (LucideIcons as any)[svc.iconName || "Compass"] || Compass;',
    services_content
)

services_content = re.sub(
    r'<div className="relative w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 animate-bounce" style=\{\{ animationDuration: \'3s\' \}\}>\s*<div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-600 rounded-full shadow-\[0_0_20px_rgba\(168,85,247,0\.6\)\] group-hover:shadow-\[0_0_30px_rgba\(192,38,211,0\.8\)\] transition-all duration-500 animate-pulse"></div>\s*<IconComponent className="w-6 h-6 text-white relative z-10 drop-shadow-\[0_0_10px_rgba\(255,255,255,1\)\]" />\s*</div>',
    new_icon_jsx.strip(),
    services_content,
    flags=re.DOTALL
)

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(services_content)

print("Patched diverse icons in Home.tsx and Services.tsx")
