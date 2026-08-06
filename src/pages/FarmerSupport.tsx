import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout, CloudRain, Sun, Leaf } from "lucide-react";

export default function FarmerSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800 animate-fadeIn">
      <div className="bg-green-700 text-white px-4 py-3 flex items-center shadow-md sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-white/10 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg">{isHi ? "????? ???????" : "Farmer Support"}</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-white border border-green-200 p-4 rounded-xl shadow-sm">
           <div className="flex items-center gap-2 mb-3">
             <Sprout className="w-6 h-6 text-green-600" />
             <h3 className="font-black text-green-800">{isHi ? "???? ????" : "Mandi Prices (Bhopal)"}</h3>
           </div>
           <p className="text-xs text-slate-600 font-semibold">{isHi ? "????? ???????? ????" : "Loading latest Mandi prices..."}</p>
        </div>
      </div>
    </div>
  );
}
