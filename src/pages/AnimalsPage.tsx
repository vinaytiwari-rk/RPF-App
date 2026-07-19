import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Info, AlertCircle, Camera, CheckCircle, Heart } from "lucide-react";

export default function AnimalsPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const [reported, setReported] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReported(true);
    setTimeout(() => setReported(false), 4000);
  };

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24">
      {/* Overview Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="font-display font-extrabold text-base text-amber-900 flex items-center gap-1.5">
          <Heart className="w-5 h-5 text-amber-700 fill-amber-700" />
          {lang === "hi" ? "पशु कल्याण और संरक्षण" : "Animal Welfare Services"}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          {lang === "hi" 
            ? "बेसहारा और घायल पशुओं के उपचार और आश्रय के लिए। आप बीमार या चोटिल आवारा पशुओं की रिपोर्ट कर सकते हैं, हमारी रेस्क्यू टीम तुरंत सहायता करेगी।" 
            : "Emergency relief, rescue, and shelter assistance for stray or injured animals. File reports to dispatch our veterinary team directly."}
        </p>
      </div>

      {/* Report Stray Form */}
      <div className="glass-card bg-white/95 p-5 border-gold-soft shadow-gold-premium space-y-4">
        <h4 className="font-display font-bold text-xs text-chakra-navy uppercase tracking-widest border-b border-slate-100 pb-2">
          {lang === "hi" ? "घायल पशु की रिपोर्ट करें" : "Report Injured Stray"}
        </h4>

        {reported ? (
          <div className="bg-green-50 text-green-700 border border-green-150 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-green-800">{lang === "hi" ? "शिकायत दर्ज हुई!" : "Incident Reported!"}</p>
              <p className="text-[10px] text-green-600 font-normal mt-0.5">
                {lang === "hi" ? "हमारी पशु एम्बुलेंस और रेस्क्यू टीम जल्द ही पहुंचेगी।" : "Our stray rescue ambulance is notified and will dispatch shortly."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {lang === "hi" ? "पशु का प्रकार" : "Animal Type"}
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-amber-500 font-bold">
                <option>{lang === "hi" ? "गाय (Cow)" : "Cow"}</option>
                <option>{lang === "hi" ? "कुत्ता (Dog)" : "Dog"}</option>
                <option>{lang === "hi" ? "बिल्ली (Cat)" : "Cat"}</option>
                <option>{lang === "hi" ? "अन्य (Other)" : "Other"}</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                {lang === "hi" ? "चोट/बीमारी का विवरण" : "Condition Description"}
              </label>
              <textarea required placeholder={lang === "hi" ? "जैसे - पैर में फ्रैक्चर है..." : "e.g. fractured leg, bleeding"} className="w-full border border-slate-200 rounded-lg p-2.5 text-xs min-h-[70px] outline-none focus:border-amber-500 font-bold" />
            </div>

            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition">
              <Camera className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-500">{lang === "hi" ? "तस्वीर अपलोड करें (वैकल्पिक)" : "Upload Photo (Optional)"}</span>
            </div>

            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg text-xs shadow-md transition">
              {lang === "hi" ? "रिपोर्ट भेजें" : "Submit Incident Report"}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
