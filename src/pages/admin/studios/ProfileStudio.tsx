import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Save, RefreshCw, Upload, Shield } from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { id: "roles", label: "User Roles & Access" },
  { id: "certificates", label: "Certificate Designer" },
  { id: "policies", label: "App Policies (T&C)" },
];

export default function ProfileStudio() {
  const [activeTab, setActiveTab] = useState("certificates");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/supreme/configs");
      if (res.data.success) {
        setConfigs(res.data.configs);
      }
    } catch (e) {
      toast.error("Failed to load configurations.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const res = await axios.post(
        "/api/supreme/configs",
        { configs },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Profile Studio settings saved!");
      }
    } catch (e) {
      toast.error("Failed to save Profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0A192F]">Profile & Security Studio</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage user policies, access control, and dynamic certificate templates.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchConfigs}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 $\{loading ? 'animate-spin' : ''}`} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 transition"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Configs
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-full transition-colors $\{
              activeTab === tab.id
                ? "bg-[#0A192F] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex justify-center h-48 items-center">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {activeTab === "certificates" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Dynamic Certificate Templates</h3>
                <p className="text-xs text-slate-500">Provide image URLs for the base certificate backgrounds. The system will auto-print the user's name on them.</p>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Volunteer Certificate Template URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={configs.cert_volunteer_bg || ""}
                      onChange={(e) => handleChange("cert_volunteer_bg", e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  {configs.cert_volunteer_bg && (
                    <img src={configs.cert_volunteer_bg} alt="Preview" className="mt-2 w-48 border border-slate-200 rounded-lg shadow-sm" />
                  )}
                </div>

                <div className="pt-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Donor Certificate Template URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={configs.cert_donor_bg || ""}
                      onChange={(e) => handleChange("cert_donor_bg", e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  {configs.cert_donor_bg && (
                    <img src={configs.cert_donor_bg} alt="Preview" className="mt-2 w-48 border border-slate-200 rounded-lg shadow-sm" />
                  )}
                </div>
              </div>
            )}

            {activeTab === "policies" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">App Terms & Policies</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Privacy Policy URL</label>
                  <input
                    type="text"
                    placeholder="https://therpfoundation.org/privacy"
                    value={configs.policy_privacy_url || ""}
                    onChange={(e) => handleChange("policy_privacy_url", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Terms & Conditions URL</label>
                  <input
                    type="text"
                    placeholder="https://therpfoundation.org/terms"
                    value={configs.policy_terms_url || ""}
                    onChange={(e) => handleChange("policy_terms_url", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "roles" && (
              <div className="space-y-4 text-center py-10">
                <Shield className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-sm font-black text-slate-900">User Access Management</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Role management interface is being linked to the core auth database. This allows assigning Admin/Super Admin privileges.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
