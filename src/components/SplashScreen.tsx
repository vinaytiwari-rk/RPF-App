import React, { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    setOpacity(1);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-[#FFEBD6] via-[#FFFDFB] to-[#E8F8EE] flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 ease-in-out overflow-hidden"
      style={{ opacity }}
    >
      <style>{`
        @keyframes spin-chakra {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes logo-zoom-settle {
          0% { transform: scale(2.2); opacity: 0; filter: blur(6px); }
          75% { transform: scale(0.96); opacity: 1; filter: blur(0); }
          100% { transform: scale(1.0); opacity: 1; }
        }

        @keyframes float-particle {
          0% { transform: translateY(105vh) translateX(0); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-10vh) translateX(30px); opacity: 0; }
        }
      `}</style>

      {/* Decorative Tricolour top/bottom bars */}
      <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      {/* Floating Traditional Particles (Tricolor confetti) */}
      {[...Array(12)].map((_, i) => {
        const colors = ["#FF9933", "#FFFFFF", "#138808"];
        const color = colors[i % 3];
        const delay = i * 1.5;
        const size = 5 + (i % 3) * 4;
        const left = 5 + (i * 8.5) % 90;
        return (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none shadow-xs"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              left: `${left}%`,
              animation: `float-particle 11s linear infinite`,
              animationDelay: `${delay}s`,
              bottom: '-20px'
            }}
          />
        );
      })}

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Container with Zoom-In Bounce Animation */}
        <div 
          className="relative mb-8 bg-white rounded-full p-2.5 shadow-2xl border-4 border-white overflow-hidden flex items-center justify-center"
          style={{ 
            width: '128px', 
            height: '128px',
            animation: 'logo-zoom-settle 1.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}
        >
          <img 
            src="/assets/logo.png" 
            alt="RP Foundation Official Logo" 
            className="w-full h-full object-contain bg-white rounded-full"
          />
        </div>

        {/* Text and Title */}
        <div className="text-center space-y-2.5 mb-8">
          <h1 className="text-2xl font-display font-black text-[#1C2D42] tracking-widest uppercase">
            RP FOUNDATION
          </h1>
          <p className="text-[#FF9933] text-sm uppercase tracking-[0.2em] font-black drop-shadow-xs">
            RPF Jan Seva App
          </p>
          <span className="font-sans text-[10px] font-black text-[#138808] tracking-widest uppercase block mt-1">
            सेवा • समर्पण • संकल्प
          </span>
        </div>

        {/* Ashoka Chakra Loading Spinner */}
        <div 
          className="w-12 h-12 text-[#000080] flex items-center justify-center mb-4"
          style={{ animation: 'spin-chakra 5s linear infinite' }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.25"/>
            <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
            {[...Array(24)].map((_, i) => (
              <line
                key={i}
                x1="12"
                y1="12"
                x2={12 + 10 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={12 + 10 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="currentColor"
                strokeWidth="0.4"
              />
            ))}
          </svg>
        </div>

        {/* Vande Mataram under the wheel */}
        <span className="text-[18px] text-[#000080] font-sans tracking-widest font-black uppercase animate-pulse">
          वंदे मातरम
        </span>
      </div>
    </div>
  );
}
