import React, { useEffect, useState } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";

export default function DynamicWeather({ weather, lang }: { weather: any, lang: "hi" | "en" }) {
  const isHi = lang === "hi";
  
  // Fake weather state to show cool animations, based on temp or random
  const temp = weather?.current_weather?.temperature || 25;
  const wind = weather?.current_weather?.windspeed || 12;
  const isRaining = weather?.daily?.precipitation_sum?.[0] > 0 || temp < 20;

  // Background and icons dynamically change
  const bgClass = isRaining 
    ? "bg-gradient-to-br from-slate-700 to-slate-900" 
    : "bg-gradient-to-br from-blue-400 to-blue-600";
    
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${bgClass} transition-colors duration-1000`}>
      {/* Weather Animations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        {isRaining ? (
          <div className="absolute inset-0">
            {/* Simple CSS rain simulation using repeating linear gradients and animation */}
            <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0)_0%,rgba(255,255,255,0.4)_100%)] bg-[length:2px_50px] animate-rain"></div>
          </div>
        ) : (
          <div className="absolute top-0 right-0 p-4 animate-spin-slow">
            <Sun className="w-32 h-32 text-yellow-300 opacity-20" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-black text-xl drop-shadow-md">
              {isHi ? "भोपाल, म.प्र." : "Bhopal, MP"}
            </h3>
            <p className="text-xs font-bold text-white/80 uppercase tracking-widest mt-1">
              {isRaining ? (isHi ? "भारी बारिश" : "Heavy Rain") : (isHi ? "साफ मौसम" : "Clear Sky")}
            </p>
          </div>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30">
            {isRaining ? <CloudRain className="w-6 h-6 text-white" /> : <Sun className="w-6 h-6 text-yellow-300" />}
          </div>
        </div>

        <div className="mt-6 flex justify-between items-end">
          <div className="flex items-start">
            <span className="text-5xl font-black drop-shadow-lg leading-none">{temp}</span>
            <span className="text-xl font-bold mt-1">°C</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
              <Wind className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{wind} km/h</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10">
              <Droplets className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">{isRaining ? "85%" : "45%"} {isHi ? "नमी" : "Hum"}</span>
            </div>
          </div>
        </div>

        {/* Agri-Advisory Alert */}
        <div className="mt-4 bg-white/10 border border-white/20 p-3 rounded-xl backdrop-blur-md">
          <p className="text-[10px] font-bold leading-tight">
            <span className="text-yellow-300 font-black mr-1">{isHi ? "⚠️ कृषि सलाह:" : "⚠️ Agri-Advisory:"}</span>
            {isRaining 
              ? (isHi ? "अगले 24 घंटे खेतों में कीटनाशक का छिड़काव न करें।" : "Do not spray pesticides for the next 24 hours.")
              : (isHi ? "फसलों में पर्याप्त सिंचाई बनाए रखें।" : "Maintain adequate irrigation for crops.")}
          </p>
        </div>
      </div>
    </div>
  );
}
