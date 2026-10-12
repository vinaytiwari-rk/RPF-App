import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { resolveMediaUrl } from '../utils/media';

export interface RadioStation {
  name: string;
  url: string;
  image?: string;
  page?: string;
  enabled?: boolean;
}

export interface LiveTvChannel {
  id: string;
  name: string;
  url: string;
  category: string;
  videoId?: string;
}

interface MediaContextType {
  // Radio State
  activeRadio: RadioStation | null;
  isRadioPlaying: boolean;
  isRadioLoading: boolean;
  radioVolume: number;
  isRadioMuted: boolean;
  radioError: string | null;
  playRadio: (station: RadioStation) => Promise<void>;
  toggleRadioPlay: () => void;
  stopRadio: () => void;
  setRadioVolume: (vol: number) => void;
  toggleRadioMute: () => void;

  // TV State
  activeTv: LiveTvChannel | null;
  isTvOpen: boolean;
  playTv: (channel: LiveTvChannel) => void;
  closeTv: () => void;

  // Global Player Controls
  closeAllMedia: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  // Radio states
  const [activeRadio, setActiveRadio] = useState<RadioStation | null>(null);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [isRadioLoading, setIsRadioLoading] = useState(false);
  const [radioVolume, setRadioVolumeState] = useState(0.85);
  const [isRadioMuted, setIsRadioMuted] = useState(false);
  const [radioError, setRadioError] = useState<string | null>(null);

  // TV states
  const [activeTv, setActiveTv] = useState<LiveTvChannel | null>(null);
  const [isTvOpen, setIsTvOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const hlsRef = useRef<any>(null);
  // Ignore late HLS callbacks when a listener switches stations or stops playback.
  const playbackGeneration = useRef(0);

  // Initialize Web Audio API GainNode for reliable software volume control across Android WebView, iOS, and Web
  const initWebAudio = () => {
    try {
      const audio = audioRef.current;
      if (!audio || gainNodeRef.current) return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = isRadioMuted ? 0 : radioVolume;
      source.connect(gain);
      gain.connect(ctx.destination);
      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
    } catch (err) {
      console.warn("Web Audio GainNode initialization fallback:", err);
    }
  };

  // Wire event listeners to the mounted audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = radioVolume;
    audio.muted = isRadioMuted;

    const onPlay = () => {
      setIsRadioPlaying(true);
      setIsRadioLoading(false);
      setRadioError(null);
    };

    const onPause = () => {
      setIsRadioPlaying(false);
    };

    const onError = () => {
      if (!audio.currentSrc || audio.currentSrc === 'about:blank') return;
      setIsRadioPlaying(false);
      setIsRadioLoading(false);
      setRadioError('Station stream could not be loaded. Try another station or check your connection.');
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const stopRadio = () => {
    playbackGeneration.current += 1;
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setIsRadioPlaying(false);
    setIsRadioLoading(false);
    setActiveRadio(null);
    setRadioError(null);
  };

  const playRadio = async (station: RadioStation) => {
    const generation = ++playbackGeneration.current;
    const isCurrent = () => playbackGeneration.current === generation;
    // If TV is active, close it
    if (isTvOpen) {
      closeTv();
    }

    const audio = audioRef.current;
    if (!audio || !station?.url) return;

    setActiveRadio(station);
    setIsRadioLoading(true);
    setRadioError(null);

    // Initialize Web Audio graph if not yet created
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      try { await audioCtxRef.current.resume(); } catch {}
    }

    // Stop current stream if any
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch {}
      hlsRef.current = null;
    }
    audio.pause();
    audio.volume = radioVolume;
    audio.muted = isRadioMuted;
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(isRadioMuted ? 0 : radioVolume, audioCtxRef.current.currentTime);
    }

