import React, { useState, useEffect } from "react";
import axios from "axios";
import { Images, Save, RefreshCw, FileText, Megaphone, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

export default function HomeStudio() {
  const { token } = useAuth();
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

      const newDrafts: Record<string, string> = {};
      Object.keys(data).forEach((key) => {
        newDrafts[key] = typeof data[key] === "string" ? data[key] : JSON.stringify(data[key], null, 2);
      });

      // Synchronize single unified keys from legacy En/Hi if they don't exist
      if (!newDrafts["founderMessage"] && (newDrafts["founderMessageHi"] || newDrafts["founderMessageEn"])) {
        newDrafts["founderMessage"] = newDrafts["founderMessageHi"] || newDrafts["founderMessageEn"] || "";
      }
      if (!newDrafts["alertBanner"] && (newDrafts["alertBannerHi"] || newDrafts["alertBannerEn"])) {
        newDrafts["alertBanner"] = newDrafts["alertBannerHi"] || newDrafts["alertBannerEn"] || "";
      }

      setDrafts(newDrafts);
      setDirty(new Set());
    } catch {
      toast.error("Failed to load CMS data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDraft = (key: string, value: string) => {
    setDrafts((prev) => {
      const updated = { ...prev, [key]: value };
      // Also mirror single unified key to legacy En/Hi keys automatically to keep full app backwards compatible
      if (key === "founderMessage") {
        updated["founderMessageEn"] = value;
        updated["founderMessageHi"] = value;
      }
      if (key === "alertBanner") {
        updated["alertBannerEn"] = value;
        updated["alertBannerHi"] = value;
      }
      return updated;
    });

    setDirty((prev) => {
      const next = new Set(prev).add(key);
      if (key === "founderMessage") {
        next.add("founderMessageEn");
        next.add("founderMessageHi");
      }
      if (key === "alertBanner") {
        next.add("alertBannerEn");
        next.add("alertBannerHi");
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Admin session expired");
      return;
    }

    const patch: Record<string, any> = {};
    let hasChanges = false;

    for (const key of dirty) {
      let parsedValue: any = drafts[key];
      if (
        (parsedValue?.startsWith("{") && parsedValue?.endsWith("}")) ||
        (parsedValue?.startsWith("[") && parsedValue?.endsWith("]"))
      ) {
        try {
          parsedValue = JSON.parse(parsedValue);
        } catch {
          // fallback string
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
            <p className="text-xs text-slate-500 mt-1">Unified content controls for Founder speech, announcements and contacts</p>
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
                <p className="text-[10px] text-slate-500">Founder Details & Message</p>
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
                <p className="text-[10px] text-slate-500">Unified Live Announcements</p>
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Name</label>
                          <input type="text" value={drafts["founderName"] || ""} onChange={(e) => handleUpdateDraft("founderName", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Designation</label>
                          <input type="text" value={drafts["founderDesignation"] || ""} onChange={(e) => handleUpdateDraft("founderDesignation", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Founder Message</label>
                        <textarea rows={5} value={drafts["founderMessage"] || drafts["founderMessageHi"] || drafts["founderMessageEn"] || ""} onChange={(e) => handleUpdateDraft("founderMessage", e.target.value)} placeholder="Enter Founder speech/message..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 leading-relaxed" />
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
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Global Alert Banner</label>
                        <input type="text" value={drafts["alertBanner"] || drafts["alertBannerHi"] || drafts["alertBannerEn"] || ""} onChange={(e) => handleUpdateDraft("alertBanner", e.target.value)} placeholder="Live emergency notice or news..." className="w-full bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm font-semibold text-amber-900 focus:ring-2 focus:ring-amber-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Helplines Marquee Ticker</label>
                        <textarea rows={4} value={drafts["helplinesMarquee"] || ""} onChange={(e) => handleUpdateDraft("helplinesMarquee", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500" placeholder="Emergency contacts comma-separated..." />
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
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Government Scheme Portal URL</label>
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
