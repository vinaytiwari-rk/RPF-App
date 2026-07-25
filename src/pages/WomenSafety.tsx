import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Shield, AlertOctagon, Phone, User, Plus, Heart, HelpCircle, CheckCircle, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function WomenSafety() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [sosFired, setSosFired] = useState(false);
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals state
  const [showCounselingModal, setShowCounselingModal] = useState(false);
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  
  // Counseling form state
  const [counselingType, setCounselingType] = useState("Legal Consultation");
  const [counselingDesc, setCounselingDesc] = useState("");
  const [counselingContact, setCounselingContact] = useState("Call");
  const [submittingCounseling, setSubmittingCounseling] = useState(false);

  // Workshop form state
  const [preferredBatch, setPreferredBatch] = useState("Weekend Morning");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [submittingWorkshop, setSubmittingWorkshop] = useState(false);

  const handleSOS = async () => {
    setSosActive(true);
    try {
      let locationStr = "Location unavailable";
      if ("geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
          const lat = pos.coords.latitude.toFixed(6);
          const lon = pos.coords.longitude.toFixed(6);
          locationStr = `https://www.google.com/maps?q=${lat},${lon}`;
        } catch (e: any) {
          console.warn("GPS failed", e);
          if (e.code === 1) { // PERMISSION_DENIED
            locationStr = "Location Permission Denied";
          } else {
            locationStr = "Location unavailable (Error or Timeout)";
          }
        }
      }

      const data = {
        sosTriggered: true,
        userLocation: locationStr,
        designatedContacts: contacts
      };

      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Women Support",
        submissionData: JSON.stringify(data),
        status: "pending",
        timestamp: new Date().toISOString(),
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (!res.ok) throw new Error("Failed to submit SOS report");
      
      setSosFired(true);
      setTimeout(() => {
        setSosFired(false);
      }, 5000);
    } catch (err) {
      console.error("Supabase SOS broadcast error:", err);
    } finally {
      setSosActive(false);
    }
  };

  const handleCounselingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCounseling(true);
    try {
      const data = {
        counselingType,
        description: counselingDesc,
        contactPreference: counselingContact
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Women Support - Counseling",
        submissionData: JSON.stringify(data),
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setSuccessMsg(lang === "hi" ? "परामर्श अनुरोध पंजीकृत किया गया!" : "Counseling request registered!");
        setShowCounselingModal(false);
        setCounselingDesc("");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCounseling(false);
    }
  };

  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWorkshop(true);
    try {
      const data = {
        preferredBatch,
        experienceLevel
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Women Support - Workshop",
        submissionData: JSON.stringify(data),
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setSuccessMsg(lang === "hi" ? "कार्यशाला हेतु सफलतापूर्वक पंजीकृत!" : "Successfully registered for workshop!");
        setShowWorkshopModal(false);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingWorkshop(false);
    }
  };

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.trim() && contacts.length < 5) {
      setContacts([...contacts, newContact.trim()]);
      setNewContact("");
      setSuccessMsg(lang === "hi" ? "सम्पर्क सफलतापूर्वक जोड़ा गया!" : "Contact added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24 relative overflow-x-hidden">
      
      {/* Dynamic Saffron/Crimson SOS Dial */}
      <div className="flex flex-col items-center justify-center py-6 bg-white border border-red-200/50 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-red-50/10 pointer-events-none"></div>
        
        <button 
          onClick={handleSOS}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative cursor-pointer ${
            sosActive 
              ? "bg-red-950 scale-95 shadow-inner" 
              : "bg-gradient-to-br from-red-600 to-red-800 hover:scale-105 shadow-[0_10px_30px_rgba(220,38,38,0.4)]"
          }`}
        >
          {/* Animated concentric rings */}
          {!sosActive && (
            <>
              <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping"></div>
              <div className="absolute -inset-4 rounded-full border border-red-500/10 animate-pulse"></div>
            </>
          )}
          <AlertOctagon className="w-10 h-10 text-white mb-1.5" />
          <span className="text-white text-xs font-black uppercase tracking-wider">
            {sosActive ? "Sending..." : "Emergency SOS"}
          </span>
        </button>
        <p className="text-[10px] text-red-600 font-semibold uppercase tracking-widest mt-4">
          {lang === "hi" ? "तुरंत सहायता के लिए दबाएं" : "Press for immediate dispatch"}
        </p>
      </div>

      {/* Quick Services Grid */}
      <div className="space-y-3">
        <h4 className="font-display font-bold text-xs text-chakra-navy uppercase tracking-widest px-1">
          {lang === "hi" ? "त्वरित सहायता मार्ग" : "Welfare Services"}
        </h4>
        
        {[
          { title: lang === "hi" ? "निःशुल्क कानूनी परामर्श" : "Free Legal Advice", desc: lang === "hi" ? "विशेषज्ञों से सुरक्षित सलाह" : "Confidential consultation with counselors", code: "1091", action: () => setShowCounselingModal(true) },
          { title: lang === "hi" ? "आत्मरक्षा कार्यशाला" : "Self-Defense Workshops", desc: lang === "hi" ? "निशुल्क साप्ताहिक प्रशिक्षण" : "Register for free local skill sessions", code: "RPF-DEF", action: () => setShowWorkshopModal(true) }
        ].map((item, idx) => (
          <div 
            key={idx} 
            onClick={item.action}
            className="glass-card bg-white/95 p-4 border-gold-soft flex items-center justify-between cursor-pointer hover:border-purple-400 hover:shadow-md transition duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <Shield className="w-4.5 h-4.5" />
              </div>
              <div>
                <h5 className="font-display font-bold text-xs text-slate-800">{item.title}</h5>
                <p className="text-[9px] text-slate-400 font-semibold">{item.desc}</p>
              </div>
            </div>
            <span className="text-[8px] font-mono font-bold bg-purple-100/50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">{item.code}</span>
          </div>
        ))}
      </div>

      {/* Emergency Contact List Form */}
      <div className="glass-card bg-white/95 p-4 border-gold-soft shadow-gold-premium space-y-4">
        <h4 className="font-display font-bold text-xs text-chakra-navy uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-purple-600" />
          {lang === "hi" ? "आपातकालीन संपर्क सूची (Max 5)" : "Emergency Contacts (Max 5)"}
        </h4>

        {successMsg && (
          <div className="bg-green-50 text-green-700 border border-green-150 p-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={addContact} className="flex gap-2">
          <input 
            type="tel" 
            value={newContact}
            onChange={e => setNewContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder={lang === "hi" ? "मोबाइल नंबर दर्ज करें" : "Enter mobile number"} 
            className="flex-1 border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-purple-500 font-bold"
          />
          <button 
            type="submit" 
            disabled={contacts.length >= 5 || newContact.length < 10}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg text-xs font-bold shadow-md transition disabled:opacity-40"
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </form>

        {contacts.length > 0 && (
          <div className="space-y-2 pt-2">
            {contacts.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono font-bold text-slate-700">+91 {c}</span>
                </div>
                <button 
                  onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}
                  className="text-[9px] font-bold text-red-600 hover:underline"
                >
                  {lang === "hi" ? "हटाएं" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Legal & Counseling Form Modal */}
      {showCounselingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-display font-extrabold text-sm text-[#0B1E3F] uppercase tracking-wider">
                {lang === "hi" ? "मुफ़्त कानूनी व परामर्श सेवा" : "Free Counseling Inquiry"}
              </h4>
              <button onClick={() => setShowCounselingModal(false)} className="text-slate-400 hover:text-slate-650 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCounselingSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-1">Inquiry Type / परामर्श का प्रकार</label>
                <select 
                  value={counselingType}
                  onChange={e => setCounselingType(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-slate-50 outline-none"
                >
                  <option>Legal Consultation</option>
                  <option>Psychological Counseling</option>
                  <option>Crisis Support</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-1">Description / विवरण</label>
                <textarea 
                  required
                  value={counselingDesc}
                  onChange={e => setCounselingDesc(e.target.value)}
                  placeholder="Describe your query briefly..."
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-slate-50 outline-none min-h-[70px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-1">Contact Preference / संपर्क का माध्यम</label>
                <select 
                  value={counselingContact}
                  onChange={e => setCounselingContact(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-slate-50 outline-none"
                >
                  <option>Call</option>
                  <option>Email</option>
                  <option>Anonymous Chat</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={submittingCounseling}
                className="w-full bg-purple-600 hover:bg-purple-750 text-white font-bold py-3 rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {submittingCounseling ? "Submitting..." : (lang === "hi" ? "अनुरोध भेजें" : "Submit Consultation Request")}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Self-Defense Workshop Modal */}
      {showWorkshopModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h4 className="font-display font-extrabold text-sm text-[#0B1E3F] uppercase tracking-wider">
                {lang === "hi" ? "आत्मरक्षा कार्यशाला पंजीकरण" : "Self-Defense Registration"}
              </h4>
              <button onClick={() => setShowWorkshopModal(false)} className="text-slate-400 hover:text-slate-650 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-1">Preferred Batch / पसंदीदा बैच</label>
                <select 
                  value={preferredBatch}
                  onChange={e => setPreferredBatch(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-slate-50 outline-none"
                >
                  <option>Weekend Morning (8:00 AM - 10:00 AM)</option>
                  <option>Weekend Evening (4:00 PM - 6:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-550 uppercase tracking-widest block mb-1">Experience Level / अनुभव स्तर</label>
                <select 
                  value={experienceLevel}
                  onChange={e => setExperienceLevel(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-xs font-bold bg-slate-50 outline-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={submittingWorkshop}
                className="w-full bg-purple-600 hover:bg-purple-750 text-white font-bold py-3 rounded-xl text-xs shadow-md transition disabled:opacity-50"
              >
                {submittingWorkshop ? "Registering..." : (lang === "hi" ? "पंजीकरण करें" : "Book My Free Seat")}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
