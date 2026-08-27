import React, { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ChevronRight, ExternalLink, Newspaper, Search, Globe } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

type Lang = "en" | "hi";
type Paper = { name: string; nameHi: string; url: string; language?: string };

const PAPERS: Paper[] = [
  { name: "Free Press Journal", nameHi: "फ्री प्रेस जर्नल", url: "https://epaper.freepressjournal.in/", language: "English" },
  { name: "People's Samachar", nameHi: "पीपुल्स समाचार", url: "https://epapers.peoplessamachar.in/", language: "Hindi" },
  { name: "Mid-Day", nameHi: "मिड-डे", url: "https://epaper.mid-day.com/", language: "English" },
  { name: "Aaj Tak", nameHi: "आज तक", url: "https://epaper.aajtak.in/", language: "Hindi" },
  { name: "Financial Express", nameHi: "फाइनेंशियल एक्सप्रेस", url: "https://epaper.financialexpress.com/", language: "English" },
  { name: "The Telegraph", nameHi: "द टेलीग्राफ", url: "https://epaper.telegraphindia.com/", language: "English" },
  { name: "Live Hindustan", nameHi: "लाइव हिन्दुस्तान", url: "https://epaper.livehindustan.com/", language: "Hindi" },
  { name: "Lokdesh Bhopal", nameHi: "लोकदेश भोपाल", url: "https://lokdesh.com/bhopal-e-papers/", language: "Hindi" },
  { name: "Hitavada", nameHi: "हितवाद", url: "https://www.ehitavada.com/index.php?edition=BMpage&date={{DATE}}&page=1", language: "English" },
  { name: "Central Chronicle", nameHi: "सेंट्रल क्रॉनिकल", url: "https://www.centralchronicle.com/epaper/", language: "English" },
  { name: "Navbharat Live", nameHi: "नवभारत लाइव", url: "https://epaper.navbharatlive.com/", language: "Hindi" },
  { name: "Pradesh Today", nameHi: "प्रदेश टुडे", url: "https://epaper.pradeshtoday.com/", language: "Hindi" },
  { name: "Mint", nameHi: "मिंट", url: "https://epaper.livemint.com/", language: "English" },
  { name: "The Daily Guardian", nameHi: "द डेली गार्डियन", url: "https://epaper.thedailyguardian.com/", language: "English" },
  { name: "Subah Savere Bhopal", nameHi: "सुबह सवेरे भोपाल", url: "https://epaper.subahsavere.news/view/2912/bhopal", language: "Hindi" },
  { name: "Dainik Navajyoti", nameHi: "दैनिक नवज्योति", url: "https://epaper.dainiknavajyoti.com/", language: "Hindi" },
  { name: "Navarashtra", nameHi: "नवराष्ट्र", url: "https://epaper.navarashtra.com/", language: "Hindi" },
  { name: "Prabhat Khabar", nameHi: "प्रभात खबर", url: "https://epaper.prabhatkhabar.com/", language: "Hindi" }
];

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function resolvedUrl(url: string) {
  return url.replace("{{DATE}}", today());
}

export default function Epaper() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("All");

  const dateLabel = new Date().toLocaleDateString(isHi ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });
  const openPaper = (url: string) => openExternalLink(resolvedUrl(url), navigate);

  const filteredPapers = useMemo(() => {
    return PAPERS.filter((p) => {
      const matchesSearch = `${p.name} ${p.nameHi}`.toLowerCase().includes(search.toLowerCase().trim());
      const matchesLang = langFilter === "All" || p.language === langFilter;
      return matchesSearch && matchesLang;
    });
  }, [search, langFilter]);

  return (
    <main className="min-h-full bg-transparent pb-10 text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-5 space-y-4">
        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#14213D] p-5 sm:p-7 text-white shadow-md">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">
              <Newspaper className="h-4 w-4" />
              {isHi ? "दैनिक ई-पेपर" : "Daily E-paper Kiosk"}
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isHi ? "आज के समाचार पत्र" : "Today's Newspapers"}
            </h1>
            <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
              {isHi ? "एक ही जगह से प्रमुख दैनिक ई-पेपर पढ़ें। किसी अखबार पर टैप करके उसका आज का संस्करण खोलें।" : "Read leading daily e-papers from one central location. Tap any newspaper to view today's edition."}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-amber-300">
              <CalendarDays className="h-4 w-4" />
              {dateLabel}
            </div>
          </div>
        </section>

        {/* Search & Language Filter Bar */}
        <section className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-3.5 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-white border border-slate-200/80 px-3.5 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isHi ? "समाचार पत्र खोजें..." : "Search e-paper by name..."}
              className="min-w-0 flex-1 bg-transparent text-xs font-semibold outline-none text-[#14213D] placeholder:text-slate-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {["All", "Hindi", "English"].map((l) => (
              <button
                key={l}
                onClick={() => setLangFilter(l)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase transition-all ${
                  langFilter === l
                    ? "bg-[#14213D] text-[#FFF9F0] shadow-2xs"
                    : "bg-white border border-slate-200/80 text-slate-600 hover:bg-amber-50/50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* E-Paper Grid */}
        <section className="grid gap-3 sm:grid-cols-2">
          {filteredPapers.map((paper) => (
            <button
              key={paper.name}
              type="button"
              onClick={() => openPaper(paper.url)}
              className="group flex min-h-[90px] items-center gap-3.5 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs transition hover:border-amber-300/80 hover:shadow-xs active:scale-[.99]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D97706]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="block text-[14px] font-bold leading-tight text-[#14213D] group-hover:text-[#D97706] transition-colors">
                    {isHi ? paper.nameHi : paper.name}
                  </span>
                  {paper.language && (
                    <span className="rounded-full bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">
                      {paper.language}
                    </span>
                  )}
                </div>
                <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                  {isHi ? "आज का संस्करण खोलें" : "Open today's edition"}
                </span>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-[#14213D] transition-colors" />
            </button>
          ))}
          {filteredPapers.length === 0 && (
            <div className="col-span-2 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-8 text-center text-xs font-medium text-slate-500">
              No newspapers found matching your search.
            </div>
          )}
        </section>

        <p className="px-1 text-center text-[11px] font-medium leading-relaxed text-slate-500">
          {isHi
            ? "ई-पेपर प्रकाशक की अपनी आधिकारिक वेबसाइट में खुलेंगे ताकि लॉगिन, कुकीज़ और PDF व्यूअर सही तरीके से काम करें।"
            : "E-papers open directly on the publisher's official website so PDF viewers and login features operate seamlessly."}
        </p>
      </div>
    </main>
  );
}
