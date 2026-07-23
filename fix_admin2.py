import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'set([a-zA-Z]+)En\(e\.target\.value\)', r'set\1En(e.target.value); set\1Hi(e.target.value)', content)
content = re.sub(r'set([a-zA-Z]+)En\(newContent\)', r'set\1En(newContent); set\1Hi(newContent)', content)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Synced En to Hi states.')
