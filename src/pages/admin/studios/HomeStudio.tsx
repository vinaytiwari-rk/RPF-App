import React, { useState, useEffect } from "react";
import axios from "axios";
import { Images, Save, Check, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const TABS = [
  { id: "identity", label: "Foundation Identity" },
  { id: "splash", label: "Splash Screen" },
  { id: "marquees", label: "Live Marquees & News" },
  { id: "thought", label: "Thought of the Day" },
  { id: "live_market", label: "Live Market & Weather" }
];

export default function HomeStudio() {
  const [activeTab, setActiveTab] = useState("identity");
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        toast.success("Configurations saved successfully!");
      }
    } catch (e) {
      toast.error("Failed to save configurations.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#E67817]">
            <Images className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0A192F]">Home Screen Control Studio</h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Complete autonomy over the app's home page and external API integrations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchConfigs}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Reload
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-[#166534] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#14532d] transition"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="flex flex-wrap gap-2 px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-full transition-colors ${
              activeTab === tab.id
                ? "bg-[#0A192F] text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl">
            {activeTab === "identity" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Founder & Foundation Details</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Founder Name</label>
                  <input
                    type="text"
                    value={configs.founder_name || ""}
                    onChange={(e) => handleChange("founder_name", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] focus:ring-1 focus:ring-[#E67817] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Founder Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={configs.founder_image_url || ""}
                    onChange={(e) => handleChange("founder_image_url", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] focus:ring-1 focus:ring-[#E67817] outline-none"
                  />
                  {configs.founder_image_url && (
                    <img src={configs.founder_image_url} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-full border border-slate-200" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Foundation Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={configs.foundation_logo || ""}
                    onChange={(e) => handleChange("foundation_logo", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] focus:ring-1 focus:ring-[#E67817] outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "splash" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Splash Screen Configuration</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Background Color (Hex)</label>
                  <input
                    type="text"
                    value={configs.splash_bg_color || ""}
                    onChange={(e) => handleChange("splash_bg_color", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] focus:ring-1 focus:ring-[#E67817] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loading Text / Slogan</label>
                  <input
                    type="text"
                    value={configs.splash_text || ""}
                    onChange={(e) => handleChange("splash_text", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] focus:ring-1 focus:ring-[#E67817] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Splash Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={configs.splash_logo || ""}
                    onChange={(e) => handleChange("splash_logo", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] focus:ring-1 focus:ring-[#E67817] outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === "marquees" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Live News Marquee</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Content Source</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="marquee_type" 
                        checked={configs.marquee_type === 'rss'}
                        onChange={() => handleChange("marquee_type", "rss")}
                        className="accent-[#E67817]"
                      /> 
                      RSS Feed Link
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="marquee_type" 
                        checked={configs.marquee_type === 'custom'}
                        onChange={() => handleChange("marquee_type", "custom")}
                        className="accent-[#E67817]"
                      /> 
                      Custom Text
                    </label>
                  </div>
                </div>

                {configs.marquee_type === 'rss' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">RSS Feed URL</label>
                    <input
                      type="text"
                      value={configs.marquee_rss_url || ""}
                      onChange={(e) => handleChange("marquee_rss_url", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Display Text</label>
                    <input
                      type="text"
                      value={configs.marquee_custom_text || ""}
                      onChange={(e) => handleChange("marquee_custom_text", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "thought" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Thought of the Day</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Content Source</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="thought_type" 
                        checked={configs.thought_type === 'rss'}
                        onChange={() => handleChange("thought_type", "rss")}
                        className="accent-[#E67817]"
                      /> 
                      RSS Feed Link
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input 
                        type="radio" 
                        name="thought_type" 
                        checked={configs.thought_type === 'custom'}
                        onChange={() => handleChange("thought_type", "custom")}
                        className="accent-[#E67817]"
                      /> 
                      Custom Quote
                    </label>
                  </div>
                </div>

                {configs.thought_type === 'rss' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">RSS Feed URL</label>
                    <input
                      type="text"
                      value={configs.thought_rss_url || ""}
                      onChange={(e) => handleChange("thought_rss_url", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Quote Text</label>
                    <textarea
                      rows={3}
                      value={configs.thought_custom_text || ""}
                      onChange={(e) => handleChange("thought_custom_text", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] outline-none resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "live_market" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-900">Hindu Panchang Widget</h3>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <span className={configs.drik_panchang_active === 'true' ? 'text-[#166534]' : 'text-slate-400'}>
                        {configs.drik_panchang_active === 'true' ? 'Widget Active' : 'Widget Suspended'}
                      </span>
                      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${configs.drik_panchang_active === 'true' ? 'bg-[#166534]' : 'bg-slate-300'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={configs.drik_panchang_active === 'true'}
                          onChange={(e) => handleChange("drik_panchang_active", e.target.checked ? 'true' : 'false')}
                        />
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${configs.drik_panchang_active === 'true' ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">API Key (Optional)</label>
                    <input
                      type="text"
                      placeholder="Leave blank for public API"
                      value={configs.panchang_api_key || ""}
                      onChange={(e) => handleChange("panchang_api_key", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-900">Live Weather Widget</h3>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <span className={configs.weather_active === 'true' ? 'text-[#166534]' : 'text-slate-400'}>
                        {configs.weather_active === 'true' ? 'Widget Active' : 'Widget Suspended'}
                      </span>
                      <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${configs.weather_active === 'true' ? 'bg-[#166534]' : 'bg-slate-300'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={configs.weather_active === 'true'}
                          onChange={(e) => handleChange("weather_active", e.target.checked ? 'true' : 'false')}
                        />
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${configs.weather_active === 'true' ? 'translate-x-4' : 'translate-x-1'}`} />
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Weather API Key</label>
                    <input
                      type="text"
                      placeholder="OpenWeatherMap API Key"
                      value={configs.weather_api_key || ""}
                      onChange={(e) => handleChange("weather_api_key", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-[#E67817] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
