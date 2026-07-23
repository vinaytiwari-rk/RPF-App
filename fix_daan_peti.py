import re

with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the Donate button with the Daan Peti icon
daan_peti_button = '''
          {/* Central elevated Daan Peti (Donation Box) Button */}
          <motion.div className="relative -top-8">
            <motion.button 
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNav("/donations")}
              className="flex flex-col items-center justify-center cursor-pointer p-0 bg-transparent border-0 outline-none relative"
            >
              <svg 
                viewBox="0 0 100 100" 
                className="w-18 h-18 filter drop-shadow-[0_0_15px_rgba(242,101,34,0.95)] animate-pulse"
                style={{ animationDuration: '2.5s' }}
              >
                <defs>
                  <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF9933" />
                    <stop offset="100%" stopColor="#F26522" />
                  </linearGradient>
                  <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFE000" />
                    <stop offset="100%" stopColor="#FF9933" />
                  </linearGradient>
                </defs>

                {/* Floating Gold Coin */}
                <circle cx="50" cy="18" r="4.5" fill="#FFE000" stroke="#FFFFFF" strokeWidth="1" />
                <path d="M50 15v6 M47.5 18h5" stroke="#FF9933" strokeWidth="0.8" />

                {/* Donation Box Lid */}
                <polygon points="20,38 80,38 75,32 25,32" fill="url(#lidGrad)" stroke="#FFFFFF" strokeWidth="1" />
                <rect x="42" y="34" width="16" height="2" rx="1" fill="#1C2D42" />

                {/* Donation Box Body */}
                <rect x="23" y="38" width="54" height="44" rx="6" fill="url(#boxGrad)" stroke="#FFFFFF" strokeWidth="1.5" />
                
                {/* Front panel glass highlight */}
                <rect x="27" y="42" width="46" height="36" rx="4" fill="#FFFFFF" fillOpacity="0.1" />

                {/* Text: "दान पेटी" */}
                <text x="50" y="56" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="9.5" letterSpacing="0.5">
                  दान पेटी
                </text>

                {/* Text: "DONATION BOX" */}
                <text x="50" y="68" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif" fontWeight="900" fontSize="5.5" letterSpacing="0.8" opacity="0.95">
                  DONATION BOX
                </text>
              </svg>
              <span className="absolute -bottom-4 text-[8px] font-black text-[#1C2D42] tracking-widest uppercase">DONATE</span>
            </motion.button>
          </motion.div>
'''

content = re.sub(
    r'\{/\* Central elevated hand dropping coin inside neon heart button \*\/\}.*?</motion\.div>|\{/\* Central elevated Glowing Heart Donate Button \*\/\}.*?</motion\.div>',
    daan_peti_button,
    content,
    flags=re.DOTALL
)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Donate button to Daan Peti vector icon')
