import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Calendar, BookOpen, Volume2, Download, Play, Eye, Users, 
  MapPin, Landmark, Award, ChevronRight, HelpCircle 
} from "lucide-react";

export default function ReligiousCulture() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const [activeSubTab, setActiveSubTab] = useState<"festivals" | "texts" | "live">("festivals");

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
      meaningEn: "Whenever there is decay of righteousness, O Bharata, and rise of unrighteousness, then I manifest Myself.",
      meaningHi: "हे भरतवंशी! जब-जब धर्म की हानि और अधर्म का उत्थान होता है, तब-तब मैं स्वयं की रचना करता हूँ (अवतार लेता हूँ)।",
      scripture: "Srimad Bhagavad Gita - Chapter 4, Verse 7"
    },
    {
      sloka: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं\nभर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
      meaningEn: "We meditate on the glory of that Creator; Who has created the Universe; May He enlighten our intellect.",
      meaningHi: "हम उस प्राणस्वरूप, दुःखनाशक, सुखस्वरूप, श्रेष्ठ, तेजस्वी, पापनाशक, देवस्वरूप परमात्मा का ध्यान करें, जो हमारी बुद्धियों को प्रेरित करे।",
      scripture: "Rigveda - Gayatri Mantra"
    }
  ];

  // PDF Downloadable scriptures
  const pdfScriptures = [
    { nameEn: "Srimad Bhagavad Gita (Sanskrit & Hindi)", nameHi: "श्रीमद्भगवद्गीता (संस्कृत एवं हिंदी)", size: "2.4 MB" },
    { nameEn: "Valmiki Ramayana (Selected Slokas)", nameHi: "वाल्मीकि रामायण (चयनित श्लोक)", size: "4.1 MB" },
    { nameEn: "Vedic Slokas & Morning Prayers Guide", nameHi: "वैदिक श्लोक और प्रातः कालीन प्रार्थना मार्गदर्शिका", size: "1.2 MB" }
  ];

  // Simulated Temple Live stream status
  const [isPlayingStream, setIsPlayingStream] = useState(false);

  const handleDownload = (name: string) => {
    alert(isHi ? `स्क्रिप्ट डाउनलोड शुरू हुआ: ${name}` : `Downloading scripture: ${name}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn font-sans">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 pt-6 pb-6 px-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">
              {isHi ? "धर्म और संस्कृति हब" : "Religious & Culture"}
            </h2>
            <p className="text-xs text-amber-100 mt-0.5 font-bold">
              {isHi ? "स्थानीय उत्सव, पवित्र ग्रंथ और लाइव मंदिर दर्शन" : "Sacred texts, festivals tracker & cross-faith community"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => setActiveSubTab("festivals")}
          className={`flex-1 py-3.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === "festivals" ? "border-amber-600 text-amber-800" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "उत्सव एवं मिलन" : "Festivals Tracker"}
        </button>
        <button 
          onClick={() => setActiveSubTab("texts")}
          className={`flex-1 py-3.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === "texts" ? "border-amber-600 text-amber-800" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "पवित्र ग्रंथ व श्लोक" : "Sacred Texts"}
        </button>
        <button 
          onClick={() => setActiveSubTab("live")}
          className={`flex-1 py-3.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === "live" ? "border-amber-600 text-amber-800" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "मंदिर लाइव दर्शन" : "Live Temple Feed"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        
        {/* ==================== SUB-TAB 1: FESTIVALS & MEETUPS ==================== */}
        {activeSubTab === "festivals" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Celebration tracker title */}
            <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <Landmark className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 text-xs block leading-snug">{isHi ? "अंतर-धार्मिक एकता और सांस्कृतिक मिलन" : "Cross-Faith Community Harmony"}</span>
                <p className="text-[10.5px] text-slate-500 leading-relaxed font-bold mt-1">
                  {isHi 
                    ? "सीहोर के स्थानीय त्यौहारों, पूजा उत्सवों और अंतर-धार्मिक शांति सम्मेलनों की सूचनाएं और समय-सारणी देखें।" 
                    : "Track upcoming celebrations, regional holy days, and register for community meetups."}
                </p>
              </div>
            </div>

            {/* List of upcoming celebrations */}
            {localFestivals.map((fest, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                  <h4 className="font-display font-bold text-xs text-slate-800 leading-snug">
                    {isHi ? fest.titleHi : fest.titleEn}
                  </h4>
                  <span className="text-[9px] font-bold text-amber-750 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0 uppercase tracking-wider">
                    {isHi ? "आगामी" : "Upcoming"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  {isHi ? fest.detailsHi : fest.detailsEn}
                </p>

                <div className="flex flex-col gap-1.5 text-[9.5px] text-slate-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-450" /> {fest.date}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-450" /> {isHi ? fest.locationHi : fest.locationEn}</span>
                </div>

                <button 
                  onClick={() => alert(`Registered for ${fest.titleEn}!`)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-xl text-[10.5px] transition"
                >
                  {isHi ? "मिलन कार्यक्रम में शामिल हों" : "Join Meetup Event"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ==================== SUB-TAB 2: SACRED TEXTS & SLOKAS ==================== */}
        {activeSubTab === "texts" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Devotional sloka viewer */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest pl-1">
                {isHi ? "प्रवचन, श्लोक व अर्थ" : "Sacred Slokas & Core Meanings"}
              </span>

              {devotionals.map((dev, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3">
                  <div className="bg-amber-50/20 border border-amber-200/50 rounded-xl p-3.5 text-center text-xs font-serif font-black text-amber-900 whitespace-pre-line leading-relaxed italic">
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
                <BookOpen className="w-4.5 h-4.5 text-amber-700" />
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
            {/* Live Feed simulated player */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Landmark className="w-4.5 h-4.5 text-amber-700" />
                {isHi ? "लाइव मंदिर दर्शन (सीहोर व प्रमुख तीर्थ)" : "Live Spiritual Temple Feeds"}
              </h4>

              {/* Mock Video Stream Player */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 flex flex-col justify-center items-center text-white border border-slate-200">
                {isPlayingStream ? (
                  <div className="relative w-full h-full">
                    {/* Simulated stream running */}
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col justify-center items-center">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping mb-2"></span>
                      <span className="text-xs font-bold text-slate-350">{isHi ? "लाइव प्रसारण चल रहा है..." : "Broadcasting live temple stream..."}</span>
                      <span className="text-[10px] text-slate-450 mt-1 font-mono">Bada Mahadev Mandir • 720p 30fps</span>
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
                      className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-4.5 shadow-lg transition transform hover:scale-105 active:scale-95"
                    >
                      <Play className="w-6 h-6 fill-white" />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 mt-3">{isHi ? "लाइव दर्शन शुरू करने के लिए प्ले दबाएं" : "Press play to start simulated live feed"}</span>
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

      </div>
    </div>
  );
}
