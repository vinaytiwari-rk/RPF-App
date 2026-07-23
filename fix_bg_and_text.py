import re

# 1. Update index.css for high-color abstract tricolor background
with open('src/index.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

# Locate .bg-heritage-base and replace it with the high-color tricolor mesh
old_heritage = '''.bg-heritage-base {
      background-color: #FAF8F5; /* Premium matte warm ivory canvas */
      background-image: url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='80' cy='80' r='60' fill='none' stroke='%23D4AF37' stroke-opacity='0.02' stroke-width='0.5'/%3E%3Ccircle cx='80' cy='80' r='30' fill='none' stroke='%23D4AF37' stroke-opacity='0.015' stroke-width='0.5'/%3E%3Cpath d='M80 0l6 24 24 6-24 6-6 24-6-24-24-6 24-6z' fill='%23FF9933' fill-opacity='0.012'/%3E%3Cpath d='M80 50c16.5 0 30 13.5 30 30s-13.5 30-30 30-30-13.5-30-30 13.5-30 30-30zm0 2c-15.4 0-28 12.6-28 28s12.6 28 28 28 28-12.6 28-28-12.6-28-28-28z' fill='%23138808' fill-opacity='0.012'/%3E%3C/svg%3E");
    }'''

new_heritage = '''.bg-heritage-base {
      background-color: #ffffff;
      background-image: 
        radial-gradient(at 0% 0%, rgba(255, 153, 51, 0.45) 0px, transparent 55%),
        radial-gradient(at 100% 100%, rgba(19, 136, 8, 0.45) 0px, transparent 55%),
        radial-gradient(at 100% 0%, rgba(255, 153, 51, 0.15) 0px, transparent 45%),
        radial-gradient(at 0% 100%, rgba(19, 136, 8, 0.15) 0px, transparent 45%);
      background-size: cover;
    }'''

css_content = css_content.replace(old_heritage, new_heritage)
with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_content)


# 2. Update page components to use bg-transparent
# Home.tsx
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()
home_content = home_content.replace('bg-[#FAF9F6]', 'bg-transparent')
with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

# Services.tsx
with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    services_content = f.read()
services_content = services_content.replace('bg-slate-50/50', 'bg-transparent')
with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(services_content)

# Profile.tsx
with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    profile_content = f.read()
profile_content = profile_content.replace('bg-slate-50', 'bg-transparent')
with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(profile_content)

# NotificationsPage.tsx
with open('src/pages/NotificationsPage.tsx', 'r', encoding='utf-8') as f:
    notif_content = f.read()
notif_content = notif_content.replace('bg-slate-50', 'bg-transparent')
with open('src/pages/NotificationsPage.tsx', 'w', encoding='utf-8') as f:
    f.write(notif_content)


# 3. Update MainLayout.tsx: Remove DONATION BOX and make "दान पेटी" static text
with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Replace the text node block inside Daan Peti SVG
old_svg_text_block = '''                {/* Text: "दान पेटी" */}
                <motion.text 
                  x="50" 
                  y="60" 
                  textAnchor="middle" 
                  fill="#FFFFFF" 
                  fontFamily="sans-serif" 
                  fontWeight="900" 
                  fontSize="9.5" 
                  letterSpacing="0.5"
                  animate={{ opacity: [1, 1, 0, 0, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  दान पेटी
                </motion.text>

                <motion.text 
                  x="50" 
                  y="60" 
                  textAnchor="middle" 
                  fill="#FFFFFF" 
                  fontFamily="sans-serif" 
                  fontWeight="900" 
                  fontSize="6.5" 
                  letterSpacing="0.8"
                  animate={{ opacity: [0, 0, 1, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  DONATION BOX
                </motion.text>'''

new_svg_text_block = '''                {/* Text: "दान पेटी" (English label removed, text made static) */}
                <text 
                  x="50" 
                  y="62" 
                  textAnchor="middle" 
                  fill="#FFFFFF" 
                  fontFamily="sans-serif" 
                  fontWeight="900" 
                  fontSize="9.5" 
                  letterSpacing="0.5"
                >
                  दान पेटी
                </text>'''

layout_content = layout_content.replace(old_svg_text_block, new_svg_text_block)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_content)

print('Updated background and removed English text')
