import React, { useState, useEffect } from "react";
import { Sunrise, Sunset, Moon, Clock, Calendar, Star, Sun } from "lucide-react";

export default function DrikPanchang({ lang }: { lang: "en" | "hi" }) {
  const isHi = lang === "hi";
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedTime = currentDate.toLocaleTimeString(isHi ? 'hi-IN' : 'en-US', timeOptions);
  
  const todayDate = currentDate.toLocaleDateString(isHi ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-20 transform translate-x-4 -translate-y-4">
          <Sun className="w-32 h-32 animate-spin-slow" />
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <h3 className="font-display font-black text-2xl drop-shadow-md">
              {isHi ? "दैनिक पंचांग" : "Daily Panchang"}
            </h3>
            <div className="flex items-center gap-2 mt-2 opacity-90 text-sm font-bold">
              <Calendar className="w-4 h-4" />
              <span>{todayDate}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 opacity-90 text-sm font-bold">
              <Clock className="w-4 h-4" />
              <span>{formattedTime}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/40 shadow-inner">
              {isHi ? "विक्रम संवत 2083" : "Vikram Samvat 2083"}
            </span>
          </div>
        </div>
      </div>

      {/* Astro Data Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
            <Sunrise className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{isHi ? "सूर्योदय" : "Sunrise"}</p>
            <p className="font-black text-slate-800 text-sm">05:48 AM</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex items-center gap-3">
          <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
            <Sunset className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{isHi ? "सूर्यास्त" : "Sunset"}</p>
            <p className="font-black text-slate-800 text-sm">06:42 PM</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{isHi ? "चंद्रोदय" : "Moonrise"}</p>
            <p className="font-black text-slate-800 text-sm">08:15 PM</p>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-sm flex items-center gap-3">
          <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{isHi ? "नक्षत्र" : "Nakshatra"}</p>
            <p className="font-black text-slate-800 text-sm">{isHi ? "रोहिणी" : "Rohini"}</p>
          </div>
        </div>
      </div>

      {/* Auspicious / Inauspicious Timings */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h4 className="font-display font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
          {isHi ? "शुभ और अशुभ मुहूर्त" : "Auspicious & Inauspicious Timings"}
        </h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2.5 bg-green-50 border border-green-100 rounded-lg">
            <div>
              <p className="text-xs font-black text-green-800">{isHi ? "अभिजित मुहूर्त (शुभ)" : "Abhijit Muhurat (Auspicious)"}</p>
              <p className="text-[10px] text-green-600 font-bold">{isHi ? "कोई भी शुभ कार्य करने का समय" : "Good time for new beginnings"}</p>
            </div>
            <span className="text-xs font-black text-green-700 bg-white px-2 py-1 rounded-md shadow-sm">11:58 AM - 12:49 PM</span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-red-50 border border-red-100 rounded-lg">
            <div>
              <p className="text-xs font-black text-red-800">{isHi ? "राहु काल (अशुभ)" : "Rahu Kalam (Inauspicious)"}</p>
              <p className="text-[10px] text-red-600 font-bold">{isHi ? "शुभ कार्यों से बचें" : "Avoid starting auspicious work"}</p>
            </div>
            <span className="text-xs font-black text-red-700 bg-white px-2 py-1 rounded-md shadow-sm">10:45 AM - 12:15 PM</span>
          </div>
          <div className="flex justify-between items-center p-2.5 bg-orange-50 border border-orange-100 rounded-lg">
            <div>
              <p className="text-xs font-black text-orange-800">{isHi ? "यमगण्ड (अशुभ)" : "Yamaganda (Inauspicious)"}</p>
            </div>
            <span className="text-xs font-black text-orange-700 bg-white px-2 py-1 rounded-md shadow-sm">03:15 PM - 04:45 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
