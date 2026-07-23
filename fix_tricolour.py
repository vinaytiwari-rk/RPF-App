import re
import os

# 1. Modify Services.tsx
with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    services_content = f.read()

# Remove the global search bar block
# We look for {/* Global Search */} up to the Category chips
services_content = re.sub(
    r'\{\/\* Global Search \*\/\}.*?\{\/\* Category chips \*\/\}',
    '{/* Category chips */}',
    services_content,
    flags=re.DOTALL
)

# Remove the Category chips block
# We look for {/* Category chips */} up to the service cards loading/grid
services_content = re.sub(
    r'\{\/\* Category chips \*\/\}.*?\{\/\* 21 service cards \*\/\}',
    '{/* 21 service cards */}',
    services_content,
    flags=re.DOTALL
)

# Remove the Footer support bar block
services_content = re.sub(
    r'\{\/\*  Footer support bar  \*\/\}.*?</div>\s*</div>\s*\);\s*\}',
    '</div>\n  );\n}',
    services_content,
    flags=re.DOTALL
)

# Force default category to 'all' and search to ''
# No need to change state, it will just not render the inputs so category stays 'all' and search stays ''

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(services_content)


# 2. Modify Profile.tsx
with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    profile_content = f.read()

# Fix light text colors in profile header
profile_content = profile_content.replace('text-slate-200', 'text-slate-700')
profile_content = profile_content.replace('text-slate-300', 'text-slate-700')
profile_content = profile_content.replace('text-slate-400', 'text-slate-600')
profile_content = profile_content.replace('text-slate-800', 'text-[#000080]')

# Add Support Panel above the Sign Out button
support_panel = '''
        {/* Support Panel (Helpline, website, email) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3.5">
          <h4 className="font-display font-extrabold text-xs text-[#000080] uppercase tracking-wider">
            {isHi ? "सहायता एवं संपर्क" : "Help & Contact"}
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-bold">{isHi ? "टोल-फ्री हेल्पलाइन:" : "Toll-Free Helpline:"}</span>
              <span className="font-extrabold text-amber-900 font-mono">{settings?.tollFree || "1800-569-0991"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-bold">{isHi ? "ईमेल समर्थन:" : "Email Support:"}</span>
              <span className="font-extrabold text-amber-900">{settings?.email || "info@therpfoundation.org"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">{isHi ? "आधिकारिक वेबसाइट:" : "Official Website:"}</span>
              <a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : https://) : "https://therpfoundation.org"} target="_blank" rel="noreferrer" className="font-extrabold text-blue-600 hover:underline">
                {settings?.webUrl || "therpfoundation.org"}
              </a>
            </div>
          </div>
        </div>
'''

profile_content = profile_content.replace('{/* Sign Out Button */}', support_panel + '\n        {/* Sign Out Button %}')
profile_content = profile_content.replace('{/* Sign Out Button %}', '{/* Sign Out Button */}')

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(profile_content)


# 3. Modify MainLayout.tsx
with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Fix Donate button click navigation to /donations
layout_content = layout_content.replace('onClick={() => handleNav("/donate")}', 'onClick={() => handleNav("/donations")}')

# Replace children icon 🙏 with beautiful glowing hands + heart image
# We'll use the img element and apply animate-pulse and some glow effects
glowing_donate_img = '<img src="/assets/donate.jpg" alt="Donate Now" className="w-12 h-12 rounded-full object-cover animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />'
layout_content = re.sub(
    r'<span className="text-xl animate-bounce drop-shadow-md">🙏</span>',
    glowing_donate_img,
    layout_content
)

# Apply tricolor gradient to main layout header top bar
# Replacing bg-white/95 with bg-gradient-to-r from-[#FF9933] via-white to-[#138808]
layout_content = layout_content.replace(
    'className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3.5',
    'className="w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] backdrop-blur-md border-b-2 border-[#000080]/20 px-4 py-3.5'
)

# Adjust header subtitles to use dark Navy Blue for high readability
layout_content = layout_content.replace('text-[#FF9933] mt-0.5', 'text-[#000080]/80 mt-0.5')
layout_content = layout_content.replace('text-[#138808] mt-0.5', 'text-[#000080]/70 mt-0.5')

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_content)


# 4. Modify SplashScreen.tsx
with open('src/components/SplashScreen.tsx', 'r', encoding='utf-8') as f:
    splash_content = f.read()

splash_content = splash_content.replace(
    'className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-in-out"',
    'className="fixed inset-0 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-in-out"'
)

with open('src/components/SplashScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(splash_content)

print('Updated Services.tsx, Profile.tsx, MainLayout.tsx, SplashScreen.tsx')
