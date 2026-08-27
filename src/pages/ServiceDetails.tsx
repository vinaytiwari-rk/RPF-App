import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowLeft, ExternalLink, Download, Compass, Sparkles, Globe2, Landmark } from "lucide-react";
import { useApp } from "../context/AppContext";
import { openExternalLink } from "../utils/browser";
import BrandLoader from "../components/BrandLoader";
import { getGovLinksForService, GovLink } from "../data/serviceGovLinks";

type LocalizedServiceContent = { body?: string; actionLabel?: string };

function sanitizeHtml(input: string): string {
  if (typeof window === "undefined" || !input) return "";
  const template = document.createElement("template");
  template.innerHTML = input;
  const blocked = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "FORM", "BASE"]);
  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const elements: Element[] = [];
  while (walker.nextNode()) elements.push(walker.currentNode as Element);
  for (const el of elements) {
    if (blocked.has(el.tagName)) {
      el.remove();
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase(),
        value = attr.value.trim();
      if (name.startsWith("on") || name === "srcdoc" || name === "style") el.removeAttribute(attr.name);
      if ((name === "href" || name === "src" || name === "action") && /^(javascript|data|vbscript):/i.test(value))
        el.removeAttribute(attr.name);
    }
  }
  return template.innerHTML;
}

function WebsiteLogo({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false);
  let logo = "";
  try {
    logo = `${new URL(url).origin}/favicon.ico`;
  } catch {}

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {!failed && logo ? (
        <img
          src={logo}
          alt={`${label} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Globe2 className="h-5 w-5 text-[#000080]" />
      )}
    </div>
  );
}

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: string }>();
  const { servicesList, isLoadingServices } = useApp();
  const [contentData, setContentData] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const serviceMeta = servicesList?.find((s) => s.id === id);
  const locale = lang || "en";
  const hi = locale === "hi";

  useEffect(() => {
    if (!id) return;
    // Native dedicated routes - DO NOT replace with web links
    if (id === "card") {
      navigate("/jan-seva-card", { replace: true });
      return;
    }
    if (id === "internet-radio") {
      navigate("/internet-radio", { replace: true });
      return;
    }
    if (id === "live-tv") {
      navigate("/live-tv", { replace: true });
      return;
    }
    if (id === "news-feed") {
      navigate("/news", { replace: true });
      return;
    }
    if (id === "epaper") {
      navigate("/epaper", { replace: true });
      return;
    }
    if (id === "fact-check") {
      navigate("/fact-check", { replace: true });
      return;
    }
    if (id === "directory") {
      navigate("/directory", { replace: true });
      return;
    }
    if (id === "culture") {
      navigate("/culture", { replace: true });
      return;
    }
    if (id === "donations") {
      navigate("/donations", { replace: true });
      return;
    }
    if (id === "grievance") {
      navigate("/grievance", { replace: true });
      return;
    }
    if (id === "blood") {
      navigate("/blood-network", { replace: true });
      return;
    }

    const fetchContent = async () => {
      setIsLoadingContent(true);
      setContentData(null);
      try {
        const res = await fetch(`/api/public/services/${encodeURIComponent(id)}/content`);
        const json = await res.json();
        setContentData(res.ok && json.success ? json.data : null);
      } catch (err) {
        console.error("Error fetching service content:", err);
        setContentData(null);
      } finally {
        setIsLoadingContent(false);
      }
    };
    fetchContent();
  }, [id, locale]);

  const localized: LocalizedServiceContent = contentData?.content?.[locale] || contentData?.content?.en || {};
  const htmlContent = useMemo(() => sanitizeHtml(localized.body || ""), [localized.body]);
  const actionLabel = localized.actionLabel || "";
  const actionUrl = contentData?.action_url || "";
  const resources = Array.isArray(contentData?.resources) ? contentData.resources : [];

  // Fetch all related official government links for this service page
  const govLinks: GovLink[] = useMemo(() => (id ? getGovLinksForService(id) : []), [id]);

  if (isLoadingServices || isLoadingContent)
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-transparent">
        <BrandLoader size="sm" label={hi ? "सेवा लोड हो रही है" : "Loading service"} />
      </div>
    );

  if (!serviceMeta)
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-transparent p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-[#DC2626] rounded-full flex items-center justify-center mb-2">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[#14213D]">Service Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs font-medium">This service is no longer available or the URL is incorrect.</p>
        <button
          onClick={() => navigate("/services")}
          className="mt-4 px-6 py-2.5 bg-[#14213D] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#0f192e] transition"
        >
          Back to Services
        </button>
      </div>
    );

  const IconComponent = (LucideIcons as any)[serviceMeta.iconName || "Compass"] || Compass;
  const isExternalAction = /^https?:\/\//i.test(actionUrl);

  return (
    <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-screen bg-transparent pb-28 relative overflow-x-hidden text-[#14213D]">
      {/* Header Bar */}
      <div className="flex items-center gap-3 border-b border-amber-200/80 pb-4 mb-5 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-white border border-amber-200/80 rounded-full flex items-center justify-center text-[#14213D] hover:bg-amber-50 transition-colors shrink-0 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-[#14213D] truncate">
            {hi ? serviceMeta.titleHi : serviceMeta.titleEn}
          </h3>
          <p className="text-[10.5px] text-slate-500 font-medium truncate">
            {hi ? serviceMeta.descHi : serviceMeta.descEn}
          </p>
        </div>
      </div>

      {/* Main Service Card Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100/80 p-5 shadow-2xs mb-5 flex items-center gap-4">
        <div className="w-13 h-13 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 border border-amber-500/20 text-[#D97706]">
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-[#167C5A] border border-emerald-200/80 rounded-md text-[9px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-2.5 h-2.5" /> Verified Service Portal
          </span>
          <h4 className="font-bold text-sm text-[#14213D] leading-tight">
            {hi ? serviceMeta.titleHi : serviceMeta.titleEn}
          </h4>
          <p className="text-[11.5px] text-slate-500 font-medium mt-0.5">{hi ? serviceMeta.descHi : serviceMeta.descEn}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Dynamic HTML Content if available */}
        {htmlContent && (
          <div
            className="prose prose-sm prose-slate max-w-none bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-2xs border border-amber-100/80 text-[#14213D]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {/* Resources & Documents */}
        {resources.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-2xs border border-amber-100/80 space-y-3">
            <h5 className="text-[10.5px] font-bold text-[#D97706] uppercase tracking-widest border-b border-amber-100/80 pb-2">
              Documents & Downloads
            </h5>
            <div className="space-y-2">
              {resources.map((resource: any, idx: number) => {
                const resourceTitle = resource?.title?.[locale] || resource?.title?.en || resource?.title || "Resource";
                return (
                  <button
                    key={idx}
                    onClick={() => openExternalLink(resource.url, navigate)}
                    className="flex w-full items-center gap-3 p-3 bg-white rounded-xl border border-slate-200/80 hover:border-amber-300 transition-all group text-left shadow-2xs"
                  >
                    <div className="w-8 h-8 bg-amber-50 border border-amber-200/80 rounded-lg flex items-center justify-center shrink-0 text-[#D97706]">
                      <Download className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-[#14213D] truncate group-hover:text-[#D97706]">
                      {resourceTitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Service Action Button */}
        {actionLabel && actionUrl && (
          <div>
            <button
              onClick={() => (isExternalAction ? openExternalLink(actionUrl, navigate) : navigate(actionUrl))}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#14213D] text-white font-bold rounded-xl text-xs shadow-md hover:bg-[#0f192e] transition-transform active:scale-98"
            >
              <span>{actionLabel}</span>
              {isExternalAction && <ExternalLink className="w-3.5 h-3.5 text-amber-300" />}
            </button>
          </div>
        )}

        {/* OFFICIAL GOVERNMENT WEBSITES & PORTALS SECTION */}
        {govLinks.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50/60 via-white to-emerald-50/40 p-5 rounded-2xl shadow-2xs border border-amber-200/80 space-y-3">
            <div className="flex items-center gap-2 border-b border-amber-200/80 pb-2.5">
              <Landmark className="h-4 w-4 text-[#D97706]" />
              <h5 className="text-[10.5px] font-bold uppercase tracking-widest text-[#14213D]">
                {hi ? "आधिकारिक सरकारी पोर्टल एवं वेबसाइटें" : "Official Government Portals & Websites"}
              </h5>
            </div>
            <p className="text-[11.5px] font-medium text-slate-600">
              {hi
                ? "इस सेवा से संबंधित आधिकारिक भारत सरकार और राज्य सरकार की वेबसाइटें:"
                : "Official Government of India and State Portals related to this service:"}
            </p>

            <div className="space-y-2.5 pt-1">
              {govLinks.map((link) => {
                const isGov = link.isGov !== false;
                return (
                  <button
                    key={link.url}
                    onClick={() => openExternalLink(link.url, navigate, link.title)}
                    className="flex w-full items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-3.5 text-left shadow-2xs transition hover:border-amber-300 hover:shadow-xs active:scale-[.99]"
                  >
                    <WebsiteLogo url={link.url} label={link.title} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                            isGov
                              ? "text-[#167C5A] bg-emerald-50 border-emerald-200"
                              : "text-slate-700 bg-slate-50 border-slate-200"
                          }`}
                        >
                          {isGov ? (hi ? "आधिकारिक पोर्टल" : "Official Gov") : hi ? "उपयोगी संसाधन" : "Verified Resource"}
                        </span>
                        <h4 className="text-xs font-bold text-[#14213D] truncate">{hi ? link.titleHi : link.title}</h4>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-500">
                        {hi ? link.descHi : link.desc}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[#14213D]" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}