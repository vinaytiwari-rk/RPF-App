import re

with open('src/index.css', 'r', encoding='utf-8') as f:
    content = f.read()

stagger_css = """
  /* Staggered entrance delays */
  .delay-75 { animation-delay: 75ms; }
  .delay-100 { animation-delay: 100ms; }
  .delay-150 { animation-delay: 150ms; }
  .delay-200 { animation-delay: 200ms; }
  .delay-300 { animation-delay: 300ms; }
  .delay-500 { animation-delay: 500ms; }
"""

if "/* Staggered entrance delays */" not in content:
    content = content.replace('.animate-fadeIn {', stagger_css + '\n  .animate-fadeIn {')

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched index.css")
