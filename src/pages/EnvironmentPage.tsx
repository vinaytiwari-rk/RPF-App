import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Leaf, CheckCircle, Wind, Sun, CloudRain, CloudSun, Thermometer, 
  Droplets, ShieldAlert, Award, FileText, ChevronRight, Share2, 
  Fuel, Map, Activity, Compass, Target, Navigation
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Open-Meteo weather code → short label
function getCondition(code: number, isHi: boolean): string {
  if (code === 0) return isHi ? "साफ आसमान" : "Clear sky";
  if (code <= 3) return isHi ? "आंशिक बादल" : "Partly cloudy";
  if (code <= 48) return isHi ? "कोहरा" : "Foggy";
  if (code <= 67) return isHi ? "बारिश" : "Rain";
  if (code <= 77) return isHi ? "बर्फ" : "Snow";
  if (code <= 82) return isHi ? "मूसलाधार बारिश" : "Heavy rain";
  if (code <= 99) return isHi ? "आंधी-तूफान" : "Thunderstorm";
  return isHi ? "परिवर्तनशील" : "Variable";
}

function weatherIcon(code: number) {
  if (code === 0) return Sun;
  if (code <= 3) return CloudSun;
  return CloudRain;
}

// Approximate lat/lon for common MP pincodes (extend as needed)
const PINCODE_COORDS: Record<string, { lat: number; lon: number; name: string }> = {
  "462038": { lat: 23.2950, lon: 77.4040, name: "Bhopal (Karond/Narela)" },
  "462001": { lat: 23.2599, lon: 77.4126, name: "Bhopal" },
  "462002": { lat: 23.2599, lon: 77.4126, name: "Bhopal" },
  "462003": { lat: 23.2599, lon: 77.4126, name: "Bhopal" },
  "452001": { lat: 22.7196, lon: 75.8577, name: "Indore" },
  "466001": { lat: 23.2032, lon: 77.0844, name: "Bhopal" },
};

