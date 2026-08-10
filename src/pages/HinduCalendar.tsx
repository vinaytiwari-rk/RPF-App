import React, { useState } from 'react';
import { Calendar, Sun, Moon, Sparkles, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function HinduCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Some mock data for festivals and tithis
  const festivals = [
    { date: '2024-10-31', name: 'Diwali', description: 'Festival of Lights' },
    { date: '2024-10-12', name: 'Dussehra', description: 'Vijayadashami' },
    { date: '2024-09-07', name: 'Ganesh Chaturthi', description: 'Birth of Lord Ganesha' },
    { date: '2024-03-25', name: 'Holi', description: 'Festival of Colors' },
    { date: '2024-01-15', name: 'Makar Sankranti', description: 'Kite Festival' }
  ];

  const getTithi = (day: number) => {
    const tithis = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya'];
    return tithis[day % 15];
  };

  const getPaksha = (day: number) => {
    return (day % 30) < 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const upcomingFestivals = festivals.filter(f => new Date(f.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-[var(--rp-primary)]" />
            Hindu Calendar
          </h1>
          <p className="text-gray-600">Panchang, Tithis, and Auspicious Days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-sm font-semibold text-gray-500 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasFestival = festivals.find(f => f.date === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <div key={day} className={`p-2 border border-gray-100 rounded-xl relative flex flex-col items-center justify-center min-h-[80px] transition-all hover:border-[var(--rp-primary)] hover:shadow-sm ${isToday ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
                    <span className={`text-lg font-bold ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>{day}</span>
                    <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center mt-1">{getTithi(day)}</span>
                    {hasFestival && (
                      <div className="absolute top-1 right-1">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-500" /> Today's Panchang
            </h3>
            <div className="space-y-4">
              <div className="bg-white/80 p-3 rounded-xl border border-orange-100">
                <p className="text-xs text-gray-500 mb-1">Tithi</p>
                <p className="font-semibold text-gray-800">{getTithi(new Date().getDate())}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-orange-100">
                <p className="text-xs text-gray-500 mb-1">Paksha</p>
                <p className="font-semibold text-gray-800">{getPaksha(new Date().getDate())}</p>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-orange-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sunrise</p>
                  <p className="font-semibold text-gray-800">06:12 AM</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Sunset</p>
                  <p className="font-semibold text-gray-800">06:45 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> Upcoming Festivals
            </h3>
            <div className="space-y-3">
              {upcomingFestivals.slice(0, 4).map((festival, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold">{new Date(festival.date).getDate()}</span>
                    <span className="text-[10px] uppercase">{new Date(festival.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{festival.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{festival.description}</p>
                  </div>
                </div>
              ))}
              {upcomingFestivals.length === 0 && (
                <p className="text-sm text-gray-500 italic">No upcoming festivals this year.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
