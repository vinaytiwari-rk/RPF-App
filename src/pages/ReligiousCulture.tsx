import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Calendar, BookOpen, Volume2, Download, Play, Eye, Users, 
  MapPin, Landmark, Award, ChevronRight, HelpCircle, Calculator, Heart, RefreshCw
} from "lucide-react";
import { motion } from "motion/react";

export default function ReligiousCulture() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const [activeSubTab, setActiveSubTab] = useState<"festivals" | "texts" | "live" | "tools">("festivals");
  const [rsvps, setRsvps] = useState<string[]>([]);
  const [isPlayingStream, setIsPlayingStream] = useState(false);

  const fetchRsvps = async () => {
    try {
      const token = localStorage.getItem("@rpf_token");
      const res = await fetch("/api/culture/rsvps", {
        headers: { "Authorization": `Bearer ${token || ""}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setRsvps(json.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading rsvps:", err);
    }
  };

  const toggleRsvp = async (eventTitle: string) => {
    const isRegistered = rsvps.includes(eventTitle);
    const token = localStorage.getItem("@rpf_token");
    try {
      if (isRegistered) {
        const res = await fetch(`/api/culture/rsvps/${encodeURIComponent(eventTitle)}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token || ""}` }
        });
        if (res.ok) {
          fetchRsvps();
        }
      } else {
        const res = await fetch("/api/culture/rsvps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token || ""}`
          },
          body: JSON.stringify({ event_title: eventTitle })
        });
        if (res.ok) {
          fetchRsvps();
        }
      }
    } catch (err) {
      console.error("Error toggling RSVP:", err);
    }
  };

  useEffect(() => {
    fetchRsvps();
  }, []);

  // Local Celebrations feed
  const localFestivals = [
    {
      titleEn: "Shravan Shivratri Celebration & Bhandara",
      titleHi: "श्रावण शिवरात्रि उत्सव एवं भंडारा",
      date: "August 15, 2026",
      locationEn: "Sehore Bada Mahadev Temple",
      locationHi: "सीहोर बड़ा महादेव मंदिर",
      detailsEn: "Community meetup, evening bhajan sandhya, and mass distribution of prasadam.",
      detailsHi: "सामुदायिक मिलन, शाम की भजन संध्या, और महाप्रसाद का सामूहिक वितरण।"
    },
    {
      titleEn: "Janmashtami Meetup & Dahi Handi",
      titleHi: "कृष्ण जन्माष्टमी मिलन व दही हांडी",
      date: "September 4, 2026",
      locationEn: "Town Hall Square, Sehore",
      locationHi: "टाउन हॉल चौराहा, सीहोर",
      detailsEn: "Cross-faith cultural values exhibition, kids costume contest, and sports event.",
      detailsHi: "अंतर-धार्मिक सांस्कृतिक मूल्य प्रदर्शनी, बाल पोशाक प्रतियोगिता, और खेल उत्सव।"
    },
    {
      titleEn: "Eid-e-Milad Interfaith Peace Assembly",
      titleHi: "ईद-ए-मिलाद अंतर-धार्मिक शांति सभा",
      date: "September 16, 2026",
      locationEn: "Community Center Hall, Sehore",
      locationHi: "कम्युनिटी सेंटर हॉल, सीहोर",
      detailsEn: "Linking diverse faith groups over shared social causes and cultural harmony.",
      detailsHi: "विविध धार्मिक समूहों को साझा सामाजिक कारणों और सांस्कृतिक सद्भाव से जोड़ना।"
    }
  ];

  // Devotional audio / sacred slokas
  const devotionals = [
    {
      sloka: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
      scripture: "Bhagavad Gita • Chapter 4, Verse 7",
      meaningEn: "Whenever righteousness wanes and unrighteousness prevails, O Bharata, I manifest myself to establish order.",
      meaningHi: "हे अर्जुन! जब-जब इस पृथ्वी पर धर्म की हानि होती है और अधर्म का बोलबाला होता है, तब-तब मैं धर्म की स्थापना के लिए अवतार लेता हूँ।"
    },
    {
      sloka: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
      scripture: "Rigveda • 3.62.10",
      meaningEn: "We meditate on the adorable glory of the radiant sun; may it inspire and guide our intellect towards righteousness.",
      meaningHi: "हम उस परमात्मा के दिव्य तेज का ध्यान करते हैं जो हमारी बुद्धि और कर्मों को अच्छे मार्ग पर चलने के लिए प्रेरित करे।"
    }
  ];

  const pdfScriptures = [
    { nameEn: "Shrimad Bhagavad Gita Guide", nameHi: "श्रीमद्भगवद्गीता सार निर्देशिका", size: "1.4 MB" },
    { nameEn: "Ramcharitmanas Sunderkand Slokas", nameHi: "रामचरितमानस सुंदरकांड श्लोक", size: "2.1 MB" },
    { nameEn: "Vedic Hymns for Daily Assembly", nameHi: "दैनिक सभा हेतु वैदिक सूक्त संग्रह", size: "950 KB" }
  ];

  const handleDownload = (name: string) => {
    alert(isHi ? `${name} का पीडीएफ डाउनलोड शुरू हो रहा है...` : `Starting download for ${name} PDF...`);
  };

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);

  // 1. Chanting metronome counter states
  const [chantCount, setChantCount] = useState(0);
  const [chantRate, setChantRate] = useState(3); // seconds per chant

  // 2. Yoga Pranayama States
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathIntervalId, setBreathIntervalId] = useState<NodeJS.Timeout | null>(null);

  // 3. Tithing (Daan) States
  const [monthlyEarnings, setMonthlyEarnings] = useState(25000);

  // 4. Panchang Tithi states
  const [lunarDay, setLunarDay] = useState(15); // days into month

  // Cleanup breath timer
  useEffect(() => {
    return () => {
      if (breathIntervalId) clearInterval(breathIntervalId);
    };
  }, [breathIntervalId]);

  const startPranayama = () => {
    if (breathIntervalId) clearInterval(breathIntervalId);
    
    setBreathPhase("inhale");
    setBreathTimer(4);

    const id = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev <= 1) {
          // cycle to next phase: inhale (4s) -> hold (16s) -> exhale (8s)
          setBreathPhase((currentPhase) => {
            if (currentPhase === "inhale") {
              setBreathTimer(16);
              return "hold";
            } else if (currentPhase === "hold") {
              setBreathTimer(8);
              return "exhale";
            } else {
              setBreathTimer(4);
              return "inhale";
            }
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    setBreathIntervalId(id);
  };

  const stopPranayama = () => {
    if (breathIntervalId) {
      clearInterval(breathIntervalId);
      setBreathIntervalId(null);
    }
    setBreathTimer(4);
    setBreathPhase("inhale");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn max-w-md mx-auto pb-24">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 pt-6 pb-6 px-5 relative overflow-hidden shrink-0 text-white shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10">
          <h3 className="font-display font-extrabold text-sm sm:text-base leading-none">
            {isHi ? "धर्म, संस्कृति एवं सामुदायिक मिलन" : "Religious & Cultural Hub"}
          </h3>
          <p className="text-[10px] text-orange-100 font-bold mt-1 uppercase tracking-wider">
            RP Foundation Interfaith Harmony
          </p>
        </div>
      </div>

      {/* Tab Select Area */}
      <div className="p-5 pb-0 shrink-0">
        <div className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1 shadow-sm">
          <button 
            onClick={() => setActiveSubTab("festivals")}
            className={`flex-1 text-center py-2 rounded-lg text-[10.5px] font-black transition cursor-pointer ${
              activeSubTab === "festivals" ? "bg-[#000080] text-white animate-fadeIn" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isHi ? "उत्सव" : "Meetups"}
          </button>
          <button 
            onClick={() => setActiveSubTab("texts")}
            className={`flex-1 text-center py-2 rounded-lg text-[10.5px] font-black transition cursor-pointer ${
              activeSubTab === "texts" ? "bg-[#000080] text-white animate-fadeIn" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isHi ? "ग्रंथ" : "Devotionals"}
          </button>
          <button 
            onClick={() => setActiveSubTab("live")}
            className={`flex-1 text-center py-2 rounded-lg text-[10.5px] font-black transition cursor-pointer ${
              activeSubTab === "live" ? "bg-[#000080] text-white animate-fadeIn" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isHi ? "लाइव" : "Live"}
          </button>
          <button 
            onClick={() => {
              setActiveSubTab("tools");
              if (!activeCalc) setActiveCalc("chant");
            }}
            className={`flex-1 text-center py-2 rounded-lg text-[10.5px] font-black transition cursor-pointer ${
              activeSubTab === "tools" ? "bg-[#000080] text-white animate-fadeIn" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {isHi ? "टूल्स" : "Calculators"}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 space-y-5">
        
        {/* ==================== SUB-TAB 1: FESTIVALS ==================== */}
        {activeSubTab === "festivals" && (
          <div className="space-y-4 animate-fadeIn">
            {localFestivals.map((fest, idx) => {
              const isRegistered = rsvps.includes(isHi ? fest.titleHi : fest.titleEn);
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-display font-extrabold text-xs sm:text-sm text-slate-850">
                        {isHi ? fest.titleHi : fest.titleEn}
                      </h4>
                      <div className="flex items-center gap-1 text-[9.5px] text-slate-400 font-mono mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{fest.date}</span>
                      </div>
                    </div>
                    <span className="text-[8.5px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
                      Event RSVP
                    </span>
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                    {isHi ? fest.detailsHi : fest.detailsEn}
                  </p>

                  <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {isHi ? fest.locationHi : fest.locationEn}</span>
                    <button 
                      onClick={() => toggleRsvp(isHi ? fest.titleHi : fest.titleEn)}
                      className={`px-3 py-1.5 rounded-xl font-black text-[10px] transition uppercase cursor-pointer ${
                        isRegistered 
                          ? "bg-green-50 text-green-700 border border-green-200" 
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {isRegistered ? (isHi ? "रजिस्टर्ड ✓" : "RSVP Registered ✓") : (isHi ? "शामिल हों (RSVP)" : "Join Event")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== SUB-TAB 2: SACRED TEXTS ==================== */}
        {activeSubTab === "texts" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="space-y-3">
              {devotionals.map((dev, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3">
                  {/* Cleaned up brown colors to neutral slate colors */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-xs font-serif font-black text-slate-800 whitespace-pre-line leading-relaxed italic">
                    {dev.sloka}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">{dev.scripture}</span>
                    <p className="text-[10.5px] text-slate-650 leading-relaxed font-semibold">
                      {isHi ? dev.meaningHi : dev.meaningEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct scripture PDF downloads */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <BookOpen className="w-4.5 h-4.5 text-[#000080]" />
                {isHi ? "धार्मिक ग्रंथ पीडीएफ डाउनलोड" : "Scriptures Archive & PDF Downloads"}
              </h4>

              <div className="space-y-2.5">
                {pdfScriptures.map((pdf, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{isHi ? pdf.nameHi : pdf.nameEn}</span>
                      <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{pdf.size} • PDF Format</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(pdf.nameEn)}
                      className="bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-xl text-slate-700 transition"
                      title={isHi ? "डाउनलोड करें" : "Download PDF"}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SUB-TAB 3: LIVE TEMPLE FEED ==================== */}
        {activeSubTab === "live" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Landmark className="w-4.5 h-4.5 text-[#000080]" />
                {isHi ? "लाइव मंदिर दर्शन (सीहोर व प्रमुख तीर्थ)" : "Live Spiritual Temple Feeds"}
              </h4>

              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 flex flex-col justify-center items-center text-white border border-slate-200">
                {isPlayingStream ? (
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col justify-center items-center">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping mb-2"></span>
                      <span className="text-xs font-bold text-slate-350">{isHi ? "लाइव प्रसारण चल रहा है..." : "Broadcasting live temple stream..."}</span>
                      <span className="text-[10px] text-slate-455 mt-1 font-mono">Bada Mahadev Mandir • 720p 30fps</span>
                    </div>
                    <button 
                      onClick={() => setIsPlayingStream(false)}
                      className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 px-2.5 py-1 text-[9.5px] font-bold rounded-lg transition"
                    >
                      Stop Feed
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsPlayingStream(true)}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white rounded-full p-4.5 shadow-lg transition transform hover:scale-105 active:scale-95"
                    >
                      <Play className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-450 mt-3">{isHi ? "लाइव दर्शन शुरू करने के लिए प्ले दबाएं" : "Press play to start simulated live feed"}</span>
                  </>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-[10.5px] text-slate-650 leading-relaxed font-bold">
                {isHi 
                  ? "विशेष धार्मिक उत्सवों के दौरान सीहोर के विभिन्न मंदिरों से सुबह 6:00 बजे और शाम 7:00 बजे की लाइव आरती का सीधा प्रसारण।"
                  : "Watch live morning and evening aarti broadcasts from local Sehore temples during major festivals."}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "tools" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
            <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>{isHi ? "संस्कृति और प्रार्थना स्मार्ट टूल्स" : "Spiritual Calculators"}</span>
              <Calculator className="w-4.5 h-4.5 text-indigo-600" />
            </h4>

            {/* Tools Select Grid */}
            <div className="grid grid-cols-2 gap-2 text-center">
              {[
                { key: "chant", title: isHi ? "मंत्र जाप काउंटर" : "Chant Metronome" },
                { key: "pranayama", title: isHi ? "प्राणायाम श्वास पेसर" : "Pranayama Pacer" },
                { key: "daan", title: isHi ? "दशांश दान कैलकुलेटर" : "Daan Calculator" },
                { key: "tithi", title: isHi ? "हिंदू तिथि पंचांग" : "Panchang Tithi Math" }
              ].map(tool => (
                <button
                  key={tool.key}
                  onClick={() => setActiveCalc(tool.key)}
                  className={`p-2.5 rounded-xl text-[10.5px] font-bold border transition ${
                    activeCalc === tool.key ? "bg-[#000080] text-white border-[#000080]" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {tool.title}
                </button>
              ))}
            </div>

            {/* Calculators Content Container */}
            {activeCalc && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs">
              
              {/* 1. Chant Metronome Counter */}
              {activeCalc === "chant" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "डिजिटल मंत्र जाप काउंटर व टाइमर" : "Digital Chant Counter & Metronome"}</h5>
                  <p className="text-[10px] text-slate-400 font-bold">{isHi ? "माला के १०८ मनकों की पूर्णता को प्रोग्रेस बार से ट्रैक करें।" : "Metronome guiding you to count 108 chants at customizable intervals."}</p>
                  
                  <div className="flex justify-around items-center bg-white p-4.5 rounded-xl border border-slate-200/50 shadow-inner">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{isHi ? "मनके काउंट" : "Beads Counted"}</p>
                      <p className="text-3xl font-black text-[#000080]">{chantCount} / 108</p>
                    </div>
                    
                    <button 
                      onClick={() => setChantCount(prev => (prev >= 108 ? 0 : prev + 1))}
                      className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md uppercase active:scale-95 transition"
                    >
                      +1
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setChantCount(0)} className="flex-1 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[10.5px] font-bold flex justify-center items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isHi ? "रीसेट करें" : "Reset beads"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Pranayama Pacer */}
              {activeCalc === "pranayama" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "प्राणायाम श्वास नियंत्रण पेसर (1:4:2)" : "Yoga Pranayama Breathing Pacer (1:4:2)"}</h5>
                  <p className="text-[9.5px] text-slate-400 font-semibold">{isHi ? "श्वास चक्र: अंदर लें (4s) -> रोकें (16s) -> बाहर छोड़ें (8s)" : "Follow the cycle: Inhale (4s) -> Hold/Retention (16s) -> Exhale (8s)"}</p>

                  <div className="w-full h-32 rounded-xl flex flex-col items-center justify-center font-black cursor-pointer shadow-inner transition-colors duration-300 border border-slate-200 bg-indigo-50/50">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{breathPhase.toUpperCase()}</p>
                    <p className="text-4xl text-[#000080] mt-1">{breathTimer}s</p>
                  </div>

                  <div className="flex gap-2">
                    {!breathIntervalId ? (
                      <button onClick={startPranayama} className="flex-1 py-2 bg-[#000080] text-white font-bold rounded-lg text-xs uppercase tracking-wider">
                        {isHi ? "पेसर शुरू करें" : "Start Pranayama"}
                      </button>
                    ) : (
                      <button onClick={stopPranayama} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg text-xs uppercase tracking-wider">
                        {isHi ? "रोकें (Stop)" : "Stop Pacer"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Daan Calculator */}
              {activeCalc === "daan" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "दशांश दान (10% Charity) कैलकुलेटर" : "Dasaansh Charity Tithing"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `मासिक आय: ₹${monthlyEarnings.toLocaleString()}` : `Monthly Earnings: ₹${monthlyEarnings.toLocaleString()}`}</label>
                    <input type="range" min="5000" max="150000" step="5000" value={monthlyEarnings} onChange={e => setMonthlyEarnings(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>

                  {(() => {
                    const titheAmount = Math.round(monthlyEarnings * 0.1);
                    return (
                      <div className="bg-green-50 border border-green-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{isHi ? "दशांश (10%) दान राशि:" : "Recommended Tithing (10%):"}</p>
                        <p className="text-lg text-green-700 font-black mt-1">₹{titheAmount.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-500 mt-1 font-semibold">{isHi ? "शास्त्रानुसार १०% परोपकार समाज कल्याण के लिए फलदायी है।" : "Traditional scriptural codes suggest 10% tithing for grassroot charity."}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4. Panchang Tithi Math */}
              {activeCalc === "tithi" && (
                <div className="space-y-3">
                  <h5 className="font-extrabold text-[#000080]">{isHi ? "चंद्र कला हिंदू तिथि पंचांग" : "Lunar Cycle Hindu Tithi Math"}</h5>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `चंद्र चक्र दिवस (Day): ${lunarDay}` : `Lunar Cycle Day: ${lunarDay}`}</label>
                    <input type="range" min="1" max="30" value={lunarDay} onChange={e => setLunarDay(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>

                  {(() => {
                    let phase = "";
                    let tithiNum = 0;
                    if (lunarDay === 15) {
                      phase = isHi ? "🌕 पूर्णिमा (Full Moon)" : "🌕 Purnima (Full Moon)";
                    } else if (lunarDay === 30) {
                      phase = isHi ? "🌑 अमावस्या (New Moon)" : "🌑 Amavasya (New Moon)";
                    } else if (lunarDay < 15) {
                      tithiNum = lunarDay;
                      phase = isHi ? `शुक्ल पक्ष - तृतीया/चतुर्दशी (Tithi: ${tithiNum})` : `Shukla Paksha (Waxing Phase - Tithi: ${tithiNum})`;
                    } else {
                      tithiNum = lunarDay - 15;
                      phase = isHi ? `कृष्ण पक्ष - तृतीया/चतुर्दशी (Tithi: ${tithiNum})` : `Krishna Paksha (Waning Phase - Tithi: ${tithiNum})`;
                    }

                    return (
                      <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{isHi ? "अनुमानित तिथि" : "Calculated Hindu Tithi"}</p>
                        <p className="text-xs text-[#000080] font-black mt-1">{phase}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
