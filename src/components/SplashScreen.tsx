import React, { useEffect, useState } from 'react';

const RunningChildWithFlag = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 80" className="w-20 h-16 pointer-events-none" style={style}>
    {/* Flag Pole */}
    <line x1="50" y1="30" x2="65" y2="5" stroke="#5C4033" strokeWidth="1.8" strokeLinecap="round" />
    
    {/* Waving Tricolor Flag */}
    {/* Saffron */}
    <path d="M 65 5 Q 73 2, 81 5 T 95 5 L 95 14 Q 87 11, 79 14 T 65 14 Z" fill="#FF9933" />
    {/* White */}
    <path d="M 65 14 Q 73 11, 81 14 T 95 14 L 95 23 Q 87 20, 79 23 T 65 23 Z" fill="#FFFFFF" />
    {/* Green */}
    <path d="M 65 23 Q 73 20, 81 23 T 95 23 L 95 32 Q 87 29, 79 32 T 65 32 Z" fill="#138808" />
    {/* Chakra on white band */}
    <circle cx="80" cy="18.5" r="2.5" fill="none" stroke="#000080" strokeWidth="0.4" />
    {[...Array(12)].map((_, i) => (
      <line
        key={i}
        x1="80"
        y1="18.5"
        x2={80 + 2.5 * Math.cos((i * 30 * Math.PI) / 180)}
        y2={18.5 + 2.5 * Math.sin((i * 30 * Math.PI) / 180)}
        stroke="#000080"
        strokeWidth="0.25"
      />
    ))}
    
    {/* Child Silhouette */}
    {/* Head */}
    <circle cx="36" cy="22" r="4.5" fill="#1C2D42" />
    {/* Back arm */}
    <path d="M 36 27 L 27 34 L 30 44" stroke="#1C2D42" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Torso */}
    <path d="M 36 26.5 L 32 42" stroke="#1C2D42" strokeWidth="3" strokeLinecap="round" fill="none" />
    {/* Front arm holding pole */}
    <path d="M 36 28 L 50 30" stroke="#1C2D42" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Back leg (extended) */}
    <path d="M 32 42 L 20 48 L 14 58" stroke="#1C2D42" strokeWidth="2.8" strokeLinecap="round" fill="none" />
    {/* Front leg (bent) */}
    <path d="M 32 42 L 42 50 L 38 62" stroke="#1C2D42" strokeWidth="2.8" strokeLinecap="round" fill="none" />
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
        @keyframes spin-chakra {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes logo-zoom-settle {
          0% { transform: scale(2.2); opacity: 0; filter: blur(6px); }
          75% { transform: scale(0.96); opacity: 1; filter: blur(0); }
          100% { transform: scale(1.0); opacity: 1; }
        }
        @keyframes run-across {
          0% { transform: translateX(-120px) translateY(0); }
          50% { transform: translateX(calc(50vw - 40px)) translateY(-3px); }
          100% { transform: translateX(100vw) translateY(0); }
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
          className="w-12 h-12 text-[#000080] flex items-center justify-center mb-6"
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
      </div>

      {/* Silhouette child running with flag animation */}
      <div className="absolute bottom-16 left-0 right-0 w-full overflow-hidden h-20">
        <RunningChildWithFlag 
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            animation: 'run-across 9s linear infinite'
          }}
        />
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center opacity-85 z-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[12px] text-[#000080] font-sans tracking-widest font-black animate-pulse">वंदे मातरम</span>
        </div>
      </div>
    </div>
  );
}