    // Resolve target stream URL with auto-fixes for wavespb -> cloudfront and bitgravity -> cloudfront
    let targetUrl = station.url.trim();
    if (targetUrl.includes('radio.wavespb.com/live/')) {
      targetUrl = targetUrl.replace(/https?:\/\/radio\.wavespb\.com\/live\//, 'https://d1tmej9eu7kw5c.cloudfront.net/');
    }
    if (targetUrl.includes('air.pc.cdn.bitgravity.com/air/live/pbaudio001')) {
      targetUrl = 'https://d1tmej9eu7kw5c.cloudfront.net/146ed6ec6dea5a24/146ed6ec6dea5a24.m3u8';
    }

    // Always route HLS m3u8 streams and plain http: streams through our secure proxy
    // to guarantee Access-Control-Allow-Origin: * on both m3u8 playlist and all .ts audio chunks!
    if (!targetUrl.includes('/api/iptv/proxy')) {
      targetUrl = resolveMediaUrl(`/api/iptv/proxy?url=${encodeURIComponent(targetUrl)}`);
    }

    try {
      const isHlsStream = /\.m3u8(?:\?|$)/i.test(targetUrl);

      if (isHlsStream && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: false,
          lowLatencyMode: true,
          backBufferLength: 15,
          maxBufferLength: 10,
          maxMaxBufferLength: 20,
          manifestLoadingMaxRetry: 4,
          levelLoadingMaxRetry: 4,
          fragLoadingMaxRetry: 4,
        });
        hlsRef.current = hls;

        const loadHlsSource = (urlToLoad: string) => {
          hls.loadSource(urlToLoad);
          hls.attachMedia(audio);
        };

        loadHlsSource(targetUrl);

        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          if (!isCurrent()) return;
          try {
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
              await audioCtxRef.current.resume();
            }
            await audio.play();
            if (isCurrent()) {
              setIsRadioPlaying(true);
              setIsRadioLoading(false);
              setRadioError(null);
            }
          } catch (e: any) {
            console.warn("audio.play() failed on start:", e);
            if (!isCurrent()) return;
            setIsRadioPlaying(false);
            setIsRadioLoading(false);
            setRadioError('Tap play button to start streaming');
          }
        });

        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (!isCurrent() || !data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          hls.destroy();
          hlsRef.current = null;
          setRadioError('This station stream is currently unreachable. Please try another station.');
          setIsRadioLoading(false);
          setIsRadioPlaying(false);
        });
        return;
      } else if (isHlsStream && (audio.canPlayType('application/vnd.apple.mpegurl') || audio.canPlayType('application/x-mpegURL'))) {
        // Native HLS fallback (primarily iOS Safari)
        audio.src = targetUrl;
        audio.load();
      } else {
        // Direct stream (MP3/AAC/Shoutcast/Icecast)
        audio.src = targetUrl;
        audio.load();
      }

      try {
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        await audio.play();
      } catch (err: any) {
        throw err;
      }

      if (isCurrent()) {
        setIsRadioPlaying(true);
        setIsRadioLoading(false);
        setRadioError(null);
      }
    } catch (err: any) {
      if (!isCurrent()) return;
      if (err?.name === 'NotAllowedError') {
        setRadioError('Tap play button to start audio stream.');
      } else {
        setRadioError('Could not start this stream. Please try another station or check your connection.');
      }
      setIsRadioLoading(false);
    } finally {
      if (isCurrent() && !hlsRef.current) {
        setIsRadioLoading(false);
      }
    }
  };

  const toggleRadioPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isRadioPlaying) {
      audio.pause();
      setIsRadioPlaying(false);
    } else if (activeRadio) {
      void playRadio(activeRadio);
    }
  };

  const setRadioVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setRadioVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clamped, audioCtxRef.current.currentTime);
    }
    // If muted and volume is adjusted above zero, automatically unmute
    if (isRadioMuted && clamped > 0) {
      setIsRadioMuted(false);
      if (audioRef.current) {
        audioRef.current.muted = false;
      }
    }
  };

  const toggleRadioMute = () => {
    const next = !isRadioMuted;
    setIsRadioMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(next ? 0 : radioVolume, audioCtxRef.current.currentTime);
    }
  };

  const playTv = (channel: LiveTvChannel) => {
    // If radio is playing, stop radio
    if (isRadioPlaying || activeRadio) {
      stopRadio();
    }
    setActiveTv(channel);
    setIsTvOpen(true);
  };

  const closeTv = () => {
    setIsTvOpen(false);
    setActiveTv(null);
  };

  const closeAllMedia = () => {
    stopRadio();
    closeTv();
  };

  return (
    <MediaContext.Provider
      value={{
        activeRadio,
        isRadioPlaying,
        isRadioLoading,
        radioVolume,
        isRadioMuted,
        radioError,
        playRadio,
        toggleRadioPlay,
        stopRadio,
        setRadioVolume,
        toggleRadioMute,
        activeTv,
        isTvOpen,
        playTv,
        closeTv,
        closeAllMedia,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        aria-hidden="true"
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return ctx;
}
