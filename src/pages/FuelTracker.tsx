import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Fuel, TrendingUp, History, Loader2, Plus, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface FuelLog {
  id: string;
  fill_date: string;
  odometer: number;
  liters: number;
  price_per_liter: number;
  total_cost: number;
}

export default function FuelTracker() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Form State
  const [odometer, setOdometer] = useState('');
  const [liters, setLiters] = useState('');
  const [price, setPrice] = useState('');

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("@rpf_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/env/fuel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const token = localStorage.getItem("@rpf_token");
      if (!token) {
        toast.error("You must be logged in to track fuel");
        setAdding(false);
        return;
      }

      await axios.post('/api/env/fuel', {
        odometer: Number(odometer),
        liters: Number(liters),
        price_per_liter: Number(price)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Fuel log added!");
      setOdometer('');
      setLiters('');
      setPrice('');
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add log");
    } finally {
      setAdding(false);
    }
  };

  const calculateTotalCost = () => {
    return logs.reduce((sum, log) => sum + Number(log.total_cost), 0);
  };

  const calculateTotalLiters = () => {
    return logs.reduce((sum, log) => sum + Number(log.liters), 0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-[#0B1E3F] pt-12 pb-6 px-6 text-white rounded-b-[2.5rem] shadow-md relative overflow-hidden z-10 flex-shrink-0">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl tracking-tight leading-none">Fuel Tracker</h1>
              <p className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mt-1">Vehicle Expense & Mileage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 relative -mt-6 z-20">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-4 !rounded-2xl">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3" />
              Total Spent
            </div>
            <div className="text-lg font-black text-slate-800">₹{calculateTotalCost().toFixed(2)}</div>
          </div>
          <div className="glass-card p-4 !rounded-2xl">
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Fuel className="w-3 h-3" />
              Total Fuel
            </div>
            <div className="text-lg font-black text-[#FF9933]">{calculateTotalLiters().toFixed(1)} L</div>
          </div>
        </div>

        {/* Add Log Form */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Add New Log</h2>
          </div>
          
          <form onSubmit={handleAddLog} className="p-4 space-y-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Current Odometer (km)</label>
              <input 
                type="number" 
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                placeholder="e.g., 45000"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Fuel Added (Liters)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  placeholder="e.g., 10.5"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Price per L (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 104.50"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={adding}
              className="w-full bg-[#FF9933] text-white font-bold py-2.5 rounded-xl shadow-sm hover:bg-[#e68a2e] transition mt-2 flex justify-center items-center gap-2"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
            </button>
          </form>
        </div>

        {/* Log History */}
        <div className="glass-card overflow-hidden !rounded-2xl">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-[#138808]" />
              History
            </h2>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {logs.length} entries
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 text-slate-300 animate-spin" /></div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">No fuel logs found. Add one above!</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">{Number(log.liters).toFixed(1)} L @ ₹{Number(log.price_per_liter).toFixed(2)}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(log.fill_date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">Odo: {log.odometer} km</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-rose-600">₹{Number(log.total_cost).toFixed(2)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
