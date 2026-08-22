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
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <BrandLoader size="sm" label={hi ? "सेवा लोड हो रही है" : "Loading service"} />
      </div>
    );

  if (!serviceMeta)
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Service Not Found</h2>
        <p className="text-xs text-slate-500 max-w-xs">This service is no longer available or the URL is incorrect.</p>
        <button
          onClick={() => navigate("/services")}
          className="mt-4 px-6 py-2.5 bg-[#000080] text-white rounded-xl text-xs font-bold shadow-md"
        >
          Back to Services
        </button>
      </div>
    );

  const IconComponent = (LucideIcons as any)[serviceMeta.iconName || "Compass"] || Compass;
  const colorClass = serviceMeta.color || "bg-indigo-50 text-indigo-600 border-indigo-100";
  const isExternalAction = /^https?:\/\//i.test(actionUrl);

  return (
    <div className="p-5 flex-1 flex flex-col min-h-screen bg-slate-50/50 pb-28 relative overflow-x-hidden font-sans">
      {/* Header Bar */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4 mb-5 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-[#000080] hover:border-[#000080] transition-colors shrink-0 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-black text-base text-[#000080] truncate">
            {hi ? serviceMeta.titleHi : serviceMeta.titleEn}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold truncate">
            {hi ? serviceMeta.descHi : serviceMeta.descEn}
          </p>
        </div>
      </div>

      {/* Main Service Card Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-5 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${colorClass}`}>
          <IconComponent className="w-7 h-7" />
        </div>
        <div>
          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9px] font-black uppercase tracking-wider mb-1">
            Verified Service Portal
          </span>
          <h4 className="font-black text-sm text-slate-900 leading-tight">
            {hi ? serviceMeta.titleHi : serviceMeta.titleEn}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">{hi ? serviceMeta.descHi : serviceMeta.descEn}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Dynamic HTML Content if available */}
        {htmlContent && (
          <div
            className="prose prose-sm prose-slate max-w-none bg-white p-5 rounded-2xl shadow-sm border border-slate-200"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {/* Resources & Documents */}
        {resources.length > 0 && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-wider border-b pb-2">
              Documents & Downloads
            </h5>
            <div className="space-y-2">
              {resources.map((resource: any, idx: number) => {
                const resourceTitle = resource?.title?.[locale] || resource?.title?.en || resource?.title || "Resource";
                return (
                  <button
                    key={idx}
                    onClick={() => openExternalLink(resource.url, navigate)}
                    className="flex w-full items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group text-left"
                  >
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-600">
                      <Download className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-700">
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
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#000080] text-white font-bold rounded-xl text-xs shadow-lg hover:bg-blue-900 transition-transform active:scale-95"
            >
              <span>{actionLabel}</span>
              {isExternalAction && <ExternalLink className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* OFFICIAL GOVERNMENT WEBSITES & PORTALS SECTION (Added for ALL Service Pages) */}
        {govLinks.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50/60 via-white to-emerald-50/40 p-5 rounded-3xl shadow-sm border border-orange-200 space-y-3">
            <div className="flex items-center gap-2 border-b border-orange-200/80 pb-2.5">
              <Landmark className="h-4 w-4 text-[#FF9933]" />
              <h5 className="text-xs font-black uppercase tracking-wider text-[#000080]">
                {hi ? "आधिकारिक सरकारी पोर्टल एवं वेबसाइटें" : "Official Government Portals & Websites"}
              </h5>
            </div>
            <p className="text-[11px] text-slate-600">
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
                    className="flex w-full items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-3.5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md active:scale-[.99]"
                  >
                    <WebsiteLogo url={link.url} label={link.title} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                            isGov
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : "text-sky-700 bg-sky-50 border-sky-200"
                          }`}
                        >
                          {isGov ? (hi ? "आधिकारिक पोर्टल" : "Official Gov") : hi ? "उपयोगी संसाधन" : "Verified Resource"}
                        </span>
                        <h4 className="text-xs font-black text-slate-900 truncate">{hi ? link.titleHi : link.title}</h4>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] font-medium text-slate-500">
                        {hi ? link.descHi : link.desc}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-[#000080]" />
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