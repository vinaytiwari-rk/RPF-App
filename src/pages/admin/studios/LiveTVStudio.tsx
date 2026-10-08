import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Tv,
  Radio,
  FileText,
  Plus,
  Trash2,
  Edit3,
  Play,
  Save,
  CheckCircle,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Globe,
  RadioTower,
  Eye,
  EyeOff,
  Video
} from "lucide-react";
import toast from "react-hot-toast";

type MediaType = "tv" | "radio" | "epaper";

interface TVChannel {
  id: string;
  name: string;
  url: string;
  videoId?: string;
  category: string;
  logo?: string;
  enabled?: boolean;
}

interface RadioStation {
  id: string;
  name: string;
  url: string;
  category?: string;
  region?: string;
  enabled?: boolean;
}

interface EpaperItem {
  id: string;
  name: string;
  nameHi?: string;
  url: string;
  language: string;
  enabled?: boolean;
}

export default function LiveTVStudio() {
  const [activeTab, setActiveTab] = useState<MediaType>("tv");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // Media Collections
  const [tvChannels, setTvChannels] = useState<TVChannel[]>([]);
  const [radioStations, setRadioStations] = useState<RadioStation[]>([]);
  const [epapers, setEpapers] = useState<EpaperItem[]>([]);

  // Selected item for right inspector pane
  const [selectedItem, setSelectedItem] = useState<{
    type: MediaType;
    data: any;
  } | null>(null);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    fetchCmsMedia();
  }, []);

  const fetchCmsMedia = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      const cms = res.data?.cms || res.data?.data || {};

      // Live TV
      if (Array.isArray(cms.liveTvChannels)) {
        setTvChannels(cms.liveTvChannels);
      } else {
        setTvChannels([]);
      }

      // Internet Radio
      if (Array.isArray(cms.internetRadioStations)) {
        setRadioStations(cms.internetRadioStations);
      } else {
        setRadioStations([]);
      }

      // E-Papers
      if (Array.isArray(cms.epapers)) {
        setEpapers(cms.epapers);
      } else {
        // Fallback defaults if not in CMS
        setEpapers([
          { id: "epaper-1", name: "Free Press Journal", nameHi: "फ्री प्रेस जर्नल", url: "https://epaper.freepressjournal.in/", language: "English", enabled: true },
          { id: "epaper-2", name: "Peoples Samachar", nameHi: "पीपुल्स समाचार", url: "https://epapers.peoplessamachar.in/", language: "Hindi", enabled: true },
          { id: "epaper-3", name: "Mid-Day", nameHi: "मिड-डे", url: "https://epaper.mid-day.com/", language: "English", enabled: true },
          { id: "epaper-4", name: "Aaj Tak", nameHi: "आज तक", url: "https://epaper.aajtak.in/", language: "Hindi", enabled: true },
          { id: "epaper-5", name: "Lokdesh Bhopal", nameHi: "लोकदेश भोपाल", url: "https://lokdesh.com/bhopal-e-papers/", language: "Hindi", enabled: true },
        ]);
      }
    } catch {
      toast.error("Failed to load broadcast media catalog");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!token) {
      toast.error("Admin session expired");
      return;
    }
    setSaving(true);
    const toastId = toast.loading("Publishing broadcast media safely...");
    try {
      const patch = {
        liveTvChannels: tvChannels,
        internetRadioStations: radioStations,
        epapers: epapers,
      };

      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: `Broadcast Hub: update ${activeTab} content` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      toast.success("Broadcast channels live on mobile & web!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Save failed", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Add new item helper
  const handleAddNew = () => {
    const id = `${activeTab}-${Date.now()}`;
    if (activeTab === "tv") {
      const newItem: TVChannel = { id, name: "New TV Channel", url: "https://www.youtube.com/live/...", category: "News", enabled: true };
      setTvChannels([newItem, ...tvChannels]);
      setSelectedItem({ type: "tv", data: newItem });
    } else if (activeTab === "radio") {
      const newItem: RadioStation = { id, name: "New FM Station", url: "https://stream...", category: "Regional", enabled: true };
      setRadioStations([newItem, ...radioStations]);
      setSelectedItem({ type: "radio", data: newItem });
    } else {
      const newItem: EpaperItem = { id, name: "New Newspaper", url: "https://epaper...", language: "Hindi", enabled: true };
      setEpapers([newItem, ...epapers]);
      setSelectedItem({ type: "epaper", data: newItem });
    }
  };

  // Delete item helper
  const handleDelete = (id: string) => {
    if (activeTab === "tv") {
      setTvChannels(tvChannels.filter(c => c.id !== id));
    } else if (activeTab === "radio") {
      setRadioStations(radioStations.filter(s => s.id !== id));
    } else {
      setEpapers(epapers.filter(p => p.id !== id));
    }
    if (selectedItem?.data?.id === id) {
      setSelectedItem(null);
    }
  };

  // Toggle enable status
  const handleToggleEnable = (id: string) => {
    if (activeTab === "tv") {
      setTvChannels(tvChannels.map(c => c.id === id ? { ...c, enabled: c.enabled === false ? true : false } : c));
    } else if (activeTab === "radio") {
      setRadioStations(radioStations.map(s => s.id === id ? { ...s, enabled: s.enabled === false ? true : false } : s));
    } else {
      setEpapers(epapers.map(p => p.id === id ? { ...p, enabled: p.enabled === false ? true : false } : p));
    }
    if (selectedItem?.data?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, data: { ...prev.data, enabled: prev.data.enabled === false ? true : false } } : null);
    }
  };

  // Filter current active tab items
  const currentItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (activeTab === "tv") {
      return tvChannels.filter(c => (c.name || "").toLowerCase().includes(q) || (c.category || "").toLowerCase().includes(q));
    } else if (activeTab === "radio") {
      return radioStations.filter(s => (s.name || "").toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q));
    } else {
      return epapers.filter(p => (p.name || "").toLowerCase().includes(q) || (p.language || "").toLowerCase().includes(q));
    }
  }, [activeTab, tvChannels, radioStations, epapers, search]);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* HEADER MATCHING LEGACY CMS DESIGN */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-amber-50 text-amber-600">
            <RadioTower className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-amber-600">Broadcast & Infotainment CMS</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Live TV, Radio & E-Paper Command</h1>
            <p className="text-xs text-slate-500 mt-1">
              Live stream URLs, government channels, regional radio frequencies and daily digital newspapers.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add New Stream
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition shadow-xs disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
      </div>

      {/* METRIC BADGES */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><Tv className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Live TV Channels</p>
              <p className="text-lg font-black text-slate-800">{tvChannels.length}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {tvChannels.filter(c => c.enabled !== false).length} Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600"><Radio className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Radio Stations</p>
              <p className="text-lg font-black text-slate-800">{radioStations.length}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {radioStations.filter(s => s.enabled !== false).length} Active
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><FileText className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Daily E-Papers</p>
              <p className="text-lg font-black text-slate-800">{epapers.length}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {epapers.filter(p => p.enabled !== false).length} Active
          </span>
        </div>
      </div>

      {/* SPLIT PANE MAIN CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-6 h-[72vh]">
        {/* LEFT COLUMN: LIST OF MEDIA CHANNELS */}
        <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col space-y-3">
          {/* MEDIA TYPE SELECTOR TABS */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab("tv"); setSelectedItem(null); }}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "tv" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Tv className="h-3.5 w-3.5" /> Live TV ({tvChannels.length})
            </button>
            <button
              onClick={() => { setActiveTab("radio"); setSelectedItem(null); }}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "radio" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Radio className="h-3.5 w-3.5" /> Radio ({radioStations.length})
            </button>
            <button
              onClick={() => { setActiveTab("epaper"); setSelectedItem(null); }}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeTab === "epaper" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> E-Papers ({epapers.length})
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'tv' ? 'channels' : activeTab === 'radio' ? 'stations' : 'newspapers'}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* SCROLLABLE STREAMS LIST */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-xs font-semibold">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" /> Loading media registry...
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No media items found.</div>
            ) : (
              currentItems.map((item: any) => {
                const isSelected = selectedItem?.data?.id === item.id && selectedItem?.type === activeTab;
                const isLive = item.enabled !== false;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem({ type: activeTab, data: item })}
                    className={`bg-white p-3 rounded-xl border transition-all cursor-pointer hover:border-slate-300 hover:shadow-xs ${
                      isSelected ? "border-amber-500 ring-1 ring-amber-500 shadow-xs" : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
                        {activeTab === "tv" && <Tv className="h-5 w-5 text-blue-500" />}
                        {activeTab === "radio" && <Radio className="h-5 w-5 text-purple-500" />}
                        {activeTab === "epaper" && <FileText className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.category || item.language || "General"}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isLive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {isLive ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">{item.url}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION & CONFIGURATION INSPECTOR */}
        <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col">
          {selectedItem ? (
            <div className="p-6 h-full flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                {/* Header for Selected Channel */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                      {activeTab === "tv" && <Tv className="h-5 w-5" />}
                      {activeTab === "radio" && <Radio className="h-5 w-5" />}
                      {activeTab === "epaper" && <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                        Stream Editor
                      </span>
                      <h2 className="text-lg font-black text-slate-800">
                        {selectedItem.data.name || "Channel Settings"}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEnable(selectedItem.data.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedItem.data.enabled !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {selectedItem.data.enabled !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {selectedItem.data.enabled !== false ? "Visible Live" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedItem.data.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                      title="Delete Stream"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Channel / Station Name</label>
                    <input
                      type="text"
                      value={selectedItem.data.name || ""}
                      onChange={e => {
                        const val = e.target.value;
                        if (activeTab === "tv") {
                          setTvChannels(tvChannels.map(c => c.id === selectedItem.data.id ? { ...c, name: val } : c));
                        } else if (activeTab === "radio") {
                          setRadioStations(radioStations.map(s => s.id === selectedItem.data.id ? { ...s, name: val } : s));
                        } else {
                          setEpapers(epapers.map(p => p.id === selectedItem.data.id ? { ...p, name: val } : p));
                        }
                        setSelectedItem({ ...selectedItem, data: { ...selectedItem.data, name: val } });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      {activeTab === "tv" ? "YouTube Live / HLS M3U8 Stream URL" : activeTab === "radio" ? "Audio Streaming URL (MP3/AAC/HLS)" : "E-Paper Publisher Portal URL"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedItem.data.url || ""}
                        onChange={e => {
                          const val = e.target.value;
                          if (activeTab === "tv") {
                            setTvChannels(tvChannels.map(c => c.id === selectedItem.data.id ? { ...c, url: val } : c));
                          } else if (activeTab === "radio") {
                            setRadioStations(radioStations.map(s => s.id === selectedItem.data.id ? { ...s, url: val } : s));
                          } else {
                            setEpapers(epapers.map(p => p.id === selectedItem.data.id ? { ...p, url: val } : p));
                          }
                          setSelectedItem({ ...selectedItem, data: { ...selectedItem.data, url: val } });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                      {selectedItem.data.url && (
                        <a
                          href={selectedItem.data.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1 text-xs font-bold"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Test
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category / Genre</label>
                      <input
                        type="text"
                        value={selectedItem.data.category || selectedItem.data.language || ""}
                        onChange={e => {
                          const val = e.target.value;
                          if (activeTab === "tv") {
                            setTvChannels(tvChannels.map(c => c.id === selectedItem.data.id ? { ...c, category: val } : c));
                          } else if (activeTab === "radio") {
                            setRadioStations(radioStations.map(s => s.id === selectedItem.data.id ? { ...s, category: val } : s));
                          } else {
                            setEpapers(epapers.map(p => p.id === selectedItem.data.id ? { ...p, language: val } : p));
                          }
                          setSelectedItem({ ...selectedItem, data: { ...selectedItem.data, category: val, language: val } });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stream Identifier</label>
                      <input
                        type="text"
                        disabled
                        value={selectedItem.data.id}
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom helper */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Changes will take effect in real-time across apps upon saving.</span>
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition"
                >
                  {saving ? "Saving..." : "Save Stream"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4 shadow-xs border border-amber-100">
                <RadioTower className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">Select a Broadcast Stream to Inspect</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Add, toggle visibility, and update streaming servers for Live TV, FM Radio, and E-Papers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
