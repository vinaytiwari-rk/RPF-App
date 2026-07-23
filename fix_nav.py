import re

with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure Heart is imported in MainLayout.tsx
if 'Heart' not in content:
    content = content.replace('import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield }', 
                              'import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield, Heart }')

# The current nav has: Home, Services, Community, Alerts, Profile
# Let's insert the Donate button in the middle (after Services, before Community)
donate_button = '''
          {/* Central Donate Button */}
          <motion.div className="relative -top-5">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav("/donate")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-4 shadow-xl flex items-center justify-center border-4 border-slate-50"
            >
              <Heart className="w-6 h-6 fill-white" />
            </motion.button>
          </motion.div>
'''

# Find the Community button block
community_regex = r'(<motion\.button[^>]*onClick=\{\(\) => handleNav\("/community"\)\}[^>]*>.*?</motion\.button>)'
# Insert donate_button before Community
content = re.sub(community_regex, donate_button + r'\n          \1', content, flags=re.DOTALL)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added Donate button to bottom nav in MainLayout.tsx')
