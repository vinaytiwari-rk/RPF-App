import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import { Map, MapPin, Navigation, Car, Bus, Footprints, Search, ArrowRightLeft, Clock, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A component to re-center the map when route changes
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function TransitPlanner() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [mode, setMode] = useState<'transit' | 'car' | 'walking'>('transit');
  const [isRouting, setIsRouting] = useState(false);
  
  // New Delhi mock coordinates
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(12);
  
  const handleSearch = () => {
    if (!origin || !destination) return;
    setIsRouting(true);
    
    // Simulate API call and mock route calculation
    setTimeout(() => {
      // Mock points near New Delhi
      const start: [number, number] = [28.6139 + (Math.random() - 0.5) * 0.05, 77.2090 + (Math.random() - 0.5) * 0.05];
      const end: [number, number] = [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1];
      
      const mid: [number, number] = [
        (start[0] + end[0]) / 2 + (Math.random() - 0.5) * 0.02,
        (start[1] + end[1]) / 2 + (Math.random() - 0.5) * 0.02
      ];

      setRouteCoords([start, mid, end]);
      setMapCenter(start);
      setMapZoom(13);
      setIsRouting(false);
    }, 1000);
  };

  const getPolylineColor = () => {
    switch (mode) {
      case 'transit': return '#3b82f6'; // blue
      case 'car': return '#f59e0b'; // amber
      case 'walking': return '#10b981'; // emerald
      default: return '#3b82f6';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="w-8 h-8 text-blue-600" />
            Transit & Route Planner
          </h1>
          <p className="text-gray-600">Smart routing for public transit, EV, and walking.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
          <div className="glass-card p-5 rounded-2xl">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Plan Your Journey</h2>
            
            <div className="relative space-y-3 mb-6">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
                <input 
                  type="text" 
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Choose starting point..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>
              
              <div className="absolute left-[17px] top-[30px] bottom-[30px] w-0.5 bg-gray-200 border-l border-dashed border-gray-400"></div>
              
              <button 
                onClick={() => {
                  const temp = origin;
                  setOrigin(destination);
                  setDestination(temp);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 z-10 text-gray-500"
              >
                <ArrowRightLeft className="w-4 h-4 rotate-90" />
              </button>

              <div className="relative">
                <MapPin className="w-4 h-4 text-red-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Choose destination..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setMode('transit')}
                className={`flex-1 flex justify-center py-2 rounded-lg text-sm font-medium transition-all ${mode === 'transit' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Bus className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setMode('car')}
                className={`flex-1 flex justify-center py-2 rounded-lg text-sm font-medium transition-all ${mode === 'car' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Car className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setMode('walking')}
                className={`flex-1 flex justify-center py-2 rounded-lg text-sm font-medium transition-all ${mode === 'walking' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Footprints className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={handleSearch}
              disabled={!origin || !destination || isRouting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRouting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-5 h-5" /> Search Routes
                </>
              )}
            </button>
          </div>

          {routeCoords.length > 0 && (
            <div className="glass-card p-5 rounded-2xl flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-500" /> Route Details
              </h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-blue-900">Estimated Time</span>
                  <span className="text-lg font-bold text-blue-700">24 min</span>
                </div>
                <div className="flex justify-between items-center text-xs text-blue-600/80">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> 5.2 km</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Arrive by 4:10 PM</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shrink-0"></div>
                    <div className="w-0.5 h-full bg-gray-200 my-1"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold text-gray-900">{origin}</p>
                    <p className="text-xs text-gray-500">Walk 2 min to station</p>
                  </div>
                </div>
                
                {mode === 'transit' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full shrink-0 flex items-center justify-center">
                        <Bus className="w-3 h-3" />
                      </div>
                      <div className="w-0.5 h-full bg-blue-200 my-1"></div>
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold text-gray-900">Bus 420 - Central Line</p>
                      <p className="text-xs text-gray-500">4 stops • 15 min</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{destination}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {routeCoords.length === 0 && (
            <div className="glass-card p-5 rounded-2xl flex-1 flex flex-col items-center justify-center text-center text-gray-500 opacity-60">
              <Map className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Search for a route to see details and directions.</p>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden shadow-sm relative z-0 h-full min-h-[400px]">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            className="w-full h-full"
            zoomControl={false}
          >
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {routeCoords.length > 0 && (
              <>
                <Polyline 
                  positions={routeCoords} 
                  color={getPolylineColor()} 
                  weight={5}
                  opacity={0.8}
                  dashArray={mode === 'walking' ? "5, 10" : undefined}
                />
                
                <Marker position={routeCoords[0]}>
                  <Popup>Start: {origin}</Popup>
                </Marker>
                
                <Marker position={routeCoords[routeCoords.length - 1]}>
                  <Popup>End: {destination}</Popup>
                </Marker>
              </>
            )}
          </MapContainer>
          
          <div className="absolute bottom-4 right-4 z-[400] bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-start gap-3 max-w-sm">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-900">Mock Data Mode</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                This is a UI demonstration. External routing engines (OSRM/Mapbox) would process the actual polyline data for live paths.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
