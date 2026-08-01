import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Leaf, CheckCircle, Wind, Sun, CloudRain, CloudSun, Thermometer, 
  Droplets, ShieldAlert, Award, FileText, ChevronRight, Share2 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function EnvironmentPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";

  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Simulated AQI details for Sehore
  const aqiData = {
    value: 68,
    status: isHi ? "संतोषजनक" : "Moderate",
    color: "border-yellow-400 bg-yellow-50 text-yellow-800",
    pm25: "19.5 µg/m³",
    pm10: "48.2 µg/m³",
    advisory: isHi 
      ? "हवा की गुणवत्ता ठीक है। हालांकि संवेदनशील लोगों को लंबी बाहरी गतिविधियों को सीमित करना चाहिए।"
      : "Air quality is acceptable. However, sensitive people should limit prolonged outdoor exertion."
  };

  // Weather data
  const weatherData = {
    temp: "31°C",
    condition: isHi ? "आंशिक रूप से बादल छाए रहेंगे" : "Partly Cloudy",
    humidity: "62%",
    wind: "12 km/h",
    forecast: [
      { day: isHi ? "सोम" : "Mon", temp: "30°C", icon: CloudRain },
      { day: isHi ? "मंगल" : "Tue", temp: "32°C", icon: CloudSun },
      { day: isHi ? "बुध" : "Wed", temp: "33°C", icon: Sun }
    ]
  };

  // Global & Local Climate News
  const newsFeed = [
    {
      id: 1,
      titleEn: "India targets 500GW of renewable energy by 2030, says Environment Ministry",
      titleHi: "भारत का 2030 तक 500 गीगावाट नवीकरणीय ऊर्जा का लक्ष्य: पर्यावरण मंत्रालय",
      snippetEn: "Renewable energy scaling shows promising progress with massive solar grids added in central India.",
      snippetHi: "मध्य भारत में बड़े सौर ग्रिड जोड़े जाने के साथ नवीकरणीय ऊर्जा विकास में महत्वपूर्ण प्रगति दिख रही है।",
      source: "Climate Action India",
      date: "Aug 1, 2026"
    },
    {
      id: 2,
      titleEn: "Sehore Afforestation campaign restores local ground water levels",
      titleHi: "सीहोर वृक्षारोपण अभियान से भूजल स्तर में हुआ सुधार",
      snippetEn: "A 5,000 tree plantation drive led by volunteers improves water tables across Sehore villages.",
      snippetHi: "स्वयंसेवकों के नेतृत्व में 5,000 वृक्षारोपण अभियान से सीहोर के गांवों में जल स्तर में सुधार हुआ है।",
      source: "State Green Board",
      date: "Jul 28, 2026"
    },
    {
      id: 3,
      titleEn: "Global carbon emission rates see slight dip due to EV grid expansions",
      titleHi: "इलेक्ट्रिक वाहनों के विस्तार से वैश्विक कार्बन उत्सर्जन दरों में मामूली गिरावट",
      snippetEn: "New industrial transport policies show significant reductions in overall urban air toxins.",
      snippetHi: "नई औद्योगिक परिवहन नीतियों से शहरी वायु विषाक्त पदार्थों में समग्र रूप से महत्वपूर्ण कमी देखी गई है।",
      source: "UNEP Report",
      date: "Jul 25, 2026"
    }
  ];

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const data = {
        campaignName: "Green Sehore Afforestation 2026",
        joinedAsVolunteer: true
      };
      const submission = {
        userId: user?.id || "guest",
        citizenName: user?.name || "Citizen",
        citizenPhone: user?.phone || "",
        serviceName: "Environment Support",
        submissionData: data,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Environment registration error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-5 animate-fadeIn pb-24">
      {/* Page Heading */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-5 shadow-sm space-y-2">
        <h3 className="font-display font-extrabold text-base text-green-900 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600 fill-green-600" />
          {isHi ? "पर्यावरण एवं जल संरक्षण" : "Environment & Vitals Hub"}
        </h3>
        <p className="text-xs text-slate-650 leading-relaxed">
          {isHi 
            ? "स्वच्छ जल और हरित भारत के लिए सामूहिक प्रयास। हवा की गुणवत्ता और स्थानीय पर्यावरण अपडेट्स ट्रैक करें।" 
            : "Track air quality indices, temperature forecasting, and take active part in Sehore plantation campaigns."}
        </p>
      </div>

      {/* AQI & WEATHER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AQI Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="font-display font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-emerald-600" />
              {isHi ? "वायु गुणवत्ता सूचकांक (AQI)" : "Air Quality Index (AQI)"}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Live • Sehore</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-yellow-400 flex flex-col items-center justify-center bg-yellow-50/20">
              <span className="text-base font-black text-slate-800">{aqiData.value}</span>
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest leading-none">AQI</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${aqiData.color}`}>
                  {aqiData.status}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-bold space-x-3 mt-1">
                <span>PM2.5: {aqiData.pm25}</span>
                <span>PM10: {aqiData.pm10}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-[10.5px] text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-snug">{aqiData.advisory}</p>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="font-display font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              {isHi ? "मौसम व तापमान" : "Local Weather Forecast"}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Live • 31°C</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Thermometer className="w-8 h-8 text-orange-500" />
              <div>
                <span className="text-xl font-black text-slate-800">{weatherData.temp}</span>
                <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">{weatherData.condition}</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-bold text-right space-y-1">
              <p className="flex items-center justify-end gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /> {isHi ? "आर्द्रता" : "Humidity"}: {weatherData.humidity}</p>
              <p className="flex items-center justify-end gap-1"><Wind className="w-3.5 h-3.5 text-emerald-500" /> {isHi ? "हवा" : "Wind"}: {weatherData.wind}</p>
            </div>
          </div>

          {/* 3-day forecast */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {weatherData.forecast.map((fc, i) => {
              const FcIcon = fc.icon;
              return (
                <div key={i} className="bg-slate-50/50 rounded-xl p-1.5 border border-slate-200/50">
                  <span className="text-[10px] font-bold text-slate-500">{fc.day}</span>
                  <FcIcon className="w-4 h-4 mx-auto my-1 text-slate-650" />
                  <span className="text-[10px] font-black text-slate-700">{fc.temp}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Climate Campaign Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3.5">
        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
          <div>
            <h4 className="font-display font-bold text-xs text-slate-800">{isHi ? "हरित सीहोर वृक्षारोपण २०२६" : "Green Sehore Afforestation 2026"}</h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{isHi ? "सक्रिय अभियान" : "Active Campaign"}</p>
          </div>
          <span className="text-[8px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">+50 Points</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isHi
            ? "सीहोर जिले के १० विभिन्न ग्रामों में ५००० छायादार वृक्ष लगाने का लक्ष्य। जल संचयन के लिए स्वयंसेवा करें।"
            : "Targeting 5,000 shade-giving local saplings across 10 rural wards of Sehore. Click below to volunteer."}
        </p>

        {success ? (
          <div className="bg-green-50 text-green-700 border border-green-150 p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 justify-center">
            <CheckCircle className="w-4 h-4" />
            <span>{isHi ? "सफलतापूर्वक शामिल हुए!" : "Successfully Joined Campaign!"}</span>
          </div>
        ) : (
          <button 
            onClick={handleRegister}
            disabled={submitting}
            className="w-full bg-[#138808] hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
          >
            {submitting ? "Joining..." : (isHi ? "अभियान में शामिल हों" : "Join Campaign as Volunteer")}
          </button>
        )}
      </div>

      {/* Global Climate News Feed */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest pl-1">
          {isHi ? "वैश्विक एवं स्थानीय जलवायु समाचार" : "Global & Local Climate News"}
        </h4>

        <div className="space-y-3">
          {newsFeed.map(news => (
            <div key={news.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                  {news.source}
                </span>
                <span className="text-[9px] font-mono text-slate-400">{news.date}</span>
              </div>

              <h5 className="font-display font-bold text-slate-900 text-xs leading-snug">
                {isHi ? news.titleHi : news.titleEn}
              </h5>

              <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                {isHi ? news.snippetHi : news.snippetEn}
              </p>

              <div className="flex justify-end gap-3 pt-1 border-t border-slate-50 text-[10px] font-bold text-slate-450">
                <button className="flex items-center gap-1 hover:text-slate-700">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isHi ? "साझा करें" : "Share"}</span>
                </button>
                <button className="flex items-center gap-0.5 hover:text-slate-700">
                  <span>{isHi ? "पूरा पढ़ें" : "Read More"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
