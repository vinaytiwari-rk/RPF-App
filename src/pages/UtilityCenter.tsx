import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Activity, Wind, Sparkles } from "lucide-react";

type Lang = "en" | "hi";

export default function UtilityCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28">
      <header className="pt-3">
        <div className="flex items-center gap-2 text-[#000080]">
          <Sparkles className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">RPF Daily Utility</span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-slate-900">
          {hi ? "दैनिक उपयोगिता केंद्र" : "Daily Utility Center"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {hi ? "आराम और श्वास अभ्यास के लिए उपयोगी टूल।" : "A focused space for breathing and wellbeing."}
        </p>
      </header>

      <section className="mt-7">
        <div className="mb-2 flex items-center gap-2 px-1">
          <Activity className="h-4 w-4 text-[#FF9933]" />
          <h2 className="text-sm font-black text-[#000080]">
            {hi ? "फोकस और वेलनेस" : "Focus & wellbeing"}
          </h2>
        </div>
        <button
          onClick={() => navigate("/utilities/breathing-meditator")}
          className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[.98] hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <Wind className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-slate-900">
              {hi ? "ब्रीदिंग मेडिटेटर" : "Breathing Meditator"}
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {hi ? "बॉक्स, 4-7-8, अल्टरनेट नॉस्ट्रिल, इक्वल और हमिंग बी ब्रीदिंग" : "Box, 4-7-8, alternate nostril, equal and humming bee breathing"}
            </p>
          </div>
          <span className="text-lg text-slate-300">›</span>
        </button>
      </section>
    </div>
  );
}
