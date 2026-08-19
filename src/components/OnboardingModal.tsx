import React, { useEffect, useState } from "react";
import { ShieldCheck, MapPin, Bell, ChevronRight, Check } from "lucide-react";
import { getPermissionStatus, requestPermission } from "../lib/permissions";

interface OnboardingModalProps { onComplete: () => void; }

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [locGranted, setLocGranted] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [requestingLoc, setRequestingLoc] = useState(false);
  const [requestingNotif, setRequestingNotif] = useState(false);

  useEffect(() => {
    getPermissionStatus("geolocation").then(s => setLocGranted(s === "granted"));
    getPermissionStatus("notifications").then(s => setNotifGranted(s === "granted"));
  }, []);

  const handleRequestLocation = async () => {
    setRequestingLoc(true);
    const status = await requestPermission("geolocation");
    setLocGranted(status === "granted");
    setRequestingLoc(false);
    if (status !== "granted") alert("Location permission was not granted. You can enable it later from Android App Permissions.");
  };

  const handleRequestNotifications = async () => {
    setRequestingNotif(true);
    const status = await requestPermission("notifications");
    setNotifGranted(status === "granted");
    setRequestingNotif(false);
    if (status !== "granted") alert("Notification permission was not granted. You can enable it later from Android App Permissions.");
  };

  const handleFinish = () => { localStorage.setItem("onboarding_completed", "true"); onComplete(); };
  const Card = ({ granted, requesting, onClick, icon, title, text, button, success }: any) => (
    <div className="flex gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${granted ? "bg-green-50 border-green-200 text-green-600" : "bg-indigo-50 border-indigo-150 text-[#000080]"}`}>{granted ? <Check className="w-5 h-5" /> : icon}</div>
      <div className="flex-1 space-y-1 text-left"><h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">{title}</h4><p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{text}</p>
        {!granted ? <button type="button" onClick={onClick} disabled={requesting} className="mt-2 text-[9px] font-black uppercase text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1">{requesting ? "Requesting..." : button}<ChevronRight className="w-3 h-3" /></button> : <span className="inline-block mt-2 text-[9px] font-black uppercase text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-md">{success}</span>}
      </div>
    </div>
  );

  return <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto"><div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
    <div className="bg-gradient-to-r from-[#000080] via-indigo-900 to-slate-950 p-6 text-white"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 border border-[#D4AF37]"><img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" /></div><div><h2 className="font-display font-black text-sm tracking-widest text-[#FF9933] uppercase">RP FOUNDATION</h2><p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-1">Welcome to Jan Seva Portal</p></div></div><h3 className="font-display font-black text-lg mt-6 uppercase tracking-wide">Setup Your Device Permissions</h3><p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-2">Allow permissions using the official Android system popup. You can continue without optional permissions.</p></div>
    <div className="p-6 space-y-4"><Card granted={locGranted} requesting={requestingLoc} onClick={handleRequestLocation} icon={<MapPin className="w-5 h-5" />} title="Device Location (जीपीएस लोकेशन)" text="Used for nearby services, grievance location tagging and local welfare support." button="Enable GPS Access" success="Location Connected" /><Card granted={notifGranted} requesting={requestingNotif} onClick={handleRequestNotifications} icon={<Bell className="w-5 h-5" />} title="Push Notifications (अलर्ट सूचनाएं)" text="Used for Jan Seva updates, emergency alerts and service notifications." button="Allow Notifications" success="Notifications Enabled" />
    <button type="button" onClick={handleFinish} className="w-full mt-4 bg-gradient-to-r from-[#FF9933] to-[#000080] text-white font-black uppercase text-xs tracking-widest py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" />Proceed to Portal / आगे बढ़ें</button></div>
  </div></div>;
}
