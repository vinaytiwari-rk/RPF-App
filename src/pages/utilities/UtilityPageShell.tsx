import React from "react";
import { ArrowLeft } from "lucide-react";

export default function UtilityPageShell({
  title,
  icon,
  children,
  onBack
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="min-h-full bg-transparent p-4 pb-24 text-[#14213D] sm:px-6">
      <header className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/90 shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-[#14213D]" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-widest text-[#D97706]">
            {icon}
            <span>RPF Utility</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14213D] truncate">{title}</h1>
        </div>
      </header>
      <main className="mt-4 rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-2xs">
        {children}
      </main>
    </div>
  );
}
