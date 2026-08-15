import { useEffect, useState } from "react";
import { ArrowRight, CloudSun, HeartPulse, Newspaper, Radio, Sparkles, Wind, RefreshCw, MapPin } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";
type WeatherState = { temperature: number; apparent: number; humidity: number; wind: number; aqi: number | null; place: string; source: "live" | "cached" };

const WAQI_TOKEN = "83274cc3f5749b4ec7b5b6c7b9f40464debbd6b1";
const CACHE_KEY = "rpf_local_weather_v2";
const cards = [
  { id: "news", icon: Newspaper, titleEn: "News", titleHi: "समाचार", descEn: "Stay informed with current stories.", descHi: "ताज़ा समाचार और महत्वपूर्ण जानकारी।", route: "/news", tone: "indigo" },
  { id: "culture", icon: Sparkles, titleEn: "Culture & Spirituality", titleHi: "संस्कृति और अध्यात्म", descEn: "Festivals, calendar and cultural content.", descHi: "त्योहार, कैलेंडर और सांस्कृतिक जानकारी।", route: "/culture", tone: "saffron" },
  { id: "health", icon: HeartPulse, titleEn: "Health Hub", titleHi: "स्वास्थ्य केंद्र", descEn: "Health information and community care.", descHi: "स्वास्थ्य जानकारी और सामुदायिक सहायता।", route: "/health-care", tone: "rose" },
  { id: "radio", icon: Radio, titleEn: "Radio", titleHi: "रेडियो", descEn: "Listen to the available live stream.", descHi: "उपलब्ध लाइव रेडियो स्ट्रीम सुनें।", route: "/internet-radio", tone: "green" },
];
const tones: Record<string, string> = { indigo: "bg-blue-50 text-[#000080] ring-blue-100", saffron: "bg-orange-50 text-[#FF9933] ring-orange-100", rose: "bg-rose-50 text-rose-700 ring-rose-100", green: "bg-green-50 text-[#138808] ring-green-100" };

function readCachedWeather(): WeatherState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) return null;
    return { ...parsed.data, source: "cached" };
  } catch { return null; }
}

function saveCachedWeather(data: Omit<WeatherState, "source">) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data })); } catch { /* storage may be unavailable */ }
}

