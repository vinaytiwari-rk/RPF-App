import React, { useState, useEffect } from "react";
import { ShieldAlert, PhoneCall, MapPin, CheckCircle2, Plus, Trash2, Loader2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SosSystem() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(true);
  const [sosSent, setSosSent] = useState(false);
  const [sosError, setSosError] = useState("");
  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("@rpf_emergency_contacts");
      if (saved) setContacts(JSON.parse(saved));
    } catch {}
  }, []);

  const saveContactsToStorage = (updated: { name: string; phone: string }[]) => {
    setContacts(updated);
    try { localStorage.setItem("@rpf_emergency_contacts", JSON.stringify(updated)); } catch {}
  };
  const addContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    saveContactsToStorage([...contacts, { name: newContactName.trim(), phone: newContactPhone.trim() }]);
    setNewContactName(""); setNewContactPhone("");
  };
  const removeContact = (idx: number) => saveContactsToStorage(contacts.filter((_, i) => i !== idx));

  useEffect(() => {
    if (!navigator.geolocation) { setLocating(false); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords: c }) => {
      const lat = c.latitude, lon = c.longitude;
      setCoords({ lat, lon });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        if (res.ok) { const data = await res.json(); setAddress(data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`); }
      } catch { setAddress(`${lat.toFixed(4)}, ${lon.toFixed(4)}`); }
      finally { setLocating(false); }
    }, () => setLocating(false), { timeout: 8000 });
  }, []);

  const handleBroadcastSos = async () => {
    setSendingAlert(true); setSosSent(false); setSosError("");
    try {
      const response = await fetch("/api/public/sos-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          userName: user?.name || "Citizen",
          userPhone: user?.phone || "Not provided",
          location: address || (coords ? `${coords.lat}, ${coords.lon}` : "Location unavailable"),
          lat: coords?.lat,
          lon: coords?.lon,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error("SOS server request failed");
      const result = await response.json().catch(() => ({}));
      if (result?.success !== true) throw new Error("SOS server did not confirm the alert");

      // SMS is an explicit user action; do not claim the server dispatched an emergency response.
      if (contacts.length > 0 && coords) {
        const smsBody = encodeURIComponent(`EMERGENCY SOS ALERT! ${user?.name || "Citizen"} needs help. Location: https://maps.google.com/?q=${coords.lat},${coords.lon}`);
        window.location.href = `sms:${contacts[0].phone}?body=${smsBody}`;
      }
      setSosSent(true);
    } catch {
      setSosError(isHi ? "SOS अलर्ट की सर्वर से पुष्टि नहीं हुई। कृपया 112 पर सीधे कॉल करें।" : "The SOS alert was not confirmed by the server. Please call 112 directly.");
    } finally { setSendingAlert(false); }
  };

  const EMERGENCY_NUMBERS = [
    { labelEn: "National Emergency", labelHi: "राष्ट्रीय आपातकाल", phone: "112", icon: ShieldAlert, color: "bg-red-600 text-white" },
    { labelEn: "Ambulance", labelHi: "एम्बुलेंस सेवा", phone: "102", icon: PhoneCall, color: "bg-[#000080] text-white" },
    { labelEn: "Women Helpline", labelHi: "महिला हेल्पलाइन", phone: "181", icon: PhoneCall, color: "bg-slate-800 text-white" },
    { labelEn: "Police Helpline", labelHi: "पुलिस हेल्पलाइन", phone: "100", icon: ShieldAlert, color: "bg-[#138808] text-white" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans selection:bg-orange-100 animate-fadeIn">
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 p-6 text-white shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/25 mb-3"><ShieldAlert className="w-4 h-4" />{isHi ? "आपातकालीन एस.ओ.एस प्रणाली" : "Emergency SOS"}</div>
          <h1 className="text-2xl font-black tracking-tight">{isHi ? "त्वरित एस.ओ.एस सहायता" : "Emergency SOS"}</h1>
          <p className="text-xs text-rose-100 font-medium mt-1">{isHi ? "सर्वर से पुष्टि होने पर ही अलर्ट सफल माना जाएगा।" : "An SOS is successful only after server confirmation."}</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        <section className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm space-y-2">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#FF9933]" /> {isHi ? "वर्तमान स्थान" : "Current location"}</span>
          <p className="text-xs font-black text-slate-900">{address || (locating ? (isHi ? "GPS स्थान प्राप्त हो रहा है…" : "Fetching location…") : (isHi ? "स्थान उपलब्ध नहीं" : "Location unavailable"))}</p>
          {coords && <p className="text-[10px] font-mono text-slate-400">Lat: {coords.lat.toFixed(5)}, Lon: {coords.lon.toFixed(5)}</p>}
        </section>
        <section className="bg-white rounded-3xl border border-red-200 p-6 text-center shadow-md space-y-4">
          <div className="relative inline-block"><div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping" /><button onClick={handleBroadcastSos} disabled={sendingAlert} className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 text-white font-black text-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center mx-auto border-4 border-white">{sendingAlert ? <Loader2 className="w-10 h-10 animate-spin" /> : <><ShieldAlert className="w-10 h-10 mb-1" /><span>SOS</span></>}</button></div>
          <p className="text-xs text-slate-600 font-bold">{isHi ? "आपातस्थिति में लाल बटन दबाएं" : "Press SOS to record the emergency alert"}</p>
          {sosSent && <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-600" /><span>{isHi ? "SOS अलर्ट सर्वर में दर्ज हो गया है। आपातकालीन सेवाओं को स्वतः नहीं भेजा गया।" : "SOS alert was recorded by the server. Emergency services were not automatically dispatched."}</span></div>}
          {sosError && <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-800 text-xs font-bold">{sosError}</div>}
        </section>
        <section className="space-y-2.5"><h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{isHi ? "आपातकालीन नंबर" : "Emergency numbers"}</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{EMERGENCY_NUMBERS.map((num) => <a key={num.phone} href={`tel:${num.phone}`} className="w-full bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between gap-3 active:scale-95"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${num.color}`}><num.icon className="w-5 h-5" /></div><div><h4 className="font-black text-xs text-slate-900">{isHi ? num.labelHi : num.labelEn}</h4><p className="text-[11px] font-mono font-bold text-slate-500">{num.phone}</p></div></div><PhoneCall className="w-4 h-4 text-emerald-600" /></a>)}</div></section>
        <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3"><div className="flex items-center justify-between border-b border-slate-100 pb-2.5"><h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{isHi ? "व्यक्तिगत आपातकालीन संपर्क" : "Saved emergency contacts"}</h3><span className="text-[10px] font-bold text-slate-400">{contacts.length}</span></div><div className="space-y-2">{contacts.map((c, idx) => <div key={`${c.phone}-${idx}`} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3"><div><p className="text-xs font-black text-slate-900">{c.name}</p><p className="text-[10px] font-mono text-slate-500">{c.phone}</p></div><div className="flex items-center gap-2"><a href={`tel:${c.phone}`} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><PhoneCall className="w-3.5 h-3.5" /></a><button type="button" onClick={() => removeContact(idx)} className="p-2 bg-rose-100 text-rose-700 rounded-xl"><Trash2 className="w-3.5 h-3.5" /></button></div></div>)}</div><div className="pt-2 flex gap-2"><input type="text" placeholder={isHi ? "नाम" : "Name"} value={newContactName} onChange={(e) => setNewContactName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" /><input type="tel" placeholder={isHi ? "मोबाइल नंबर" : "Phone No."} value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold" /><button type="button" onClick={addContact} className="bg-[#000080] text-white p-2.5 rounded-xl"><Plus className="w-4 h-4" /></button></div></section>
      </div>
    </div>
  );
}
