// src/components/SocialLinkManager.tsx
import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
// Replaced Firebase with backend API proxy calls

/**
 * Admin UI for live editing of the five official social media links.
 * The links are stored in the Firestore document:
 *   settings/social_links
 * and merged on each save.
 */
export default function SocialLinkManager() {
  const { socialLinks } = useApp();

  // Helper to extract a link by platform name (fallback to empty string)
  const getLink = (platform: string) => {
    const found = socialLinks?.find((l) => (l as any).platform === platform);
    return found ? (found as any).url : "";
  };

  const [founderInstagram, setFounderInstagram] = useState<string>("");
  const [foundationInstagram, setFoundationInstagram] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [youtube, setYoutube] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Populate fields from Firestore on mount / when socialLinks change
  useEffect(() => {
    setFounderInstagram(getLink("founder_instagram"));
    setFoundationInstagram(getLink("foundation_instagram"));
    setFacebook(getLink("facebook"));
    setTwitter(getLink("twitter"));
    setYoutube(getLink("youtube"));
  }, [socialLinks]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founder_instagram: founderInstagram.trim(),
          foundation_instagram: foundationInstagram.trim(),
          facebook: facebook.trim(),
          twitter: twitter.trim(),
          youtube: youtube.trim(),
        })
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setMessage("✅ Links saved successfully!");
    } catch (err) {
      console.error("error saving social links:", err);
      setMessage("❌ Failed to save links. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-lg max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Social Link Manager</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Founder Instagram</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={founderInstagram}
            onChange={(e) => setFounderInstagram(e.target.value)}
            placeholder="https://www.instagram.com/therohitpandit/"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Foundation Instagram</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={foundationInstagram}
            onChange={(e) => setFoundationInstagram(e.target.value)}
            placeholder="https://www.instagram.com/rpfoundationofficial/"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Facebook Page</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://www.facebook.com/rpfofficial"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Twitter (X)</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://x.com/rpfoundation15"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">YouTube Channel</label>
          <input
            type="url"
            className="w-full border rounded px-3 py-2"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://www.youtube.com/@rpfoundationofficial"
            required
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {saving ? "Saving…" : "Save Links"}
        </button>
        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
}
