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
  const hlsRef = useRef<any>(null);
  // Ignore late HLS callbacks when a listener switches stations or stops playback.
  const playbackGeneration = useRef(0);

  // Initialize background audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const onPlay = () => {
      setIsRadioPlaying(true);
      setIsRadioLoading(false);
      setRadioError(null);
    };

    const onPause = () => {
      setIsRadioPlaying(false);
    };

    const onError = () => {
      if (!audio.currentSrc || audio.currentSrc === 'about:blank' || !audioRef.current) return;
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

    // Stop current stream if any
    if (hlsRef.current) {
      try { hlsRef.current.destroy(); } catch {}
      hlsRef.current = null;
    }
    audio.pause();
    audio.volume = radioVolume;
    audio.muted = isRadioMuted;

    // Resolve target stream URL with auto-fixes for wavespb -> cloudfront and http: -> proxy
    let targetUrl = station.url.trim();
    if (targetUrl.includes('radio.wavespb.com/live/')) {
      targetUrl = targetUrl.replace('https://radio.wavespb.com/live/', 'https://d1tmej9eu7kw5c.cloudfront.net/');
    }

    // Auto-route plain http: streams through our secure proxy to prevent Mixed Content blocking on HTTPS & Android
    if (targetUrl.startsWith('http://')) {
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

        let triedProxy = false;
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (!isCurrent() || !data.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // Auto fallback to server proxy on network/CORS error
            if (!triedProxy && !targetUrl.includes('/api/iptv/proxy')) {
              triedProxy = true;
              const proxyUrl = resolveMediaUrl(`/api/iptv/proxy?url=${encodeURIComponent(station.url)}`);
              console.warn(`Direct radio stream failed for ${station.name}, retrying via proxy:`, proxyUrl);
              loadHlsSource(proxyUrl);
              return;
            }
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
        await audio.play();
      } catch (err: any) {
        // If direct stream fails, retry via server proxy
        if (!targetUrl.includes('/api/iptv/proxy')) {
          const proxyUrl = resolveMediaUrl(`/api/iptv/proxy?url=${encodeURIComponent(station.url)}`);
          audio.src = proxyUrl;
          audio.load();
          await audio.play();
        } else {
          throw err;
        }
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
    setRadioVolumeState(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const toggleRadioMute = () => {
    const next = !isRadioMuted;
    setIsRadioMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
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
