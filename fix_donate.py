import re

# Home.tsx
with open('src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    home_content = f.read()

# The Quick Actions matrix in Home.tsx likely has a Donation or Donate item.
# Let's see if we can find it by looking for the word "Donation" or "Donate" in a list or array.
home_content = re.sub(r'\{\s*icon:\s*\w+,\s*label:\s*isHi\s*\?\s*"[^"]+"\s*:\s*"(?:Donation|Donate|Quick Donate)",\s*path:\s*"[^"]+"\s*\},?\s*', '', home_content)

# Add floating Donate button
floating_donate = '''
      {/* Floating Animated Donate Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/donate")}
        className="fixed bottom-24 right-5 z-40 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-5 py-3 shadow-2xl flex items-center gap-2 animate-bounce border-2 border-white/20 backdrop-blur-md"
      >
        <Heart className="w-5 h-5 fill-white" />
        <span className="font-black text-sm uppercase tracking-wider drop-shadow-md">Donate Now</span>
      </motion.button>
'''
# Insert before final closing div
home_content = home_content.replace('</motion.div>', floating_donate + '\n    </motion.div>')

with open('src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.write(home_content)

# Services.tsx
with open('src/pages/Services.tsx', 'r', encoding='utf-8') as f:
    services_content = f.read()

# Filter out donation service
services_content = re.sub(r'\{\s*id:\s*"(?:donate|donation)".*?\},', '', services_content, flags=re.DOTALL)

with open('src/pages/Services.tsx', 'w', encoding='utf-8') as f:
    f.write(services_content)

print('Updated Home.tsx and Services.tsx')
