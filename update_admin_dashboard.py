import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state variables
state_vars = """
  // Admin Credentials State
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminCredMsg, setAdminCredMsg] = useState("");

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser || !adminPass) return;
    try {
      const res = await fetch("/api/admin/hq/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, newPassword: adminPass })
      });
      const data = await res.json();
      if (data.success) {
        setAdminCredMsg("Credentials updated securely.");
        setAdminPass("");
        setTimeout(() => setAdminCredMsg(""), 3000);
      } else {
        setAdminCredMsg("Update failed.");
      }
    } catch (err) {
      setAdminCredMsg("Update failed.");
    }
  };
"""
content = content.replace('const [settingsSuccess, setSettingsSuccess] = useState(false);', 
                          'const [settingsSuccess, setSettingsSuccess] = useState(false);\n' + state_vars)

# 2. Add the UI card
ui_card = """
          {/* TAB: GLOBAL SYSTEM CONTROLS (FOUNDER, HELPLINE, ALERTS) */}
          {activeTab === "settings" && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* ADMIN CREDENTIALS CARD */}
              <div className="bg-white p-5 border border-red-200 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600" /> Security Settings (Admin Credentials)
                </h4>
                
                {adminCredMsg && (
                  <div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg text-xs font-bold text-center animate-fadeIn">
                    {adminCredMsg}
                  </div>
                )}
                
                <form onSubmit={handleUpdateCredentials} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">New User ID</label>
                    <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} required placeholder="Enter new Admin ID" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-red-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">New Password</label>
                    <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} required placeholder="Enter new password" className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-red-500" />
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2">
                    <Save className="w-3.5 h-3.5" /> Update Admin Credentials
                  </button>
                </form>
              </div>
"""
content = content.replace('{/* TAB: GLOBAL SYSTEM CONTROLS (FOUNDER, HELPLINE, ALERTS) */}\n          {activeTab === "settings" && (\n            <div className="space-y-4 animate-fadeIn">', ui_card)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("AdminDashboard updated!")
