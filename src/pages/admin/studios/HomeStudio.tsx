import React, { useState, useEffect } from "react";
import axios from "axios";
import { Images, Save, Check, RefreshCw, FileText, Megaphone, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

export default function HomeStudio() {
  const { token } = useAuth();
  const [cms, setCms] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");

  // Local state for editing fields
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCms();
  }, []);

  const fetchCms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/cms");
      const data = res.data?.cms || res.data?.data || {};
      setCms(data);
      
      const newDrafts: Record<string, string> = {};
      Object.keys(data).forEach((key) => {
        newDrafts[key] = typeof data[key] === "string" ? data[key] : JSON.stringify(data[key], null, 2);
      });
      setDrafts(newDrafts);
      setDirty(new Set());
    } catch (e) {
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDraft = (key: string, value: string) => {
    setDrafts(prev => ({ ...prev, [key]: value }));
    setDirty(prev => new Set(prev).add(key));
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Admin session expired");
      return;
    }

    const patch: Record<string, any> = {};
    let hasChanges = false;
    
    for (const key of dirty) {
      // Basic JSON parsing if it looks like an array or object
      let parsedValue: any = drafts[key];
      if ((parsedValue.startsWith("{") && parsedValue.endsWith("}")) || (parsedValue.startsWith("[") && parsedValue.endsWith("]"))) {
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch {
          // Leave as string if it doesn't parse
        }
      }
      patch[key] = parsedValue;
      hasChanges = true;
    }

    if (!hasChanges) {
      toast("No changes to publish.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Publishing CMS changes safely...");
    try {
      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: `HomeStudio: update ${activeTab}` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success === false) throw new Error(res.data?.error || "Publish failed");
      
      toast.success("CMS updated successfully!", { id: toastId });
      
      // Update local state
      setCms(prev => ({ ...prev, ...patch }));
      setDirty(new Set());
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e.message || "Failed to save CMS", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 text-blue-500">
            <Images className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-blue-500">Content Studio</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Home & Core Settings CMS</h1>
            <p className="text-xs text-slate-500 mt-1">Manage Founder details, Alert banners, and Social Links</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={fetchCms} disabled={loading} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={handleSave} disabled={saving || dirty.size === 0} className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : `Publish ${dirty.size > 0 ? `(${dirty.size})` : ""}`}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[75vh]">
        {/* Left List */}
        <div className="w-full lg:w-3/12 flex flex-col space-y-4">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <button
              onClick={() => setActiveTab("identity")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeTab === "identity" ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}
            >
              <div className={`p-2 rounded-lg ${activeTab === "identity" ? "bg-blue-50 text-blue-600" : "bg-white text-slate-500 shadow-sm"}`}>
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Core Identity</p>
                <p className="text-[10px] text-slate-500">Founder Details & Bio</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("marquees")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeTab === "marquees" ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}
            >
              <div className={`p-2 rounded-lg ${activeTab === "marquees" ? "bg-amber-50 text-amber-600" : "bg-white text-slate-500 shadow-sm"}`}>
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Alerts & Marquees</p>
                <p className="text-[10px] text-slate-500">Global Announcements</p>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("contacts")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeTab === "contacts" ? "bg-white border-blue-500 shadow-sm ring-1 ring-blue-500" : "bg-slate-50 border-slate-200 hover:border-slate-300"}`}
            >
              <div className={`p-2 rounded-lg ${activeTab === "contacts" ? "bg-emerald-50 text-emerald-600" : "bg-white text-slate-500 shadow-sm"}`}>
                <Link2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Contacts & Socials</p>
                <p className="text-[10px] text-slate-500">Emails, Helplines & Links</p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Panel Editor */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto custom-scrollbar space-y-6">
              
              {activeTab === "identity" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Foundation Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Name</label>
                        <input type="text" value={drafts["founderName"] || ""} onChange={(e) => handleUpdateDraft("founderName", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Designation</label>
                        <input type="text" value={drafts["founderDesignation"] || ""} onChange={(e) => handleUpdateDraft("founderDesignation", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Message (English)</label>
                        <textarea rows={3} value={drafts["founderMessageEn"] || ""} onChange={(e) => handleUpdateDraft("founderMessageEn", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Message (Hindi)</label>
                        <textarea rows={3} value={drafts["founderMessageHi"] || ""} onChange={(e) => handleUpdateDraft("founderMessageHi", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "marquees" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Alerts & Marquees</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alert Banner (English)</label>
                        <input type="text" value={drafts["alertBannerEn"] || ""} onChange={(e) => handleUpdateDraft("alertBannerEn", e.target.value)} className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-semibold text-amber-900 focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alert Banner (Hindi)</label>
                        <input type="text" value={drafts["alertBannerHi"] || ""} onChange={(e) => handleUpdateDraft("alertBannerHi", e.target.value)} className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-semibold text-amber-900 focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Helplines Marquee Text</label>
                        <textarea rows={3} value={drafts["helplinesMarquee"] || ""} onChange={(e) => handleUpdateDraft("helplinesMarquee", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" placeholder="Supports comma separated string..." />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contacts" && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">Contacts & Socials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Support Email</label>
                        <input type="text" value={drafts["email"] || ""} onChange={(e) => handleUpdateDraft("email", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Toll Free / Helpline</label>
                        <input type="text" value={drafts["tollFree"] || ""} onChange={(e) => handleUpdateDraft("tollFree", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Government Scheme URL</label>
                        <input type="text" value={drafts["governmentSchemeUrl"] || ""} onChange={(e) => handleUpdateDraft("governmentSchemeUrl", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Social Links (JSON Array)</label>
                        <textarea rows={8} value={drafts["socialLinks"] || ""} onChange={(e) => handleUpdateDraft("socialLinks", e.target.value)} className="w-full bg-slate-900 text-emerald-400 font-mono border border-slate-800 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
