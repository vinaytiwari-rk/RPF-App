with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : https://) :',
    'a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : "https://" + settings.webUrl) :'
)

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Syntax fixed in Profile.tsx')
