import re

with open('src/context/AppContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('setInterval(fetchAllData, 5000)', 'setInterval(fetchAllData, 60000)')

with open('src/context/AppContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/pages/Community.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('}, 5000);', '}, 60000);')

with open('src/pages/Community.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched polling intervals")
