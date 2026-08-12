import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Moon, Sun, Star, Clock, AlertCircle, Sparkles, MapPin } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"panchang" | "highlights" | "kundli">("panchang");
  const [panchang, setPanchang] = useState<FeedItem[]>([]);
  const [highlights, setHighlights] = useState<FeedItem[]>([]);
  const [digest, setDigest] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Kundli Form State
  const [astroData, setAstroData] = useState<any>(null);
  const [astroLoading, setAstroLoading] = useState(false);
  const [kundliForm, setKundliForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: "12:00",
    lat: "28.6139",
    lon: "77.2090"
  });

  const fetchKundli = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAstroLoading(true);
    try {
      const [year, month, day] = kundliForm.date.split('-').map(Number);
      const [hours, minutes] = kundliForm.time.split(':').map(Number);
      
      const payload = {
        year, month, date: day,
        hours, minutes, seconds: 0,
        latitude: parseFloat(kundliForm.lat),
        longitude: parseFloat(kundliForm.lon),
        timezone: 5.5
      };

      const res = await axios.post("/api/public/calendar/astrology/planets", payload);
      if (res.data.success && res.data.data.output && res.data.data.output.length > 0) {
        // The first element in output array contains the list of planets with index 0 to 13
        setAstroData(res.data.data.output[0]);
      }
    } catch (err) {
      console.error("Failed to load Astrology data", err);
      alert("Failed to load planetary positions.");
    } finally {
      setAstroLoading(false);
    }
  };

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
            Festivals
          </button>
          <button 
            onClick={() => { setActiveTab("kundli"); if (!astroData) fetchKundli(); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-t-xl transition-colors ${
              activeTab === "kundli" ? "bg-white text-[#FF8C00]" : "text-white/80 hover:bg-white/10"
            }`}
          >
            Kundli
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
        ) : activeTab === "highlights" ? (
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
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 px-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" /> 
              Kundli & Planetary Positions
            </h3>
            
            <form onSubmit={fetchKundli} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" value={kundliForm.date} onChange={e => setKundliForm({...kundliForm, date: e.target.value})} className="w-full border-slate-200 rounded-lg text-sm p-2" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                  <input type="time" value={kundliForm.time} onChange={e => setKundliForm({...kundliForm, time: e.target.value})} className="w-full border-slate-200 rounded-lg text-sm p-2" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude</label>
                  <input type="number" step="0.0001" value={kundliForm.lat} onChange={e => setKundliForm({...kundliForm, lat: e.target.value})} className="w-full border-slate-200 rounded-lg text-sm p-2" placeholder="28.6139" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude</label>
                  <input type="number" step="0.0001" value={kundliForm.lon} onChange={e => setKundliForm({...kundliForm, lon: e.target.value})} className="w-full border-slate-200 rounded-lg text-sm p-2" placeholder="77.2090" required />
                </div>
              </div>
              <button type="submit" disabled={astroLoading} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                {astroLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Star className="w-4 h-4" />}
                Generate Kundli
              </button>
            </form>

            {astroData && !astroLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
                {Object.keys(astroData).filter(k => k !== "debug" && k !== "ayanamsa").map((key) => {
                  const planet = astroData[key];
                  if (!planet || !planet.name) return null;
                  
                  return (
                    <div key={key} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 text-sm">{planet.name}</span>
                        {planet.isRetro === "true" && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 rounded-sm">RETRO</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                        <div className="flex justify-between"><span>Sign:</span> <span className="font-medium text-slate-700">{planet.current_sign}</span></div>
                        {planet.house_number && <div className="flex justify-between"><span>House:</span> <span className="font-medium text-slate-700">{planet.house_number}</span></div>}
                        <div className="flex justify-between"><span>Degree:</span> <span className="font-medium text-slate-700">{Number(planet.normDegree).toFixed(2)}°</span></div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HinduCalendar;
