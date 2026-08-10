import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, MapPin, Phone, MessageSquare, Volume2, VolumeX, Plus, Trash2, Mail } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const SOSSystem: React.FC = () => {
  const [isPanicActive, setIsPanicActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [sirenEnabled, setSirenEnabled] = useState(false);

  useEffect(() => {
    // Load contacts
    const savedContacts = localStorage.getItem('rp_sos_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
    
    // Create a simple oscillating siren using Web Audio API
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let oscillator: OscillatorNode | null = null;
    let gainNode: GainNode | null = null;
    let intervalId: number | undefined;

    const playSiren = () => {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'square';
      oscillator.start();
      
      let high = true;
      intervalId = window.setInterval(() => {
        if (oscillator && gainNode) {
          oscillator.frequency.setValueAtTime(high ? 800 : 400, audioCtx.currentTime);
          high = !high;
        }
      }, 300);
    };

    const stopSiren = () => {
      if (intervalId) clearInterval(intervalId);
      if (oscillator) {
        oscillator.stop();
        oscillator.disconnect();
      }
      if (gainNode) {
        gainNode.disconnect();
      }
    };

    if (isPanicActive && sirenEnabled) {
      playSiren();
    } else {
      stopSiren();
    }

    return () => {
      stopSiren();
    };
  }, [isPanicActive, sirenEnabled]);

  const handlePanic = () => {
    if (!isPanicActive) {
      setIsPanicActive(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => {
            setLocationError('Could not get location. Ensure permissions are granted.');
          }
        );
      } else {
        setLocationError('Geolocation not supported.');
      }
    } else {
      setIsPanicActive(false);
    }
  };

  const addContact = () => {
    if (newContactName.trim() && newContactPhone.trim()) {
      const newContact = {
        id: Date.now().toString(),
        name: newContactName,
        phone: newContactPhone
      };
      const updated = [...contacts, newContact];
      setContacts(updated);
      localStorage.setItem('rp_sos_contacts', JSON.stringify(updated));
      setNewContactName('');
      setNewContactPhone('');
    }
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setContacts(updated);
    localStorage.setItem('rp_sos_contacts', JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-[var(--rp-primary)]" />
            SOS System
          </h1>
          <p className="text-gray-600">Personal safety and emergency response toolkit.</p>
        </div>
      </div>

      <div className={`glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center transition-colors duration-500 ${isPanicActive ? 'bg-red-50 border-red-500' : ''}`}>
        <button
          onClick={handlePanic}
          className={`w-48 h-48 rounded-full shadow-premium flex flex-col items-center justify-center transition-all duration-300 transform ${isPanicActive ? 'bg-red-600 text-white scale-110 animate-pulse' : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'}`}
        >
          <ShieldAlert className="w-16 h-16 mb-2" />
          <span className="text-3xl font-bold uppercase tracking-wider">{isPanicActive ? 'ACTIVE' : 'SOS'}</span>
        </button>
        <p className="mt-6 text-gray-600 max-w-md">
          {isPanicActive 
            ? 'Emergency mode activated. Capturing location and alerting contacts.' 
            : 'Tap the SOS button to immediately alert your trusted contacts with your current location.'}
        </p>

        {isPanicActive && (
          <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-red-200 w-full max-w-md text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Current Location
            </h3>
            {location ? (
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                <p><strong>Lat:</strong> {location.lat.toFixed(6)}</p>
                <p><strong>Lng:</strong> {location.lng.toFixed(6)}</p>
                <a 
                  href={`https://maps.google.com/?q=${location.lat},${location.lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            ) : locationError ? (
              <p className="text-sm text-red-600">{locationError}</p>
            ) : (
              <p className="text-sm text-gray-500 animate-pulse">Locating...</p>
            )}
            
            <div className="mt-4 grid grid-cols-1 gap-2">
              <h3 className="font-semibold text-gray-900 mb-1">Quick Actions</h3>
              <a href="tel:911" className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-md">
                <Phone className="w-5 h-5" /> Dial Emergency (911 / 112)
              </a>
              <a href={`mailto:?subject=EMERGENCY SOS&body=SOS! I need help. My current location is: https://maps.google.com/?q=${location?.lat},${location?.lng}`} className="flex items-center justify-center gap-2 w-full py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-bold">
                <Mail className="w-5 h-5" /> Email My Location
              </a>
              {contacts.map(c => (
                <a key={c.id} href={`sms:${c.phone}?body=SOS! I need help. My location: https://maps.google.com/?q=${location?.lat},${location?.lng}`} className="flex items-center justify-center gap-2 w-full py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                  <MessageSquare className="w-5 h-5" /> Send SOS Alert to {c.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-[var(--rp-saffron)]" />
              Alarm Settings
            </h2>
            <button 
              onClick={() => setSirenEnabled(!sirenEnabled)}
              className={`p-2 rounded-lg transition-colors ${sirenEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {sirenEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            When enabled, activating SOS will play a loud, oscillating siren sound from your device to attract attention and deter threats.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <span className={`text-sm font-bold px-2 py-1 rounded-full ${sirenEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {sirenEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Trusted Contacts</h2>
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No emergency contacts added yet.</p>
            ) : (
              <ul className="space-y-3">
                {contacts.map(c => (
                  <li key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-500">{c.phone}</p>
                    </div>
                    <button 
                      onClick={() => deleteContact(c.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Contact</h3>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Name" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                />
                <div className="flex gap-2">
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                  />
                  <button 
                    onClick={addContact}
                    className="px-4 py-2 bg-[var(--rp-primary)] text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center"
                    disabled={!newContactName.trim() || !newContactPhone.trim()}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSSystem;
