import re

with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove blue backgrounds and replace with neutral/slate
content = re.sub(r'bg-gradient-to-br from-\[#000080\] to-\[#0A1128\]', 'bg-gradient-to-br from-slate-700 to-slate-900', content)
content = re.sub(r'bg-\[#0B1E3F\]', 'bg-slate-800', content)
content = re.sub(r'text-\[#000080\]', 'text-slate-800', content)
content = re.sub(r'text-\[#FF9933\]', 'text-orange-500', content)
content = re.sub(r'bg-gradient-to-r from-\[#000080\] to-indigo-900', 'bg-slate-800', content)

# Change Avatar from 'RA' to generic icon
# Find initials generation and replace avatar display
content = re.sub(r'\{user\?.name\?.substring\(0,\s*2\)\.toUpperCase\(\)\s*\|\|\s*"RA"\}', '<User className="w-8 h-8 text-slate-300" />', content)

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated Profile.tsx')
