import React, { useState, useRef } from "react";
import { Play, Pause, Download, Image as ImageIcon, Music } from "lucide-react";

export default function SanatanMedia({ lang }: { lang: "en" | "hi" }) {
  const isHi = lang === "hi";

  const [activeTab, setActiveTab] = useState<"aarti" | "darshan">("aarti");
  const [playingAarti, setPlayingAarti] = useState<number | null>(null);
  
  // Dummy Audio refs for UI animation simulation
  const aartis = [
    { id: 1, titleHi: "श्री गणेश आरती", titleEn: "Shri Ganesh Aarti", dur: "4:32" },
    { id: 2, titleHi: "शिव तांडव स्तोत्रम्", titleEn: "Shiv Tandav Stotram", dur: "9:15" },
    { id: 3, titleHi: "हनुमान चालीसा", titleEn: "Hanuman Chalisa", dur: "10:05" },
    { id: 4, titleHi: "माँ दुर्गा आरती", titleEn: "Maa Durga Aarti", dur: "5:20" }
  ];

  const wallpapers = [
    { id: 1, titleHi: "महाकाल ज्योतिर्लिंग", titleEn: "Mahakal Jyotirlinga", url: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=400&q=80" },
    { id: 2, titleHi: "राम लला, अयोध्या", titleEn: "Ram Lalla, Ayodhya", url: "https://images.unsplash.com/photo-1605372332182-ed13840742f5?auto=format&fit=crop&w=400&q=80" },
    { id: 3, titleHi: "राधा कृष्ण", titleEn: "Radha Krishna", url: "https://images.unsplash.com/photo-1622325983777-6c84c1381270?auto=format&fit=crop&w=400&q=80" },
    { id: 4, titleHi: "माँ शेरावाली", titleEn: "Maa Sherawali", url: "https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=400&q=80" }
  ];

  const togglePlay = (id: number) => {
    if (playingAarti === id) {
      setPlayingAarti(null);
    } else {
      setPlayingAarti(id);
    }
  };

  const handleDownload = (title: string) => {
    alert(isHi ? `${title} वॉलपेपर डाउनलोड हो रहा है...` : `Downloading ${title} wallpaper...`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => setActiveTab("aarti")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition ${
            activeTab === "aarti" ? "bg-orange-50 text-orange-600 border-b-2 border-orange-500" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <Music className="w-4 h-4" />
          {isHi ? "आरती और भजन" : "Aarti & Bhajans"}
        </button>
        <button
          onClick={() => setActiveTab("darshan")}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition ${
            activeTab === "darshan" ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-500" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          {isHi ? "दैनिक दर्शन" : "Daily Darshan"}
        </button>
      </div>

      <div className="p-4">
        {activeTab === "aarti" ? (
          <div className="space-y-3">
            {aartis.map((aarti) => (
              <div key={aarti.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-orange-200 transition">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => togglePlay(aarti.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition transform active:scale-95 ${
                      playingAarti === aarti.id ? "bg-orange-500 text-white animate-pulse" : "bg-white text-orange-500"
                    }`}
                  >
                    {playingAarti === aarti.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                  </button>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">{isHi ? aarti.titleHi : aarti.titleEn}</h5>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{aarti.dur} • High Quality Audio</p>
                  </div>
                </div>
                {playingAarti === aarti.id && (
                  <div className="flex gap-1 items-end h-4 mr-2">
                    <span className="w-1 bg-orange-500 h-full animate-[bounce_1s_infinite]"></span>
                    <span className="w-1 bg-orange-500 h-2/3 animate-[bounce_1s_infinite_0.2s]"></span>
                    <span className="w-1 bg-orange-500 h-4/5 animate-[bounce_1s_infinite_0.4s]"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {wallpapers.map((wp) => (
              <div key={wp.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-100 aspect-[3/4]">
                <img src={wp.url} alt={wp.titleEn} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                  <h5 className="text-white font-bold text-xs drop-shadow-md">{isHi ? wp.titleHi : wp.titleEn}</h5>
                  <button
                    onClick={() => handleDownload(isHi ? wp.titleHi : wp.titleEn)}
                    className="mt-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white text-[10px] font-black uppercase py-1.5 rounded-lg flex items-center justify-center gap-1 transition border border-white/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isHi ? "डाउनलोड" : "Download"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
