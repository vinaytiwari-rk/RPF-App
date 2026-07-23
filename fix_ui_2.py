import re

# 1. Fix Home.tsx (Remove Quick Actions Donation & Dedicated Red Button)
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

# Filter out donations from quick actions
home_content = re.sub(
    r'const activeActions = \(servicesList \|\| \[\]\)\.filter\(\(action\) => \{([^\}]+)\}\);',
    r'const activeActions = (servicesList || []).filter((action) => {\1}).filter((action) => action.id !== "donations" and action.id !== "donate");',
    home_content
)

# Remove Dedicated Donate Button block
home_content = re.sub(
    r'\{/\* Dedicated Donate Button \*/\}.*?</div>\s*</div>\s*\{/\* 5\. Latest Campaigns',
    r'</div>\n\n      {/* 5. Latest Campaigns',
    home_content,
    flags=re.DOTALL
)

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

# 2. Fix AIAssistant.tsx (Remove "Google Search Backup" and "Gemini Search")
with open('src/components/AIAssistant.tsx', 'r', encoding='utf-8') as f:
    ai_content = f.read()

ai_content = ai_content.replace('Google Search Backup', '')
ai_content = ai_content.replace('Gemini Search', '')
ai_content = ai_content.replace('Gemini + Search', '')

with open('src/components/AIAssistant.tsx', 'w', encoding='utf-8') as f:
    f.write(ai_content)

# 3. Fix MainLayout.tsx (Chatbot icon and animated 🙏)
with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    layout_content = f.read()

# Replace Heart with folding hands emoji for Donate
layout_content = re.sub(
    r'<Heart className="w-6 h-6 fill-white" />',
    r'<span className="text-xl animate-bounce drop-shadow-md">🙏</span>',
    layout_content
)

# Replace Chatbot Bot icon with AI man image
layout_content = re.sub(
    r'<Bot className="w-6 h-6 text-white" />',
    r'<img src="/assets/chatbot.jpg" alt="AI Chatbot" className="w-10 h-10 rounded-full object-cover" />',
    layout_content
)

# Update padding of the chatbot button because the image is bigger
layout_content = re.sub(
    r'className="absolute bottom-20 right-4 z-40 bg-gradient-to-tr from-\[#FF9933\] to-\[#FF5722\] hover:from-\[#FF7700\] hover:to-\[#FF5722\] text-white p-3 rounded-full',
    r'className="absolute bottom-20 right-4 z-40 bg-white p-1 rounded-full',
    layout_content
)

# Apply global Indian tricolor background to Profile
# Wait, Profile is handled in Profile.tsx

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_content)

print('Updated UI Components')
