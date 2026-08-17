import React from "react";
import { GraduationCap, Globe2, ChevronRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

export default function PeoplesUniversity() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  const url = "https://www.peoplesuniversity.edu.in/";

  return (
    <main className="min-h-full bg-[#f7f3eb] pb-10">
      <div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.2em] text-indigo-600">RPF Education</p>
              <h1 className="mt-1 text-2xl font-black text-[#000080] sm:text-3xl">
                {hi ? "पीपुल्स यूनिवर्सिटी" : "People's University"}
              </h1>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            {hi
              ? "People's University की आधिकारिक वेबसाइट और शैक्षणिक जानकारी एक ही जगह से खोलें।"
              : "Access the official People's University website and academic information from one place."}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/browser?url=${encodeURIComponent(url)}`)}
            className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-[#000080] p-4 text-left text-white shadow-md transition hover:shadow-lg active:scale-[.99]"
          >
            <Globe2 className="h-5 w-5 shrink-0" />
            <span className="flex-1">
              <span className="block text-sm font-black">{hi ? "आधिकारिक वेबसाइट खोलें" : "Open Official Website"}</span>
              <span className="mt-1 block text-[10px] font-medium text-white/70">{hi ? "RPF In-App Browser में खुलेगा" : "Opens inside the RPF In-App Browser"}</span>
            </span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </section>
      </div>
    </main>
  );
}
