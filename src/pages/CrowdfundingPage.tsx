import React, { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Heart, QrCode, TrendingUp, CheckCircle } from "lucide-react";

export default function CrowdfundingPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const [backed, setBacked] = useState(false);

  return (
    <div className="p-5 space-y-5 animate-fadeIn pb-24">
      {/* Campaign Details */}
      <div className="glass-card bg-white/95 border-gold-soft shadow-gold-premium overflow-hidden rounded-2xl">
        <img 
          src="/assets/water_pump_camp.png" 
          alt="Campaign Banner" 
          className="w-full h-40 object-cover" 
        />
        
        <div className="p-5 space-y-4">
          <div>
            <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block">
              {lang === "hi" ? "त्वरित आवश्यकता" : "Urgent Fundraiser"}
            </span>
            <h3 className="font-display font-extrabold text-base text-[#0B1E3F] mt-2">
              {lang === "hi" ? "ग्रामीण स्कूलों में पेयजल हेतु ट्यूबवेल बोरिंग" : "Clean Drinking Water Tube Wells in Rural Schools"}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              By RP Foundation Water Aid
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === "hi"
              ? "सीहोर के ५ दूरदराज के सरकारी स्कूलों में पेयजल की भारी किल्लत है। हम वहां ट्यूबवेल और वाटर प्यूरीफायर लगाने के लिए राशि संकलित कर रहे हैं।"
              : "5 remote government schools in Sehore district have no access to clean drinking water. We are installing borewells and RO purification kits."}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="w-[60%] bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>₹1.2L Raised (60%)</span>
              <span>Target: ₹2L</span>
            </div>
          </div>

          {backed ? (
            <div className="bg-green-50 text-green-700 border border-green-150 p-3 rounded-lg text-xs font-bold flex items-center gap-1.5 justify-center">
              <CheckCircle className="w-4.5 h-4.5" />
              <span>{lang === "hi" ? "सहयोग देने के लिए धन्यवाद!" : "Thank you for backing this cause!"}</span>
            </div>
          ) : (
            <button 
              onClick={() => navigate("/donations")}
              className="w-full bg-[#000080] hover:bg-indigo-950 text-white font-bold py-3.5 rounded-lg text-xs shadow-md transition flex justify-center items-center gap-2"
            >
              <Heart className="w-4 h-4 text-white fill-white" />
              <span>{lang === "hi" ? "दान देकर सहायता करें" : "Support Project with Donation"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
