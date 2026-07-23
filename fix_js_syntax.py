import re

with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

home_content = home_content.replace('action.id !== "donations" and action.id !== "donate"', 'action.id !== "donations" && action.id !== "donate"')

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

with open('src/components/AIAssistant.tsx', 'r', encoding='utf-8') as f:
    ai_content = f.read()

ai_content = ai_content.replace('{isHi ? "AI जन सेवा सहायक • Google Search बैकअप" : "AI Jan Seva Assistant • "}', '{isHi ? "AI जन सेवा सहायक" : "AI Jan Seva Assistant"}')

with open('src/components/AIAssistant.tsx', 'w', encoding='utf-8') as f:
    f.write(ai_content)

print('Fixed Home.tsx and AIAssistant.tsx')
