import React, { useEffect, useState } from "react";
import { Sunrise, Sunset, Moon, Clock, Calendar, Star, Sun } from "lucide-react";

type PanchangData = {
  date?: string; location?: string; sunrise?: string; sunset?: string; moonrise?: string;
  tithi?: string; nakshatra?: string; paksha?: string; samvat?: string; yoga?: string;
  karana?: string; abhijitMuhurat?: string; rahukaal?: string; updatedAt?: string;
  unavailable?: boolean;
};

export default function DrikPanchang({ lang }: { lang: "en" | "hi" }) {
  const isHi = lang === "hi";
  const [data, setData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch("/api/public/live-panchang?_=" + Date.now(), { cache: "no-store", headers: { "Cache-Control": "no-cache" } })
      .then(r => r.json())
      .then(r => { if (active && r?.success) setData(r.data); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = (v?: string) => loading ? "…" : (v || "—");

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20"><Sun className="w-32 h-32" /></div>
        <div className="relative z-10">
          <h3 className="font-display font-black text-2xl">{isHi ? "दैनिक पंचांग" : "Daily Panchang"}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm font-bold"><Calendar className="w-4 h-4" /><span>{value(data?.date)}</span></div>
          <div className="flex items-center gap-2 mt-1 text-sm font-bold"><Clock className="w-4 h-4" /><span>{data?.location || "—"}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Info icon={<Sunrise className="w-5 h-5" />} label={isHi ? "सूर्योदय" : "Sunrise"} value={value(data?.sunrise)} />
        <Info icon={<Sunset className="w-5 h-5" />} label={isHi ? "सूर्यास्त" : "Sunset"} value={value(data?.sunset)} />
        <Info icon={<Moon className="w-5 h-5" />} label={isHi ? "चंद्रोदय" : "Moonrise"} value={value(data?.moonrise)} />
        <Info icon={<Star className="w-5 h-5" />} label={isHi ? "नक्षत्र" : "Nakshatra"} value={value(data?.nakshatra)} />
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="font-bold text-slate-800">{value(data?.samvat)} • {value(data?.tithi)}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-slate-500">Yoga</span><div className="font-bold">{value(data?.yoga)}</div></div>
          <div><span className="text-slate-500">Karana</span><div className="font-bold">{value(data?.karana)}</div></div>
          <div><span className="text-slate-500">Abhijit</span><div className="font-bold">{value(data?.abhijitMuhurat)}</div></div>
          <div><span className="text-slate-500">Rahu Kaal</span><div className="font-bold">{value(data?.rahukaal)}</div></div>
        </div>
        {data?.unavailable && <p className="text-xs text-amber-700">Live Panchang source is temporarily unavailable. No dummy values are shown.</p>}
      </div>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex items-center gap-3">
    <div className="bg-orange-50 p-2 rounded-lg text-orange-500">{icon}</div>
    <div><p className="text-[10px] text-slate-500 font-bold uppercase">{label}</p><p className="font-black text-slate-800 text-sm">{value}</p></div>
  </div>;
}
