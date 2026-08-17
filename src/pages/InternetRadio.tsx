import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Radio, Play, Pause, Volume2, VolumeX, Search,
  Signal, Loader2, Wifi, WifiOff,
} from 'lucide-react';

/* ─── Curated Akashvani stations (HLS .m3u8 streams from akashvani.gov.in) ─── */
const STATIONS = [
  { id: 1,  name: 'AIR News (Live 24×7)',      nameHi: 'AIR न्यूज़ (लाइव 24×7)',      state: 'National', lang: 'Hindi',   url: 'https://radio.wavespb.com/live/b20ff2fc0bb34b3d/b20ff2fc0bb34b3d.m3u8' },
  { id: 2,  name: 'Vividh Bharati Mumbai',     nameHi: 'विविध भारती मुंबई',          state: 'National', lang: 'Hindi',   url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio012/playlist.m3u8' },
  { id: 3,  name: 'AIR FM Gold Delhi',         nameHi: 'AIR FM गोल्ड दिल्ली',        state: 'National', lang: 'Hindi',   url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio009/playlist.m3u8' },
  { id: 4,  name: 'AIR FM Rainbow Delhi',      nameHi: 'AIR FM रेनबो दिल्ली',        state: 'National', lang: 'Hindi',   url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio008/playlist.m3u8' },
  { id: 5,  name: 'Akashvani Lucknow',         nameHi: 'आकाशवाणी लखनऊ',             state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/75c01e54cb46ad29/75c01e54cb46ad29.m3u8' },
  { id: 6,  name: 'FM Rainbow Lucknow',        nameHi: 'FM रेनबो लखनऊ',             state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/81c465a355a1ea65/81c465a355a1ea65.m3u8' },
  { id: 7,  name: 'Akashvani Kanpur',          nameHi: 'आकाशवाणी कानपुर',           state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/278ca8613f27411e/278ca8613f27411e.m3u8' },
  { id: 8,  name: 'Akashvani Varanasi',        nameHi: 'आकाशवाणी वाराणसी',          state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/43290b0b741fd08f/43290b0b741fd08f.m3u8' },
  { id: 9,  name: 'Akashvani Delhi',           nameHi: 'आकाशवाणी दिल्ली',           state: 'Delhi',    lang: 'Hindi',   url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio007/playlist.m3u8' },
  { id: 10, name: 'Akashvani Mumbai',          nameHi: 'आकाशवाणी मुंबई',            state: 'Maharashtra', lang: 'Hindi', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio011/playlist.m3u8' },
  { id: 11, name: 'Aakashvani Marathi Mumbai', nameHi: 'आकाशवाणी मराठी मुंबई',     state: 'Maharashtra', lang: 'Marathi', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio013/playlist.m3u8' },
  { id: 12, name: 'Akashvani Pune',            nameHi: 'आकाशवाणी पुणे',             state: 'Maharashtra', lang: 'Marathi', url: 'https://radio.wavespb.com/live/a8c1d74b3e9f2c60/a8c1d74b3e9f2c60.m3u8' },
  { id: 13, name: 'FM Rainbow Chennai',        nameHi: 'FM रेनबो चेन्नई',           state: 'Tamil Nadu', lang: 'Tamil',  url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio027/playlist.m3u8' },
  { id: 14, name: 'Akashvani Aaradhana',       nameHi: 'आकाशवाणी आराधना',          state: 'Tamil Nadu', lang: 'Tamil',  url: 'https://radio.wavespb.com/live/f6fa349221f25803/f6fa349221f25803.m3u8' },
  { id: 15, name: 'Akashvani Bangla',          nameHi: 'आकाशवाणी बांग्ला',          state: 'West Bengal', lang: 'Bengali', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio014/playlist.m3u8' },
  { id: 16, name: 'FM Rainbow Kolkata',        nameHi: 'FM रेनबो कोलकाता',          state: 'West Bengal', lang: 'Bengali', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio017/playlist.m3u8' },
  { id: 17, name: 'Akashvani FM Gold Kolkata', nameHi: 'FM गोल्ड कोलकाता',         state: 'West Bengal', lang: 'Bengali', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio016/playlist.m3u8' },
  { id: 18, name: 'Akashvani Gujarati',        nameHi: 'आकाशवाणी गुजराती',          state: 'Gujarat',  lang: 'Gujarati', url: 'https://radio.wavespb.com/live/165856ba98ca031a/165856ba98ca031a.m3u8' },
  { id: 19, name: 'Akashvani Punjabi',         nameHi: 'आकाशवाणी पंजाबी',           state: 'Punjab',   lang: 'Punjabi', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio030/playlist.m3u8' },
  { id: 20, name: 'Akashvani Dehradun',        nameHi: 'आकाशवाणी देहरादून',         state: 'Uttarakhand', lang: 'Hindi', url: 'https://radio.wavespb.com/live/355939733d28e2e7/355939733d28e2e7.m3u8' },
  { id: 21, name: 'Akashvani Almora',          nameHi: 'आकाशवाणी अल्मोड़ा',        state: 'Uttarakhand', lang: 'Hindi', url: 'https://radio.wavespb.com/live/38719309b3b91cdc/38719309b3b91cdc.m3u8' },
  { id: 22, name: 'Akashvani Mathura',         nameHi: 'आकाशवाणी मथुरा',            state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/5e42265becd8a816/5e42265becd8a816.m3u8' },
  { id: 23, name: 'Akashvani Maitree',         nameHi: 'आकाशवाणी मैत्री',           state: 'National', lang: 'Bengali', url: 'https://radio.wavespb.com/live/66249dfecaf80241/66249dfecaf80241.m3u8' },
  { id: 24, name: 'Akashvani North East',      nameHi: 'आकाशवाणी नॉर्थ ईस्ट',      state: 'North East', lang: 'Multi', url: 'https://radio.wavespb.com/live/NElivestream/NElivestream.m3u8' },
  { id: 25, name: 'Akashvani Kokrajhar',       nameHi: 'आकाशवाणी कोकराझार',        state: 'Assam',    lang: 'Assamese', url: 'https://radio.wavespb.com/live/8a1bb2ca9d2a6741/8a1bb2ca9d2a6741.m3u8' },
  { id: 26, name: 'Akashvani Shantiniketan',   nameHi: 'आकाशवाणी शांतिनिकेतन',    state: 'West Bengal', lang: 'Bengali', url: 'https://radio.wavespb.com/live/47a45f818dd9203b/47a45f818dd9203b.m3u8' },
  { id: 27, name: 'Akashvani Rampur',          nameHi: 'आकाशवाणी रामपुर',           state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/bc3b1ad27f1e2fda/bc3b1ad27f1e2fda.m3u8' },
  { id: 28, name: 'Akashvani Najibabad',       nameHi: 'आकाशवाणी नजीबाबाद',        state: 'UP',       lang: 'Hindi',   url: 'https://radio.wavespb.com/live/4aaa85cab056e9c1/4aaa85cab056e9c1.m3u8' },
  { id: 29, name: 'Akashvani Siliguri',        nameHi: 'आकाशवाणी सिलीगुड़ी',       state: 'West Bengal', lang: 'Bengali', url: 'https://airhlspush.pc.cdn.bitgravity.com/httppush/hlspbaudio023/playlist.m3u8' },
  { id: 30, name: 'Akashvani Kurseong',        nameHi: 'आकाशवाणी कुर्सियांग',      state: 'West Bengal', lang: 'Bengali', url: 'https://radio.wavespb.com/live/1f781b48497e67d3/1f781b48497e67d3.m3u8' },
] as const;

type Station = (typeof STATIONS)[number];

const STATES = ['All', 'National', 'UP', 'Delhi', 'Maharashtra', 'Tamil Nadu', 'West Bengal', 'Gujarat', 'Punjab', 'Uttarakhand', 'Assam', 'North East'];

/* State color map */
const stateColor: Record<string, string> = {
  National: 'bg-[#FF9933]/10 text-[#FF9933]',
  UP: 'bg-green-50 text-green-700',
  Delhi: 'bg-blue-50 text-blue-700',
  Maharashtra: 'bg-purple-50 text-purple-700',
  'Tamil Nadu': 'bg-rose-50 text-rose-700',
  'West Bengal': 'bg-amber-50 text-amber-700',
  Gujarat: 'bg-orange-50 text-orange-700',
  Punjab: 'bg-yellow-50 text-yellow-700',
  Uttarakhand: 'bg-teal-50 text-teal-700',
  Assam: 'bg-emerald-50 text-emerald-700',
  'North East': 'bg-indigo-50 text-indigo-700',
};

/* Animated sound bars */
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

  const [active, setActive] = useState<Station>(STATIONS[0]);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<any>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return STATIONS.filter(s => {
      const matchState = state === 'All' || s.state === state;
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.nameHi.includes(q) || s.lang.toLowerCase().includes(q) || s.state.toLowerCase().includes(q);
      return matchState && matchSearch;
    });
  }, [search, state]);

  /* Load HLS stream */
  const loadStation = async (station: Station) => {
    if (!audioRef.current) return;
    setError('');
    setLoading(true);
    setPlaying(false);

    // Destroy previous HLS instance
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }

    const audio = audioRef.current;
    audio.pause();

    const url = station.url;

    try {
      if (url.endsWith('.m3u8')) {
        // Dynamic import hls.js only when needed
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          const hls = new Hls({ lowLatencyMode: true, maxBufferLength: 10 });
          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.volume = volume;
            audio.muted = muted;
            audio.play().then(() => { setPlaying(true); setLoading(false); }).catch(e => {
              setError(hi ? 'स्ट्रीम शुरू नहीं हो सकी।' : 'Could not start stream.');
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

  const handleSelect = (station: Station) => {
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
  useEffect(() => () => {
    if (hlsRef.current) hlsRef.current.destroy();
    audioRef.current?.pause();
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
              {hi ? 'सरकारी लाइव स्ट्रीम • 30+ स्टेशन' : 'Government Live Streams • 30+ Stations'}
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
            {hi ? active.nameHi : active.name}
          </h2>
          <p className="mt-0.5 text-[11px] font-medium text-white/60">
            {active.lang} • {active.state}
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
              placeholder={hi ? 'स्टेशन खोजें...' : 'Search station, language, state...'}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#000080]/40 focus:ring-2 focus:ring-[#000080]/10"
            />
          </div>

          {/* State chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STATES.map(s => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition ${
                  state === s
                    ? 'bg-[#000080] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#000080]/30'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Station List ── */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {filtered.length} {hi ? 'स्टेशन' : 'Stations'}
          </p>
          {filtered.map(station => {
            const isActive = station.id === active.id;
            return (
              <button
                key={station.id}
                onClick={() => handleSelect(station)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all active:scale-[0.98] ${
                  isActive
                    ? 'border-[#000080]/20 bg-[#000080]/5 shadow-sm'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                {/* Radio icon with state color */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stateColor[station.state] || 'bg-slate-50 text-slate-400'}`}>
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
                  <p className={`text-sm font-black leading-tight truncate ${isActive ? 'text-[#000080]' : 'text-slate-800'}`}>
                    {hi ? station.nameHi : station.name}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                    {station.lang} • {station.state}
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

        <p className="text-center text-[10px] leading-5 text-slate-400">
          {hi
            ? 'सभी स्ट्रीम आकाशवाणी.gov.in के आधिकारिक HLS सर्वर से आती हैं।'
            : 'All streams from official Akashvani.gov.in HLS servers.'}
        </p>
      </div>
    </div>
  );
}
