import re

# 1. Patch Profile.tsx
with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    prof_content = f.read()

prof_content = prof_content.replace(
    'const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);',
    'const initials = (user.name || "U").split(" ").filter(w => w.length > 0).map((w) => w[0]).join("").toUpperCase().slice(0, 2);'
)

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(prof_content)


# 2. Patch Services.tsx
with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    svc_content = f.read()

# Remove emojis from categories
svc_content = svc_content.replace('{ id: "urgent", en: "🚨 Urgent Core", hi: "🚨 अर्जेंट" }', '{ id: "urgent", en: "Urgent Core", hi: "अर्जेंट" }')
svc_content = svc_content.replace('{ id: "involved", en: "🤝 Involved", hi: "🤝 जुड़े" }', '{ id: "involved", en: "Involved", hi: "जुड़े" }')
svc_content = svc_content.replace('{ id: "welfare", en: "🛡️ Welfare", hi: "🛡️ रक्षा" }', '{ id: "welfare", en: "Welfare", hi: "रक्षा" }')
svc_content = svc_content.replace('{ id: "civic", en: "🏛️ Civic", hi: "🏛️ नागरिक" }', '{ id: "civic", en: "Civic", hi: "नागरिक" }')

# Remove compactView state
svc_content = svc_content.replace('const [compactView, setCompactView] = useState(false);\n', '')

# Remove Compact button
compact_btn_regex = re.compile(r'<button[^>]*onClick=\{\(\) => setCompactView\(\(g\) => !g\)\}[^>]*>.*?</button>', re.DOTALL)
svc_content = compact_btn_regex.sub('', svc_content)

# Remove compactView class conditions
svc_content = re.sub(
    r'\$\{\s*compactView \? "[^"]*" : "([^"]*)"\s*\}',
    r'\1',
    svc_content
)

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(svc_content)


# 3. Patch AppContext.tsx
with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

default_services_code = """
const DEFAULT_SERVICES = [
  { id: "card", category: "welfare", iconName: "ShieldCheck", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", descEn: "Apply for Foundational ID", descHi: "बुनियादी आईडी के लिए आवेदन" },
  { id: "blood", category: "urgent", iconName: "Heart", titleEn: "Blood Network", titleHi: "रक्त नेटवर्क", descEn: "Emergency Blood Donor Requests", descHi: "आपातकालीन रक्तदाता अनुरोध" },
  { id: "donations", category: "involved", iconName: "HandCoins", titleEn: "Donations", titleHi: "दान", descEn: "Support our causes directly", descHi: "हमारे कारणों का समर्थन करें" },
  { id: "grievance", category: "civic", iconName: "AlertTriangle", titleEn: "Grievances", titleHi: "शिकायतें", descEn: "Report Civic Issues", descHi: "नागरिक समस्याओं की रिपोर्ट" },
  { id: "volunteers", category: "involved", iconName: "Users", titleEn: "Volunteering", titleHi: "स्वयंसेवा", descEn: "Join the RP Force", descHi: "आरपी फोर्स से जुड़ें" },
  { id: "health-camps", category: "welfare", iconName: "Stethoscope", titleEn: "Health Camps", titleHi: "स्वास्थ्य शिविर", descEn: "Free checkups and drives", descHi: "मुफ्त जांच और अभियान" },
];
"""

if "DEFAULT_SERVICES" not in app_content:
    # Insert right before DEFAULT_SOCIAL_LINKS
    app_content = app_content.replace('const DEFAULT_SOCIAL_LINKS', default_services_code + '\nconst DEFAULT_SOCIAL_LINKS')

fetch_logic_old = """
            if (servicesRes.ok) {
              const d = await servicesRes.json();
              if (d.data) setServicesList(d.data);
            }
"""
fetch_logic_new = """
            if (servicesRes.ok) {
              const d = await servicesRes.json();
              if (d.data && d.data.length > 0) {
                 setServicesList(d.data);
              } else {
                 setServicesList(DEFAULT_SERVICES);
              }
            } else {
              setServicesList(DEFAULT_SERVICES);
            }
"""
app_content = app_content.replace(fetch_logic_old, fetch_logic_new)

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("UI bugs patched successfully!")
