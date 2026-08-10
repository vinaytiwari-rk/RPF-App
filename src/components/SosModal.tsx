import React, { useState, useEffect } from "react";
import { X, PhoneCall, AlertTriangle, Navigation, MapPin } from "lucide-react";

export default function SosModal({ onClose, lang }: { onClose: () => void, lang: "hi" | "en" }) {
  const isHi = lang === "hi";
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [status, setStatus] = useState<"locating" | "ready" | "sent">("locating");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setStatus("ready");
        },
        () => {
          setStatus("ready"); // fallback if denied
        }
      );
    } else {
      setStatus("ready");
    }
  }, []);

  const handleSendSOS = () => {
    setStatus("sent");
    // Generate WhatsApp link with location
    const text = isHi 
      ? `🚨 आपातकालीन सहायता (SOS)! मुझे तुरंत मदद की जरूरत है।` 
      : `🚨 EMERGENCY (SOS)! I need immediate help.`;
    
    let locationText = location 
      ? ` My Location: https://maps.google.com/?q=${location.lat},${location.lng}` 
      : ` Location: Not available.`;

    const fullMessage = encodeURIComponent(text + locationText);
    
    // In a real app, this would send an SMS/WhatsApp or API call to HQ
    window.open(`https://wa.me/?text=${fullMessage}`, "_blank");
    
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slideUp">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-black uppercase">
              {isHi ? "आपातकालीन SOS" : "Emergency SOS"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <p className="text-sm font-semibold text-slate-600 mb-6">
          {isHi 
            ? "यह बटन तुरंत RP Foundation कंट्रोल रूम और नज़दीकी स्वयंसेवकों को आपकी लाइव लोकेशन भेज देगा।" 
            : "This will instantly alert the RP Foundation control room and nearby volunteers with your live location."}
        </p>

        {/* Fake Map Preview */}
        <div className="w-full h-32 bg-slate-200 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border-2 border-slate-300">
          {status === "locating" ? (
            <div className="flex flex-col items-center text-slate-500">
              <Navigation className="w-6 h-6 animate-bounce mb-1" />
              <span className="text-xs font-bold">{isHi ? "लोकेशन ढूँढ रहे हैं..." : "Locating you..."}</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[url('https://c.tile.openstreetmap.org/13/5899/3442.png')] bg-cover bg-center flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-red-500/30 rounded-full animate-ping"></div>
                <MapPin className="w-8 h-8 text-red-600 relative z-10 -mt-4 drop-shadow-md" />
              </div>
            </div>
          )}
        </div>

        {status === "sent" ? (
          <div className="w-full py-4 bg-green-50 text-green-700 font-bold rounded-xl text-center border border-green-200">
            {isHi ? "✅ SOS अलर्ट भेज दिया गया है!" : "✅ SOS Alert Sent!"}
          </div>
        ) : (
          <button 
            onClick={handleSendSOS}
            disabled={status === "locating"}
            className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 text-white font-black rounded-xl text-lg shadow-[0_4px_20px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition disabled:opacity-50"
          >
            <PhoneCall className="w-5 h-5" />
            {isHi ? "अभी मदद बुलाएं (SEND SOS)" : "SEND SOS NOW"}
          </button>
        )}
      </div>
    </div>
  );
}
