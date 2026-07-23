import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SplashScreen() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in on mount
    setOpacity(1);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-in-out"
      style={{ opacity }}
    >
      {/* Decorative Tricolour top bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-tricolour"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-8">
          <div className="relative w-36 h-36 bg-white rounded-full p-2 shadow-tricolour border-4 border-slate-100 overflow-hidden">
            <img 
              src="/assets/logo.png" 
              alt="RP Foundation Official Logo" 
              className="w-full h-full object-contain bg-white rounded-full"
            />
          </div>
        </div>

        {/* Text and Title */}
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-2xl font-display font-black text-[#000080] tracking-widest">
            RP FOUNDATION
          </h1>
          <p className="text-[#FF9933] text-xs uppercase tracking-[0.2em] font-bold">
            Official Citizen Portal
          </p>
        </div>

        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-[#138808] animate-spin opacity-80" />
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center opacity-70">
        <div className="flex items-center gap-2 mb-1">
          <img src="/assets/logo.png" className="w-4 h-4 grayscale" alt="Gov" />
          
        </div>
        <div className="flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 text-[#FF9933] animate-spin" />
          <span className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">Initializing Core Services...</span>
        </div>
      </div>
    </div>
  );
}
