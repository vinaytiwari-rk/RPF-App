import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Moon, Sun, Star, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "motion/react";

interface FeedItem {
  title: string;
  description: string;
  pubDate: string;
  category?: string;
}

const HinduCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"panchang" | "highlights">("panchang");
  const [panchang, setPanchang] = useState<FeedItem[]>([]);
  const [highlights, setHighlights] = useState<FeedItem[]>([]);
  const [digest, setDigest] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [panchangRes, highlightsRes, digestRes] = await Promise.all([
          axios.get("/api/public/calendar/panchang"),
          axios.get("/api/public/calendar/highlights"),
          axios.get("/api/public/calendar/digest")
        ]);
        
        if (panchangRes.data.success) setPanchang(panchangRes.data.data);
        if (highlightsRes.data.success) setHighlights(highlightsRes.data.data);
        setDigest(digestRes.data);
      } catch (err) {
        console.error("Failed to load Hindu Calendar feeds", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const parseDigest = (text: string) => {
    return text.split('\n').filter(line => line.trim().length > 0 && !line.startsWith('—'));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FF8C00]/90 backdrop-blur-md shadow-sm">
        <div className="flex items-center px-4 h-16 max-w-3xl mx-auto text-white">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2 ml-2">
            <Calendar className="w-6 h-6" />
            <h1 className="text-xl font-bold">Premium Hindu Calendar</h1>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex max-w-3xl mx-auto px-4 mt-2 mb-1 gap-2">
          <button 
            onClick={() => setActiveTab("panchang")}
            className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === "panchang" ? "bg-white text-[#FF8C00]" : "text-white/80 hover:bg-white/10"
            }`}
          >
            Live Panchang
          </button>
          <button 
            onClick={() => setActiveTab("highlights")}
            className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === "highlights" ? "bg-white text-[#FF8C00]" : "text-white/80 hover:bg-white/10"
            }`}
          >
            Festivals & Highlights
          </button>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        
        {/* Today's Digest Card */}
        {digest && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-orange-500" />
              <h2 className="font-bold text-slate-800">Today's Overview</h2>
            </div>
            <div className="space-y-2">
              {parseDigest(digest).map((line, i) => {
                const isTitle = line.includes('Panchang transitions');
                return (
                  <p key={i} className={`${isTitle ? 'font-bold text-orange-700 mb-3 border-b border-orange-200 pb-2' : 'text-slate-600 text-sm flex items-start gap-2'}`}>
                    {!isTitle && <span className="mt-0.5 opacity-70"><Clock className="w-3.5 h-3.5" /></span>}
                    {line}
                  </p>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        ) : activeTab === "panchang" ? (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 px-1 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" /> 
              Upcoming Transitions
            </h3>
            {panchang.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No recent panchang updates available.</p>
            ) : (
              panchang.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.description}</p>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium bg-slate-50 inline-block px-2 py-1 rounded-md">
                      {new Date(item.pubDate).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 px-1 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" /> 
              Festivals & Major Highlights
            </h3>
            {highlights.length === 0 ? (
              <p className="text-slate-500 text-center py-10">No upcoming highlights right now.</p>
            ) : (
              highlights.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-rose-50 flex gap-4 items-start hover:border-rose-200 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    <p className="text-[10px] text-rose-400 mt-2 font-medium">
                      {new Date(item.pubDate).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HinduCalendar;
