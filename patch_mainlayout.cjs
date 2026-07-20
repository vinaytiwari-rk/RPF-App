const fs = require('fs');

let file = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// 1. Add logout and Shield to imports
file = file.replace(/import { ArrowLeft.*? } from "lucide-react";/, 'import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield } from "lucide-react";');

// 2. Destructure logout from useAuth
file = file.replace(/const { language, setLanguage, user } = useAuth\(\);/, 'const { language, setLanguage, user, logout } = useAuth();\n  const [showGuestModal, setShowGuestModal] = useState(false);\n\n  const handleNav = (path) => {\n    if (user?.role === "guest" && (path === "/services" || path === "/community" || path === "/notifications")) {\n      setShowGuestModal(true);\n      return;\n    }\n    navigate(path);\n  };');

// 3. Replace onClick={() => navigate(...)} with onClick={() => handleNav(...)} for bottom nav buttons
file = file.replace(/onClick=\{\(\) => navigate\("\/"\)\}/g, 'onClick={() => handleNav("/")}');
file = file.replace(/onClick=\{\(\) => navigate\("\/services"\)\}/g, 'onClick={() => handleNav("/services")}');
file = file.replace(/onClick=\{\(\) => navigate\("\/community"\)\}/g, 'onClick={() => handleNav("/community")}');
file = file.replace(/onClick=\{\(\) => navigate\("\/notifications"\)\}/g, 'onClick={() => handleNav("/notifications")}');
file = file.replace(/onClick=\{\(\) => navigate\("\/profile"\)\}/g, 'onClick={() => handleNav("/profile")}');

// 4. Inject the modal before the final </div>
const modalJsx = `
        {/* Guest Interceptor Modal */}
        {showGuestModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 space-y-4 shadow-2xl max-w-sm w-full text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Registration Required</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Please register yourself as a Volunteer to access this feature.
              </p>
              <div className="flex justify-center gap-3 pt-4">
                <button 
                  onClick={() => setShowGuestModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowGuestModal(false);
                    if (logout) logout();
                    navigate("/login");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#000080] text-white font-bold text-xs hover:bg-[#0a2351] shadow-md shadow-blue-900/20 cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
`;

file = file.replace(/(\s*)(<\/div>\s*<\/div>\s*)$/i, `$1${modalJsx}$2`);

fs.writeFileSync('src/layouts/MainLayout.tsx', file);
