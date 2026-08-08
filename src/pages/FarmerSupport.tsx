import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, Sprout, TrendingUp, TrendingDown, CloudRain, Droplet } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function FarmerSupport() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userLocation } = useApp();
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [fuel, setFuel] = useState<any>(null);
  const [fuelLoading, setFuelLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mandi-prices")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrices(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
      
    // Fetch Weather
    const lat = userLocation?.latitude || "23.2599";
    const lon = userLocation?.longitude || "77.4126";
    fetch(`/api/public/weather?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWeather(data.data);
        }
        setWeatherLoading(false);
      })
      .catch(err => {
        console.error(err);
        setWeatherLoading(false);
      });

    // Fetch Fuel Prices
    fetch("/api/public/fuel-prices")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFuel(data.data);
        }
        setFuelLoading(false);
      })
      .catch(err => {
        console.error(err);
        setFuelLoading(false);
      });
  }, [userLocation]);

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800 animate-fadeIn">
      <div className="bg-green-700 text-white px-4 py-3 flex items-center shadow-md sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-white/10 transition active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-lg">{isHi ? "किसान सहायता" : "Farmer Support"}</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        <div className="bg-white border border-green-200 p-4 rounded-xl shadow-sm">
           <div className="flex items-center gap-2 mb-3">
             <Sprout className="w-6 h-6 text-green-600" />
             <h3 className="font-black text-green-800">{isHi ? "मंडी भाव (लाइव)" : "Live Mandi Prices"}</h3>
           </div>
           
           {loading ? (
             <p className="text-xs text-slate-500 font-semibold animate-pulse">{isHi ? "मंडी भाव लोड हो रहे हैं..." : "Loading latest Mandi prices..."}</p>
           ) : (
             <div className="space-y-2">
               {prices.map((item, idx) => {
                 const isUp = item.trend.startsWith("+");
                 return (
                   <div key={idx} className="flex items-center justify-between p-2.5 bg-green-50/50 rounded-lg border border-green-100">
                     <span className="text-xs font-bold text-slate-800">{isHi ? item.commodityHi : item.commodityEn}</span>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-green-700">₹{item.livePrice}</span>
                       <span className={`flex items-center text-[10px] font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                         {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                         {item.trend}
                       </span>
                     </div>
                   </div>
                 );
               })}
               <p className="text-[9px] text-slate-400 mt-2 text-center">
                 {isHi ? "स्रोत: कृषि उपज मंडी समिति (फ्री पोर्टल)" : "Source: Krishi Upaj Mandi Samiti (Free API)"}
               </p>
             </div>
           )}
        </div>

        {/* Live Weather Forecast */}
        <div className="bg-white border border-blue-200 p-4 rounded-xl shadow-sm">
           <div className="flex items-center gap-2 mb-3">
             <CloudRain className="w-6 h-6 text-blue-500" />
             <h3 className="font-black text-blue-800">{isHi ? "IMD मौसम (आपके क्षेत्र में)" : "IMD Weather (Your Area)"}</h3>
           </div>
           
           {weatherLoading ? (
             <p className="text-xs text-slate-500 font-semibold animate-pulse">{isHi ? "मौसम की जानकारी लोड हो रही है..." : "Loading weather info..."}</p>
           ) : weather ? (
             <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-lg border border-blue-100">
               <div>
                 <p className="text-2xl font-black text-slate-800">
                   {weather.current_weather?.temperature}°C
                 </p>
                 <p className="text-[10px] font-bold text-slate-500">
                   {userLocation?.city ? `${userLocation.city}, ${userLocation.region}` : (isHi ? "भोपाल, मध्य प्रदेश" : "Bhopal, MP")}
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-[11px] font-bold text-slate-700">
                   {isHi ? "हवा की गति:" : "Wind:"} {weather.current_weather?.windspeed} km/h
                 </p>
                 <p className="text-[11px] font-bold text-blue-600 mt-0.5">
                   {isHi ? "वर्षा:" : "Precipitation:"} {weather.daily?.precipitation_sum?.[0] || 0} mm
                 </p>
               </div>
             </div>
           ) : (
             <p className="text-xs text-red-500 font-semibold">{isHi ? "मौसम डेटा उपलब्ध नहीं है" : "Weather data unavailable"}</p>
           )}
           <p className="text-[9px] text-slate-400 mt-2 text-center">
             {isHi ? "स्रोत: भारतीय मौसम विज्ञान विभाग (IMD) / Open-Meteo" : "Source: IMD / Open-Meteo Aggregation"}
           </p>
        </div>

         {/* Fuel Prices Widget */}
         <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Droplet className="w-6 h-6 text-amber-500" />
              <h3 className="font-black text-amber-800">{isHi ? "आज के ईंधन भाव (पेट्रोल/डीजल)" : "Today's Fuel Prices"}</h3>
            </div>
            
            {fuelLoading ? (
              <p className="text-xs text-slate-500 font-semibold animate-pulse">{isHi ? "ईंधन के भाव लोड हो रहे हैं..." : "Loading fuel prices..."}</p>
            ) : fuel ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isHi ? "पेट्रोल (Petrol)" : "Petrol"}</p>
                  <p className="text-xl font-black text-slate-800 mt-1">₹{fuel.petrol}</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{fuel.city}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{isHi ? "डीजल (Diesel)" : "Diesel"}</p>
                  <p className="text-xl font-black text-slate-800 mt-1">₹{fuel.diesel}</p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{fuel.city}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500 font-semibold">{isHi ? "ईंधन भाव उपलब्ध नहीं हैं" : "Fuel prices unavailable"}</p>
            )}
         </div>
      </div>
    </div>
  );
}
