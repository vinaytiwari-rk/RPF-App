import React, { useState, useEffect } from "react";
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
  const [subPage, setSubPage] = useState<"portal" | "tools">("portal");
  const [dynamicWeather, setDynamicWeather] = useState<{
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
    forecast: Array<{ day: string; temp: string; weatherCode: number }>;
  } | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://api.open-meteo.com/v1/forecast?latitude=23.2032&longitude=77.0844&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=3");
        if (res.ok) {
          const json = await res.json();
          const current = json.current;
          const daily = json.daily;

          const getCondition = (code: number) => {
            if (code === 0) return isHi ? "साफ़ मौसम" : "Clear Sky";
            if (code >= 1 && code <= 3) return isHi ? "आंशिक रूप से बादल" : "Partly Cloudy";
            if (code >= 51 && code <= 65) return isHi ? "बारिश" : "Rainy";
            if (code >= 80 && code <= 82) return isHi ? "बौछारें" : "Showers";
            return isHi ? "बादल छाए रहेंगे" : "Overcast";
          };

          const days = [isHi ? "सोम" : "Mon", isHi ? "मंगल" : "Tue", isHi ? "बुध" : "Wed", isHi ? "गुरु" : "Thu", isHi ? "शुक्र" : "Fri", isHi ? "शनि" : "Sat", isHi ? "रवि" : "Sun"];
          const todayIndex = new Date().getDay();

          const forecastData = (daily.time || []).map((t: string, idx: number) => {
            const dayNum = (todayIndex + idx) % 7;
            const dayLabel = days[dayNum === 0 ? 6 : dayNum - 1];
            return {
              day: dayLabel,
              temp: `${Math.round(daily.temperature_2m_max[idx])}°C`,
              weatherCode: daily.weather_code[idx]
            };
          });

          setDynamicWeather({
            temp: `${Math.round(current.temperature_2m)}°C`,
            condition: getCondition(current.weather_code),
            humidity: `${current.relative_humidity_2m}%`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`,
            forecast: forecastData
          });
        }
      } catch (err) {
        console.error("Open-Meteo API error", err);
      }
    };
    fetchWeather();
  }, [isHi]);

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [monthlyElectricity, setMonthlyElectricity] = useState(150); // kWh
  const [lpgCylinders, setLpgCylinders] = useState(1); // count
  const [solarRoofArea, setSolarRoofArea] = useState(250); // sq ft
  const [harvestedRoofArea, setHarvestedRoofArea] = useState(500); // sq ft
  const [plantedSaplings, setPlantedSaplings] = useState(5);

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
      {/* Top Switcher Tab Bar */}
      <div className="flex bg-slate-100 border border-slate-200 p-1 rounded-xl shadow-inner shrink-0">
        <button 
          onClick={() => setSubPage("portal")}
          className={`flex-1 py-2 text-center rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "portal" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "पर्यावरण सेवा" : "Eco Portal"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("carbon");
          }}
          className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "tools" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {isHi ? "स्मार्ट पर्यावरण टूल्स" : "Savings Planners"}
        </button>
      </div>

      {subPage === "portal" && (
        <>
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
            <span className="text-[10px] font-mono text-slate-400">Live • {dynamicWeather ? dynamicWeather.temp : "31°C"}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Thermometer className="w-8 h-8 text-orange-500" />
              <div>
                <span className="text-xl font-black text-slate-800">{dynamicWeather ? dynamicWeather.temp : weatherData.temp}</span>
                <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">{dynamicWeather ? dynamicWeather.condition : weatherData.condition}</p>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-bold text-right space-y-1">
              <p className="flex items-center justify-end gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /> {isHi ? "आर्द्रता" : "Humidity"}: {dynamicWeather ? dynamicWeather.humidity : weatherData.humidity}</p>
              <p className="flex items-center justify-end gap-1"><Wind className="w-3.5 h-3.5 text-emerald-500" /> {isHi ? "हवा" : "Wind"}: {dynamicWeather ? dynamicWeather.wind : weatherData.wind}</p>
            </div>
          </div>

          {/* 3-day forecast */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
            {(dynamicWeather ? dynamicWeather.forecast : [
              { day: isHi ? "सोम" : "Mon", temp: "30°C", weatherCode: 51 },
              { day: isHi ? "मंगल" : "Tue", temp: "32°C", weatherCode: 1 },
              { day: isHi ? "बुध" : "Wed", temp: "33°C", weatherCode: 0 }
            ]).map((fc, i) => {
              const FcIcon = fc.weatherCode === 0 ? Sun 
                           : (fc.weatherCode >= 1 && fc.weatherCode <= 3) ? CloudSun 
                           : CloudRain;
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
        </>
      )}

      {subPage === "tools" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
          <h4 className="font-display font-black text-xs text-[#000080] uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>{isHi ? "पर्यावरण और कार्बन सुरक्षा टूल्स" : "Eco-Savings & Carbon Tools"}</span>
            <Leaf className="w-4.5 h-4.5 text-green-600 animate-pulse" />
          </h4>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-slate-750">
          {[
            { key: "carbon", title: isHi ? "कार्बन पदचिह्न गणना" : "Carbon Calculator" },
            { key: "solar", title: isHi ? "सोलर बिजली बचत" : "Solar Estimator" },
            { key: "rainwater", title: isHi ? "वर्षा जल संचयन मात्रा" : "Rainwater Harvester" },
            { key: "tree", title: isHi ? "वृक्षारोपण CO2 अवशोषण" : "Sapling Benefits" }
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

        {/* Content Container */}
        {activeCalc && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 space-y-4 animate-fadeIn text-xs text-slate-700">
            
            {/* 1. Carbon Footprint */}
            {activeCalc === "carbon" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "दैनिक घरेलू कार्बन उत्सर्जन गणना" : "Household Carbon Footprint Estimator"}</h5>
                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `मासिक बिजली: ${monthlyElectricity} kWh` : `Monthly Electricity: ${monthlyElectricity} kWh`}</label>
                    <input type="range" min="50" max="600" step="10" value={monthlyElectricity} onChange={e => setMonthlyElectricity(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `LPG सिलेंडर/माह: ${lpgCylinders}` : `LPG Cylinders/mo: ${lpgCylinders}`}</label>
                    <input type="range" min="0" max="4" value={lpgCylinders} onChange={e => setLpgCylinders(Number(e.target.value))} className="w-full accent-[#000080]" />
                  </div>
                </div>

                {(() => {
                  // Standard factors: 1kWh = 0.85kg CO2, 1 LPG cylinder = 42.5kg CO2
                  const lpgC = typeof lpgCylinders === 'number' ? lpgCylinders : 1;
                  const totalCO2 = Math.round((monthlyElectricity * 0.85) + (lpgC * 42.5));
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold text-center">
                      <p className="text-[10px] text-slate-450 font-bold uppercase">{isHi ? "अनुमानित मासिक कार्बन उत्सर्जन" : "Projected Monthly CO2 Emissions"}</p>
                      <p className="text-lg text-[#000080] font-black mt-1">{totalCO2} kg CO2</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 2. Solar Panel Estimator */}
            {activeCalc === "solar" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "रूफटॉप सोलर पैनल ऊर्जा और निवेश वापसी" : "Rooftop Solar Output & Payback Estimator"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `उपलब्ध छत क्षेत्रफल: ${solarRoofArea} वर्ग फुट` : `Available Roof Area: ${solarRoofArea} sq ft`}</label>
                  <input type="range" min="100" max="1000" step="50" value={solarRoofArea} onChange={e => setSolarRoofArea(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  const capacitykW = (solarRoofArea / 100).toFixed(1); // 100 sq ft = 1kW average
                  const dailyGen = Math.round(Number(capacitykW) * 4); // 4 hours peak sunlight
                  const cost = Math.round(Number(capacitykW) * 60000); // ₹60,000 per kW avg
                  return (
                    <div className="bg-indigo-50 border border-indigo-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{isHi ? "सौर ऊर्जा क्षमता (kW):" : "Recommended Solar Size:"}</span><span className="text-[#000080]">{capacitykW} kW</span></p>
                      <p className="flex justify-between"><span>{isHi ? "दैनिक उत्पादित बिजली:" : "Daily Power Yield:"}</span><span className="text-[#000080]">{dailyGen} kWh (Units)</span></p>
                      <p className="flex justify-between border-t border-indigo-200/50 pt-1.5"><span>{isHi ? "अनुमानित स्थापना लागत:" : "Estimated Setup Cost:"}</span><span className="text-green-700">₹{cost.toLocaleString()}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 3. Rainwater Harvester */}
            {activeCalc === "rainwater" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "वर्षा जल संचयन क्षमता संकेतक" : "Rainwater Harvesting Volume Estimator"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `छत का क्षेत्रफल: ${harvestedRoofArea} वर्ग फुट` : `Roof Area: ${harvestedRoofArea} sq ft`}</label>
                  <input type="range" min="200" max="2500" step="50" value={harvestedRoofArea} onChange={e => setHarvestedRoofArea(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  // Sehore average annual rainfall = ~40 inches (~1000mm)
                  // Harvesting Capacity (Gallons) = Area (sq ft) * Rainfall (inches) * 0.623 * Runoff Coeff (0.85 for concrete roof)
                  const rainInches = 40;
                  const liters = Math.round(harvestedRoofArea * rainInches * 0.623 * 0.85 * 3.785);
                  return (
                    <div className="bg-blue-50 border border-blue-155 p-3 rounded-lg text-blue-800 font-bold text-center">
                      <p className="text-[10px] text-blue-500 uppercase">{isHi ? "वार्षिक संभावित वर्षा जल संग्रह" : "Estimated Annual Water Saved"}</p>
                      <p className="text-lg font-black text-[#000080] mt-1">{liters.toLocaleString()} Liters</p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 4. Tree Sapling Benefits */}
            {activeCalc === "tree" && (
              <div className="space-y-3">
                <h5 className="font-extrabold text-[#000080]">{isHi ? "वृक्षारोपण पर्यावरण संवर्धन लाभ" : "Sapling Planting Ecological Benefits"}</h5>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">{isHi ? `लगाए गए पौधे: ${plantedSaplings}` : `Saplings Planted: ${plantedSaplings}`}</label>
                  <input type="range" min="1" max="50" value={plantedSaplings} onChange={e => setPlantedSaplings(Number(e.target.value))} className="w-full accent-[#000080]" />
                </div>

                {(() => {
                  // Standard mature tree absorbs ~22kg CO2/year and produces oxygen for 2 humans/year
                  const co2Year = plantedSaplings * 22;
                  const oxygenHumans = plantedSaplings * 2;
                  return (
                    <div className="bg-green-50 border border-green-150 p-3 rounded-lg text-slate-800 font-bold space-y-1.5">
                      <p className="flex justify-between"><span>{isHi ? "सालाना CO2 अवशोषण:" : "CO2 Absorbed / Year:"}</span><span className="text-green-700">~{co2Year} kg</span></p>
                      <p className="flex justify-between border-t border-green-200/50 pt-1.5"><span>{isHi ? "ऑक्सीजन प्रदाता क्षमता:" : "Oxygen Supported for:"}</span><span className="text-[#000080]">{oxygenHumans} {isHi ? "इंसान" : "humans"}</span></p>
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
  );
}
