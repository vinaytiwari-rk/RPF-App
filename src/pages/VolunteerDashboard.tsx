import React, { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Award, Target, CheckCircle, Clock, Navigation, MapPin, User, ArrowLeft, Star, FileText } from "lucide-react";

interface VolunteerTask {
  id: string;
  volunteerId: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  status: "pending" | "in-progress" | "completed";
  points: number;
  createdAt: string;
  completedAt?: string;
}

export default function VolunteerDashboard() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/volunteer_tasks?volunteerId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch (err) {
        console.error("Failed to fetch volunteer tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [user, navigate]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const response = await fetch(`/api/volunteer_tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: status as any } : t));
        // Force context user update for points (simplified for demo)
      }
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 pb-24">
      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-indigo-900 to-[#000080] p-5 pt-8 text-white relative overflow-hidden shadow-lg rounded-b-3xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="relative z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-white/10 transition mb-3">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-white/20 mb-2 shadow-sm">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                {user?.badges && user.badges > 0 ? "Verified Field Agent" : "Active Volunteer"}
              </div>
              <h2 className="font-display font-black text-2xl tracking-tight leading-tight">
                {user?.name || "Volunteer"}
              </h2>
              <p className="text-indigo-200 text-xs font-bold mt-1 max-w-[200px]">
                {isHi ? "सक्रिय कार्य डैशबोर्ड" : "Field Operations Dashboard"}
              </p>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <div className="w-14 h-14 bg-white/10 border-2 border-amber-400/50 rounded-2xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent"></div>
                <Star className="w-4 h-4 text-amber-400 mb-0.5" />
                <span className="font-black text-sm text-white leading-none">{user?.points || 0}</span>
                <span className="text-[7px] font-bold text-amber-200 uppercase tracking-widest mt-0.5">Pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 -mt-3 relative z-20">
        
        {/* Analytics Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isHi ? "सक्रिय कार्य" : "Active Tasks"}</p>
              <p className="text-lg font-black text-slate-800">{pendingTasks.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isHi ? "पूरे किए गए" : "Completed"}</p>
              <p className="text-lg font-black text-slate-800">{completedTasks.length}</p>
            </div>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 border-b border-slate-200/80 pb-2">
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> 
              {isHi ? "सौंपे गए कार्य" : "Assigned Field Tasks"}
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs font-bold text-slate-400">Loading tasks...</div>
          ) : pendingTasks.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-300 rounded-2xl">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-500">
                {isHi ? "अभी कोई कार्य नहीं है!" : "All caught up! No active tasks."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div key={task.id} className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider">
                      <Clock className="w-3 h-3" /> {task.status === "in-progress" ? (isHi ? "प्रगति पर" : "In Progress") : (isHi ? "लंबित" : "Pending")}
                    </span>
                    <span className="text-[10px] font-black text-slate-400">+{task.points} Pts</span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-slate-800 mb-1 leading-snug">
                    {isHi ? task.titleHi : task.titleEn}
                  </h4>
                  <p className="text-[11px] font-semibold text-slate-500 line-clamp-2 mb-4">
                    {isHi ? task.descriptionHi : task.descriptionEn}
                  </p>

                  <div className="flex gap-2">
                    {task.status === "pending" && (
                      <button 
                        onClick={() => updateTaskStatus(task.id, "in-progress")}
                        className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-[10px] uppercase tracking-wider rounded-xl transition"
                      >
                        {isHi ? "शुरू करें" : "Start Task"}
                      </button>
                    )}
                    {task.status === "in-progress" && (
                      <>
                        <button className="flex items-center justify-center w-10 h-10 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition">
                          <Navigation className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateTaskStatus(task.id, "completed")}
                          className="flex-1 py-2.5 bg-[#000080] hover:bg-navy-dark text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition shadow-md"
                        >
                          {isHi ? "पूरा चिह्नित करें" : "Mark Complete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
