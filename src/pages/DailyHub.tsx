import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Activity, ArrowRight, CloudSun, HeartPulse, Leaf, Newspaper, Radio, Sparkles, SunMedium, Thermometer, Wind } from "lucide-react";

type Lang = "en" | "hi";
type WeatherState = { temperature: number; apparent: number; humidity: number; wind: number; aqi: number | null };

const cards = [
  { id: "news", icon: Newspaper, titleEn: "News", titleHi: "समाचार", descEn: "Stay informed with current stories.", descHi: "ताज़ा समाचार और महत्वपूर्ण जानकारी।", route: "/news" },
  { id: "culture", icon: Sparkles, titleEn: "Culture & Spirituality", titleHi: "संस्कृति और अध्यात्म", descEn: "Festivals, calendar and cultural content.", descHi: "त्योहार, कैलेंडर और सांस्कृतिक जानकारी।", route: "/culture" },
  { id: "health", icon: HeartPulse, titleEn: "Health Hub", titleHi: "स्वास्थ्य केंद्र", descEn: "Health information and community care.", descHi: "स्वास्थ्य जानकारी और सामुदायिक सहायता।", route: "/health-care" },
  { id: "radio", icon: Radio, titleEn: "Radio", titleHi: "रेडियो", descEn: "Listen to the available live stream.", descHi: "उपलब्ध लाइव रेडियो स्ट्रीम सुनें।", route: "/internet-radio" },
];

export default function DailyHub() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const loadWeather = (lat: number, lon: number) => {
    setLoading(true);
    setLocationError(false);
    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&timezone=auto`).then((r) => r.ok ? r.json() : null),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5&timezone=auto`).then((r) => r.ok ? r.json() : null),
      fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`).then((r) => r.ok ? r.json() : null),
    ]).then(([forecast, air, geo]) => {
      if (!forecast?.current) throw new Error("weather unavailable");
      setWeather({
        temperature: Number(forecast.current.temperature_2m),
        apparent: Number(forecast.current.apparent_temperature),
        humidity: Number(forecast.current.relative_humidity_2m),
        wind: Number(forecast.current.wind_speed_10m),
        aqi: air?.current?.pm2_5 == null ? null : Number(air.current.pm2_5),
      });
      setPlace(geo?.results?.[0]?.name || "");
    }).catch(() => setLocationError(true)).finally(() => setLoading(false));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocationError(true); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => loadWeather(position.coords.latitude, position.coords.longitude),
      () => setLocationError(true),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 15 * 60 * 1000 },
    );
  };

  useEffect(() => { requestLocation(); }, []);

  const aqiLabel = weather?.aqi == null ? (lang === "hi" ? "उपलब्ध नहीं" : "Unavailable") : weather.aqi <= 30 ? (lang === "hi" ? "अच्छी हवा" : "Good air") : weather.aqi <= 60 ? (lang === "hi" ? "संतोषजनक" : "Fair") : weather.aqi <= 90 ? (lang === "hi" ? "सावधानी" : "Caution") : (lang === "hi" ? "खराब हवा" : "Poor air");

  return (
    <main className="min-h-full bg-slate-50 pb-10">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <section className="rounded-[28px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/10 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-slate-400"><Sparkles className="h-4 w-4" /> {lang === "hi" ? "आज आपके लिए" : "Today for you"}</div>
          <h1 className="mt-3 text-3xl font-black tracking-tight">{lang === "hi" ? "आपका दैनिक उपयोग" : "Your daily utility"}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{lang === "hi" ? "मौसम, वायु गुणवत्ता और आपकी रोज़मर्रा की उपयोगी सेवाएं—एक ही जगह।" : "Weather, air quality and everyday services in one calm, useful space."}</p>
        </section>

        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400"><CloudSun className="h-4 w-4" /> Weather</div>
            {weather ? <><div className="mt-3 flex items-end gap-2"><span className="text-4xl font-black tracking-tight">{Math.round(weather.temperature)}°</span><span className="pb-1 text-sm font-semibold text-slate-500">{place}</span></div><p className="mt-2 text-xs text-slate-500">Feels {Math.round(weather.apparent)}° · {weather.humidity}% humidity · {Math.round(weather.wind)} km/h wind</p></> : <div className="mt-4"><p className="text-sm font-semibold text-slate-700">{loading ? (lang === "hi" ? "स्थान की जानकारी ली जा रही है…" : "Getting your location…") : (lang === "hi" ? "मौसम देखने के लिए स्थान साझा करें" : "Share location to see local weather")}</p><button onClick={requestLocation} className="mt-3 rounded-xl bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-white">{lang === "hi" ? "स्थान साझा करें" : "Use location"}</button></div>}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400"><Wind className="h-4 w-4" /> AQI</div>
            <p className="mt-3 text-4xl font-black tracking-tight">{weather?.aqi == null ? "—" : Math.round(weather.aqi)}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600">{aqiLabel}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{lang === "hi" ? "यह सार्वजनिक मौसम/AQI सेवा से प्राप्त वर्तमान PM2.5 संकेतक है।" : "Current PM2.5 indicator from a public weather/air-quality service."}</p>
          </div>
        </section>

        {locationError && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-900">{lang === "hi" ? "स्थान या मौसम सेवा उपलब्ध नहीं है। बाद में फिर प्रयास करें।" : "Location or weather service is unavailable. Try again later."}</div>}

        <section className="mt-7"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{lang === "hi" ? "प्रीमियम सेवाएं" : "Premium services"}</p><h2 className="mt-1 text-base font-black">{lang === "hi" ? "जानें और जुड़ें" : "Discover and connect"}</h2></div></div>
          <div className="grid gap-3 sm:grid-cols-2">{cards.map(({ id, icon: Icon, titleEn, titleHi, descEn, descHi, route }) => <button key={id} onClick={() => navigate(route)} className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-slate-900">{lang === "hi" ? titleHi : titleEn}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{lang === "hi" ? descHi : descEn}</span></span><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1" /></button>)}</div>
        </section>

        <section className="mt-7 grid gap-3 sm:grid-cols-2">
          <button onClick={() => navigate("/blood-network")} className="flex items-center justify-between rounded-2xl bg-rose-50 p-5 text-left text-rose-950"><span><span className="block text-sm font-black">{lang === "hi" ? "Blood Network" : "Blood Network"}</span><span className="mt-1 block text-xs text-rose-700">{lang === "hi" ? "जरूरत हो तो अनुरोध करें या मदद करें।" : "Request blood or offer help when needed."}</span></span><HeartPulse className="h-5 w-5" /></button>
          <button onClick={() => navigate("/services")} className="flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-left text-white"><span><span className="block text-sm font-black">{lang === "hi" ? "सभी सेवाएं" : "All services"}</span><span className="mt-1 block text-xs text-slate-400">{lang === "hi" ? "सभी उपलब्ध सेवाओं को देखें।" : "Browse every currently available service."}</span></span><ArrowRight className="h-5 w-5" /></button>
        </section>
      </div>
    </main>
  );
}
