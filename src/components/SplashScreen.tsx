import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const WavingFlag = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 60 40" className={className} style={style}>
    {/* Saffron */}
    <path d="M 0 0 Q 15 -5, 30 0 T 60 0 L 60 12 Q 45 7, 30 12 T 0 12 Z" fill="#FF9933" />
    {/* White */}
    <path d="M 0 12 Q 15 7, 30 12 T 60 12 L 60 24 Q 45 19, 30 24 T 0 24 Z" fill="#FFFFFF" />
    {/* Green */}
    <path d="M 0 24 Q 15 19, 30 24 T 60 24 L 60 36 Q 45 31, 30 36 T 0 36 Z" fill="#138808" />
    {/* Ashoka Chakra */}
    <circle cx="30" cy="18" r="4.5" fill="none" stroke="#000080" strokeWidth="0.6" />
    {[...Array(24)].map((_, i) => (
      <line
        key={i}
        x1="30"
        y1="18"
        x2={30 + 4.5 * Math.cos((i * 15 * Math.PI) / 180)}
        y2={18 + 4.5 * Math.sin((i * 15 * Math.PI) / 180)}
        stroke="#000080"
        strokeWidth="0.3"
      />
    ))}
  </svg>
);

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
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes wave-left {
          0%, 100% { transform: translateY(0) scale(1) rotate(-8deg); }
          50% { transform: translateY(-12px) scale(1.05) rotate(4deg); }
        }
        @keyframes wave-right {
          0%, 100% { transform: translateY(0) scale(1) rotate(8deg); }
          50% { transform: translateY(-15px) scale(1.03) rotate(-6deg); }
        }
        @keyframes float-particle {
          0% { transform: translateY(105vh) translateX(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
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
        const size = 6 + (i % 3) * 4;
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
              animation: `float-particle 10s linear infinite`,
              animationDelay: `${delay}s`,
              bottom: '-20px'
            }}
          />
        );
      })}

      {/* Left Flying Flag */}
      <WavingFlag 
        className="absolute left-8 top-1/4 w-16 h-auto drop-shadow-md z-10 pointer-events-none"
        style={{ animation: 'wave-left 6s ease-in-out infinite' }}
      />

      {/* Right Flying Flag */}
      <WavingFlag 
        className="absolute right-8 top-1/3 w-14 h-auto drop-shadow-md z-10 pointer-events-none"
        style={{ animation: 'wave-right 7s ease-in-out infinite' }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo and Chakra Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Ashoka Chakra Rotating Wheel Background */}
          <div 
            className="absolute w-44 h-44 opacity-20 text-[#000080] flex items-center justify-center"
            style={{ animation: 'spin-slow 24s linear infinite' }}
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.8"/>
              <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
              {[...Array(24)].map((_, i) => (
                <line
                  key={i}
                  x1="12"
                  y1="12"
                  x2={12 + 10 * Math.cos((i * 15 * Math.PI) / 180)}
                  y2={12 + 10 * Math.sin((i * 15 * Math.PI) / 180)}
                  stroke="currentColor"
                  strokeWidth="0.35"
                />
              ))}
            </svg>
          </div>

          {/* Foreground Logo */}
          <div className="relative w-32 h-32 bg-white rounded-full p-2.5 shadow-xl border-4 border-white overflow-hidden flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
            <img 
              src="/assets/logo.png" 
              alt="RP Foundation Official Logo" 
              className="w-full h-full object-contain bg-white rounded-full"
            />
          </div>
        </div>

        {/* Text and Title */}
        <div className="text-center space-y-2.5 mb-10">
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

        {/* Spinner */}
        <Loader2 className="w-7 h-7 text-[#000080] animate-spin opacity-80" />
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center opacity-85">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[12px] text-[#000080] font-sans tracking-widest font-black animate-pulse">वंदे मातरम</span>
        </div>
      </div>
    </div>
  );
}
