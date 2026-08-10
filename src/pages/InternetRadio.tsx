import React, { useState, useRef, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX, Music, Heart, BarChart2 } from 'lucide-react';

const STATIONS = [
  {
    id: 1,
    name: 'Lo-Fi Chill Beats',
    frequency: 'Web',
    genre: 'Lo-Fi',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', 
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    name: 'Classic FM',
    frequency: '100.9 FM',
    genre: 'Classical',
    url: 'http://media-ice.musicradio.com/ClassicFMMP3',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    name: 'Retro 80s Hits',
    frequency: 'Web',
    genre: 'Pop / 80s',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv', 
    image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&q=80&w=400'
  }
];

export default function InternetRadio() {
  const [activeStation, setActiveStation] = useState(STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([1]);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = activeStation.url;
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Audio playback error:", err);
            setIsPlaying(false);
            setError("Failed to stream this station. It may be offline.");
          });
        }
      }
    }
    setError(null);
  }, [activeStation]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setError(null);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Audio playback error:", err);
          setError("Failed to connect to the stream.");
        });
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFavorite = (id: number) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fid => fid !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="w-8 h-8 text-[var(--rp-primary)]" />
            Internet Radio
          </h1>
          <p className="text-gray-600">Listen to live stations and curated music.</p>
        </div>
      </div>

      <audio ref={audioRef} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 z-0 opacity-20">
              <img src={activeStation.image} alt="Background" className="w-full h-full object-cover blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl shrink-0 group relative">
                <img src={activeStation.image} alt={activeStation.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="flex items-end gap-1 h-8">
                      <div className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: '40%', animationDuration: '0.6s' }}></div>
                      <div className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: '80%', animationDuration: '0.4s' }}></div>
                      <div className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: '60%', animationDuration: '0.8s' }}></div>
                      <div className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: '100%', animationDuration: '0.5s' }}></div>
                      <div className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: '50%', animationDuration: '0.7s' }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex justify-between items-start mb-2">
                  <div className="px-3 py-1 bg-[var(--rp-primary)]/10 text-[var(--rp-primary)] text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
                    {activeStation.genre}
                  </div>
                  <button 
                    onClick={() => toggleFavorite(activeStation.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className={`w-6 h-6 ${favorites.includes(activeStation.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{activeStation.name}</h2>
                <p className="text-gray-500 font-medium mb-8 flex items-center justify-center md:justify-start gap-2">
                  <Radio className="w-4 h-4" /> {activeStation.frequency}
                </p>

                {error && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

                <div className="flex items-center justify-center md:justify-start gap-6">
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 bg-[var(--rp-primary)] text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-transform hover:scale-105 shadow-xl shadow-blue-900/20"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </button>

                  <div className="flex items-center gap-3 flex-1 max-w-[200px]">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-gray-700 transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input 
                      type="range" 
                      min="0" max="1" step="0.01" 
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(parseFloat(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[var(--rp-primary)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-gray-500" /> Stations
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {STATIONS.map(station => (
              <button 
                key={station.id}
                onClick={() => setActiveStation(station)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                  activeStation.id === station.id 
                    ? 'bg-blue-50 border border-blue-100 shadow-sm' 
                    : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <img src={station.image} alt={station.name} className="w-full h-full object-cover" />
                  {activeStation.id === station.id && isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Music className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${activeStation.id === station.id ? 'text-[var(--rp-primary)]' : 'text-gray-900'}`}>
                    {station.name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{station.genre}</p>
                </div>
                {favorites.includes(station.id) && (
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
