const fs = require('fs');

let lines = fs.readFileSync('src/pages/Profile.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const { user, language, logout } = useAuth();')) {
    lines[i] = '    const { user, isAuthenticated, language, logout } = useAuth();';
  }
  if (lines[i].includes('import { \n  Award')) {
    lines[i] = 'import { \n  LogIn,\n  Award';
  }
  if (lines[i].includes('browserSettings }) => (')) {
    lines[i] = lines[i].replace('browserSettings }) => (', 'browserSettings }: any) => (');
  }
  
  if (lines[i].includes('{/* User Identity Header Card */}')) {
    lines.splice(i, 0, `        {/* Unauthenticated Login Card */}
        {!isAuthenticated && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[24px] border border-[#D8E8DB] bg-white p-6 shadow-sm text-center"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#167C5A] via-[#FFF7E8] to-[#D97706]" />
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-[#D97706]">
                <User className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#243B32]">
              {hi ? "खाता साइन इन करें" : "Sign In to Your Account"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 mb-6">
              {hi ? "जन सेवा कार्ड, व्यक्तिगत गतिविधियों और अन्य सुविधाओं तक पहुंचने के लिए साइन इन करें।" : "Sign in to access your Jan Seva Card, personal activity, and other features."}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#167C5A] py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#12664A] transition active:scale-[0.98]"
            >
              <LogIn className="h-5 w-5" />
              {hi ? "साइन इन / रजिस्टर" : "Sign In / Register"}
            </button>
          </motion.section>
        )}
        
        {isAuthenticated && (
          <>`);
    i += 30; // skip added lines
  }
  
  if (lines[i].includes('{/* Legal, Governance & Policy Options */}')) {
    lines.splice(i, 0, `          </>\n        )}\n`);
    i += 2;
  }
  
  if (lines[i].includes('{/* Logout Section */}')) {
    lines[i] = '        {isAuthenticated && (\n        <>\n' + lines[i];
  }
  
  if (lines[i].includes('Log Out of Account"}')) {
    // find the closing tag for the button
    let j = i + 1;
    while (!lines[j].includes('</button>')) j++;
    if (lines[j+1].includes('</section>')) {
      lines[j+1] = '        </section>\n        </>\n        )}';
    }
  }
}

fs.writeFileSync('src/pages/Profile.tsx', lines.join('\n'), 'utf8');
console.log('Profile parsed correctly');
