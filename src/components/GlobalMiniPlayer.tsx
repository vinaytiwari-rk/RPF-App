import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, X, Radio, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMedia } from '../context/MediaContext';
import BrandLoader from './BrandLoader';

export default function GlobalMiniPlayer() {
  const { activeRadio, isRadioPlaying, isRadioLoading, toggleRadioPlay, stopRadio } = useMedia();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide mini player on radio full page to avoid redundancy, or show everywhere else
  if (!activeRadio || location.pathname === '/internet-radio') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-3.5 z-40 mx-auto max-w-lg overflow-hidden rounded-2xl border border-orange-200/80 bg-gradient-to-r from-[#000080] via-[#001050] to-[#000040] p-2.5 text-white shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          {/* Station Artwork / Icon (Click to open full radio page) */}
          <button
            onClick={() => navigate('/internet-radio')}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left group"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 border border-white/15">
              {activeRadio.image ? (
                <img
                  src={activeRadio.image}
                  alt={activeRadio.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Radio className="h-5 w-5 text-[#FF9933]" />
              )}
              {isRadioPlaying && (
                <span className="absolute bottom-0.5 right-0.5 flex h-2 w-2 rounded-full bg-[#FF9933] ring-1 ring-black" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#FF9933]">Akashvani Radio</span>
                {isRadioPlaying && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <h4 className="truncate text-xs font-bold text-white group-hover:text-orange-200 transition">
                {activeRadio.name}
              </h4>
            </div>
          </button>

          {/* Controls: Play/Pause and Explicit CLOSE (X) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={toggleRadioPlay}
              disabled={isRadioLoading}
              aria-label={isRadioPlaying ? 'Pause Radio' : 'Play Radio'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF9933] text-white shadow-md hover:bg-orange-500 active:scale-95 transition"
            >
              {isRadioLoading ? (
                <BrandLoader size="sm" />
              ) : isRadioPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </button>

            {/* EXPLICIT CLOSE / CANCEL BUTTON */}
            <button
              onClick={stopRadio}
              aria-label="Stop & Close Radio"
              title="Stop & Close Radio"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-rose-600 hover:text-white active:scale-95 transition border border-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
