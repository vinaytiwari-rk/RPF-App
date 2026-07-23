import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix onChange arrow functions that were broken by previous script
content = re.sub(
    r'onChange={([^=]+)\s*=>\s*set([a-zA-Z]+)En\(([^)]+)\);\s*set([a-zA-Z]+)Hi\(([^)]+)\)}',
    r'onChange={\1 => { set\2En(\3); set\4Hi(\5); }}',
    content
)

# And also for JoditEditor onBlur:
content = re.sub(
    r'onBlur={([^=]+)\s*=>\s*set([a-zA-Z]+)En\(([^)]+)\);\s*set([a-zA-Z]+)Hi\(([^)]+)\)}',
    r'onBlur={\1 => { set\2En(\3); set\4Hi(\5); }}',
    content
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed syntax errors in AdminDashboard.tsx')
