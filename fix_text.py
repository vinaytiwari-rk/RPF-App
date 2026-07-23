import os
import re

files_to_update_portal = ['index.html', 'public/index.html']
for filepath in files_to_update_portal:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('RP Foundation Portal', 'RP Jan Seva App')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

splash_path = 'src/components/SplashScreen.tsx'
if os.path.exists(splash_path):
    with open(splash_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(
        r'<span className="[^"]*">RP Foundation Tech</span>',
        '',
        content
    )
    with open(splash_path, 'w', encoding='utf-8') as f:
        f.write(content)

login_path = 'src/components/LoginScreen.tsx'
if os.path.exists(login_path):
    with open(login_path, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('Secured by RP Foundation Tech', 'Secured by RP Foundation')
    with open(login_path, 'w', encoding='utf-8') as f:
        f.write(content)

print('Updated text across app.')
