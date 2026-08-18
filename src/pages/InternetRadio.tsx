import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Radio, Play, Pause, Volume2, VolumeX, Search,
  Signal, Loader2, Wifi, WifiOff, Music
} from 'lucide-react';
import rawChannels from '../data/akashvaniChannels.json';

interface ScrapedChannel {
  name: string;
  url: string;
  image: string;
  page: string;
}

const REGIONS = [
  { id: 'All', name: 'All Stations', nameHi: 'सभी स्टेशन' },
  { id: 'Bhopal', name: 'Bhopal', nameHi: 'भोपाल' },
  { id: 'MP', name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश' },
  { id: 'UP', name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश' },
  { id: 'Delhi', name: 'Delhi', nameHi: 'दिल्ली' },
  { id: 'Mumbai', name: 'Mumbai', nameHi: 'मुंबई' },
  { id: 'Kolkata', name: 'Kolkata', nameHi: 'कोलकाता' },
  { id: 'Vividh', name: 'Vividh Bharati', nameHi: 'विविध भारती' },
  { id: 'Other', name: 'Other Regions', nameHi: 'अन्य क्षेत्र' }
];

function getRegionId(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bhopal')) return 'Bhopal';
  if (n.includes('delhi') || n.includes('indraprastha')) return 'Delhi';
  if (n.includes('mumbai')) return 'Mumbai';
  if (n.includes('kolkata')) return 'Kolkata';
  if (n.includes('vividh') || n.includes('vbs')) return 'Vividh';
  
  // MP cities
  const mpCities = ['indore', 'gwalior', 'jabalpur', 'chhindwara', 'sagar', 'rewa', 'ratlam', 'shahdol', 'balaghat'];
  if (mpCities.some(city => n.includes(city))) return 'MP';
  
  // UP cities
  const upCities = ['lucknow', 'kanpur', 'varanasi', 'mathura', 'najibabad', 'obra', 'rampur', 'allahabad', 'prayagraj', 'gorakhpur', 'agra'];
  if (upCities.some(city => n.includes(city))) return 'UP';
  
  return 'Other';
}

function SoundBars() {
  return (
    <div className="flex items-end gap-[2px] h-5">
      {[40, 80, 60, 100, 50].map((h, i) => (
        <div
          key={i}
          className="w-[3px] bg-[#FF9933] rounded-full"
          style={{
            height: `${h}%`,
            animation: `soundBar 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

export default function InternetRadio() {
  const { lang } = useOutletContext<{ lang: 'en' | 'hi' }>();
  const hi = lang === 'hi';

  // Fallback default station: Bhopal if found, otherwise first available
  const defaultStation = useMemo(() => {
    const bhopal = rawChannels.find(c => c.name.toLowerCase() === 'akashvani bhopal');
    return bhopal || rawChannels[0];
  }, []);

  const [active, setActive] = useState<ScrapedChannel>(defaultStation);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<any>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rawChannels.filter(s => {
      const region = getRegionId(s.name);
      const matchRegion = selectedRegion === 'All' || region === selectedRegion;
      const matchSearch = !q || s.name.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [search, selectedRegion]);

  /* Load HLS stream */
  const loadStation = async (station: ScrapedChannel) => {
    if (!audioRef.current) return;
    setError('');
    setLoading(true);
    setPlaying(false);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const audio = audioRef.current;
    audio.pause();

    const url = station.url;

    try {
      if (url.endsWith('.m3u8')) {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ 
            lowLatencyMode: true, 
            maxBufferLength: 10,
            enableWorker: true
          });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.volume = volume;
            audio.muted = muted;
            audio.play().then(() => {
              setPlaying(true);
              setLoading(false);
            }).catch(() => {
              setError(hi ? 'स्ट्रीम लोड नहीं हो सकी। कृपया दोबारा प्रयास करें।' : 'Could not load stream. Please retry.');
              setLoading(false);
            });
          });
          hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
            if (data.fatal) {
              setError(hi ? 'यह स्टेशन अभी उपलब्ध नहीं है।' : 'Station unavailable right now.');
              setLoading(false);
              setPlaying(false);
            }
          });
          return;
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          audio.src = url;
        }
      } else {
        audio.src = url;
      }

      audio.volume = volume;
      audio.muted = muted;
      await audio.play();
      setPlaying(true);
    } catch {
      setError(hi ? 'स्ट्रीम शुरू नहीं हो सकी।' : 'Could not start stream.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (station: ScrapedChannel) => {
    setActive(station);
    loadStation(station);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setError('');
      loadStation(active);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const next = !muted;
    audioRef.current.muted = next;
    setMuted(next);
  };

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="min-h-full bg-[#f8f7f4] pb-10">
      <style>{`
        @keyframes soundBar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
      <audio ref={audioRef} />

      <div className="mx-auto max-w-3xl px-3.5 py-5 sm:px-6 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FF9933]/10">
            <Radio className="h-6 w-6 text-[#FF9933]" />
          </div>
          <div>
            <h1 className="text-lg font-black text-[#000080] leading-tight">
              {hi ? 'आकाशवाणी लाइव रेडियो' : 'Akashvani Live Radio'}
            </h1>
            <p className="text-[11px] font-medium text-slate-500">
              {hi ? `सरकारी लाइव स्ट्रीम • ${rawChannels.length} स्टेशन` : `Government Live Streams • ${rawChannels.length} Stations`}
            </p>
          </div>
        </div>

        {/* ── Now Playing Card ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#000080] via-[#001060] to-[#000040] p-5 text-white shadow-xl">
          {/* Decorative radio waves */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full border border-white/8" />

          <p className="mb-1 text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">
            {hi ? '▶ अभी बज रहा है' : '▶ Now Playing'}
          </p>
          <h2 className="text-xl font-black leading-tight">
            {active.name}
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-white/60">
            Live Stream
          </p>

          {/* Controls */}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={togglePlay}
              disabled={loading}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FF9933] shadow-lg transition active:scale-95 disabled:opacity-60"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : playing ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-0.5" />
              )}
            </button>

            {/* Sound bars animation */}
            <div className="flex-1">
              {playing && !loading ? (
                <SoundBars />
              ) : (
                <div className="flex items-end gap-[2px] h-5">
                  {[40, 80, 60, 100, 50].map((h, i) => (
                    <div key={i} className="w-[3px] rounded-full bg-white/20" style={{ height: `${h}%` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white/70 hover:text-white">
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range" min="0" max="1" step="0.01"
                value={muted ? 0 : volume}
                onChange={e => { setVolume(+e.target.value); setMuted(false); }}
                className="w-20 accent-[#FF9933] h-1"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-[11px] font-bold text-red-200">
              <WifiOff className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Live indicator */}
          <div className="mt-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${playing ? 'animate-ping bg-[#FF9933]' : 'bg-white/30'}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${playing ? 'bg-[#FF9933]' : 'bg-white/30'}`} />
            </span>
            <span className="text-[10px] font-bold text-white/60">
              {playing ? (hi ? 'लाइव' : 'LIVE') : (hi ? 'रुका हुआ' : 'PAUSED')}
            </span>
            <Signal className="ml-auto h-3.5 w-3.5 text-white/30" />
          </div>
        </div>

        {/* ── Search + Filter ── */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={hi ? 'स्टेशन का नाम खोजें...' : 'Search station name...'}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#000080]/40 focus:ring-2 focus:ring-[#000080]/10"
            />
          </div>

          {/* Region chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-[11px] font-bold transition ${
                  selectedRegion === r.id
                    ? 'bg-[#000080] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#000080]/30'
                }`}
              >
                {hi ? r.nameHi : r.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Station List ── */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {filtered.length} {hi ? 'स्टेशन मिले' : 'Stations found'}
          </p>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filtered.map(station => {
              const isActive = station.name === active.name;
              return (
                <button
                  key={station.name}
                  onClick={() => handleSelect(station)}
                  className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.98] ${
                    isActive
                      ? 'border-[#000080]/20 bg-[#000080]/5 shadow-sm'
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF9933]">
                    {isActive && playing ? (
                      <div className="flex items-end gap-[2px] h-4">
                        {[60, 100, 70].map((h, i) => (
                          <div
                            key={i}
                            className="w-[2.5px] rounded-full bg-current"
                            style={{ height: `${h}%`, animation: `soundBar 0.7s ease-in-out ${i * 0.15}s infinite alternate` }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Radio className="h-4.5 w-4.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black leading-tight truncate ${isActive ? 'text-[#000080]' : 'text-slate-800'}`}>
                      {station.name}
                    </p>
                    <p className="text-[9px] font-medium text-slate-400 mt-0.5">
                      Prasar Bharati Stream
                    </p>
                  </div>

                  {isActive && (
                    loading ? (
                      <Loader2 className="h-4 w-4 text-[#000080] animate-spin shrink-0" />
                    ) : playing ? (
                      <span className="shrink-0 rounded-full bg-[#FF9933] px-2 py-0.5 text-[9px] font-black text-white">LIVE</span>
                    ) : (
                      <Wifi className="h-4 w-4 text-slate-300 shrink-0" />
                    )
                  )}
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-400">
                {hi ? 'कोई स्टेशन नहीं मिला।' : 'No stations found.'}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] leading-5 text-slate-400">
          {hi
            ? 'सभी स्ट्रीम आकाशवाणी.gov.in के आधिकारिक HLS सर्वर से लाइव आती हैं।'
            : 'All streams live from official Akashvani.gov.in HLS servers.'}
        </p>
      </div>
    </div>
  );
}
