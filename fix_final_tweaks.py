with open('src/layouts/MainLayout.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Header text
# Replace:
# <span className="font-sans text-[9px] font-bold text-[#000080]/80 mt-0.5 leading-none">
#   Jan Seva Super App
# </span>
# <span className="font-sans text-[8px] font-semibold text-[#000080]/70 mt-0.5 leading-none tracking-wide">
#   सेवा   समर्पण   संकल्प
# </span>
# With:
# <span className="font-sans text-[9.5px] font-extrabold text-[#000080]/85 mt-0.5 leading-none">
#   Jan Seva App
# </span>
# <span className="font-sans text-[8px] font-black mt-0.5 leading-none tracking-wide uppercase flex items-center gap-1">
#   <span className="text-[#FF9933]">सेवा</span>
#   <span className="text-slate-350">•</span>
#   <span className="text-[#000080]">समर्पण</span>
#   <span className="text-slate-355">•</span>
#   <span className="text-[#138808]">संकल्प</span>
# </span>

old_header_spans = '''                <span className="font-sans text-[9px] font-bold text-[#000080]/80 mt-0.5 leading-none">
                  Jan Seva Super App
                </span>
                <span className="font-sans text-[8px] font-semibold text-[#000080]/70 mt-0.5 leading-none tracking-wide">'''

new_header_spans = '''                <span className="font-sans text-[9.5px] font-extrabold text-[#000080]/85 mt-0.5 leading-none">
                  Jan Seva App
                </span>
                <span className="font-sans text-[8px] font-black mt-1 leading-none tracking-wide uppercase flex items-center gap-1">
                  <span className="text-[#FF9933]">सेवा</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[#000080]">समर्पण</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[#138808]">संकल्प</span>
                </span>
                <span className="hidden font-sans text-[8px] font-semibold text-[#000080]/70 mt-0.5 leading-none tracking-wide">'''

content = content.replace(old_header_spans, new_header_spans)


# 2. Update folding hands graphic inside neon heart (replace arrow paths)
old_hands_paths = '''                {/* Embedded silhouette of Folding Hands (Namaste) inside heart */}
                <path 
                  d="M50 28c-0.8 0-1.5 0.3-2 0.8l-8.5 8.5c-0.8 0.8-0.8 2 0 2.8 0.8 0.8 2 0.8 2.8 0L50 32.8l7.7 7.3c0.8 0.8 2 0.8 2.8 0 0.8-0.8 0.8-2 0-2.8l-8.5-8.5c-0.5-0.5-1.2-0.8-2-0.8z" 
                  fill="#ffffff"
                />
                <path 
                  d="M50 33.5c-0.5 0-1 0.2-1.4 0.6L41 42c-0.8 0.8-0.8 2 0 2.8s2 0.8 2.8 0l6.2-5.9 6.2 5.9c0.8 0.8 2 0.8 2.8 0s0.8-2 0-2.8l-7.6-7.9c-0.4-0.4-0.9-0.6-1.4-0.6z" 
                  fill="#ffffff"
                  opacity="0.9"
                />
                <path 
                  d="M47.5 40v20c0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V40h-5z" 
                  fill="#ffffff"
                  opacity="0.95"
                />'''

new_hands_paths = '''                {/* Embedded silhouette of Folding Hands (Namaste) inside heart */}
                <g fill="#ffffff" opacity="0.95">
                  {/* Symmetrical joined palms */}
                  <path d="M48 25C44.5 25 41 33 41 48c0 10 3 17 3 17h4.5z" />
                  <path d="M52 25l0 40H56.5c0 0 3-7 3-17C59.5 33 55.5 25 52 25z" />
                </g>'''

content = content.replace(old_hands_paths, new_hands_paths)

with open('src/layouts/MainLayout.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated header text & replaced arrow graphics with clean folding hands silhouette')
