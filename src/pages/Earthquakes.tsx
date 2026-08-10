import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, MapPin, AlertTriangle, Loader2, Globe, Clock, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import { motion } from 'motion/react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Earthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    url: string;
    alert: string;
  };
  geometry: {
    coordinates: [number, number, number];
  };
}

export default function Earthquakes() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        const res = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        setEarthquakes(res.data.features || []);
      } catch (err: any) {
        setError('Failed to load earthquake data. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchEarthquakes();
  }, []);

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 6) return '#ef4444'; // Red
    if (mag >= 4) return '#f97316'; // Orange
    return '#eab308'; // Yellow
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-[#000080] pt-12 pb-6 px-6 text-white rounded-b-[2.5rem] shadow-md relative overflow-hidden z-10 flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Global Seismic Alerts</h1>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mt-1">USGS Live Earthquakes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 relative -mt-6 z-20">
        <div className="glass-card overflow-hidden !rounded-2xl flex flex-col h-[350px]">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              Live Activity Map
            </h2>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              M2.5+ Past 24h
            </span>
          </div>
          
          <div className="flex-1 w-full bg-slate-200 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-rose-500 text-xs font-bold px-6 text-center">
                {error}
              </div>
            ) : (
              <MapContainer 
                center={[20, 0]} 
                zoom={1.5} 
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />
                {earthquakes.map((eq) => {
                  const [lon, lat] = eq.geometry.coordinates;
                  const color = getMagnitudeColor(eq.properties.mag);
                  return (
                    <CircleMarker
                      key={eq.id}
                      center={[lat, lon]}
                      radius={Math.max(5, eq.properties.mag * 2.5)}
                      pathOptions={{
                        fillColor: color,
                        color: color,
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.6
                      }}
                    >
                      <Popup className="text-xs">
                        <strong>M {eq.properties.mag.toFixed(1)}</strong><br />
                        {eq.properties.place}<br />
                        <span className="text-[10px] text-gray-500">
                          {new Date(eq.properties.time).toLocaleString()}
                        </span>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            )}
          </div>
        </div>

        {/* List view */}
        <div className="glass-card overflow-hidden !rounded-2xl flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Recent Alerts
            </h2>
            <span className="text-xs font-bold text-slate-600">
              {earthquakes.length} Events
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">Loading seismic data...</div>
            ) : earthquakes.length === 0 && !error ? (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">No recent earthquakes found.</div>
            ) : (
              earthquakes.slice(0, 50).map((eq, i) => (
                <motion.a 
                  href={eq.properties.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={eq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black shadow-sm flex-shrink-0"
                    style={{ backgroundColor: getMagnitudeColor(eq.properties.mag) }}
                  >
                    {eq.properties.mag.toFixed(1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-800 truncate">{eq.properties.place}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(eq.properties.time).toLocaleTimeString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {eq.geometry.coordinates[2]} km deep</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </motion.a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
