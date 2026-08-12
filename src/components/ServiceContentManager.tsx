// src/components/ServiceContentManager.tsx
//
// This is the missing link that used to make Education/Environment/Senior
// Citizens/Women/Religious & Culture (and every other service) look
// "frozen": there was no admin UI at all for the `service_content` table
// that the public service detail page (ServiceDetails.tsx) actually reads
// from. Admins were instead editing separate list tables (education_aid,
// environment, etc.) that the public page never looked at. This edits the
// real thing, through the now-authenticated
// PUT /api/admin/hq/services/:id/content endpoint.
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const SERVICE_OPTIONS = [
  { id: "nation", label: "Nation Building / राष्ट्र निर्माण" },
  { id: "culture", label: "Religious & Culture / धर्म और संस्कृति" },
  { id: "jobs", label: "Jobs Portal / रोजगार पोर्टल" },
  { id: "women-safety", label: "Women Safety / महिला सुरक्षा" },
  { id: "youth", label: "Youth Empowerment / युवा सशक्तिकरण" },
  { id: "health-care", label: "Health Care / स्वास्थ्य सेवा" },
  { id: "grievance", label: "Grievances (Jan Sunwai) / जन सुनवाई" },
  { id: "education", label: "Education Aid / शिक्षा सहायता" },
  { id: "environment", label: "Environment / पर्यावरण" },
  { id: "seniors", label: "Senior Citizens / वरिष्ठ नागरिक" },
  { id: "countries", label: "Global Guide / वैश्विक निर्देशिका" },
  { id: "skills", label: "Skills Training / कौशल प्रशिक्षण" },
];

export default function ServiceContentManager() {
  const { token } = useAuth();
  const [serviceId, setServiceId] = useState(SERVICE_OPTIONS[0].id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contentEn, setContentEn] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [actionLabelEn, setActionLabelEn] = useState("");
  const [actionLabelHi, setActionLabelHi] = useState("");
  const [actionUrl, setActionUrl] = useState("");

  const load = async (id: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/public/services/${id}/content`);
      const d = res.data?.data;
      setContentEn(d?.content_en || "");
      setContentHi(d?.content_hi || "");
      setActionLabelEn(d?.action_label_en || "");
      setActionLabelHi(d?.action_label_hi || "");
      setActionUrl(d?.action_url || "");
    } catch (e) {
      toast.error("Failed to load current content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(serviceId);
  }, [serviceId]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(
        `/api/admin/hq/services/${serviceId}/content`,
        {
          content_en: contentEn,
          content_hi: contentHi,
          action_label_en: actionLabelEn,
          action_label_hi: actionLabelHi,
          action_url: actionUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Live page updated — citizens will see this immediately");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-5">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Service Page Content</h2>
        <p className="text-xs text-slate-500 mt-1">
          This is the actual content citizens see when they open a service. Editing and saving here updates
          the live page immediately — this was previously disconnected from the app.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1">Service</label>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200"
        >
          {SERVICE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-400 py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Content (English, HTML allowed)</label>
            <textarea
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              rows={6}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 font-mono"
              placeholder="<p>Details citizens see for this service...</p>"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">सामग्री (हिंदी, HTML मान्य)</label>
            <textarea
              value={contentHi}
              onChange={(e) => setContentHi(e.target.value)}
              rows={6}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 font-mono"
              placeholder="<p>इस सेवा के लिए विवरण...</p>"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Action Button Label (EN)</label>
              <input
                value={actionLabelEn}
                onChange={(e) => setActionLabelEn(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200"
                placeholder="Apply Now"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">बटन लेबल (HI)</label>
              <input
                value={actionLabelHi}
                onChange={(e) => setActionLabelHi(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200"
                placeholder="अभी आवेदन करें"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Action URL</label>
            <input
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200"
              placeholder="https://... or /internal-route"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#000080] text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Publish
          </button>
        </>
      )}
    </div>
  );
}
