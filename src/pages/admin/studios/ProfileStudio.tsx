import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Save, RefreshCw, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

export default function ProfileStudio() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (!token) return;
    const patch: Record<string, any> = {};
    for (const key of dirty) {
      patch[key] = drafts[key];
    }
    if (Object.keys(patch).length === 0) return;

    setSaving(true);
    const toastId = toast.loading("Saving Profile content...");
    try {
      const res = await axios.post(
        "/api/admin/control/cms/publish",
        { patch, label: "ProfileStudio updates" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success === false) throw new Error("Publish failed");
      toast.success("Profile content updated!", { id: toastId });
      setDirty(new Set());
    } catch (e: any) {
      toast.error("Failed to save", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 text-purple-500">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-purple-500">Profile & About CMS</p>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Organization Info</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={fetchCms} disabled={loading} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button onClick={handleSave} disabled={saving || dirty.size === 0} className="inline-flex items-center gap-1.5 px-6 py-2 text-xs font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : `Publish (${dirty.size})`}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[75vh]">
        <div className="w-full lg:w-3/12 flex flex-col space-y-4">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <button className="w-full flex items-center gap-3 p-3 rounded-xl border bg-white border-purple-500 shadow-sm ring-1 ring-purple-500 text-left">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">About App</p>
                <p className="text-[10px] text-slate-500">Long-form descriptions</p>
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col p-6">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2 mb-4">About the Organization</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">About Text (English)</label>
                  <textarea rows={6} value={drafts["aboutTextEn"] || ""} onChange={(e) => handleUpdateDraft("aboutTextEn", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">About Text (Hindi)</label>
                  <textarea rows={6} value={drafts["aboutTextHi"] || ""} onChange={(e) => handleUpdateDraft("aboutTextHi", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
