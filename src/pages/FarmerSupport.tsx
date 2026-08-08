import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout, TrendingUp, TrendingDown } from "lucide-react";

export default function FarmerSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mandi-prices")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrices(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800 animate-fadeIn">
      <div className="bg-green-700 text-white px-4 py-3 flex items-center shadow-md sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-white/10 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg">{isHi ? "किसान सहायता" : "Farmer Support"}</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-white border border-green-200 p-4 rounded-xl shadow-sm">
           <div className="flex items-center gap-2 mb-3">
             <Sprout className="w-6 h-6 text-green-600" />
             <h3 className="font-black text-green-800">{isHi ? "मंडी भाव (लाइव)" : "Live Mandi Prices"}</h3>
           </div>
           
           {loading ? (
             <p className="text-xs text-slate-500 font-semibold animate-pulse">{isHi ? "मंडी भाव लोड हो रहे हैं..." : "Loading latest Mandi prices..."}</p>
           ) : (
             <div className="space-y-2">
               {prices.map((item, idx) => {
                 const isUp = item.trend.startsWith("+");
                 return (
                   <div key={idx} className="flex items-center justify-between p-2.5 bg-green-50/50 rounded-lg border border-green-100">
                     <span className="text-xs font-bold text-slate-800">{isHi ? item.commodityHi : item.commodityEn}</span>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-green-700">₹{item.livePrice}</span>
                       <span className={`flex items-center text-[10px] font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                         {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                         {item.trend}
                       </span>
                     </div>
                   </div>
                 );
               })}
               <p className="text-[9px] text-slate-400 mt-2 text-center">
                 {isHi ? "स्रोत: कृषि उपज मंडी समिति (फ्री पोर्टल)" : "Source: Krishi Upaj Mandi Samiti (Free API)"}
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
