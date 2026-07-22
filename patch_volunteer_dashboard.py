import re

with open('src/pages/VolunteerDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for Check-In and Profile
new_states = """
  const [volunteerProfile, setVolunteerProfile] = useState<any>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [reportText, setReportText] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/volunteers");
        if (res.ok) {
          const data = await res.json();
          const me = data.volunteers.find((v: any) => v.id === user.id);
          if (me) setVolunteerProfile(me);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, [user]);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    setCheckInTime(new Date());
  };

  const handleCheckOut = async () => {
    if (!reportText.trim()) return alert(isHi ? "कृपया रिपोर्ट दर्ज करें" : "Please enter a report before checking out.");
    setIsSubmittingReport(true);
    try {
      const res = await fetch("/api/volunteers/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          volunteer_id: user?.id,
          check_in_time: checkInTime,
          check_out_time: new Date(),
          report_text: reportText,
          location_lat: "28.6139", // Simulated
          location_lng: "77.2090"
        })
      });
      if (res.ok) {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setReportText("");
        alert(isHi ? "रिपोर्ट सफलतापूर्वक जमा की गई!" : "Report submitted successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

"""

# Insert new_states after the existing tasks states
content = re.sub(
    r'const \[certificates, setCertificates\] = useState<any\[\]>\(\[\]\);',
    r'const [certificates, setCertificates] = useState<any[]>([]);\n' + new_states,
    content
)

# Add "Pending Approval" blocker at the top of the return
pending_blocker = """
  if (volunteerProfile && volunteerProfile.approval_status === "pending") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-screen text-center">
        <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Award className="w-12 h-12" />
        </div>
        <h2 className="font-display font-black text-2xl text-slate-800 mb-2">
          {isHi ? "अनुमोदन की प्रतीक्षा है" : "Application Pending Approval"}
        </h2>
        <p className="text-slate-500 font-bold max-w-sm mb-6">
          {isHi ? "आपके स्वयंसेवक खाते की अभी व्यवस्थापक द्वारा समीक्षा की जा रही है। एक बार स्वीकृत हो जाने पर, आप इस डैशबोर्ड तक पहुँच प्राप्त कर सकेंगे।" : "Your volunteer account is currently being reviewed by an administrator. Once approved, you will gain access to this dashboard."}
        </p>
        <button onClick={() => navigate("/")} className="bg-slate-900 text-white font-black uppercase text-xs px-6 py-3 rounded-xl shadow-lg">
          {isHi ? "होम पर वापस जाएं" : "Return Home"}
        </button>
      </div>
    );
  }
"""

content = re.sub(
    r'return \(\n\s*<div className="flex-1 flex flex-col min-h-screen bg-slate-50 pb-24">',
    pending_blocker + '\n  return (\n    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 pb-24">',
    content
)

# Add Check-in UI and location tracking below "Analytics Summary"
checkin_ui = """
        {/* Daily Operations / Check-in */}
        <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> 
              {isHi ? "दैनिक चेक-इन और रिपोर्टिंग" : "Daily Check-in & Reporting"}
            </h3>
            {isCheckedIn && (
              <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Tracking Active
              </span>
            )}
          </div>

          {!isCheckedIn ? (
            <div className="text-center py-4">
              <p className="text-xs font-bold text-slate-500 mb-4">
                {isHi ? "अपना कार्य दिवस शुरू करने के लिए चेक-इन करें और स्थान ट्रैकिंग सक्षम करें।" : "Check-in to start your work day and enable location tracking."}
              </p>
              <button 
                onClick={handleCheckIn}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3.5 rounded-xl font-black text-xs uppercase shadow-md shadow-emerald-500/20 active:scale-95 transition-transform"
              >
                {isHi ? "चेक-इन करें (स्थान सक्षम करें)" : "Check-In (Enable Location)"}
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isHi ? "वर्तमान स्थान" : "Current Location"}</p>
                  <p className="text-xs font-bold text-slate-700">Sector 14, RPF Assignment Zone</p>
                  <p className="text-[9px] font-bold text-slate-400">Lat: 28.6139, Lng: 77.2090</p>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  {isHi ? "दैनिक रिपोर्ट" : "Daily Report"}
                </label>
                <textarea 
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  placeholder={isHi ? "आज आपने क्या पूरा किया?" : "What did you accomplish today?"}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:border-indigo-500 h-24 resize-none font-medium"
                />
              </div>

              <button 
                onClick={handleCheckOut}
                disabled={isSubmittingReport}
                className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingReport ? (isHi ? "सबमिट कर रहा है..." : "Submitting...") : (isHi ? "चेक-आउट और रिपोर्ट सबमिट करें" : "Check-Out & Submit Report")}
              </button>
            </div>
          )}
        </div>
"""

content = content.replace("        {/* Assigned Tasks */}", checkin_ui + "\n        {/* Assigned Tasks */}")

# Add allocation badge in header
allocation_badge = """
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/20 mb-2 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {volunteerProfile?.constituency_allocation || "Unassigned"}
              </div>
"""
content = re.sub(
    r'<Award className="w-3\.5 h-3\.5 text-amber-400" />\n\s*\{user\?\.badges.*?\}\n\s*</div>',
    r'\g<0>\n' + allocation_badge,
    content
)

with open('src/pages/VolunteerDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched VolunteerDashboard.tsx")
