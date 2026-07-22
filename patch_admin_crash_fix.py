import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The block to remove
block_to_remove = """
  // Auto-save simulation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAutoSaving(true);
      setTimeout(() => {
        setIsAutoSaving(false);
        setLastSaved(new Date());
      }, 800);
    }, 5000);
    return () => clearTimeout(timer);
  }, [founderEn, founderHi, aboutTextEn, aboutTextHi, postTextEn, postTextHi]);
"""

# Extract the block
if block_to_remove.strip() in content:
    content = content.replace(block_to_remove, "")
else:
    # Use regex if exact match fails
    content = re.sub(r'  // Auto-save simulation effect\n  useEffect\(\(\) => \{.*?\n  \}, \[founderEn, founderHi, aboutTextEn, aboutTextHi, postTextEn, postTextHi\]\);\n', '', content, flags=re.DOTALL)


# Insert it right before the first useEffect after all useStates are defined
# Let's find: `const [cmsLoaded, setCmsLoaded] = useState(false);`
insert_target = "  const [cmsLoaded, setCmsLoaded] = useState(false);"

if insert_target in content:
    content = content.replace(insert_target, insert_target + "\n\n" + block_to_remove)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Crash fix applied.")
