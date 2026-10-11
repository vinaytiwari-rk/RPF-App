import React, { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Search, ShieldCheck, Sparkles, ChevronRight,
  LayoutGrid, BadgeCheck, FileText, Scale, Sprout, Maximize2,
  Briefcase, GraduationCap, Store, Landmark, ShieldAlert,
  HeartPulse, HeartHandshake, Award, Home, Compass, X,
  Image as ImageIcon, FileSpreadsheet, Code, FolderArchive, Music, QrCode
} from "lucide-react";
import {
  UTILITY_CATEGORIES,
  UTILITY_TOOLS,
  UtilityToolDefinition,
  UtilityCategoryDefinition
} from "../data/utilityToolsCatalog";
import UtilityToolRunnerModal from "../components/utilities/UtilityToolRunnerModal";

type Lang = "en" | "hi";

// Icon mapping for dynamic category chip icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  LayoutGrid,
  BadgeCheck,
  FileText,
  Scale,
  Sprout,
  Maximize2,
  Briefcase,
  GraduationCap,
  Store,
  Landmark,
  ShieldAlert,
  HeartPulse,
  HeartHandshake,
  Award,
  Home,
  Compass,
  ShieldCheck,
  Image: ImageIcon,
  FileSpreadsheet,
  Code,
  FolderArchive,
  Music,
  QrCode,
};

