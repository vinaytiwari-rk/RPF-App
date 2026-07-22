import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<body>', '<body class="bg-slate-200 flex justify-center min-h-screen">')
content = content.replace('<div id="root"></div>', '<div id="root" class="w-full max-w-md bg-white shadow-2xl min-h-screen relative overflow-x-hidden"></div>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched index.html successfully!")
