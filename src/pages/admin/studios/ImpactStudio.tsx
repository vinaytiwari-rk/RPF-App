import React, { useState, useEffect } from "react";
import axios from "axios";
import { HeartHandshake, Save, Plus, Trash2, RefreshCw, Video } from "lucide-react";
import toast from "react-hot-toast";

export default function ImpactStudio() {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCms();
  }, []);

  const fetchCms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      if (res.data?.cms) {
        setReels(res.data.cms.instagramPosts || []);
      }
    } catch (e) {
      toast.error("Failed to load Impact config");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const currentRes = await axios.get("/api/cms");
      const currentCms = currentRes.data?.cms || {};

      const newCms = {
        ...currentCms,
        instagramPosts: reels
      };

      const res = await axios.post("/api/cms", newCms, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Impact settings saved!");
      }
    } catch (e) {
      toast.error("Failed to save Impact settings");
    } finally {
      setSaving(false);
    }
  };

  const addReel = () => {
    setReels([
      { id: `reel-$\{(new Date()).getTime()}`, type: "youtube", url: "", caption: "New Reel" },
      ...reels
    ]);
  };

  const removeReel = (idx: number) => {
    const newReels = [...reels];
    newReels.splice(idx, 1);
    setReels(newReels);
  };

  const updateReel = (idx: number, field: string, value: any) => {
    const newReels = [...reels];
    newReels[idx] = { ...newReels[idx], [field]: value };
    setReels(newReels);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0A192F]">Impact & Ground Action Studio</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage social reels, foundation ground reports, and volunteer tracker metrics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCms}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 $\{loading ? 'animate-spin' : ''}`} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Impact Config
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-900">Manage Social Reels</h3>
              <button
                onClick={addReel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg hover:bg-rose-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Reel
              </button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {reels.map((reel, i) => (
                <div key={reel.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col gap-4 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-[#0A192F]">
                      <Video className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">Video Block</span>
                    </div>
                    <button
                      onClick={() => removeReel(i)}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Video URL (YouTube/Direct)</label>
                    <input
                      type="text"
                      value={reel.url || ""}
                      onChange={(e) => updateReel(i, "url", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Caption</label>
                    <textarea
                      rows={2}
                      value={reel.caption || ""}
                      onChange={(e) => updateReel(i, "caption", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
