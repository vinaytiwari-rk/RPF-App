import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inputs that are specifically for HI
content = re.sub(r'<input[^>]*value={[a-zA-Z]+Hi}[^>]*/>\s*', '', content)
content = re.sub(r'<textarea[^>]*value={[a-zA-Z]+Hi}[^>]*/>\s*', '', content)
content = re.sub(r'<div[^>]*><label[^>]*>About \(HI\).*?</JoditEditor></div>\s*', '', content)

# Now for all En inputs, change placeholder from (EN) to (Multi-Language)
content = content.replace('(EN)', '(Multi-Language)')
content = content.replace('English', 'Multi-Language')
content = content.replace('Title (English)', 'Title')

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Replaced Hi inputs.')
