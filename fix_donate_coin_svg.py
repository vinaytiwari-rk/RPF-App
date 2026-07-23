import re

with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the svg icon with a clean SVG of a hand dropping a coin into a heart/box
# Hand vector with a glowing golden coin dropping down into the heart shape

hand_coin_svg = '''
          {/* Central elevated hand dropping coin inside neon heart button */}
          <motion.div className="relative -top-7">
            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav("/donations")}
              className="flex items-center justify-center cursor-pointer p-0 bg-transparent border-0 outline-none relative"
            >
              <svg 
                viewBox="0 0 100 100" 
                className="w-16 h-16 filter drop-shadow-[0_0_15px_rgba(255,59,48,0.95)]"
              >
                <defs>
                  <linearGradient id="neonHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF3B30" />
                    <stop offset="100%" stopColor="#F26522" />
                  </linearGradient>
                </defs>
                
                {/* Heart Base Box */}
                <path 
                  d="M50 88.3L43.8 82.6C21.8 62.6 7.3 49.5 7.3 33.3C7.3 20.1 17.6 9.8 30.8 9.8C38.3 9.8 45.5 13.3 50 18.8C54.5 13.3 61.7 9.8 69.2 9.8C82.4 9.8 92.7 20.1 92.7 33.3C92.7 49.5 78.2 62.6 56.2 82.7L50 88.3Z" 
                  fill="url(#neonHeartGrad)"
                />

                {/* Hand Vector silhouette in White (dropping coin) */}
                <path 
                  d="M25 45c2 0 4-1 5-3l12-14c1-1 3-2 5-2h20c2 0 4 2 4 4s-2 4-4 4H51l-8 8H35V45h-10z" 
                  fill="#ffffff"
                  opacity="0.9"
                />

                {/* Glowing Golden Coin being dropped */}
                <circle 
                  cx="50" 
                  cy="43" 
                  r="6.5" 
                  fill="#FFD700"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="absolute -bottom-4 text-[8px] font-black text-[#1C2D42] tracking-widest uppercase">DONATE</span>
            </motion.button>
          </motion.div>
'''

# Replace the previous heart svg
content = re.sub(
    r'\{/\* Central elevated Glowing Heart Donate Button \*\/\}.*?</motion\.div>',
    hand_coin_svg,
    content,
    flags=re.DOTALL
)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Donate button with hand dropping coin SVG vector')
