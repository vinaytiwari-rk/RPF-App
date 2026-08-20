import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

type LinkMap = Record<string, string>;

const FIELDS = [
  ["founder_instagram", "Founder Instagram", "https://www.instagram.com/therohitpandit/"],
  ["foundation_instagram", "Foundation Instagram", "https://www.instagram.com/rpfoundationofficial/"],
  ["facebook", "Facebook Page", "https://www.facebook.com/rpfofficial"],
  ["twitter", "X (Twitter)", "https://x.com/rpfoundation15"],
  ["youtube", "YouTube Channel", "https://www.youtube.com/@rpfoundationofficial"],
] as const;

/** Admin UI for the official social links.
 * Links live inside the existing CMS JSON so changing a URL does not require
 * an APK rebuild. Existing CMS fields are preserved on every save.
 */
export default function SocialLinkManager() {
  const { cmsConfig, socialLinks } = useApp();
  const [links, setLinks] = useState<LinkMap>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cmsLinks = Array.isArray((cmsConfig as any)?.socialLinks) ? (cmsConfig as any).socialLinks : [];
    const source = cmsLinks.length ? cmsLinks : socialLinks || [];
    const next: LinkMap = {};
    for (const [platform, , fallback] of FIELDS) {
      next[platform] = source.find((item: any) => item?.platform === platform)?.url || fallback;
    }
    setLinks(next);
  }, [cmsConfig, socialLinks]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const currentRes = await fetch("/api/cms/config", { cache: "no-store" });
      const current = currentRes.ok ? await currentRes.json() : { data: {} };
      const token = localStorage.getItem("@rpf_token");
      const nextSocialLinks = FIELDS.map(([platform, label]) => ({ platform, label, url: (links[platform] || "").trim() }));
      const res = await fetch("/api/cms/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ...(current?.data || {}), socialLinks: nextSocialLinks }),
      });
      if (!res.ok) throw new Error("Failed to save social links");
      setMessage("Links saved successfully. The app will use the updated CMS links on refresh.");
    } catch (err) {
      console.error("error saving social links:", err);
      setMessage("Failed to save links. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Social Link Manager</h2>
      <p className="text-sm text-slate-500 mb-4">Changes are stored in CMS and do not need an APK update.</p>
      <form onSubmit={handleSave} className="space-y-4">
        {FIELDS.map(([platform, label, placeholder]) => (
          <div key={platform}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input type="url" className="w-full border rounded px-3 py-2" value={links[platform] || ""}
              onChange={(e) => setLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
              placeholder={placeholder} required />
          </div>
        ))}
        <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
          {saving ? "Saving…" : "Save Links"}
        </button>
        {message && <p className="mt-2 text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
