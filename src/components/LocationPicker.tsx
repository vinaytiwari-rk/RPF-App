import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import BrandLoader from './BrandLoader';
import L from 'leaflet';

// Fix Leaflet's default icon issue with React
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

interface LocationPickerProps { onLocationSelect: (locationString: string) => void; defaultLocation?: string; }

function LocationMarker({ position, setPosition, setAddress }: any) {
  const map = useMapEvents({ click(e) { setPosition(e.latlng); setAddress(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`); } });
  useEffect(() => { if (position) map.flyTo(position, map.getZoom()); }, [position, map]);
  return position === null ? null : <Marker position={position} />;
}

export default function LocationPicker({ onLocationSelect, defaultLocation }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [address, setAddress] = useState(defaultLocation || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  useEffect(() => { if (!defaultLocation) detectLocation(); }, []);
  useEffect(() => { onLocationSelect(address); }, [address]);
  const detectLocation = () => {
    setLoading(true); setErrorMsg('');
    if ('geolocation' in navigator) navigator.geolocation.getCurrentPosition(
      pos => { const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude); setPosition(latlng); setAddress(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`); setLoading(false); },
      err => { console.error(err); setErrorMsg('Failed to detect location. Please click on the map.'); setLoading(false); }
    );
    else { setErrorMsg('Geolocation is not supported by your browser.'); setLoading(false); }
  };
  return <div className="space-y-3 w-full">
    <div className="flex flex-col sm:flex-row gap-3">
      <input type="text" readOnly className="flex-1 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 block" placeholder="GPS Coordinates will appear here..." value={address}/>
      <button type="button" onClick={detectLocation} disabled={loading} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-4 py-2.5 focus:ring-4 focus:ring-blue-300 transition-colors">
        {loading ? <BrandLoader size="sm" label="Detecting location" className="[&>span]:bg-transparent [&>span]:p-0 [&>span]:shadow-none [&>span]:ring-0" /> : <Navigation size={18}/>}<span>Detect GPS</span>
      </button>
    </div>
    {errorMsg && <p className="text-red-500 text-xs font-medium">{errorMsg}</p>}
    <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm relative z-0"><MapContainer center={position || [22.9734, 78.6569]} zoom={position ? 15 : 4} style={{ height: '100%', width: '100%' }}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/><LocationMarker position={position} setPosition={setPosition} setAddress={setAddress}/></MapContainer></div>
    <p className="text-xs text-gray-500"><MapPin size={12} className="inline mr-1"/>If the GPS is inaccurate, you can click on the map to place the pin manually.</p>
  </div>;
}
