import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, ChevronRight, Compass, HeartPulse, BriefcaseBusiness, ClipboardList, ShieldAlert, Radio, Tv, Newspaper, Calendar, Heart, FileText, Calculator, Flame, Wind, Clock, ScanLine, Sparkles, BookOpen, UserRound, Users, FileCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { VoiceSearch } from "./VoiceSearch";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  category: string;
  description: string;
  keywords: string[];
  route: string;
  icon: React.ElementType;
  accent: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  // Services & Welfare
  { id: "jan-seva", title: "Jan Seva Card", category: "Services & Welfare", description: "Apply, view and manage your digital service card", keywords: ["card", "jan seva", "identity", "id", "scheme", "certificate"], route: "/jan-seva-card", icon: FileCheck, accent: "bg-orange-50 text-[#E67817]" },
  { id: "healthcare", title: "Healthcare Services", category: "Services & Welfare", description: "Health camps, medical assistance and medicine support", keywords: ["health", "doctor", "medical", "hospital", "medicine", "camp"], route: "/health-care", icon: HeartPulse, accent: "bg-rose-50 text-[#C81E4A]" },
  { id: "employment", title: "Employment & Jobs", category: "Services & Welfare", description: "Find job vacancies, skill development and career guidance", keywords: ["job", "employment", "career", "vacancy", "work", "hiring"], route: "/employment", icon: BriefcaseBusiness, accent: "bg-emerald-50 text-[#138808]" },
  { id: "grievances", title: "Grievance Portal", category: "Services & Welfare", description: "Submit issues and track response from RP Foundation", keywords: ["complaint", "issue", "problem", "grievance", "track", "help"], route: "/grievance", icon: ClipboardList, accent: "bg-blue-50 text-[#1D5B93]" },
  { id: "services", title: "All Services Hub", category: "Services & Welfare", description: "Explore the full directory of foundation initiatives", keywords: ["explore", "services", "schemes", "hub", "welfare"], route: "/services", icon: Compass, accent: "bg-purple-50 text-purple-600" },

  // Emergency & Community
  { id: "sos", title: "SOS Emergency Alert", category: "Emergency & Safety", description: "Instant emergency beacon and crisis alert system", keywords: ["sos", "emergency", "danger", "help", "alert", "panic"], route: "/sos", icon: ShieldAlert, accent: "bg-red-50 text-red-600" },
  { id: "blood", title: "Blood Donation Network", category: "Emergency & Safety", description: "Find blood donors or register as a life saver", keywords: ["blood", "donor", "plasma", "hospital", "donation", "save life"], route: "/blood-network", icon: Heart, accent: "bg-rose-50 text-rose-600" },
  { id: "volunteers", title: "Volunteers & Community", category: "Community", description: "Join our volunteer workforce or view community drive", keywords: ["volunteer", "community", "team", "join", "help", "social"], route: "/community", icon: Users, accent: "bg-teal-50 text-teal-600" },
  { id: "donations", title: "Donate & Support", category: "Community", description: "Contribute to RP Foundation social welfare projects", keywords: ["donate", "charity", "fund", "support", "contribution"], route: "/donations", icon: Heart, accent: "bg-amber-50 text-amber-600" },

  // Tools & Utilities
  { id: "tools-center", title: "Tools Center", category: "Utilities & Tools", description: "All productivity, health and daily utility tools", keywords: ["tools", "utilities", "center", "apps", "widgets"], route: "/tools", icon: Sparkles, accent: "bg-indigo-50 text-indigo-600" },
  { id: "fasting", title: "Fasting Tracker", category: "Utilities & Tools", description: "Track Vrat, Fasting windows and wellness routines", keywords: ["fasting", "vrat", "upvas", "health", "diet", "tracker"], route: "/utilities/fasting-tracker", icon: Flame, accent: "bg-orange-50 text-orange-600" },
  { id: "breathing", title: "Breathing Meditator", category: "Utilities & Tools", description: "Pranayama and guided deep breathing exercise", keywords: ["meditation", "breath", "pranayama", "relax", "yoga", "mindfulness"], route: "/utilities/breathing-meditator", icon: Wind, accent: "bg-sky-50 text-sky-600" },
  { id: "calculators", title: "Calculator Center", category: "Utilities & Tools", description: "Full calculator, BMI, GST and Split Bill utilities", keywords: ["calculator", "math", "bmi", "gst", "split bill", "finance"], route: "/utilities/calculators", icon: Calculator, accent: "bg-blue-50 text-blue-600" },
  { id: "doc-scanner", title: "Document Scanner", category: "Utilities & Tools", description: "Scan documents, ID cards and papers using camera", keywords: ["scan", "scanner", "doc", "pdf", "camera", "photo"], route: "/doc-scanner", icon: ScanLine, accent: "bg-emerald-50 text-emerald-600" },
  { id: "resume-builder", title: "Resume Builder", category: "Utilities & Tools", description: "Create professional CVs and resume for job applications", keywords: ["resume", "cv", "bio data", "jobs", "career"], route: "/resume-builder", icon: FileText, accent: "bg-violet-50 text-violet-600" },
  { id: "pomodoro", title: "Pomodoro Timer", category: "Utilities & Tools", description: "Focus timer for work, study and productivity", keywords: ["timer", "pomodoro", "focus", "study", "work", "clock"], route: "/utilities/pomodoro", icon: Clock, accent: "bg-rose-50 text-rose-600" },

  // Media & Culture
  { id: "live-tv", title: "Live TV", category: "Media & News", description: "Watch national news channels and live broadcasts", keywords: ["tv", "live tv", "news", "doordarshan", "channel", "video"], route: "/live-tv", icon: Tv, accent: "bg-red-50 text-red-600" },
  { id: "radio", title: "Akashvani Internet Radio", category: "Media & News", description: "Listen live to Akashvani and AIR radio channels", keywords: ["radio", "akashvani", "air", "music", "audio", "fm"], route: "/internet-radio", icon: Radio, accent: "bg-blue-50 text-blue-600" },
  { id: "news", title: "News Feed & Updates", category: "Media & News", description: "Latest PIB, ANI national news and official updates", keywords: ["news", "pib", "ani", "headlines", "updates", "epaper"], route: "/news", icon: Newspaper, accent: "bg-[#F0F9F1] text-[#138808]" },
  { id: "epaper", title: "E-Paper Reader", category: "Media & News", description: "Read daily digital newspapers and publications", keywords: ["epaper", "newspaper", "patrika", "samachar", "daily"], route: "/epaper", icon: BookOpen, accent: "bg-sky-50 text-sky-600" },
  { id: "calendar", title: "Hindu Calendar & Panchang", category: "Media & Culture", description: "Daily Panchang, Tithi, Tyohar and Shubh Muhurat", keywords: ["calendar", "panchang", "tithi", "festival", "tyohar", "muhurat"], route: "/hindu-calendar", icon: Calendar, accent: "bg-orange-50 text-[#E67817]" },
  { id: "culture", title: "Cultural Heritage", category: "Media & Culture", description: "Discover Sanatan heritage, traditions and literature", keywords: ["culture", "sanatan", "heritage", "temple", "spiritual"], route: "/culture", icon: BookOpen, accent: "bg-amber-50 text-amber-600" },

  // About Foundation
  { id: "founder", title: "Founder's Message", category: "About Foundation", description: "Message from Rohit Pandit, Founder of RP Foundation", keywords: ["founder", "rohit pandit", "leader", "message", "speech"], route: "/founder-message", icon: UserRound, accent: "bg-orange-50 text-orange-600" },
  { id: "vision", title: "Our Vision & Goals", category: "About Foundation", description: "Learn about the mission and roadmap of RP Foundation", keywords: ["vision", "goals", "about", "mission", "foundation"], route: "/vision-goals", icon: Compass, accent: "bg-blue-50 text-blue-600" },
  { id: "impact", title: "RP Foundation at Work", category: "About Foundation", description: "Ground-level social impact and initiative showcases", keywords: ["impact", "work", "gallery", "photos", "drives"], route: "/impact", icon: Sparkles, accent: "bg-emerald-50 text-emerald-600" }
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCategory || matchKeywords;
    });
  }, [query]);

  const handleSelect = (route: string) => {
    onClose();
    navigate(route);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-6 sm:pt-16">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header Bar with Search Input & Voice Input */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3.5 bg-slate-50/80">
            <Search className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, tools, news, schemes..."
              className="w-full bg-transparent text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <VoiceSearch onResult={(text) => setQuery(text)} className="shrink-0" />
            <button
              onClick={onClose}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-500 shadow-xs hover:bg-slate-100 shrink-0"
            >
              ESC
            </button>
          </div>

          {/* Body Content */}
          <div className="max-h-[68vh] overflow-y-auto p-4 space-y-4">
            {query.trim() !== "" ? (
              filteredItems.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 px-1">
                    Search Results ({filteredItems.length})
                  </p>
                  <div className="grid gap-2">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.route)}
                          className="flex items-center gap-3.5 w-full rounded-xl border border-slate-100 bg-white p-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-xs group"
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-[14px] font-bold text-slate-900 group-hover:text-[#FF9933]">
                                {item.title}
                              </h4>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase">
                                {item.category}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              {item.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-[14px] font-bold text-slate-700">No results found for "{query}"</p>
                  <p className="mt-1 text-[11px] text-slate-400">Try searching for "Jan Seva", "Blood", "Jobs", "Radio" or "Calculators"</p>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {/* Popular Tags */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 px-1 mb-2">
                    Popular Quick Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Jan Seva Card", q: "Jan Seva" },
                      { label: "Blood Donor Network", q: "Blood" },
                      { label: "Employment & Jobs", q: "Job" },
                      { label: "SOS Alert", q: "SOS" },
                      { label: "Live TV Channels", q: "Live TV" },
                      { label: "Akashvani Radio", q: "Radio" },
                      { label: "Tools & Calculators", q: "Calculator" },
                      { label: "Hindu Panchang", q: "Panchang" }
                    ].map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => setQuery(tag.q)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-bold text-slate-700 transition-colors hover:border-[#FF9933] hover:bg-orange-50 hover:text-[#FF9933]"
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Direct Links */}
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 px-1 mb-2">
                    Explore Feature Sections
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SEARCH_ITEMS.slice(0, 6).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.route)}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-left transition-all hover:border-slate-300 hover:bg-white hover:shadow-xs group"
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.accent}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[12px] font-bold text-slate-800 truncate group-hover:text-[#FF9933]">
                            {item.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;
