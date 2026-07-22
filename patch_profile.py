import re

with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add const isHi = language === "hi";
old_line = "const t = translations[language];"
new_line = "const t = translations[language];\n  const isHi = language === \"hi\";"
content = content.replace(old_line, new_line)

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched Profile.tsx to define isHi")
