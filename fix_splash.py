new_splash_code = '''import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SplashScreen() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Fade in on mount
    setOpacity(1);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-[#FAF9F6] flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-in-out"
      style={{ opacity }}
    >
      {/* Decorative Tricolour top/bottom bars */}
      <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative mb-6">
          <div className="relative w-32 h-32 bg-white rounded-full p-2.5 shadow-md border-4 border-slate-100/80 overflow-hidden flex items-center justify-center">
            <img 
              src="/assets/logo.png" 
              alt="RP Foundation Official Logo" 
              className="w-full h-full object-contain bg-white rounded-full"
            />
          </div>
        </div>

        {/* Text and Title */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-2xl font-display font-black text-[#1C2D42] tracking-widest uppercase">
            RP FOUNDATION
          </h1>
          <p className="text-[#F26522] text-xs uppercase tracking-[0.18em] font-black">
            Official Citizen Portal
          </p>
          <span className="font-sans text-[8.5px] font-black text-[#2D884D] tracking-widest uppercase block mt-1">
            सेवा • समर्पण • संकल्प
          </span>
        </div>

        {/* Spinner */}
        <Loader2 className="w-7 h-7 text-[#2D884D] animate-spin opacity-80" />
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center opacity-80">
        <div className="flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 text-[#F26522] animate-spin" />
          <span className="text-[9px] text-[#1C2D42]/60 font-mono tracking-widest uppercase font-bold">Initializing Core Services...</span>
        </div>
      </div>
    </div>
  );
}
'''

with open('src/components/SplashScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(new_splash_code)

print('Updated SplashScreen.tsx')
