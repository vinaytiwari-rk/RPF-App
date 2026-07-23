import re

with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the button style
content = re.sub(
    r'<motion\.div className="relative -top-5">\s*<motion\.button[^>]*>\s*<img src="/assets/donate\.jpg"[^>]*>\s*</motion\.button>\s*</motion\.div>',
    '''<motion.div className="relative -top-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav("/donations")}
              className="bg-black rounded-full p-0.5 shadow-2xl flex items-center justify-center border-4 border-white/90 overflow-hidden cursor-pointer"
            >
              <img src="/assets/donate.jpg" alt="Donate Now" className="w-14 h-14 rounded-full object-cover animate-pulse" />
            </motion.button>
          </motion.div>''',
    content,
    flags=re.DOTALL
)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Donate button style')
