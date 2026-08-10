import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Navigation, Car, Gauge, ShieldAlert, Navigation2 } from 'lucide-react';

export default function GPSToolkit() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parkedLocation, setParkedLocation] = useState<{lat: number, lng: number, time: number} | null>(null);

  useEffect(() => {
    // Load parked car
    const saved = localStorage.getItem('@rpf_parked_car');
    if (saved) {
      setParkedLocation(JSON.parse(saved));
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const saveParking = () => {
    if (!position) return;
    const loc = { lat: position.coords.latitude, lng: position.coords.longitude, time: Date.now() };
    localStorage.setItem('@rpf_parked_car', JSON.stringify(loc));
    setParkedLocation(loc);
    alert('Parking location saved!');
  };

  const clearParking = () => {
    localStorage.removeItem('@rpf_parked_car');
    setParkedLocation(null);
  };

  // Convert m/s to km/h
  const speedKmh = position?.coords.speed ? (position.coords.speed * 3.6).toFixed(1) : '0.0';
  const altitude = position?.coords.altitude ? position.coords.altitude.toFixed(1) : '--';
  const heading = position?.coords.heading ? position.coords.heading.toFixed(0) : '--';

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 pb-24 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 pt-12 pb-6 px-6 border-b border-slate-700/50 relative overflow-hidden z-10 flex-shrink-0">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/20 p-2.5 rounded-xl border border-blue-500/30">
              <Compass className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none text-white">GPS Toolkit</h1>
              <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mt-1">Satellite Navigation Info</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
            <p className="text-xs text-rose-200">{error}</p>
          </div>
        )}

        {/* Speedometer Panel */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            <Gauge className="w-3 h-3 text-emerald-400" />
            Speed
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 font-mono">
              {speedKmh}
            </span>
            <span className="text-sm font-bold text-slate-500 uppercase">km/h</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Altitude</div>
            <div className="text-xl font-black text-white font-mono">{altitude} <span className="text-xs text-slate-500">m</span></div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
            <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Heading</div>
            <div className="text-xl font-black text-white font-mono flex items-center gap-2">
              {heading}° 
              {heading !== '--' && <Navigation2 className="w-4 h-4 text-blue-400" style={{ transform: `rotate(${heading}deg)` }} />}
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 col-span-2">
            <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Coordinates (Lat, Lng)</div>
            <div className="text-sm font-bold text-blue-300 font-mono">
              {position ? `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` : 'Locating...'}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Accuracy: {position ? `±${position.coords.accuracy.toFixed(0)}m` : '--'}</div>
          </div>
        </div>

        {/* Find My Parked Car */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-indigo-500/30 rounded-3xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-indigo-100 uppercase tracking-wider">Parked Car</h3>
          </div>

          {parkedLocation ? (
            <div className="space-y-4">
              <div className="bg-black/20 rounded-xl p-3 text-xs font-medium text-indigo-200">
                <div className="flex items-center gap-1.5 mb-1"><MapPin className="w-3 h-3 text-rose-400" /> Saved {new Date(parkedLocation.time).toLocaleTimeString()}</div>
                <div className="font-mono text-[10px] text-indigo-300 opacity-75">{parkedLocation.lat.toFixed(5)}, {parkedLocation.lng.toFixed(5)}</div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${parkedLocation.lat},${parkedLocation.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-xl text-center transition"
                >
                  Navigate
                </a>
                <button 
                  onClick={clearParking}
                  className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition border border-slate-600"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={saveParking}
              disabled={!position}
              className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Save Current Location
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
