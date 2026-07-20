import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Shield, AlertOctagon, Phone, User, Plus, Heart, HelpCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
// import axios from 'axios';

export default function WomenSafety() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const [sosActive, setSosActive] = useState(false);
  const [sosFired, setSosFired] = useState(false);
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
          { title: lang === "hi" ? "निःशुल्क कानूनी परामर्श" : "Free Legal Advice", desc: lang === "hi" ? "विशेषज्ञों से सुरक्षित सलाह" : "Confidential consultation with counselors", code: "1091" },
          { title: lang === "hi" ? "आत्मरक्षा कार्यशाला" : "Self-Defense Workshops", desc: lang === "hi" ? "निशुल्क साप्ताहिक प्रशिक्षण" : "Register for free local skill sessions", code: "RPF-DEF" }
        ].map((item, idx) => (
          <div key={idx} className="glass-card bg-white/95 p-4 border-gold-soft flex items-center justify-between">
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

    </div>
  );
}
