import re

# 1. Fix ServiceDetails.tsx
with open('src/pages/ServiceDetails.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
# Replace setError with setContentData(null) on error
content = re.sub(r'setError\([^)]+\);', 'setContentData(null);', content)
with open('src/pages/ServiceDetails.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Fix Home.tsx (Remove floating donate button)
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

home_content = re.sub(r'\{/\* Floating Animated Donate Button \*/\}.*?</motion\.button>', '', home_content, flags=re.DOTALL)
with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

# 3. Fix Profile.tsx (Premium light theme, remove blue/purple)
with open('src/pages/Profile.tsx', 'r', encoding='utf-8') as f:
    profile_content = f.read()

# Replace any remaining blue/dark colors in Profile
profile_content = profile_content.replace('bg-gradient-to-br from-slate-700 to-slate-900', 'bg-gradient-to-br from-amber-50 to-white')
profile_content = profile_content.replace('bg-slate-800', 'bg-white')
profile_content = profile_content.replace('text-slate-800', 'text-amber-900')
profile_content = profile_content.replace('text-white', 'text-slate-800')
profile_content = profile_content.replace('placeholder-white/50', 'placeholder-slate-400')
profile_content = profile_content.replace('bg-white/10', 'bg-white shadow-sm border border-slate-200')
profile_content = profile_content.replace('border-white/20', 'border-slate-200')
profile_content = profile_content.replace('border-white/10', 'border-slate-100')
profile_content = profile_content.replace('text-slate-300', 'text-slate-400')
# The user icon should still be visible

with open('src/pages/Profile.tsx', 'w', encoding='utf-8') as f:
    f.write(profile_content)

print('Updated ServiceDetails.tsx, Home.tsx, Profile.tsx')
