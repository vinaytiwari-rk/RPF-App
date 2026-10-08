import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tv, Save, Plus, Trash2, Edit2, RadioReceiver, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function LiveTVStudio() {
  const [activeTab, setActiveTab] = useState("live_tv");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tvChannels, setTvChannels] = useState<any[]>([]);
  const [radioStations, setRadioStations] = useState<any[]>([]);

  useEffect(() => {
    fetchCms();
  }, []);

  const fetchCms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      if (res.data?.cms) {
        setTvChannels(res.data.cms.liveTvChannels || []);
        setRadioStations(res.data.cms.internetRadioStations || []);
      }
    } catch (e) {
      toast.error("Failed to load Live TV config");
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
        liveTvChannels: tvChannels,
        internetRadioStations: radioStations
      };

      const res = await axios.post("/api/cms", newCms, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Broadcast settings saved!");
      }
    } catch (e) {
      toast.error("Failed to save broadcast settings");
    } finally {
      setSaving(false);
    }
  };

  const addChannel = () => {
    setTvChannels([
      ...tvChannels,
      { id: `uploaded-$\{(new Date()).getTime()}`, name: "New Channel", url: "", enabled: true, category: "News" }
    ]);
  };

  const removeChannel = (idx: number) => {
    const newChannels = [...tvChannels];
    newChannels.splice(idx, 1);
    setTvChannels(newChannels);
  };

  const updateChannel = (idx: number, field: string, value: any) => {
    const newChannels = [...tvChannels];
    newChannels[idx] = { ...newChannels[idx], [field]: value };
    setTvChannels(newChannels);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Tv className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0A192F]">Live TV & Broadcasting Studio</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage M3U8 streams, YouTube live links, and Internet Radio stations.
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
            className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1e3a8ad0] transition"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Streams
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-2">
        <button
          onClick={() => setActiveTab("live_tv")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full transition-colors $\{
            activeTab === "live_tv"
              ? "bg-[#0A192F] text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Tv className="h-4 w-4" /> Live TV Channels
        </button>
        <button
          onClick={() => setActiveTab("radio")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-full transition-colors $\{
            activeTab === "radio"
              ? "bg-[#0A192F] text-white shadow-md"
              : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <RadioReceiver className="h-4 w-4" /> Internet Radio
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : activeTab === "live_tv" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-900">Manage TV Channels</h3>
              <button
                onClick={addChannel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Channel
              </button>
            </div>
            
            <div className="grid gap-4">
              {tvChannels.map((ch, i) => (
                <div key={ch.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col md:flex-row gap-4 bg-slate-50">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Channel Name</label>
                        <input
                          type="text"
                          value={ch.name || ""}
                          onChange={(e) => updateChannel(i, "name", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Category</label>
                        <select
                          value={ch.category || "News"}
                          onChange={(e) => updateChannel(i, "category", e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="News">News</option>
                          <option value="Devotional">Devotional</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Kids">Kids</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Stream URL (M3U8 / Website / YouTube)</label>
                      <input
                        type="text"
                        value={ch.url || ""}
                        onChange={(e) => updateChannel(i, "url", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-start md:items-center justify-between md:flex-col gap-2 md:justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-4 md:w-24 shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ch.enabled !== false}
                        onChange={(e) => updateChannel(i, "enabled", e.target.checked)}
                        className="w-4 h-4 accent-blue-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">Active</span>
                    </label>
                    <button
                      onClick={() => removeChannel(i)}
                      className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Channel"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900">Manage Radio Stations</h3>
            <div className="text-center py-10 text-slate-400 text-xs font-medium">
              Internet Radio configuration interface...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