export default function DailyHub() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherState | null>(readCachedWeather);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = (lat: number, lon: number) => {
    setLoading(true);
    setError(false);
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&timezone=auto`;
    const aqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${WAQI_TOKEN}`;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;

    Promise.allSettled([fetch(weatherUrl).then((r) => r.ok ? r.json() : null), fetch(aqiUrl).then((r) => r.ok ? r.json() : null), fetch(geoUrl).then((r) => r.ok ? r.json() : null)])
      .then(([wf, af, gf]) => {
        const f = wf.status === "fulfilled" ? wf.value : null;
        const a = af.status === "fulfilled" ? af.value : null;
        const g = gf.status === "fulfilled" ? gf.value : null;
        if (!f?.current) throw new Error("weather unavailable");
        const next = {
          temperature: Number(f.current.temperature_2m),
          apparent: Number(f.current.apparent_temperature),
          humidity: Number(f.current.relative_humidity_2m),
          wind: Number(f.current.wind_speed_10m),
          aqi: a?.status === "ok" && a?.data?.aqi != null ? Number(a.data.aqi) : null,
          place: g?.results?.[0]?.name || "",
        };
        setWeather({ ...next, source: "live" });
        saveCachedWeather(next);
      })
      .catch(() => {
        const cached = readCachedWeather();
        if (cached) setWeather(cached);
        else setError(true);
      })
      .finally(() => setLoading(false));
  };

  const location = () => {
    setError(false);
    if (!navigator.geolocation) { setError(true); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => load(p.coords.latitude, p.coords.longitude),
      () => { setLoading(false); const cached = readCachedWeather(); if (cached) setWeather(cached); else setError(true); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 900000 }
    );
  };

  useEffect(() => { location(); }, []);

  const aqiLabel = weather?.aqi == null ? (lang === "hi" ? "उपलब्ध नहीं" : "Unavailable") : weather.aqi <= 50 ? (lang === "hi" ? "अच्छी हवा" : "Good air") : weather.aqi <= 100 ? (lang === "hi" ? "संतोषजनक" : "Moderate") : weather.aqi <= 200 ? (lang === "hi" ? "संवेदनशील लोगों के लिए सावधानी" : "Unhealthy for sensitive groups") : weather.aqi <= 300 ? (lang === "hi" ? "खराब हवा" : "Unhealthy") : (lang === "hi" ? "बहुत खराब हवा" : "Very unhealthy");

  return <main className="min-h-full bg-white pb-10"><div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5">
    <section className="relative overflow-hidden rounded-[26px] border border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-green-50 p-5 text-[#000080] shadow-sm sm:p-7">
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-300/20 blur-3xl"/><div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-green-300/20 blur-3xl"/>
      <div className="relative"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]"><Sparkles className="h-3.5 w-3.5"/>{lang === "hi" ? "आज आपके लिए" : "Today for you"}</div><h1 className="mt-2.5 text-[27px] font-black leading-tight sm:text-4xl">{lang === "hi" ? "आपका दैनिक उपयोग" : "Your daily utility"}</h1><p className="mt-2 max-w-xl text-[13px] leading-5.5 text-slate-600 sm:text-sm sm:leading-6">{lang === "hi" ? "मौसम, वायु गुणवत्ता और आपकी रोज़मर्रा की उपयोगी सेवाएं—एक ही जगह।" : "Weather, air quality and everyday services in one calm, useful space."}</p></div>
    </section>

    <section className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#FF9933]"><CloudSun className="h-4 w-4"/>Weather</div>
        {weather ? <><div className="mt-3 flex items-end gap-2"><span className="text-[36px] font-black text-[#000080]">{Math.round(weather.temperature)}°</span><span className="pb-1 text-[13px] font-semibold text-slate-500">{weather.place}</span></div><p className="mt-2 text-[10px] text-slate-500">Feels {Math.round(weather.apparent)}° · {weather.humidity}% humidity · {Math.round(weather.wind)} km/h wind</p><p className="mt-2 text-[9px] font-semibold text-slate-400">{weather.source === "cached" ? (lang === "hi" ? "पिछली सफल जानकारी दिखाई जा रही है" : "Showing the last successfully saved reading") : (lang === "hi" ? "लाइव मौसम जानकारी" : "Live weather data")}</p></> : <div className="mt-4"><p className="text-[13px] font-semibold text-slate-700">{loading ? (lang === "hi" ? "फोन की लोकेशन से मौसम खोज रहे हैं…" : "Using your phone location to find local weather…") : (lang === "hi" ? "स्थानीय मौसम देखने के लिए स्थान साझा करें" : "Share your location to see local weather")}</p><button onClick={location} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF9933] px-4 py-2.5 text-[12px] font-bold text-white"><MapPin className="h-4 w-4"/>{lang === "hi" ? "स्थान उपयोग करें" : "Use location"}</button></div>}
      </div>
      <div className="rounded-2xl border border-green-100 bg-green-50/60 p-4 shadow-sm"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#138808]"><Wind className="h-4 w-4"/>AQI</div><p className="mt-3 text-[36px] font-black text-[#000080]">{weather?.aqi == null ? "—" : Math.round(weather.aqi)}</p><p className="mt-1 text-[13px] font-semibold text-green-900">{aqiLabel}</p><p className="mt-2 text-[10px] leading-5 text-green-800/70">{lang === "hi" ? "AQI उपलब्ध न होने पर पिछली सफल reading रखी जाती है। फोन स्वयं AQI माप नहीं करता।" : "If live AQI is unavailable, the last successful reading is retained. Phones do not directly measure AQI."}</p></div>
    </section>

    <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-500"><span>{lang === "hi" ? "Weather/AQI API उपलब्ध न हो तो location + saved reading fallback सक्रिय है।" : "If weather/AQI APIs fail, location plus the saved reading fallback is used."}</span><button onClick={location} aria-label="Refresh weather" className="ml-3 rounded-lg p-2 text-[#000080] hover:bg-blue-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}/></button></div>
    {error && <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-[11px] font-semibold text-orange-900">{lang === "hi" ? "लाइव मौसम उपलब्ध नहीं है और अभी कोई saved reading भी नहीं मिली। इंटरनेट आने पर फिर प्रयास करें।" : "Live weather is unavailable and no saved reading is available yet. Try again when the internet is available."}</div>}

    <section className="mt-6"><div className="mb-3"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{lang === "hi" ? "प्रीमियम सेवाएं" : "Premium services"}</p><h2 className="mt-1 text-[15px] font-black text-[#000080]">{lang === "hi" ? "जानें और जुड़ें" : "Discover and connect"}</h2></div><div className="grid gap-3 sm:grid-cols-2">{cards.map(({id,icon:Icon,titleEn,titleHi,descEn,descHi,route,tone})=><button key={id} onClick={()=>navigate(route)} className="group flex min-h-[88px] items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}><Icon className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black text-slate-900">{lang === "hi" ? titleHi : titleEn}</span><span className="mt-1 block text-[10px] leading-5 text-slate-500">{lang === "hi" ? descHi : descEn}</span></span><ArrowRight className="mt-1 h-4 w-4 text-slate-300"/></button>)}</div></section>
    <section className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={()=>navigate("/blood-network")} className="flex min-h-[78px] items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-left text-rose-950"><span><span className="block text-[13px] font-black">Blood Network</span><span className="mt-1 block text-[10px] text-rose-700">{lang === "hi" ? "जरूरत हो तो अनुरोध करें या मदद करें।" : "Request blood or offer help when needed."}</span></span><HeartPulse className="h-5 w-5 text-rose-700"/></button><button onClick={()=>navigate("/services")} className="flex min-h-[78px] items-center justify-between rounded-2xl border border-green-200 bg-gradient-to-r from-[#000080] via-[#12358f] to-[#138808] p-4 text-left text-white shadow-sm"><span><span className="block text-[13px] font-black">{lang === "hi" ? "सभी सेवाएं" : "All services"}</span><span className="mt-1 block text-[10px] text-white/85">{lang === "hi" ? "सभी उपलब्ध सेवाओं को देखें।" : "Browse every currently available service."}</span></span><ArrowRight className="h-5 w-5"/></button></section>
  </div></main>;
}