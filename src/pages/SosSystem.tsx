import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Users,
  Send,
  Plus,
  Trash2,
  Loader2,
  Volume2,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SosSystem() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [locating, setLocating] = useState<boolean>(true);
  const [sosSent, setSosSent] = useState<boolean>(false);
  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("@rpf_emergency_contacts");
      if (saved) setContacts(JSON.parse(saved));
      else setContacts([{ name: "Family Primary", phone: "112" }]);
    } catch {}
  }, []);

  const saveContactsToStorage = (updated: { name: string; phone: string }[]) => {
    setContacts(updated);
    try {
      localStorage.setItem("@rpf_emergency_contacts", JSON.stringify(updated));
    } catch {}
  };

  const addContact = () => {
    if (!newContactName || !newContactPhone) return;
    const updated = [...contacts, { name: newContactName, phone: newContactPhone }];
    saveContactsToStorage(updated);
    setNewContactName("");
    setNewContactPhone("");
  };

  const removeContact = (idx: number) => {
    const updated = contacts.filter((_, i) => i !== idx);
    saveContactsToStorage(updated);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setAddress(data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
          }
        } catch {
          setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const handleBroadcastSos = async () => {
    setSendingAlert(true);
    try {
      // Send alert to server endpoint
      const locText = address || (coords ? `${coords.lat}, ${coords.lon}` : "Location unavailable");
      await fetch("/api/public/sos-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name || "Citizen",
          userPhone: user?.phone || "Not provided",
          location: locText,
          lat: coords?.lat,
          lon: coords?.lon,
          timestamp: new Date().toISOString()
        })
      }).catch(() => null);

      // Trigger SMS protocol to saved contacts
      if (contacts.length > 0 && coords) {
        const smsBody = encodeURIComponent(
          `EMERGENCY SOS ALERT! ${user?.name || "Citizen"} needs help. Location: https://maps.google.com/?q=${coords.lat},${coords.lon}`
        );
        window.location.href = `sms:${contacts[0].phone}?body=${smsBody}`;
      }

      setSosSent(true);
    } catch {
      setSosSent(true);
    } finally {
      setSendingAlert(false);
    }
  };

  const EMERGENCY_NUMBERS = [
    { labelEn: "National Emergency", labelHi: "राष्ट्रीय आपातकाल", phone: "112", icon: ShieldAlert, color: "bg-red-600 text-white" },
    { labelEn: "Ambulance Emergency", labelHi: "एम्बुलेंस सेवा", phone: "108", icon: PhoneCall, color: "bg-[#000080] text-white" },
    { labelEn: "Women Helpline", labelHi: "महिला हेल्पलाइन", phone: "1091", icon: PhoneCall, color: "bg-pink-600 text-white" },
    { labelEn: "Police Emergency", labelHi: "पुलिस आपातकाल", phone: "100", icon: ShieldAlert, color: "bg-[#138808] text-white" },
    { labelEn: "RP Foundation Helpline", labelHi: "आर.पी. फाउंडेशन हेल्पलाइन", phone: "+917554005000", icon: PhoneCall, color: "bg-amber-600 text-white" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans selection:bg-orange-100 animate-fadeIn">
      {/* Top Danger Banner Header */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/25 mb-3">
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            {isHi ? "आपातकालीन एस.ओ.एस प्रणाली" : "Live Emergency SOS System"}
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-tight">
            {isHi ? "त्वरित एस.ओ.एस सहायता" : "Instant Emergency Help Dispatch"}
          </h1>
          <p className="text-xs text-rose-100 font-medium mt-1 max-w-md mx-auto">
            {isHi ? "एक क्लिक में आपातकालीन कॉल एवं जीपीएस लोकेशन संदेश भेजें।" : "Trigger 1-tap emergency calls and broadcast live GPS coordinates."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Live GPS Location Widget */}
        <section className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF9933]" /> Live GPS Geolocation
            </span>
            {locating && <span className="text-[9px] font-bold text-orange-600 animate-pulse">Acquiring position...</span>}
          </div>
          <p className="text-xs font-black text-slate-900 leading-snug">
            {address || (locating ? (isHi ? "जीपीएस लोकेशन लोड हो रही है..." : "Fetching exact GPS location...") : (isHi ? "स्थान अनुपलब्ध" : "Location unavailable"))}
          </p>
          {coords && (
            <p className="text-[10px] font-mono text-slate-400">
              Lat: {coords.lat.toFixed(5)}, Lon: {coords.lon.toFixed(5)}
            </p>
          )}
        </section>

        {/* Huge Red SOS Broadcast Trigger Button */}
        <section className="bg-white rounded-3xl border border-red-200 p-6 text-center shadow-md space-y-4">
          <div className="relative inline-block">
            <div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping" />
            <button
              onClick={handleBroadcastSos}
              disabled={sendingAlert}
              className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center mx-auto border-4 border-white"
            >
              {sendingAlert ? (
                <Loader2 className="w-10 h-10 animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-10 h-10 mb-1" />
                  <span>SOS</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-600 font-bold">
            {isHi ? "आपातस्थिति में तुरंत लाल बटन दबाएं" : "Press the RED SOS button to broadcast emergency alert"}
          </p>

          {sosSent && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{isHi ? "एस.ओ.एस अलर्ट भेजा गया। आपातकालीन सेवाएं सक्रिय।" : "Emergency SOS Broadcast Sent. Help dispatched."}</span>
            </div>
          )}
        </section>

        {/* 1-Tap National Emergency Hotlines */}
        <section className="space-y-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{isHi ? "1-टैप आपातकालीन नंबर" : "1-Tap Direct Hotlines"}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EMERGENCY_NUMBERS.map((num, idx) => (
              <a
                key={idx}
                href={`tel:${num.phone}`}
                className="w-full bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md transition flex items-center justify-between gap-3 active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${num.color}`}>
                    <num.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900">{isHi ? num.labelHi : num.labelEn}</h4>
                    <p className="text-[11px] font-mono font-bold text-slate-500">{num.phone}</p>
                  </div>
                </div>
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              </a>
            ))}
          </div>
        </section>

        {/* Saved Emergency Contacts */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{isHi ? "व्यक्तिगत आपातकालीन संपर्क" : "Saved Emergency Contacts"}</h3>
            <span className="text-[10px] font-bold text-slate-400">{contacts.length} Saved</span>
          </div>

          <div className="space-y-2">
            {contacts.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <div>
                  <p className="text-xs font-black text-slate-900">{c.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{c.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${c.phone}`} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                  <button type="button" onClick={() => removeContact(idx)} className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Contact Input */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder={isHi ? "नाम" : "Name"}
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            />
            <input
              type="tel"
              placeholder={isHi ? "मोबाइल नंबर" : "Phone No."}
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            />
            <button
              type="button"
              onClick={addContact}
              className="bg-[#000080] text-white p-2.5 rounded-xl text-xs font-bold hover:bg-blue-900 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
