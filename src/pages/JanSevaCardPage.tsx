import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ServiceIllustration from "../components/ServiceIllustration";
import { Download, Share2, Info, Landmark, ExternalLink, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { openExternalLink } from "../utils/browser";
import { getGovLinksForService, GovLink } from "../data/serviceGovLinks";
import JanSevaCard from "./JanSevaCard";

function WebsiteLogo({ url, label }: { url: string; label: string }) {
  const [attempt, setAttempt] = useState(0);
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {}
  const candidates = host
    ? [
        `https://icons.duckduckgo.com/ip3/${host}.ico`,
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`,
      ]
    : [];

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-emerald-50 p-2 shadow-sm">
      {attempt < candidates.length ? (
        <img
          key={attempt}
          src={candidates[attempt]}
          alt=""
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setAttempt((n) => n + 1)}
        />
      ) : (
        <span className="text-xs font-black text-[#245D45]" aria-hidden="true">
          {label.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase()}
        </span>
      )}
    </div>
  );
}

export default function JanSevaCardPage() {
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const downloadJpeg = async () => {
    setLoading(true);
    try {
      const el = document.getElementById("jan-seva-card-front");
      if (!el) throw new Error("Card not ready");
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
        logging: false,
      });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/jpeg", 0.95);
      a.download = `JanSevaCard_${(user?.name || "User").replace(/\s+/g, "_")}.jpg`;
      a.click();
    } catch (e) {
      console.error("JPEG generation failed", e);
      alert("Card image could not be generated. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Jan Seva Card",
          text: "My digital Jan Seva Card from RP Foundation",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {}
  };

  // Synchronize government portals and child links from Supreme Command Center / CMS
  const govLinks: GovLink[] = useMemo(() => {
    const allServices = (cmsConfig as any)?.allServices;
    const featuredServices = (cmsConfig as any)?.featuredServices;
    const matchedService =
      (Array.isArray(allServices)
        ? allServices.find((s: any) => s.id === "card" || s.route === "/jan-seva-card" || s.route === "/services/card")
        : null) ||
      (Array.isArray(featuredServices)
        ? featuredServices.find((s: any) => s.id === "card" || s.route === "/jan-seva-card" || s.route === "/services/card")
        : null);

    if (matchedService && Array.isArray(matchedService.subLinks) && matchedService.subLinks.length > 0) {
      const activeAdminLinks = matchedService.subLinks
        .filter((l: any) => l && l.active !== false && l.url !== "/jan-seva-card")
        .map((l: any) => ({
          title: l.title || "Portal Link",
          titleHi: l.title || "पोर्टल लिंक",
          desc: l.url || "Action Link",
          descHi: l.url || "एक्शन लिंक",
          url: l.url,
          isGov: l.isExternal !== false,
        }));
      if (activeAdminLinks.length > 0) return activeAdminLinks;
    }

    const overrides = (cmsConfig as any)?.serviceWebsiteLinks;
    if (overrides && Object.prototype.hasOwnProperty.call(overrides, "card") && Array.isArray(overrides["card"])) {
      return overrides["card"].filter((l: any) => l.url !== "/jan-seva-card");
    }

    return getGovLinksForService("card").filter((l: any) => l.url !== "/jan-seva-card");
  }, [cmsConfig]);

  return (
    <main className="min-h-full bg-[#FFF9F0] pb-28">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        {/* Header section */}
        <section className="rounded-[24px] border border-amber-200 bg-gradient-to-br from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <ServiceIllustration kind="jan-seva-card" className="h-16 w-16 shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#B36A16]">
                RP Foundation identity
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#243B32]">
                Jan Seva Card
              </h1>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Your digital service identity and access record in one place.
              </p>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={downloadJpeg}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#167C5A] px-4 py-3 text-xs font-black text-white disabled:opacity-60 hover:bg-[#126448] transition shadow-sm"
            >
              <Download className="h-4 w-4" />
              {loading ? "Preparing card…" : "Save card"}
            </button>
            <button
              onClick={share}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              aria-label="Share card"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Card Canvas */}
        <section className="mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white p-3 shadow-sm">
          <JanSevaCard />
        </section>

        {/* About card informational box */}
        <section className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-emerald-700" />
            <div>
              <h2 className="text-sm font-black text-slate-900">About your card</h2>
              <p className="mt-1 text-[11px] leading-5 text-slate-600">
                Keep your profile information accurate. Card availability and benefits depend on your registration status and applicable RP Foundation programmes.
              </p>
            </div>
          </div>
        </section>

        {/* OFFICIAL GOVERNMENT WEBSITES & PORTALS (SYNCED WITH SUPREME COMMAND CENTER) */}
        {govLinks.length > 0 && (
          <section className="mt-5 rounded-[28px] border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/50 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
              <Landmark className="h-4 w-4 text-[#D97706]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#14213D]">
                संबंधित वेबसाइटें और सरकारी पोर्टल (Official Portals & Resources)
              </h2>
            </div>
            <p className="text-xs font-medium text-slate-600">
              जन सेवा कार्ड और नागरिक पहचान से संबंधित आधिकारिक डिजिटल पोर्टल:
            </p>

            <div className="space-y-2.5 pt-1">
              {govLinks.map((link) => {
                const isGov = link.isGov !== false;
                const isExternal = link.url.startsWith("http");
                return (
                  <button
                    key={link.url}
                    type="button"
                    onClick={() => (isExternal ? openExternalLink(link.url, navigate, link.title) : navigate(link.url))}
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-3.5 text-left shadow-2xs transition hover:border-amber-300 hover:shadow-xs active:scale-[.99]"
                  >
                    <WebsiteLogo url={link.url} label={link.title} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                            isGov
                              ? "text-[#167C5A] bg-emerald-50 border-emerald-200"
                              : "text-slate-700 bg-slate-50 border-slate-200"
                          }`}
                        >
                          {isGov ? "आधिकारिक पोर्टल" : "डिजिटल सेवा"}
                        </span>
                        <h3 className="text-xs font-black text-[#14213D] truncate">{link.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-500">
                        {link.desc || link.url}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
