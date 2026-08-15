import React from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";

export default function DynamicWeather({ weather, lang }: { weather: any; lang: "hi" | "en" }) {
  const isHi = lang === "hi";
  const current = weather?.current_weather || weather?.current || null;

  // Never invent weather values. If the upstream source has no reading,
  // render an unavailable state instead of showing a fake 25°C/12 km/h value.
  const temp = Number.isFinite(Number(current?.temperature)) ? Number(current.temperature) : null;
  const wind = Number.isFinite(Number(current?.windspeed)) ? Number(current.windspeed) : null;
  const humidity = Number.isFinite(Number(current?.relative_humidity_2m)) ? Number(current.relative_humidity_2m) : null;
  const isRaining = Boolean(weather?.daily?.precipitation_sum?.[0] > 0 || weather?.current?.weather_code >= 51);
  const available = temp !== null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-green-50 p-5 text-[#000080] shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" aria-hidden="true" />
      <div className="pointer-events-none absolute right-0 top-0 p-4 opacity-10">
        {isRaining ? <CloudRain className="h-32 w-32 text-[#000080]" /> : <Sun className="h-32 w-32 text-[#FF9933]" />}
      </div>

      <div className="relative z-10 flex min-h-[210px] flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-black">{weather?.place || (isHi ? "आपका स्थान" : "Your location")}</h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500">
              {available ? (isRaining ? (isHi ? "बारिश" : "Rain") : (isHi ? "वर्तमान मौसम" : "Current weather")) : (isHi ? "मौसम उपलब्ध नहीं" : "Weather unavailable")}
            </p>
          </div>
          <div className="rounded-xl border border-orange-100 bg-white/80 p-2 shadow-sm">
            {isRaining ? <CloudRain className="h-6 w-6 text-[#000080]" /> : <Sun className="h-6 w-6 text-[#FF9933]" />}
          </div>
        </div>

        {available ? (
          <div className="mt-6 flex items-end justify-between">
            <div className="flex items-start">
              <span className="text-5xl font-black leading-none">{Math.round(temp)}</span>
              <span className="mt-1 text-xl font-bold">°C</span>
            </div>
            <div className="flex flex-col gap-2">
              {wind !== null && <div className="flex items-center gap-1.5 rounded-lg bg-[#000080]/5 px-2 py-1"><Wind className="h-3.5 w-3.5" /><span className="text-[10px] font-bold">{Math.round(wind)} km/h</span></div>}
              {humidity !== null && <div className="flex items-center gap-1.5 rounded-lg bg-[#138808]/5 px-2 py-1"><Droplets className="h-3.5 w-3.5 text-[#138808]" /><span className="text-[10px] font-bold">{Math.round(humidity)}% {isHi ? "नमी" : "Humidity"}</span></div>}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-orange-100 bg-white/80 p-4 text-sm font-semibold text-slate-600">
            {isHi ? "लाइव मौसम डेटा उपलब्ध नहीं है। फोन की लोकेशन और saved reading fallback का उपयोग किया जा सकता है।" : "Live weather data is unavailable. The app can use phone location and a saved reading as fallback."}
          </div>
        )}

        <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-3 backdrop-blur-md">
          <p className="text-[10px] font-bold leading-tight text-slate-600">
            <span className="mr-1 font-black text-[#FF9933]">{isHi ? "ℹ️ जानकारी:" : "ℹ️ Info:"}</span>
            {isHi ? "फोन की लोकेशन मौसम का स्थान बताती है; सामान्य मोबाइल फोन स्वयं वर्तमान मौसम या AQI को विश्वसनीय रूप से माप नहीं सकते।" : "Phone location identifies the place; ordinary phones do not reliably measure current weather or AQI themselves."}
          </p>
        </div>
      </div>
    </div>
  );
}