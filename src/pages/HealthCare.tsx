import React, { useMemo, useState } from "react";
import { HeartPulse, Search, ExternalLink, Stethoscope, ShieldCheck, Activity, FileHeart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

const links = [
  { name: "Ayushman Bharat", category: "Benefits", desc: "Check official health benefit and beneficiary services.", url: "https://beneficiary.nha.gov.in/" },
  { name: "ABHA Health ID", category: "Benefits", desc: "Create or manage your digital health identity.", url: "https://abha.abdm.gov.in/abha/v3/register" },
  { name: "eSanjeevani", category: "Care", desc: "Access official telemedicine services.", url: "https://esanjeevani.mohfw.gov.in/#/patient/signin" },
  { name: "Jan Aushadhi", category: "Care", desc: "Find nearby affordable generic medicine centres.", url: "https://janaushadhi.gov.in/near-by-kendra" },
  { name: "eRaktkosh", category: "Emergency", desc: "Check blood availability and locate blood centres.", url: "https://eraktkosh.mohfw.gov.in/eraktkoshPortal/#/" },
  { name: "Tele MANAS", category: "Care", desc: "Official mental health support service.", url: "https://telemanas.mohfw.gov.in/home" },
  { name: "NCDC India", category: "Information", desc: "Official public health information and updates.", url: "https://ncdc.gov.in/" },
  { name: "WHO", category: "Information", desc: "World Health Organization news and health information.", url: "https://www.who.int/news" }
];

export default function HealthCare() {
  const nav = useNavigate();
  const openUrl = (url: string, title: string) => void openExternalLink(url, nav, title);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("All");

  const cats = ["All", ...Array.from(new Set(links.map((x) => x.category)))];
  const filtered = useMemo(
    () => links.filter((x) => (tab === "All" || x.category === tab) && `${x.name} ${x.desc}`.toLowerCase().includes(q.toLowerCase())),
    [q, tab]
  );

  return (
    <main className="min-h-screen bg-transparent px-4 py-4 text-[#14213D] max-w-3xl mx-auto">
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden rounded-[24px] bg-[#14213D] p-5 sm:p-6 text-white shadow-md">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-[#DC2626]">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#D97706]">
                <Sparkles className="h-3 w-3" />
                RP Foundation Care
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Healthcare Portal</h1>
            </div>
          </div>
          <p className="mt-3 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
            Find trusted health services, official welfare programmes and emergency resources in one place.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              onClick={() => nav("/blood-network")}
              className="rounded-xl bg-[#DC2626] hover:bg-red-700 px-3.5 py-2.5 text-left text-xs font-bold text-white transition shadow-sm"
            >
              Blood Network
            </button>
            <button
              onClick={() => nav("/grievance")}
              className="rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-left text-xs font-bold text-white transition"
            >
              Need Support
            </button>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="mt-4 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-3.5 shadow-2xs">
        <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/80 px-3.5 py-2.5">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search healthcare services..."
            className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none text-[#14213D] placeholder:text-slate-400"
          />
        </div>
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setTab(c)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all ${
                tab === c
                  ? "bg-[#14213D] text-[#FFF9F0] shadow-2xs"
                  : "bg-white border border-slate-200/80 text-slate-600 hover:bg-amber-50/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Quick Cards */}
      <section className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => openUrl("https://beneficiary.nha.gov.in/", "Ayushman Bharat")}
          className="rounded-2xl border border-emerald-200/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#167C5A] flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="mt-3 text-[14px] font-bold text-[#14213D]">Health Benefits</h2>
            <p className="mt-0.5 text-[11px] leading-snug font-medium text-slate-500">Official schemes & eligibility.</p>
          </div>
        </button>
        <button
          onClick={() => nav("/blood-network")}
          className="rounded-2xl border border-red-200/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-red-300 transition-all flex flex-col justify-between"
        >
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-[#DC2626] flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="mt-3 text-[14px] font-bold text-[#14213D]">Blood Support</h2>
            <p className="mt-0.5 text-[11px] leading-snug font-medium text-slate-500">Check availability & request blood.</p>
          </div>
        </button>
      </section>

      {/* Healthcare Services List */}
      <section className="mt-5">
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Trusted Resources</p>
            <h2 className="text-[18px] font-bold text-[#14213D]">Healthcare Services</h2>
          </div>
          <span className="text-xs font-bold text-slate-500">{filtered.length}</span>
        </div>
        <div className="space-y-3">
          {filtered.map((x) => (
            <button
              key={x.name}
              onClick={() => openUrl(x.url, x.name)}
              className="flex w-full items-center gap-3.5 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 hover:shadow-xs transition-all group"
            >
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-[#DC2626] shrink-0">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-[#14213D] group-hover:text-[#D97706] transition-colors">{x.name}</h3>
                  <span className="rounded-full bg-slate-100 border border-slate-200/80 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                    {x.category}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed font-medium text-slate-500">{x.desc}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#14213D]" />
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-8 text-center text-xs font-medium text-slate-500">
              No healthcare services found matching your query.
            </div>
          )}
        </div>
      </section>

      {/* External Service Notice */}
      <section className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/50 backdrop-blur-xs p-4">
        <div className="flex gap-3">
          <FileHeart className="h-5 w-5 shrink-0 text-[#D97706]" />
          <div>
            <h2 className="font-bold text-xs text-[#14213D]">Official External Service Notice</h2>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600 font-medium">
              Healthcare links open official government or accredited portals directly. Decisions and services remain governed by respective official authorities.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
