import re

with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    profile_content = f.read()

profile_content = re.sub(
    r'bg-gradient-to-br from-\[#0B1E3F\] via-indigo-900 to-\[#122A54\]',
    'bg-gradient-to-br from-[#FF9933] via-white to-[#138808]',
    profile_content
)

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(profile_content)
