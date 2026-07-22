import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import JoditEditor
content = re.sub(
    r'import \{ DataTable \} from "\.\./components/admin/DataTable";',
    'import { DataTable } from "../components/admin/DataTable";\nimport JoditEditor from "jodit-react";',
    content
)

# 2. Add config for Jodit
config_block = """
  const joditConfig = {
    readonly: false,
    height: 300,
    toolbarButtonSize: "small" as any,
    buttons: ["bold", "italic", "underline", "strikethrough", "|", "ul", "ol", "|", "font", "fontsize", "brush", "paragraph", "|", "link", "align", "undo", "redo"]
  };
"""
content = re.sub(
    r'export default function AdminDashboard\(\) \{',
    'export default function AdminDashboard() {\n' + config_block,
    content
)

# 3. Replace Founder textareas
founder_en_replacement = r'<JoditEditor value={founderEn} config={joditConfig} onBlur={newContent => setFounderEn(newContent)} />'
founder_hi_replacement = r'<JoditEditor value={founderHi} config={joditConfig} onBlur={newContent => setFounderHi(newContent)} />'
content = re.sub(
    r'<textarea value=\{founderEn\} onChange=\{e => setFounderEn\(e\.target\.value\)\} placeholder="Message EN" className="w-full border border-slate-200 bg-slate-50 p-2\.5 rounded-xl min-h-\[50px\]" />',
    founder_en_replacement,
    content
)
content = re.sub(
    r'<textarea value=\{founderHi\} onChange=\{e => setFounderHi\(e\.target\.value\)\} placeholder=".*?" className="w-full border border-slate-200 bg-slate-50 p-2\.5 rounded-xl min-h-\[50px\] mt-2" />',
    founder_hi_replacement,
    content
)

# 4. Replace About Details textareas
about_en_replacement = r'<div className="w-full col-span-2"><label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">About (EN)</label><JoditEditor value={aboutTextEn} config={joditConfig} onBlur={newContent => setAboutTextEn(newContent)} /></div>'
about_hi_replacement = r'<div className="w-full col-span-2"><label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">About (HI)</label><JoditEditor value={aboutTextHi} config={joditConfig} onBlur={newContent => setAboutTextHi(newContent)} /></div>'
content = re.sub(
    r'<textarea required value=\{aboutTextEn\}.*?/>',
    about_en_replacement,
    content,
    count=1,
    flags=re.DOTALL
)
content = re.sub(
    r'<textarea required value=\{aboutTextHi\}.*?/>',
    about_hi_replacement,
    content,
    count=1,
    flags=re.DOTALL
)

# 5. Replace Campaign textareas
campaign_en_replacement = r'<div className="w-full"><label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Campaign Desc (EN)</label><JoditEditor value={postTextEn} config={joditConfig} onBlur={newContent => setPostTextEn(newContent)} /></div>'
campaign_hi_replacement = r'<div className="w-full"><label className="text-[10px] font-black uppercase text-slate-500 mb-1 block">Campaign Desc (HI)</label><JoditEditor value={postTextHi} config={joditConfig} onBlur={newContent => setPostTextHi(newContent)} /></div>'
content = re.sub(
    r'<textarea required value=\{postTextEn\}.*?/>',
    campaign_en_replacement,
    content,
    count=1,
    flags=re.DOTALL
)
content = re.sub(
    r'<textarea required value=\{postTextHi\}.*?/>',
    campaign_hi_replacement,
    content,
    count=1,
    flags=re.DOTALL
)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched AdminDashboard.tsx with JoditEditor")
