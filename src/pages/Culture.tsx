import React, { useState, useEffect } from "react";
import { ArrowLeft, Landmark, BookOpen, ChevronRight, Loader2, MapPin, Wind, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";

interface Temple { id: number; temple_name: string; description: string; architecture: string; temple_image: string; basic_details: { state: string; location: string; god: string; }; }
const sacredTexts = [
  { title: "Bhagavad Gita", desc: "The Song of God, a 700-verse Hindu scripture.", link: "https://www.holy-bhagavad-gita.org/" },
  { title: "Rigveda", desc: "An ancient Indian collection of Vedic Sanskrit hymns.", link: "https://www.sacred-texts.com/hin/rigveda/" },
  { title: "Upanishads", desc: "Late Vedic Sanskrit texts of religious teaching.", link: "https://www.sacred-texts.com/hin/upan/" },
  { title: "Ramayana", desc: "One of the two major Sanskrit epics of ancient India.", link: "https://www.sacred-texts.com/hin/rama/" },
  { title: "Mahabharata", desc: "The longest epic poem known and has been described as the longest poem ever written.", link: "https://www.sacred-texts.com/hin/maha/" },
  { title: "Puranas", desc: "Ancient Hindu texts eulogizing various deities.", link: "https://www.sacred-texts.com/hin/purana.htm" }
];

const Culture: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"temples" | "shastras">("temples");
  const [temples, setTemples] = useState<Temple[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTemples = async (pageNum: number) => {
    try {
      const res = await axios.get(`/api/public/culture/temples?page=${pageNum}`);
      if (res.data.success && res.data.data.data) {
        if (pageNum === 1) setTemples(res.data.data.data);
        else setTemples((prev) => [...prev, ...res.data.data.data]);
      }
    } catch (err) {
      console.error("Failed to fetch temples", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTemples(1);
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTemples(nextPage);
  };

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans text-[#14213D]">
      <div className="sticky top-0 z-50 bg-[#14213D] shadow-md border-b border-amber-200/20">
        <div className="flex items-center px-4 h-14 max-w-3xl mx-auto text-white">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 ml-2">
            <Landmark className="w-5 h-5 text-[#D97706]" />
            <h1 className="text-lg font-bold">Religion & Culture</h1>
          </div>
        </div>
        <div className="flex max-w-3xl mx-auto px-4 pb-2 gap-2">
          <button
            onClick={() => setActiveTab("temples")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "temples" ? "bg-[#D97706] text-white shadow-2xs" : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            Temples of India
          </button>
          <button
            onClick={() => setActiveTab("shastras")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "shastras" ? "bg-[#D97706] text-white shadow-2xs" : "bg-white/10 text-slate-200 hover:bg-white/20"
            }`}
          >
            Sacred Texts
          </button>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => navigate("/utilities/breathing-meditator")}
          className="w-full bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100/80 shadow-2xs p-4 flex items-center gap-3.5 text-left hover:border-amber-300/80 transition-all"
        >
          <div className="h-11 w-11 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D97706] flex items-center justify-center">
            <Wind className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-sm text-[#14213D]">Breathing Meditator</h2>
            <p className="mt-0.5 text-xs text-slate-500 font-medium leading-snug">Box, 4-7-8, Alternate Nostril & Humming Bee breathing routines.</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>

        {activeTab === "temples" ? (
          <div className="space-y-4">
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 flex items-center gap-3">
              <Landmark className="w-7 h-7 text-[#D97706] shrink-0" />
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Discover the architectural marvels and rich spiritual history of India's most famous temples.
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-7 h-7 text-[#D97706] animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {temples.map((temple, idx) => (
                  <motion.div key={`${temple.id}-${idx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xs border border-amber-100/80 overflow-hidden">
                    <div className="h-48 w-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${temple.temple_image})` }} />
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-bold text-[#14213D] leading-tight">{temple.temple_name}</h2>
                        {temple.basic_details && temple.basic_details.god && (
                          <span className="bg-amber-50 text-[#D97706] border border-amber-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 uppercase">
                            {temple.basic_details.god}
                          </span>
                        )}
                      </div>
                      {temple.basic_details && (
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#D97706]" />
                          {temple.basic_details.location}, {temple.basic_details.state}
                        </div>
                      )}
                      <div className="mt-3 text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: temple.description }} />
                    </div>
                  </motion.div>
                ))}
                <button onClick={handleLoadMore} disabled={loadingMore} className="w-full py-3 bg-white border border-amber-200/80 text-[#14213D] font-bold text-xs rounded-xl hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 shadow-2xs">
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load More Temples"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#D97706] shrink-0" />
              <p className="text-xs text-slate-700 font-medium leading-relaxed">
                Explore the vast repository of ancient knowledge, philosophy, and spirituality found in the Shastras.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sacredTexts.map((text, idx) => (
                <motion.a href={text.link} target="_blank" rel="noopener noreferrer" key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xs border border-amber-100/80 hover:border-amber-300/80 hover:shadow-xs transition-all flex flex-col group block">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className="text-sm font-bold text-[#14213D] group-hover:text-[#D97706] transition-colors">{text.title}</h3>
                    <div className="w-7 h-7 rounded-full bg-slate-100/80 flex items-center justify-center group-hover:bg-[#14213D] group-hover:text-white transition-colors">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{text.desc}</p>
                </motion.a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Culture;
