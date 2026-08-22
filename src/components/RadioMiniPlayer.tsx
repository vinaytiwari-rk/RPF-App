import { motion, AnimatePresence } from "motion/react";
import { Pause, Play, Radio, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRadioPlayer } from "../context/RadioPlayerContext";

export default function RadioMiniPlayer() {
  const navigate = useNavigate();
  const { station, playing, loading, toggle, pause } = useRadioPlayer();
  if (!station) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className="fixed inset-x-3 bottom-[calc(4.9rem+env(safe-area-inset-bottom))] z-[55] mx-auto max-w-[720px]"
      >
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#07133d]/96 p-2 text-white shadow-[0_18px_55px_rgba(0,0,0,.28)] backdrop-blur-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF9933]/80 to-transparent" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/internet-radio")}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-1.5 py-1 text-left"
              aria-label="Open radio"
            >
              <div className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-[15px] bg-white/10">
                {station.image ? (
                  <img src={station.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Radio className="h-5 w-5 text-[#FF9933]" />
                )}
                {playing && <span className="absolute inset-0 bg-[#07133d]/35" />}
                {playing && (
                  <span className="absolute inset-x-0 bottom-2 flex justify-center gap-0.5">
                    {[0, 1, 2, 3].map((bar) => (
                      <motion.i
                        key={bar}
                        animate={{ scaleY: [0.45, 1, 0.55, 0.8, 0.45] }}
                        transition={{ duration: 0.8 + bar * 0.08, repeat: Infinity, ease: "easeInOut", delay: bar * 0.08 }}
                        className="h-3 w-[2px] origin-bottom rounded-full bg-[#FF9933]"
                      />
                    ))}
                  </span>
                )}
              </div>
              <span className="min-w-0 flex-1">
                <span className="block text-[8px] font-black uppercase tracking-[.18em] text-[#FF9933]">Now playing</span>
                <span className="mt-0.5 block truncate text-[12px] font-black tracking-tight">{station.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-white/50">
                  <span className={`h-1.5 w-1.5 rounded-full ${playing ? "bg-[#FF9933] animate-pulse" : "bg-white/30"}`} />
                  {playing ? "Live now" : loading ? "Loading" : "Paused"}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => void toggle()}
              disabled={loading}
              aria-label={playing ? "Pause radio" : "Play radio"}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#FF9933] text-white shadow-[0_6px_18px_rgba(255,153,51,.28)] transition-transform active:scale-90 disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : playing ? (
                <Pause className="h-[18px] w-[18px] fill-current" />
              ) : (
                <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={pause}
              aria-label="Stop radio"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
