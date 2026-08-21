import { motion, AnimatePresence } from "motion/react";
import { Music2, Pause, Play, Radio, X } from "lucide-react";
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
        className="fixed inset-x-3 bottom-[calc(4.8rem+env(safe-area-inset-bottom))] z-[55] mx-auto max-w-[720px]"
      >
        <div className="flex items-center gap-2 rounded-[22px] border border-white/10 bg-[#07133d]/96 p-2 text-white shadow-[0_18px_55px_rgba(0,0,0,.28)] backdrop-blur-2xl">
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
              {playing && (
                <span className="absolute inset-0 grid place-items-center bg-[#07133d]/45">
                  <Music2 className="h-4 w-4 animate-pulse text-[#FF9933]" />
                </span>
              )}
            </div>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-black tracking-tight">{station.name}</span>
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
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#FF9933] text-white shadow-[0_6px_18px_rgba(255,153,51,.28)] transition-transform active:scale-90 disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" />
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
      </motion.div>
    </AnimatePresence>
  );
}
