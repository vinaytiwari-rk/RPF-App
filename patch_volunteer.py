import re

with open('src/components/VolunteerRegistrationWizard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove states
content = re.sub(r'const \[mobileOtp, setMobileOtp\] = useState\(""\);\n\s*const \[emailOtp, setEmailOtp\] = useState\(""\);\n\s*const \[mobileSent, setMobileSent\] = useState\(false\);\n\s*const \[emailSent, setEmailSent\] = useState\(false\);\n\s*const \[mobileVerified, setMobileVerified\] = useState\(false\);\n\s*const \[emailVerified, setEmailVerified\] = useState\(false\);', '', content)

# 2. Remove sendOtp and verifyOtp
content = re.sub(r'const sendOtp = async.*?};\n\s*};\n\s*const verifyOtp = async.*?};\n\s*};', '', content, flags=re.DOTALL)

# 3. Clean up the UI
ui_replace = """
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5"><Phone className="w-3 h-3 text-[#FF9933]"/> Mobile No.</label>
                </div>
                <div className="flex gap-2">
                  <input type="tel" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g, '').slice(0, 15))} className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none" placeholder={isIndia ? "10-digit number" : "Mobile Number"} />
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-700 uppercase flex items-center gap-1.5"><Mail className="w-3 h-3 text-[#138808]"/> Email ID</label>
                </div>
                <div className="flex gap-2">
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="flex-1 p-2.5 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50 outline-none" placeholder="name@example.com" />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={()=>setStep(1)} className="p-3 bg-slate-100 text-slate-600 rounded-xl transition hover:bg-slate-200"><ArrowLeft className="w-4 h-4"/></button>
                <button disabled={mobile.length < 8 || !email.includes('@')} onClick={()=>setStep(3)} className="flex-1 py-3 bg-[#0B1E3F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition">Next <ArrowRight className="w-4 h-4"/></button>
              </div>
            </div>
"""

# We can replace the whole step 2 return block
step2_ui_regex = re.compile(r'<div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">.*?</div>\n\s*</div>\n\s*\)\}', flags=re.DOTALL)
# Wait, replacing raw HTML might be tricky. Let's just find the first "Mobile No." and replace until the end of step 2 block.
# I will use a more robust regex or just write the script to do it cleanly.
content = re.sub(
    r'<div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm space-y-2">\s*<div className="flex justify-between items-center">\s*<label className="text-\[10px\] font-bold text-slate-700 uppercase flex items-center gap-1.5"><Phone.*?</div>\s*</div>\s*</div>\s*\)\}',
    ui_replace.strip() + '\n          )}',
    content,
    flags=re.DOTALL
)

with open('src/components/VolunteerRegistrationWizard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("VolunteerRegistrationWizard.tsx patched")