export default function UtilityCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTool, setActiveTool] = useState<UtilityToolDefinition | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleOpenTool = (tool: UtilityToolDefinition) => {
    if (tool.id === "studio_pdf_editor") {
      navigate("/utilities/pdf-studio");
      return;
    }
    if (tool.id === "studio_image_editor") {
      navigate("/utilities/image-studio");
      return;
    }
    if (tool.id === "studio_word_editor") {
      navigate("/utilities/word-studio");
      return;
    }
    setActiveTool(tool);
  };

  // Filtered tools list based on Category and Search Query
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return UTILITY_TOOLS.filter((tool) => {
      const matchesCategory = selectedCategory === "all" || tool.categoryId === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const inTitle = tool.titleEn.toLowerCase().includes(q) || tool.titleHi.toLowerCase().includes(q);
      const inDesc = tool.descEn.toLowerCase().includes(q) || tool.descHi.toLowerCase().includes(q);
      const inKeywords = tool.keywords.some((k) => k.toLowerCase().includes(q));

      return inTitle || inDesc || inKeywords;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FFF7E8] p-3 sm:p-5 pb-32">
      {/* Header Banner */}
      <header className="rounded-3xl bg-[#F0FAF4] p-5 shadow-sm border border-emerald-100/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#245D45]">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-800">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#245D45]">
              {isHi ? "समाहित 100% ऑफलाइन यूटिलिटी" : "Samahit 100% Offline Utilities"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 border border-emerald-200/60 text-[#243B32] shadow-2xs hover:bg-emerald-50 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-[#243B32]">
          {isHi ? "सुप्रीम यूटिलिटी सेंटर" : "Supreme Utility Center"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#52685C] max-w-xl">
          {isHi
            ? "24 महत्वपूर्ण श्रेणियां और 350+ कामकाजी टूल्स—0% सर्वर लोड, 100% ऑफलाइन, सीधे आपके फोन में सुरक्षित।"
            : "24 essential categories & 350+ practical tools—0% server load, 100% client-side privacy on your device."}
        </p>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              isHi
                ? "कोई भी टूल खोजें (e.g. फोटो रीसाइज़, चेक, रसीद, बीघा, आवेदन, दवा, ब्याज)..."
                : "Search any tool (e.g. photo resizer, cheque, rent receipt, bigha, letter)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-emerald-200/80 bg-white py-3 pl-10 pr-10 text-xs sm:text-sm text-[#243B32] shadow-2xs placeholder:text-slate-400 focus:border-[#245D45] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Featured All-in-One Offline Studios Spotlight */}
      <section className="mt-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-300">
              {isHi ? "ऑल-इन-वन प्रो स्टूडियो वर्कस्पेस" : "All-in-One Pro Studios (100% Offline)"}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            Full-Screen Dedicated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* PDF Studio */}
          <button
            type="button"
            onClick={() => navigate("/utilities/pdf-studio")}
            className="group flex items-center justify-between rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 p-3 transition text-left active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black text-white group-hover:text-rose-300 transition">
                  {isHi ? "PDF स्टूडियो प्रो" : "PDF Studio Pro"}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {isHi ? "ड्रैग टेक्स्ट, व्हाइटआउट, रोटेट" : "Movable text, whiteout, reorder"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition" />
          </button>

          {/* Image Studio */}
          <button
            type="button"
            onClick={() => navigate("/utilities/image-studio")}
            className="group flex items-center justify-between rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 p-3 transition text-left active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition">
                <ImageIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black text-white group-hover:text-emerald-300 transition">
                  {isHi ? "फोटो स्टूडियो प्रो" : "Image Studio Pro"}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {isHi ? "ड्रैग टेक्स्ट, मुहर/स्टैम्प, क्रॉप" : "Stamps, text layer, passport crop"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition" />
          </button>

          {/* Word Studio */}
          <button
            type="button"
            onClick={() => navigate("/utilities/word-studio")}
            className="group flex items-center justify-between rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 p-3 transition text-left active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 group-hover:scale-105 transition">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-black text-white group-hover:text-teal-300 transition">
                  {isHi ? "वर्ड स्टूडियो प्रो" : "Word Studio Pro"}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {isHi ? "A4 आवेदन, बायोडाटा, DOCX सेव" : "A4 letters, tables, save .docx"}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition" />
          </button>
        </div>
      </section>

      {/* 16 Category Navigation Chips (Horizontal Scroll) */}
      <section className="mt-4 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {UTILITY_CATEGORIES.map((cat: UtilityCategoryDefinition) => {
            const IconComponent = CATEGORY_ICONS[cat.iconName] || LayoutGrid;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold transition-all shadow-2xs ${
                  isSelected
                    ? "bg-[#245D45] text-white shadow-md scale-102"
                    : "border border-emerald-100 bg-white/90 text-[#3C5346] hover:bg-emerald-50"
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{isHi ? cat.titleHi : cat.titleEn}</span>
                {isSelected && (
                  <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] text-white">
                    {cat.id === "all" ? UTILITY_TOOLS.length : UTILITY_TOOLS.filter(t => t.categoryId === cat.id).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tools Count & Stats Bar */}
      <div className="mt-3 flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
        <span>
          {isHi ? "कुल उपलब्ध टूल्स:" : "Available Tools:"} <b className="text-[#243B32]">{filteredTools.length}</b>
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-full text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5" /> {isHi ? "डेटा आपके फोन में सुरक्षित" : "Local & Private"}
        </span>
      </div>

      {/* Tool Cards Grid */}
      <main className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleOpenTool(tool)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleOpenTool(tool);
            }}
            className="group relative flex flex-col justify-between rounded-2xl border border-[#D8E8DB] bg-white p-4 shadow-xs transition hover:border-[#245D45] hover:shadow-md cursor-pointer text-left"
          >
            <div>
              {/* Header inside card */}
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#245D45] group-hover:bg-[#245D45] group-hover:text-white transition">
                  <FileText className="h-5 w-5" />
                </span>
                {tool.badge && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800">
                    {tool.badge}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mt-3 text-sm sm:text-base font-extrabold text-[#243B32] group-hover:text-[#245D45] transition line-clamp-1">
                {isHi ? tool.titleHi : tool.titleEn}
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {isHi ? tool.descHi : tool.descEn}
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-bold text-[#245D45]">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">
                {isHi ? "टूल खोलें" : "Open Tool"}
              </span>
              <span className="flex items-center gap-1 group-hover:translate-x-1 transition text-emerald-800">
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}

        {filteredTools.length === 0 && (
          <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <p className="text-sm font-bold text-slate-700">
              {isHi ? "कोई टूल नहीं मिला" : "No tools found matching your search"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isHi ? "कृपया अन्य कीवर्ड खोजें या कैटेगरी बदलें।" : "Try different keywords or select 'All Tools'."}
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-3 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
            >
              {isHi ? "सभी टूल्स देखें" : "View All Tools"}
            </button>
          </div>
        )}
      </main>

      {/* Active Tool Runner Modal (Client-side execution) */}
      {activeTool && (
        <UtilityToolRunnerModal
          tool={activeTool}
          onClose={() => setActiveTool(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
