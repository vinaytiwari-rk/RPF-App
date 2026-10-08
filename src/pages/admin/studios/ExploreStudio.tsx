import React, { useState, useEffect } from "react";
import axios from "axios";
import { Compass, Save, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { id: "services", label: "Public Services" },
  { id: "sos", label: "Emergency & SOS" },
];

export default function ExploreStudio() {
  const [activeTab, setActiveTab] = useState("services");
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
        toast.success("Explore settings saved!");
      }
    } catch (e) {
      toast.error("Failed to save Explore settings.");
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0A192F]">Explore & Services Studio</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Manage public services links, healthcare, SOS numbers, and utilities.
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
            className="flex items-center gap-2 rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-800 transition"
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
            {activeTab === "sos" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Emergency Contacts Config</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Police / National Emergency</label>
                  <input
                    type="text"
                    value={configs.sos_police || "112"}
                    onChange={(e) => handleChange("sos_police", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ambulance</label>
                  <input
                    type="text"
                    value={configs.sos_ambulance || "102"}
                    onChange={(e) => handleChange("sos_ambulance", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Women Helpline</label>
                  <input
                    type="text"
                    value={configs.sos_women || "1091"}
                    onChange={(e) => handleChange("sos_women", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-purple-500 outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Service Modules Toggle</h3>
                <p className="text-xs text-slate-500">Configure which public services are active in the Explore tab.</p>
                <div className="space-y-3">
                  {['healthcare', 'employment', 'utilities', 'epaper'].map(mod => (
                    <div key={mod} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-sm font-bold text-slate-700 capitalize">{mod} Module</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={configs[`module_$\{mod}`] !== 'false'}
                          onChange={(e) => handleChange(`module_$\{mod}`, e.target.checked ? 'true' : 'false')}
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
