import re

with open('src/pages/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add "certs" to activeTab
content = content.replace(
    'useState<"analytics" | "cms" | "settings" | "cards" | "grievances" | "services" | "campaigns" | "volunteers" | "comms">("analytics")',
    'useState<"analytics" | "cms" | "settings" | "cards" | "grievances" | "services" | "campaigns" | "volunteers" | "comms" | "certs">("analytics")'
)

# 2. Add state variables for certificates
state_vars = """
  // Certificates State
  const [certService, setCertService] = useState("blood-network");
  const [sig1Name, setSig1Name] = useState("Rohit Pandit");
  const [sig1Desig, setSig1Desig] = useState("Founder");
  const [sig2Name, setSig2Name] = useState("");
  const [sig2Desig, setSig2Desig] = useState("");
  const [certConfigMsg, setCertConfigMsg] = useState("");

  const [issueVolId, setIssueVolId] = useState("");
  const [issueService, setIssueService] = useState("blood-network");
  const [issueMsg, setIssueMsg] = useState("");

  // Load Signatures when service changes
  useEffect(() => {
    if (activeTab === "certs") {
      fetch(`/api/admin/hq/certificates/signatures/${certService}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setSig1Name(data.data.signatory_1_name || "");
            setSig1Desig(data.data.signatory_1_designation || "");
            setSig2Name(data.data.signatory_2_name || "");
            setSig2Desig(data.data.signatory_2_designation || "");
          }
        });
    }
  }, [activeTab, certService]);

  const handleUpdateSignatures = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hq/certificates/signatures", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: certService, signatory_1_name: sig1Name, signatory_1_designation: sig1Desig, signatory_2_name: sig2Name, signatory_2_designation: sig2Desig })
      });
      const data = await res.json();
      if (data.success) {
        setCertConfigMsg("Signatures updated successfully!");
        setTimeout(() => setCertConfigMsg(""), 3000);
      }
    } catch (err) {
      setCertConfigMsg("Update failed.");
    }
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/hq/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_id: issueVolId, service_id: issueService })
      });
      const data = await res.json();
      if (data.success) {
        setIssueMsg(`Issued: ${data.certificate.certificate_id}`);
        setIssueVolId("");
      } else {
        setIssueMsg(data.error || "Issue failed.");
      }
    } catch (err) {
      setIssueMsg("Issue failed.");
    }
  };
"""
content = content.replace('const [settingsSuccess, setSettingsSuccess] = useState(false);', 
                          'const [settingsSuccess, setSettingsSuccess] = useState(false);\n' + state_vars)

# 3. Add the UI block for "certs"
certs_ui = """
          {/* TAB: CERTIFICATES & SIGNATORIES */}
          {activeTab === "certs" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" /> Certificate Signatures Config
                </h4>
                
                {certConfigMsg && (
                  <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs font-bold text-center">
                    {certConfigMsg}
                  </div>
                )}
                
                <form onSubmit={handleUpdateSignatures} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Select Service</label>
                    <select value={certService} onChange={e => setCertService(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none">
                      <option value="blood-network">Blood Network</option>
                      <option value="jan-seva-card">Jan Seva Card</option>
                      <option value="health-camps">Health Camps</option>
                      <option value="education-support">Education Support</option>
                      <option value="women-safety">Women Safety</option>
                      <option value="environment">Environment / Tree Plantation</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Signatory 1 Name</label>
                      <input type="text" value={sig1Name} onChange={e => setSig1Name(e.target.value)} required className="w-full border border-slate-200 p-2 rounded-lg text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Signatory 1 Desig</label>
                      <input type="text" value={sig1Desig} onChange={e => setSig1Desig(e.target.value)} required className="w-full border border-slate-200 p-2 rounded-lg text-xs" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Signatory 2 Name</label>
                      <input type="text" value={sig2Name} onChange={e => setSig2Name(e.target.value)} placeholder="Optional" className="w-full border border-slate-200 p-2 rounded-lg text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Signatory 2 Desig</label>
                      <input type="text" value={sig2Desig} onChange={e => setSig2Desig(e.target.value)} placeholder="Optional" className="w-full border border-slate-200 p-2 rounded-lg text-xs" />
                    </div>
                  </div>
                  
                  <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-[10px] uppercase py-3 rounded-xl shadow-md">
                    Save Signatures
                  </button>
                </form>
              </div>

              <div className="bg-white p-5 border border-slate-200 rounded-3xl shadow-sm space-y-4">
                <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" /> Manual Issue Certificate
                </h4>
                
                {issueMsg && (
                  <div className={`p-2 rounded-lg text-xs font-bold text-center ${issueMsg.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {issueMsg}
                  </div>
                )}
                
                <form onSubmit={handleIssueCertificate} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Volunteer ID / Username</label>
                    <input type="text" value={issueVolId} onChange={e => setIssueVolId(e.target.value)} required placeholder="e.g. RPF-2026-1042 or Username" className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Service Config</label>
                    <select value={issueService} onChange={e => setIssueService(e.target.value)} className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-xl text-xs font-bold outline-none">
                      <option value="blood-network">Blood Network</option>
                      <option value="jan-seva-card">Jan Seva Card</option>
                      <option value="health-camps">Health Camps</option>
                      <option value="education-support">Education Support</option>
                      <option value="women-safety">Women Safety</option>
                      <option value="environment">Environment / Tree Plantation</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-amber-500 text-white font-bold text-[10px] uppercase py-3 rounded-xl shadow-md">
                    Issue Certificate Now
                  </button>
                </form>
              </div>
            </div>
          )}
"""
content = content.replace('{/* TAB: GLOBAL SYSTEM CONTROLS (FOUNDER, HELPLINE, ALERTS) */}', certs_ui + '\n          {/* TAB: GLOBAL SYSTEM CONTROLS (FOUNDER, HELPLINE, ALERTS) */}')

# 4. Add the Tab Button to the grid
tab_button = """          ].map(t => ("""
new_tab_array = """{ key: "certs", label: "Certificates", icon: Award },
            { key: "analytics", label: "Analytics", icon: BarChart2 },
"""
content = content.replace('{ key: "analytics", label: "Analytics", icon: BarChart2 },', new_tab_array)

with open('src/pages/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched AdminDashboard.tsx successfully!")
