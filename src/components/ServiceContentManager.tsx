import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SERVICE_OPTIONS = [
  { id: "nation", label: "Nation Building" }, { id: "culture", label: "Religious & Culture" }, { id: "jobs", label: "Jobs Portal" },
  { id: "women-safety", label: "Women Safety" }, { id: "youth", label: "Youth Empowerment" }, { id: "health-care", label: "Health Care" },
  { id: "grievance", label: "Grievances" }, { id: "education", label: "Education Aid" }, { id: "environment", label: "Environment" },
  { id: "seniors", label: "Senior Citizens" }, { id: "countries", label: "Global Guide" }, { id: "skills", label: "Skills Training" },
];
const SUPPORTED_LANGUAGES = [{ code: "en", label: "English" }, { code: "hi", label: "Hindi" }];
type LocalizedContent = Record<string, { body?: string; actionLabel?: string }>;

export default function ServiceContentManager() {
  const { token } = useAuth();
  const [serviceId, setServiceId] = useState(SERVICE_OPTIONS[0].id);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<LocalizedContent>({});
  const [actionUrl, setActionUrl] = useState("");
  const current = useMemo(() => content[language] || {}, [content, language]);

  const load = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/public/services/${id}/content`);
      const stored = res.data?.data?.content;
      setContent(stored && typeof stored === "object" ? stored : {});
      setActionUrl(res.data?.data?.action_url || "");
    } catch (e: any) { toast.error(e.response?.data?.error || "Failed to load current content"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(serviceId); }, [serviceId, token]);

  const updateCurrent = (patch: Partial<LocalizedContent[string]>) => setContent((previous) => ({ ...previous, [language]: { ...(previous[language] || {}), ...patch } }));

  const save = async () => {
    if (!token) return toast.error("Administrator session expired. Please log in again.");
    setSaving(true);
    try {
      const res = await axios.put(`/api/admin/hq/services/${serviceId}/content`, { content, action_url: actionUrl }, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.data?.success) throw new Error(res.data?.error || "Save failed");
      if (res.data.data?.content) setContent(res.data.data.content);
      if (res.data.data?.action_url !== undefined) setActionUrl(res.data.data.action_url || "");
      toast.success("Service content saved successfully.");
    } catch (e: any) { toast.error(e.response?.data?.error || e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  return <div className="glass-card p-6 space-y-5">
    <div><h2 className="text-sm font-bold text-slate-800">Service Page Content</h2><p className="text-xs text-slate-500 mt-1">One canonical content field is stored for each service. Choose the language you want to edit; the application resolves the matching value when the page is displayed.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div><label className="text-xs font-semibold text-slate-600 block mb-1">Service</label><select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200">{SERVICE_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      <div><label className="text-xs font-semibold text-slate-600 block mb-1">Language</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200">{SUPPORTED_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select></div>
    </div>
    {loading ? <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div> : <>
      <div><label className="text-xs font-semibold text-slate-600 block mb-1">Content</label><textarea value={current.body || ""} onChange={(e) => updateCurrent({ body: e.target.value })} rows={8} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 font-mono" placeholder="Enter the content for the selected language..." /></div>
      <div><label className="text-xs font-semibold text-slate-600 block mb-1">Action Button Label</label><input value={current.actionLabel || ""} onChange={(e) => updateCurrent({ actionLabel: e.target.value })} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200" placeholder="Apply Now" /></div>
      <div><label className="text-xs font-semibold text-slate-600 block mb-1">Action URL</label><input value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200" placeholder="https://... or /internal-route" /></div>
      <button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 bg-[#000080] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-60">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving…" : "Save & Publish"}</button>
    </>}
  </div>;
}
