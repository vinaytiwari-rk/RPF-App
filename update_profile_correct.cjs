const fs = require('fs');

let p = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

if (!p.includes('const { user, isAuthenticated')) {
    p = p.replace('const { user, language, logout } = useAuth();', 'const { user, isAuthenticated, language, logout } = useAuth();');
}

if (!p.includes('import { LogIn }')) {
    p = p.replace('import { \n  Award', 'import { \n  LogIn,\n  Award');
}

// Ensure accountItems has `any`
p = p.replace('browserSettings }) =>', 'browserSettings }: any) =>');

const loginCard = `        {/* Unauthenticated Login Card */}
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
`;

// Insert the login card before the User Identity Header Card, and wrap the rest in {isAuthenticated && (...)}
p = p.replace(/\{\/\* User Identity Header Card \*\/\}/, `${loginCard}\n        {isAuthenticated && (\n          <>\n          {/* User Identity Header Card */}`);

// We need to close the `<>` at the end of the sections before Legal section.
p = p.replace(/\{\/\* Legal, Governance & Policy Options \*\/\}/, `          </>\n        )}\n\n        {/* Legal, Governance & Policy Options */}`);


// Also wrap Logout button
p = p.replace(/\{\/\* Logout Section \*\/\}/, `{isAuthenticated && (\n        {/* Logout Section */}`);
p = p.replace(/<\/button>\n        <\/section>/, `</button>\n        </section>\n        )}`);

fs.writeFileSync('src/pages/Profile.tsx', p, 'utf8');
console.log('Profile updated for unauthenticated users');
