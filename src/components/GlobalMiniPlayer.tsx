import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, X, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMedia } from '../context/MediaContext';
import BrandLoader from './BrandLoader';

export default function GlobalMiniPlayer() {
  const { activeRadio, isRadioPlaying, isRadioLoading, toggleRadioPlay, stopRadio } = useMedia();
  const navigate = useNavigate();
  const location = useLocation();

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
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] inset-x-3.5 z-40 mx-auto max-w-lg overflow-hidden rounded-2xl border border-orange-200 bg-white/95 p-2.5 text-slate-900 shadow-[0_12px_35px_rgba(0,0,128,0.12)] backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          {/* Station Artwork / Icon */}
          <button
            onClick={() => navigate('/internet-radio')}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left group"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50 border border-orange-200">
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
                <span className="absolute bottom-0.5 right-0.5 flex h-2 w-2 rounded-full bg-[#138808] ring-1 ring-white" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#FF9933]">Akashvani Radio</span>
                {isRadioPlaying && (
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <h4 className="truncate text-xs font-bold text-[#000080] group-hover:text-[#FF9933] transition">
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#FF9933] to-[#F59E0B] text-white shadow-md hover:scale-105 active:scale-95 transition"
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition border border-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
