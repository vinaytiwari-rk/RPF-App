import React, { useState, useEffect } from 'react';
import { Pill, Clock, Plus, Trash2, Bell, BellOff, Info } from 'lucide-react';
import toast from 'react-hot-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string; // HH:MM
}

export default function MedicationReminder() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Form
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('@rpf_meds');
    if (saved) setMeds(JSON.parse(saved));

    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error("Your browser doesn't support notifications");
      return;
    }
    const perm = await Notification.requestPermission();
    setNotificationsEnabled(perm === 'granted');
    if (perm === 'granted') {
      toast.success("Notifications enabled!");
      new Notification("Medication Reminder Setup", { body: "You will now receive pill reminders." });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !time) return;
    const newMed: Medication = {
      id: Date.now().toString(),
      name,
      dosage,
      time
    };
    const updated = [...meds, newMed].sort((a, b) => a.time.localeCompare(b.time));
    setMeds(updated);
    localStorage.setItem('@rpf_meds', JSON.stringify(updated));
    setName('');
    setDosage('');
    setTime('');
    toast.success("Medication added");
  };

  const handleDelete = (id: string) => {
    const updated = meds.filter(m => m.id !== id);
    setMeds(updated);
    localStorage.setItem('@rpf_meds', JSON.stringify(updated));
  };

  // Basic check for due medications (runs every minute in a real app, simplified here)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      meds.forEach(m => {
        if (m.time === currentHHMM && now.getSeconds() === 0) {
          if (notificationsEnabled) {
            new Notification(`Time for ${m.name}`, { body: `Dosage: ${m.dosage}` });
          } else {
            toast(`Time to take ${m.name} (${m.dosage})`, { icon: '💊' });
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [meds, notificationsEnabled]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-[#000080] pt-12 pb-6 px-6 text-white rounded-b-[2.5rem] shadow-md relative overflow-hidden z-10 flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Med Tracker</h1>
                <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mt-1">Pill Reminder System</p>
              </div>
            </div>
            <button 
              onClick={requestPermission}
              className={`p-2 rounded-full border ${notificationsEnabled ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-rose-500/20 border-rose-400 text-rose-300'}`}
            >
              {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 relative -mt-6 z-20">
        
        {!notificationsEnabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 text-amber-800 text-xs">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Push notifications are disabled. Tap the bell icon in the header to get reliable browser alerts when it's time to take your medication.</p>
          </div>
        )}

        {/* Add Form */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Add Medication</h2>
          </div>
          
          <form onSubmit={handleAdd} className="p-4 space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Medication Name</label>
              <input 
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g., Paracetamol" required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dosage</label>
                <input 
                  type="text" value={dosage} onChange={e => setDosage(e.target.value)}
                  placeholder="e.g., 500mg (1 Pill)" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</label>
                <input 
                  type="time" value={time} onChange={e => setTime(e.target.value)} required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-[#000080] text-white font-bold py-2.5 rounded-xl hover:bg-blue-900 transition mt-2">
              Add Reminder
            </button>
          </form>
        </div>

        {/* Schedule */}
        <h3 className="font-display font-extrabold text-[#000080] text-sm uppercase tracking-wider px-1 pt-2">Your Schedule</h3>
        <div className="space-y-2">
          {meds.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-bold bg-white rounded-2xl border border-dashed border-slate-300">
              No medications scheduled.
            </div>
          ) : (
            meds.map(med => (
              <div key={med.id} className="glass-card p-3 !rounded-2xl flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl shrink-0">
                  <div className="text-blue-800 font-black text-sm">{med.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 text-sm truncate">{med.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500">{med.dosage}</div>
                </div>
                <button onClick={() => handleDelete(med.id)} className="p-2 text-slate-400 hover:text-rose-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
