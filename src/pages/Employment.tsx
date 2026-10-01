import React, { useState, useEffect, useMemo } from "react";
import ServiceIllustration from "../components/ServiceIllustration";
import {
  BriefcaseBusiness,
  Search,
  FileText,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { openExternalLink } from "../utils/browser";
import axios from "axios";

interface JobItem {
  id: string;
  title: string;
  titleHi: string;
  department: string;
  departmentHi: string;
  vacancies: string;
  qualification: string;
  qualificationHi: string;
  lastDate: string;
  category: "mp_state" | "central" | "defense" | "railway" | "banking" | "teaching";
  applyUrl: string;
  notificationPdf?: string;
  isNew: boolean;
  publishedDate: string;
}

const officialLinks = [
  {
    title: "MP Employees Selection Board (ESB)",
    desc: "म.प्र. कर्मचारी चयन मंडल (व्यापम) आधिकारिक पोर्टल",
    url: "https://esb.mp.gov.in"
  },
  {
    title: "MP Public Service Commission (MPPSC)",
    desc: "मध्य प्रदेश लोक सेवा आयोग परीक्षा व भर्ती पोर्टल",
    url: "https://mppsc.mp.gov.in"
  },
  {
    title: "National Career Service (NCS)",
    desc: "Government of India national career and placement portal.",
    url: "https://www.ncs.gov.in/"
  },
  {
    title: "Skill India Digital",
    desc: "PMKVY कौशल विकास एवं निशुल्क व्यावसायिक प्रशिक्षण पोर्टल",
    url: "https://www.skillindia.gov.in/"
  },
  {
    title: "Apprenticeship India",
    desc: "Find national apprenticeship opportunities with stipend.",
    url: "https://www.apprenticeshipindia.gov.in/"
  }
];

const categoryTabs = [
  { id: "all", label: "सभी नौकरियां (All)" },
  { id: "mp_state", label: "म.प्र. शासन (MP State)" },
  { id: "central", label: "केंद्र सरकार (Central)" },
  { id: "teaching", label: "शिक्षक भर्ती (Teaching)" },
  { id: "railway", label: "रेलवे (Railway)" },
  { id: "banking", label: "बैंक (Banking)" }
];

export default function Employment() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    axios
      .get("/api/public/job-notices")
      .then((res) => {
        if (!alive) return;
        if (res.data?.success && Array.isArray(res.data.data)) {
          setJobs(res.data.data);
        }
      })
      .catch((err) => {
        console.warn("Could not load job notices:", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchCat = selectedCategory === "all" || job.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.titleHi.includes(searchQuery) ||
        job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.departmentHi.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [jobs, selectedCategory, searchQuery]);

  return (
    <main className="min-h-full bg-[#FAF9F6] pb-28">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6 space-y-6">
        {/* HEADER HERO BANNER */}
        <section className="overflow-hidden rounded-[24px] border border-amber-200 bg-gradient-to-br from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] p-5 text-[#243B32] shadow-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 border border-amber-300/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#B45309]">
            <Sparkles className="h-3 w-3" /> Rojgar & Opportunity Hub
          </span>
          <div className="mt-3 flex items-center gap-4">
            <ServiceIllustration kind="jobs" className="h-16 w-16 shrink-0" />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#14213D]">Employment & Skills</h1>
              <p className="mt-1 text-xs text-slate-600 font-medium">
                सरकारी नौकरियां, भर्ती सूचनाएं, रिज्यूमे मेकर और कौशल विकास केंद्र।
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => nav("/resume-builder")}
              className="rounded-xl bg-[#D97706] hover:bg-[#B45309] px-4 py-2.5 text-xs font-black text-white shadow-xs transition-colors"
            >
              Build your resume
            </button>
            <button
              onClick={() => nav("/services")}
              className="rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-2.5 text-xs font-black text-[#245D45] transition-colors"
            >
              Explore services
            </button>
          </div>
        </section>

        {/* LIVE SARKARI RECRUITMENT NOTICES SECTION */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="text-lg font-black text-[#14213D]">नवीनतम सरकारी भर्तियां (Live Alerts)</h2>
              </div>
              <p className="text-[11.5px] text-slate-500 font-medium">
                म.प्र. शासन एवं भारत सरकार के आधिकारिक भर्ती नोटिस एवं आवेदन लिंक
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl w-fit">
              {filteredJobs.length} सक्रिय भर्तियां
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="पद या विभाग का नाम खोजें (उदा. पुलिस, शिक्षक, SSC, पटवारी)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl shrink-0 transition-colors ${
                  selectedCategory === tab.id
                    ? "bg-[#14213D] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Jobs Cards List */}
          <div className="space-y-3 pt-1">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">भर्ती सूचनाएं लोड हो रही हैं...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">कोई भर्ती नहीं मिली। कृपया फ़िल्टर बदलें।</div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-indigo-50/20 p-4 hover:border-indigo-300 transition-all shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {job.isNew && (
                          <span className="text-[9.5px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.5 rounded-md">
                            NEW
                          </span>
                        )}
                        <span className="text-[11.5px] font-extrabold text-indigo-700">
                          {job.departmentHi || job.department}
                        </span>
                      </div>
                      <h3 className="text-[14.5px] font-extrabold text-[#14213D] leading-snug">
                        {job.titleHi || job.title}
                      </h3>
                    </div>
                    <span className="shrink-0 text-xs font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl border border-emerald-300">
                      {job.vacancies}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11.5px] text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700">योग्यता: </span>
                      {job.qualificationHi || job.qualification}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold text-slate-700">अंतिम तिथि: </span>
                      <span className="font-extrabold text-rose-700">{job.lastDate}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openExternalLink(job.applyUrl, nav, job.title)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <span>ऑनलाइन आवेदन करें</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    {job.notificationPdf && (
                      <button
                        onClick={() => openExternalLink(job.notificationPdf!, nav, `${job.title} Rulebook`)}
                        className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>नियम पुस्तिका (PDF)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* RESUME BUILDER & SKILLS TOOLS */}
        <section className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => nav("/resume-builder")}
            className="rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm hover:border-amber-200 transition-all cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF9933]">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900">Resume Builder</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Create and organize a professional resume directly in the app.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#B36A16]">
              Open tool <ChevronRight className="h-4 w-4" />
            </span>
          </button>

          <button
            onClick={() => nav("/services")}
            className="rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm hover:border-emerald-200 transition-all cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900">Skills & Learning</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Find relevant learning, education and verified opportunity resources.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-[#B36A16]">
              Explore <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        </section>

        {/* OFFICIAL PORTALS & LINKS */}
        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-end justify-between border-b border-slate-100 pb-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#B36A16]">Official resources</p>
              <h2 className="text-xl font-black text-slate-900">Official Opportunity Portals</h2>
            </div>
            <Search className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-2.5">
            {officialLinks.map((item) => (
              <button
                key={item.title}
                onClick={() => openExternalLink(item.url, nav, item.title)}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 p-3.5 text-left shadow-2xs transition-all cursor-pointer"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F3157] shadow-xs border border-slate-100">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-slate-900">{item.title}</h3>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{item.desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
