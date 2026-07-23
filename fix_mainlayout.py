import re

with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace RA with User icon
content = re.sub(
    r'\{language === "hi" \? ".." : "RA"\}',
    '<User className="w-5 h-5 text-slate-400" />',
    content
)
content = re.sub(
    r'bg-gradient-to-br from-\[#FF9933\] to-\[#FF5722\] flex items-center justify-center text-white',
    'bg-slate-100 flex items-center justify-center text-slate-500',
    content
)

# Add animations to nav buttons
# Find <motion.button whileTap={{ scale: 0.9 }}
content = content.replace(
    '<motion.button \n            whileTap={{ scale: 0.9 }}',
    '<motion.button \n            whileHover={{ scale: 1.15, y: -2 }}\n            whileTap={{ scale: 0.9 }}'
)
content = content.replace(
    '<motion.button \n              whileTap={{ scale: 0.9 }}',
    '<motion.button \n              whileHover={{ scale: 1.15, y: -2 }}\n              whileTap={{ scale: 0.9 }}'
)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed MainLayout.tsx')
