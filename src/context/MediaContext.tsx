import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

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
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const onPlay = () => {
      setIsRadioPlaying(true);
      setRadioError(null);
    };

    const onPause = () => {
      setIsRadioPlaying(false);
    };

    const onError = () => {
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
      audio.removeAttribute('src');
      audio.load();
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
    audio.removeAttribute('src');
    audio.load();

    audio.volume = radioVolume;
    audio.muted = isRadioMuted;

    try {
      const isHlsStream = /\.m3u8(?:\?|$)/i.test(station.url);
      const Hls = (await import('hls.js')).default;

      if (isHlsStream && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 30,
          maxBufferLength: 20,
          maxMaxBufferLength: 40,
          manifestLoadingMaxRetry: 5,
          manifestLoadingRetryDelay: 1000,
          levelLoadingMaxRetry: 5,
          fragLoadingMaxRetry: 5,
        });
        hlsRef.current = hls;
        hls.loadSource(station.url);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          if (!isCurrent()) return;
          try {
            await audio.play();
            if (isCurrent()) {
              setIsRadioPlaying(true);
              setRadioError(null);
            }
          } catch {
            if (!isCurrent()) return;
            setIsRadioPlaying(false);
            setRadioError('Tap play button to start streaming');
          } finally {
            if (isCurrent()) setIsRadioLoading(false);
          }
        });

        let recoveryAttempts = 0;
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (!isCurrent() || !data.fatal) return;
          if (recoveryAttempts++ < 3 && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            setRadioError('Buffering live stream…');
            return;
          }
          if (recoveryAttempts <= 3 && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            setRadioError('Stabilizing stream…');
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
        audio.src = station.url;
      } else {
        // Direct stream (MP3/AAC/Shoutcast/Icecast)
        audio.src = station.url;
      }

      await audio.play();
      if (isCurrent()) {
        setIsRadioPlaying(true);
        setRadioError(null);
      }
    } catch (err: any) {
      if (!isCurrent()) return;
      if (err?.name === 'NotAllowedError') {
        setRadioError('Tap play button to start audio stream.');
      } else {
        setRadioError('Could not start this stream. Please try another station or check your connection.');
      }
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
