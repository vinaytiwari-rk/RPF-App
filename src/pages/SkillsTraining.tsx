import React from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, Briefcase } from "lucide-react";

export default function SkillsTraining() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800 animate-fadeIn">
      <div className="bg-blue-600 text-white px-4 py-3 flex items-center shadow-md sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-white/10 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg">{isHi ? "???? ?????????" : "Skills Training"}</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm text-center">
           <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
           <h3 className="font-black text-blue-800">{isHi ? "?????? ?????????" : "Free Training Programs"}</h3>
           <p className="text-xs text-slate-600 font-semibold">{isHi ? "????? ??? ??? ???????? ???????? ???" : "Browse vocational courses in Bhopal."}</p>
        </div>
      </div>
    </div>
  );
}