export default function EnvironmentPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const isHi = lang === "hi";

  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subPage, setSubPage] = useState<"portal" | "tools" | "fuel" | "maps">("portal");
  
  // Fuel & Earthquake States
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [earthquakes, setEarthquakes] = useState<any[]>([]);
  
  // GPS State
  const [gpsData, setGpsData] = useState({ speed: 0, heading: 0, altitude: 0 });
  const [gpsActive, setGpsActive] = useState(false);
  const [dynamicWeather, setDynamicWeather] = useState<{
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
    locationLabel: string;
    forecast: Array<{ day: string; temp: string; weatherCode: number }>;
  } | null>(null);

  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async (lat: number, lon: number, label: string) => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&daily=weather_code,temperature_2m_max` +
          `&timezone=auto&forecast_days=3`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather API failed");

        const data = await res.json();
        const current = data.current;
        const daily = data.daily;

        const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayNamesHi = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

        const forecastData = (daily.time || []).map((t: string, idx: number) => {
          const d = new Date(t);
          const day = isHi ? dayNamesHi[d.getDay()] : dayNamesEn[d.getDay()];
          return {
            day,
            temp: `${Math.round(daily.temperature_2m_max[idx])}°C`,
            weatherCode: daily.weather_code[idx],
          };
        });

        if (!cancelled) {
          setDynamicWeather({
            temp: `${Math.round(current.temperature_2m)}°C`,
            condition: getCondition(current.weather_code, isHi),
            humidity: `${current.relative_humidity_2m}%`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`,
            locationLabel: label,
            forecast: forecastData,
          });
          setWeatherError(null);
        }
      } catch (err) {
        console.error("Open-Meteo error", err);
        if (!cancelled) setWeatherError("Could not load weather");
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    };

    const resolveAndFetch = async () => {
      setWeatherLoading(true);

      // 1) Try browser GPS
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 8000,
              maximumAge: 5 * 60 * 1000,
            });
          });
          const { latitude, longitude } = pos.coords;
          await loadWeather(latitude, longitude, isHi ? "आपका स्थान" : "Your location");
          return;
        } catch {
          // GPS denied / failed → fall through
        }
      }

      // 2) Try pincode from profile / localStorage (if your app stores it)
      const savedPin =
        localStorage.getItem("user_pincode") ||
        localStorage.getItem("@rpf_pincode") ||
        "";

      if (savedPin && PINCODE_COORDS[savedPin]) {
        const c = PINCODE_COORDS[savedPin];
        await loadWeather(c.lat, c.lon, c.name);
        return;
      }

      // 3) Fallback: Bhopal (better default than only Bhopal for this app)
      await loadWeather(23.2599, 77.4126, "Bhopal");
    };

    resolveAndFetch();
    return () => {
      cancelled = true;
    };
  }, [isHi]);

  // --- MAPS & FUEL DATA EFFECTS ---
  useEffect(() => {
    if (subPage === "maps") {
      fetch("/api/env/earthquakes")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.features) {
            setEarthquakes(data.data.features);
          }
        })
        .catch(console.error);

      // Start GPS
      setGpsActive(true);
      let watchId: number;
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            setGpsData({
              speed: pos.coords.speed || 0,
              heading: pos.coords.heading || 0,
              altitude: pos.coords.altitude || 0
            });
          },
          console.error,
          { enableHighAccuracy: true }
        );
      }
      return () => {
        setGpsActive(false);
        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [subPage]);

  const loadFuelLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/env/fuel", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFuelLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (subPage === "fuel") {
      loadFuelLogs();
    }
  }, [subPage]);

  // --- FUEL INPUT STATES ---
  const [fuelForm, setFuelForm] = useState({ odometer: "", liters: "", price: "" });
  const [fuelLoading, setFuelLoading] = useState(false);

  const addFuelLog = async () => {
    if (!fuelForm.odometer || !fuelForm.liters || !fuelForm.price) return;
    setFuelLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch("/api/env/fuel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          odometer: Number(fuelForm.odometer),
          liters: Number(fuelForm.liters),
          price_per_liter: Number(fuelForm.price)
        })
      });
      setFuelForm({ odometer: "", liters: "", price: "" });
      loadFuelLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setFuelLoading(false);
    }
  };

  const deleteFuelLog = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await fetch(`/api/env/fuel/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      loadFuelLogs();
    } catch (err) {
      console.error(err);
    }
  };

  // --- SMART CALCULATORS STATE ---
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [monthlyElectricity, setMonthlyElectricity] = useState(150); // kWh
  const [lpgCylinders, setLpgCylinders] = useState(1); // count
  const [solarRoofArea, setSolarRoofArea] = useState(250); // sq ft
  const [harvestedRoofArea, setHarvestedRoofArea] = useState(500); // sq ft
  const [plantedSaplings, setPlantedSaplings] = useState(5);

  // Simulated AQI details for Bhopal
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
      titleEn: "Bhopal Afforestation campaign restores local ground water levels",
      titleHi: "सीहोर वृक्षारोपण अभियान से भूजल स्तर में हुआ सुधार",
      snippetEn: "A 5,000 tree plantation drive led by volunteers improves water tables across Bhopal villages.",
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
        campaignName: "Green Bhopal Afforestation 2026",
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
      <div className="flex flex-wrap gap-2 bg-slate-100 border border-slate-200 p-1.5 rounded-xl shadow-inner shrink-0">
        <button 
          onClick={() => setSubPage("portal")}
          className={`flex-1 min-w-[80px] py-2 text-center rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "portal" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          }`}
        >
          {isHi ? "पर्यावरण सेवा" : "Eco Portal"}
        </button>
        <button 
          onClick={() => {
            setSubPage("tools");
            if (!activeCalc) setActiveCalc("carbon");
          }}
          className={`flex-1 min-w-[80px] text-center py-2 rounded-lg text-xs font-black transition cursor-pointer ${
            subPage === "tools" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          }`}
        >
          {isHi ? "स्मार्ट टूल्स" : "Savings Planners"}
        </button>
        <button 
          onClick={() => setSubPage("fuel")}
          className={`flex-1 min-w-[80px] text-center py-2 rounded-lg text-xs font-black transition cursor-pointer flex justify-center items-center gap-1.5 ${
            subPage === "fuel" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          }`}
        >
          <Fuel className="w-3.5 h-3.5" />
          {isHi ? "ईंधन लॉग" : "Fuel Logs"}
        </button>
        <button 
          onClick={() => setSubPage("maps")}
          className={`flex-1 min-w-[80px] text-center py-2 rounded-lg text-xs font-black transition cursor-pointer flex justify-center items-center gap-1.5 ${
            subPage === "maps" ? "bg-[#000080] text-white shadow" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          {isHi ? "लाइव मैप" : "Earthquakes & GPS"}
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
            : "Track air quality indices, temperature forecasting, and take active part in Bhopal plantation campaigns."}
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
            <span className="text-[10px] font-mono text-slate-400">Live • Bhopal</span>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              {isHi ? "मौसम व तापमान" : "Local Weather Forecast"}
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              {weatherLoading
                ? "..."
                : dynamicWeather
                ? `Live • ${dynamicWeather.locationLabel}`
                : "—"}
            </span>
          </div>

          {weatherError && (
            <p className="text-[11px] text-red-500 mb-2">{weatherError}</p>
          )}

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Thermometer className="w-8 h-8 text-orange-500" />
              <div>
                <span className="text-xl font-black text-slate-800">
                  {dynamicWeather?.temp ?? "—"}
                </span>
                <p className="text-[10.5px] text-slate-500 font-bold mt-0.5">
                  {dynamicWeather?.condition ?? (isHi ? "लोड हो रहा है..." : "Loading...")}
                </p>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-600 font-bold space-y-1 mt-1">
              <p className="flex items-center justify-end gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                {isHi ? "आर्द्रता" : "Humidity"}: {dynamicWeather?.humidity ?? "—"}
              </p>
              <p className="flex items-center justify-end gap-1">
                <Wind className="w-3.5 h-3.5 text-emerald-500" />
                {isHi ? "हवा" : "Wind"}: {dynamicWeather?.wind ?? "—"}
              </p>
            </div>
          </div>

          {/* 3-day forecast */}
          {dynamicWeather?.forecast && (
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
              {dynamicWeather.forecast.map((f, i) => {
                const Icon = weatherIcon(f.weatherCode);
                return (
                  <div key={i} className="text-center bg-slate-50/50 rounded-xl p-1.5 border border-slate-200/50">
                    <p className="text-[10px] font-bold text-slate-500">{f.day}</p>
                    <Icon className="w-4 h-4 mx-auto my-1 text-slate-600" />
                    <p className="text-[11px] font-black text-slate-800">{f.temp}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Climate Campaign Action */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-3.5">
        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
          <div>
            <h4 className="font-display font-bold text-xs text-slate-800">{isHi ? "हरित सीहोर वृक्षारोपण २०२६" : "Green Bhopal Afforestation 2026"}</h4>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{isHi ? "सक्रिय अभियान" : "Active Campaign"}</p>
          </div>
          <span className="text-[8px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">+50 Points</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isHi
            ? "सीहोर जिले के १० विभिन्न ग्रामों में ५००० छायादार वृक्ष लगाने का लक्ष्य। जल संचयन के लिए स्वयंसेवा करें।"
            : "Targeting 5,000 shade-giving local saplings across 10 rural wards of Bhopal. Click below to volunteer."}
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
                  // Bhopal average annual rainfall = ~40 inches (~1000mm)
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

      {/* --- FUEL LOGS TAB (FUELIO CLONE) --- */}
      {subPage === "fuel" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-2">
            <h3 className="font-display font-extrabold text-base text-indigo-900 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-indigo-600 fill-indigo-600" />
              {isHi ? "वाहन ईंधन व खर्च ट्रैकर" : "Vehicle Fuel & Expense Tracker"}
            </h3>
            <p className="text-xs text-slate-650 leading-relaxed">
              {isHi ? "अपने वाहन के माइलेज और ईंधन खर्च का हिसाब रखें।" : "Log your fill-ups to calculate average mileage and track monthly costs."}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h4 className="font-display font-bold text-xs text-slate-700">{isHi ? "नया रिकॉर्ड जोड़ें" : "Log Fill-up"}</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Odometer (km)</label>
                <input 
                  type="number"
                  value={fuelForm.odometer}
                  onChange={(e) => setFuelForm({ ...fuelForm, odometer: e.target.value })}
                  placeholder="e.g. 15400"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Liters</label>
                <input 
                  type="number"
                  value={fuelForm.liters}
                  onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })}
                  placeholder="e.g. 5.5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">₹ / Liter</label>
                <input 
                  type="number"
                  value={fuelForm.price}
                  onChange={(e) => setFuelForm({ ...fuelForm, price: e.target.value })}
                  placeholder="e.g. 102"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            
            <button
              onClick={addFuelLog}
              disabled={fuelLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-xs font-bold transition disabled:opacity-50"
            >
              {fuelLoading ? "Saving..." : (isHi ? "लॉग सेव करें" : "Save Log")}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-display font-bold text-xs text-slate-700">{isHi ? "हाल के ईंधन लॉग" : "Recent Logs"}</h4>
            {fuelLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">{isHi ? "कोई रिकॉर्ड नहीं मिला" : "No logs found."}</p>
            ) : (
              <div className="space-y-2">
                {fuelLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <div>
                      <p className="text-xs font-black text-slate-800">{Number(log.total_cost).toFixed(2)} ₹</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {log.liters} L @ ₹{log.price_per_liter} / L • ODO: {log.odometer} km
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">{new Date(log.fill_date).toLocaleString()}</p>
                    </div>
                    <button onClick={() => deleteFuelLog(log.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MAPS & GPS TAB (EARTHQUAKES PRO & GPS TOOLKIT) --- */}
      {subPage === "maps" && (
        <div className="space-y-4 animate-fadeIn">
          {/* GPS Toolkit */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-sm text-white">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold text-xs flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-400" />
                {isHi ? "लाइव जीपीएस टूलकिट" : "Live GPS Toolkit"}
              </h4>
              <div className="flex items-center gap-1.5 text-[9px] font-bold bg-slate-800 px-2 py-1 rounded-full text-green-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                ACTIVE
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                <Activity className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                <span className="block text-lg font-black">{Math.round(gpsData.speed * 3.6)}</span>
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Speed (km/h)</span>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                <Compass className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <span className="block text-lg font-black">{Math.round(gpsData.heading)}°</span>
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Heading</span>
              </div>
              <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
                <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="block text-lg font-black">{Math.round(gpsData.altitude)}</span>
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">Altitude (m)</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Values may be 0 if tested on desktop without hardware sensors.
            </p>
          </div>

          {/* Earthquake Radar */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-600 animate-pulse" />
              <div>
                <h4 className="font-display font-bold text-xs text-red-900 leading-tight">
                  {isHi ? "ग्लोबल भूकंप रडार" : "Global Earthquake Radar"}
                </h4>
                <p className="text-[9px] text-red-700 font-semibold uppercase tracking-widest mt-0.5">Live USGS Data • M2.5+</p>
              </div>
            </div>
            <div className="flex-1 relative z-0">
              <MapContainer 
                center={[20, 78]} 
                zoom={3} 
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {earthquakes.map((eq, i) => {
                  const mag = eq.properties.mag;
                  const color = mag >= 6 ? "#ef4444" : mag >= 4.5 ? "#f97316" : "#eab308";
                  return (
                    <CircleMarker
                      key={i}
                      center={[eq.geometry.coordinates[1], eq.geometry.coordinates[0]]}
                      radius={Math.max(mag * 2, 4)}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.6, weight: 1 }}
                    >
                      <Popup>
                        <div className="text-center font-sans">
                          <strong className="block text-sm text-slate-800">M {mag}</strong>
                          <span className="text-[10px] text-slate-500">{eq.properties.place}</span>
                          <span className="block text-[9px] text-slate-400 mt-1">{new Date(eq.properties.time).toLocaleString()}</span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
