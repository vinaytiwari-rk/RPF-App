import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Edit, Play, Save, CheckCircle, Video, Instagram, Youtube, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

type ReelItem = {
  id: string;
  type: "instagram" | "youtube" | "video";
  url: string;
  category: string;
  title: string;
  active: boolean;
};

export default function ImpactStudio() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "youtube" | "instagram">("all");
  const [selectedItem, setSelectedItem] = useState<ReelItem | null>(null);

  useEffect(() => {
    fetchCms();
  }, []);

  const fetchCms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      if (res.data?.cms) {
        // Map legacy string-based reels to structured objects if necessary, or just use as is
        const rawPosts = res.data.cms.instagramPosts || [];
        const parsedPosts = rawPosts.map((post: any, idx: number) => {
          if (typeof post === 'string') {
            return {
              id: `post-${idx}`,
              type: post.includes("youtube.com") ? "youtube" : "instagram",
              url: post,
              category: "General",
              title: "Social Media Reel " + (idx + 1),
              active: true
            };
          }
          return post;
        });
        setReels(parsedPosts);
      }
    } catch (e) {
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Saving and publishing changes...");
    try {
      const token = localStorage.getItem("token") || "";
      // Convert back to string array for legacy support if needed, but we'll save objects to support new UI
      const res = await axios.post(
        "/api/cms",
        { 
          payload: { instagramPosts: reels } 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Successfully published to live apps!", { id: toastId });
      } else {
        toast.error("Failed to publish", { id: toastId });
      }
    } catch (e) {
      toast.error("Error saving changes", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const filteredReels = reels.filter((r) => {
    if (activeTab === "youtube") return r.type === "youtube";
    if (activeTab === "instagram") return r.type === "instagram";
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* Header matching the screenshot */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-rose-50 text-rose-500">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-rose-500">Media Content & Uploads</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Social Media & Video Embed CMS</h1>
            <p className="text-xs text-slate-500 mt-1">
              YouTube Shorts, Instagram Reels & Device Video Upload. सभी सोशल मीडिया लिंक यहाँ सेव करें, ऐप में लाइव दिखने लगेंगे।
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
            <Play className="h-4 w-4" /> View Reels Player
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
            <Trash2 className="h-4 w-4" /> Remove Some Posts
          </button>
          <button 
            onClick={() => {
              const newReel: ReelItem = { id: Date.now().toString(), type: "instagram", url: "", category: "New", title: "New Reel", active: true };
              setReels([newReel, ...reels]);
              setSelectedItem(newReel);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Embed / Reel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition-colors shadow-sm disabled:opacity-70"
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[70vh]">
        {/* Left List */}
        <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col space-y-4">
          <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveTab("all")}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "all" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              All ({reels.length})
            </button>
            <button 
              onClick={() => setActiveTab("youtube")}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "youtube" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              YouTube ({reels.filter(r=>r.type==="youtube").length})
            </button>
            <button 
              onClick={() => setActiveTab("instagram")}
              className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${activeTab === "instagram" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
            >
              Instagram ({reels.filter(r=>r.type==="instagram").length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {filteredReels.map((reel) => (
              <div 
                key={reel.id} 
                onClick={() => setSelectedItem(reel)}
                className={`bg-white p-3 rounded-xl border transition-all cursor-pointer hover:border-slate-300 hover:shadow-md ${selectedItem?.id === reel.id ? "border-blue-500 shadow-sm ring-1 ring-blue-500" : "border-slate-200 shadow-sm"}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-tr ${reel.type === "instagram" ? "from-amber-500 via-rose-500 to-fuchsia-600" : "from-red-600 to-red-500"}`}>
                    {reel.type === "instagram" ? <Instagram className="h-5 w-5" /> : <Youtube className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white ${reel.type === "instagram" ? "bg-rose-500" : "bg-red-600"}`}>
                        {reel.type}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                        {reel.category}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 truncate mb-2">{reel.title || "Untitled Media"}</h3>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800">
                          <Edit className="h-3 w-3" /> Edit Details
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setReels(reels.filter(r => r.id !== reel.id)); if (selectedItem?.id === reel.id) setSelectedItem(null); }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-800"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${reel.active ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
                        <CheckCircle className="h-3 w-3" /> {reel.active ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-col">
          {selectedItem ? (
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-800">Edit Media Details</h2>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  {selectedItem.type === "instagram" ? <Instagram className="h-5 w-5 text-rose-500" /> : <Youtube className="h-5 w-5 text-red-600" />}
                </div>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Media Title</label>
                  <input 
                    type="text" 
                    value={selectedItem.title} 
                    onChange={(e) => {
                      const updated = { ...selectedItem, title: e.target.value };
                      setSelectedItem(updated);
                      setReels(reels.map(r => r.id === updated.id ? updated : r));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Platform Type</label>
                    <select 
                      value={selectedItem.type} 
                      onChange={(e) => {
                        const updated = { ...selectedItem, type: e.target.value as any };
                        setSelectedItem(updated);
                        setReels(reels.map(r => r.id === updated.id ? updated : r));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="video">Direct Video Upload</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <input 
                      type="text" 
                      value={selectedItem.category} 
                      onChange={(e) => {
                        const updated = { ...selectedItem, category: e.target.value };
                        setSelectedItem(updated);
                        setReels(reels.map(r => r.id === updated.id ? updated : r));
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">URL / Embed Code</label>
                  <textarea 
                    value={selectedItem.url} 
                    onChange={(e) => {
                      const updated = { ...selectedItem, url: e.target.value };
                      setSelectedItem(updated);
                      setReels(reels.map(r => r.id === updated.id ? updated : r));
                    }}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://instagram.com/reel/..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Public Visibility</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Show this post in the public app.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={selectedItem.active}
                      onChange={(e) => {
                        const updated = { ...selectedItem, active: e.target.checked };
                        setSelectedItem(updated);
                        setReels(reels.map(r => r.id === updated.id ? updated : r));
                      }}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 mb-4 shadow-sm border border-rose-200">
                <Instagram className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-black text-slate-800">Select a Reel from left or click 'Add Embed / Reel'</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Edit save details or render embed code. Nothing will be lost off.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
