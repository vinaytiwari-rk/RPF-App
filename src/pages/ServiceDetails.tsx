import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { ArrowLeft, ExternalLink, Download, Compass, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { servicesList, isLoadingServices } = useApp();
  
  const [contentData, setContentData] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isHi = lang === "hi";

  // Find the base service metadata from AppContext
  const serviceMeta = servicesList?.find((s) => s.id === id);

  useEffect(() => {
    if (!id) return;

    const fetchContent = async () => {
      setIsLoadingContent(true);
      setError(null);
      try {
        const res = await fetch(`/api/public/services/${id}/content`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setContentData(json.data);
          } else {
            // It's possible the admin hasn't created content for this yet.
            setContentData(null);
          }
        } else {
          setError(isHi ? "सामग्री लोड करने में विफल।" : "Failed to load content.");
        }
      } catch (err) {
        console.error("Error fetching service content:", err);
        setError(isHi ? "नेटवर्क त्रुटि।" : "Network error.");
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchContent();
  }, [id, isHi]);

  if (isLoadingServices || isLoadingContent) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#000080] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">
            {isHi ? "लोड हो रहा है..." : "Loading service..."}
          </p>
        </div>
      </div>
    );
  }

  if (!serviceMeta && !isLoadingServices) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2 shadow-inner">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {isHi ? "सेवा नहीं मिली" : "Service Not Found"}
        </h2>
        <p className="text-xs text-slate-500 max-w-xs">
          {isHi ? "यह सेवा अब उपलब्ध नहीं है या URL गलत है।" : "This service is no longer available or the URL is incorrect."}
        </p>
        <button onClick={() => navigate("/services")} className="mt-4 px-6 py-2.5 bg-[#000080] text-white rounded-xl text-xs font-bold shadow-md hover:bg-navy-dark transition-colors">
          {isHi ? "सेवाओं पर वापस जाएं" : "Back to Services"}
        </button>
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[serviceMeta?.iconName || "Compass"] || Compass;
  const colorClass = serviceMeta?.color || "bg-indigo-50 text-indigo-600 border-indigo-100";
  
  // Extract content fields
  const htmlContent = isHi ? contentData?.content_hi : contentData?.content_en;
  const actionLabel = isHi ? contentData?.action_label_hi : contentData?.action_label_en;
  const actionUrl = contentData?.action_url;
  const resources = contentData?.resources || [];

  return (
    <div className="p-5 flex-1 flex flex-col min-h-screen bg-slate-50/50 pb-24 relative overflow-x-hidden">
      
      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4 mb-5 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-[#000080] hover:border-[#000080] transition-colors shrink-0 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-extrabold text-base text-[#000080] truncate flex items-center gap-1.5">
            {isHi ? serviceMeta?.titleHi : serviceMeta?.titleEn}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold truncate">
            {isHi ? serviceMeta?.descHi : serviceMeta?.descEn}
          </p>
        </div>
      </div>

      {/* ── Banner/Hero ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-5 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-transparent to-[#000080]/5 rounded-full blur-xl pointer-events-none"></div>
        
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner shrink-0 ${colorClass}`}>
          <IconComponent className="w-7 h-7" />
        </div>
        <div>
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded text-[9px] font-black uppercase tracking-wider mb-1.5">
            {isHi ? "सक्रिय सेवा" : "Active Service"}
          </span>
          <h4 className="font-bold text-sm text-slate-800 leading-tight">
            {isHi ? "आरपी नागरिक कल्याण" : "RP Citizen Welfare"}
          </h4>
        </div>
      </div>

      {/* ── Dynamic Content Body ── */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-xs font-bold text-center">
          {error}
        </div>
      ) : !contentData ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-500 font-bold">
            {isHi ? "इस सेवा के लिए विस्तृत सामग्री अभी उपलब्ध नहीं है।" : "Detailed content for this service is not yet available."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* HTML Rich Text */}
          {htmlContent && (
            <div 
              className="prose prose-sm prose-slate max-w-none bg-white p-5 rounded-2xl shadow-sm border border-slate-100"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          {/* Resources / Downloads */}
          {resources && resources.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
              <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b pb-2">
                {isHi ? "दस्तावेज़ एवं संसाधन" : "Documents & Resources"}
              </h5>
              <div className="space-y-2">
                {resources.map((res: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 text-slate-400 group-hover:text-indigo-600">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-indigo-700">
                        {isHi ? (res.title_hi || res.title_en) : (res.title_en || res.title_hi)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          {actionLabel && actionUrl && (
            <div className="pt-2">
              <a 
                href={actionUrl}
                target={actionUrl.startsWith("http") ? "_blank" : "_self"}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#000080] text-white font-bold rounded-xl text-xs shadow-lg hover:bg-navy-dark transition-transform active:scale-95"
              >
                <span>{actionLabel}</span>
                {actionUrl.startsWith("http") && <ExternalLink className="w-3.5 h-3.5" />}
              </a>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
