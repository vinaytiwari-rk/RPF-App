import React, { useMemo, useState } from "react";
import { UserProfile } from "../types";
import {
  Award,
  CheckCircle2,
  Download,
  Droplet,
  QrCode,
  RotateCw,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
  Printer,
} from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface JanSevaCardCompProps {
  lang: "hi" | "en";
  profile: UserProfile;
  onRenew: () => void;
  onUploadImage?: (url: string) => void;
}

const valueOrDash = (value?: string | null) => (value?.trim() ? value : "—");

export default function JanSevaCardComp({ lang, profile, onRenew }: JanSevaCardCompProps) {
  const [flipped, setFlipped] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const verifyUrl = useMemo(
    () => `https://jansevacard.therpfoundation.org/verify?id=${encodeURIComponent(profile.janSevaId || "")}`,
    [profile.janSevaId]
  );

  const handleRenew = () => {
    setRenewing(true);
    window.setTimeout(() => {
      onRenew();
      setRenewing(false);
      setSuccess(true);
      window.setTimeout(() => setSuccess(false), 3000);
    }, 700);
  };

  const handleShare = async () => {
    const shareData = {
      title: lang === "hi" ? "RP Foundation सदस्य कार्ड" : "RP Foundation Member Card",
      text: `${lang === "hi" ? "सदस्य ID" : "Member ID"}: ${valueOrDash(profile.janSevaId)}`,
      url: verifyUrl,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(verifyUrl);
    } catch {
      // User cancelled sharing; no UI error is necessary.
    }
  };

  // ✨ PDF Download (Front + Back)
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const frontEl = document.getElementById("comp-card-front");
      const backEl = document.getElementById("comp-card-back");
      if (!frontEl) {
        alert(lang === "hi" ? "कार्ड एलिमेंट नहीं मिला।" : "Card element not found.");
        return;
      }

      const opts = { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false };
      const frontCanvas = await html2canvas(frontEl, opts);
      const frontImg = frontCanvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 54]
      });

      pdf.addImage(frontImg, "JPEG", 0, 0, 85.6, 54);

      if (backEl) {
        const backCanvas = await html2canvas(backEl, opts);
        const backImg = backCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addPage([85.6, 54], "landscape");
        pdf.addImage(backImg, "JPEG", 0, 0, 85.6, 54);
      }

      pdf.save(`RPFoundation_Card_${valueOrDash(profile.janSevaId)}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert(lang === "hi" ? "PDF बनाने में समस्या हुई।" : "Failed to generate PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5" id="jan-seva-card-section">
      <div className="mx-auto max-w-[340px]">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#000080]">
              {lang === "hi" ? "डिजिटल सदस्य पहचान" : "Digital Member Identity"}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-500 flex items-center gap-1">
              <RotateCw className="h-3 w-3" />
              {lang === "hi" ? "कार्ड पर टैप करके पलटें" : "Tap card to flip"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#FF9933]/30 bg-[#FF9933]/10 px-2.5 py-1.5 text-[10px] font-bold text-[#FF9933] transition hover:bg-[#FF9933]/20"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {lang === "hi" ? "फ्लिप" : "Flip"}
          </button>
        </div>

        {/* ✨ FLIP CARD */}
        <div
          className="perspective-1000 w-full cursor-pointer"
          onClick={() => setFlipped(f => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setFlipped(f => !f); }}
        >
          <div className={`relative w-full aspect-[1.586] transition-transform duration-500 transform-style-3d ${flipped ? "rotate-y-180" : ""}`}>
            
            {/* FRONT */}
            <div id="comp-card-front" className="absolute inset-0 backface-hidden w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
              {/* Saffron Header */}
              <div className="bg-[#FF9933] px-3 py-2.5 flex items-center gap-2.5 shrink-0">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm shrink-0 border border-white/40">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="" className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" />
                  ) : (
                    <span className="text-[#000080] font-black text-sm">RPF</span>
                  )}
                </div>
                <div className="flex flex-col text-white min-w-0">
                  <p className="font-sans font-black text-[12px] tracking-wider leading-none">RP FOUNDATION</p>
                  <p className="text-[8px] font-semibold tracking-[0.12em] opacity-95 mt-0.5">JAN SEVA • MEMBER</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-1 text-[8px] font-black text-white border border-white/30">
                  <ShieldCheck className="h-3 w-3" />
                  {lang === "hi" ? "सत्यापित" : "VERIFIED"}
                </span>
              </div>

              {/* Main Content */}
              <div className="p-3 flex-1 relative flex flex-col justify-between bg-white">
                {/* Ashoka Chakra Watermark */}
                <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#000080]" fill="currentColor">
                    <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
                  </svg>
                </div>

                <div className="relative z-10 flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500">{lang === "hi" ? "सदस्य नाम" : "MEMBER NAME"}</p>
                    <p className="truncate text-[14px] font-black text-[#000080] leading-tight">{valueOrDash(profile.name)}</p>
                    <p className="mt-0.5 text-[9px] font-semibold text-slate-600">{valueOrDash(profile.role)}</p>
                  </div>
                  <div
                    role="presentation"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowVerify(true);
                    }}
                    className="w-[70px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-1.5 transition hover:bg-slate-100"
                  >
                    <QRCode value={verifyUrl} size={120} style={{ width: "100%", height: "auto" }} bgColor="#F8FAFC" fgColor="#000080" level="Q" />
                    <p className="mt-1 flex items-center justify-center gap-0.5 text-[6.5px] font-black text-[#000080]">
                      <QrCode className="h-2 w-2" />
                      SCAN
                    </p>
                  </div>
                </div>

                <div className="relative z-10 space-y-1.5 text-[11px] text-[#000080]">
                  <div className="flex"><span className="w-[70px] shrink-0 font-medium text-slate-500">ID Number :</span><span className="font-bold font-mono">{valueOrDash(profile.janSevaId)}</span></div>
                  <div className="flex"><span className="w-[70px] shrink-0 font-medium text-slate-500">Region :</span><span className="font-semibold truncate">{valueOrDash(profile.division)}</span></div>
                  <div className="flex"><span className="w-[70px] shrink-0 font-medium text-slate-500">Blood Group :</span><span className="font-bold text-red-600">{valueOrDash(profile.bloodGroup)}</span></div>
                </div>

                <div className="relative z-10 text-center pt-2 border-t border-slate-100 mt-2">
                  <p className="font-sans font-black text-[12px] text-[#000080] tracking-wider leading-none">Toll Free : 1800-569-0991</p>
                  <p className="text-[8px] text-slate-600 font-medium mt-0.5">www.therpfoundation.org</p>
                </div>
              </div>
              {/* Green Footer */}
              <div className="bg-[#138808] h-2 w-full shrink-0"></div>
            </div>

            {/* BACK */}
            <div id="comp-card-back" className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-white rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
              <div className="bg-[#FF9933] h-2 w-full shrink-0"></div>
              <div className="p-3 flex-1 relative flex flex-col bg-white overflow-hidden">
                <div className="absolute inset-0 flex justify-center items-center opacity-[0.035] pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 text-[#000080]" fill="currentColor">
                    <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
                  </svg>
                </div>

                <div className="relative z-10 border-b border-slate-200 pb-2 mb-2">
                  <p className="text-[9px] font-black tracking-[0.15em] text-[#000080]">OFFICIAL CREDENTIALS</p>
                  <div className="mt-0.5 flex items-center justify-between">
                    <p className="text-[12px] font-black text-[#000080]">RP FOUNDATION</p>
                    <span className="text-[8px] font-bold text-slate-500">EST. 2026</span>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1">
                  <Spec label="BLOOD GROUP" value={valueOrDash(profile.bloodGroup)} accent />
                  <Spec label="PHONE" value={valueOrDash(profile.phone)} />
                  <Spec label="REGION" value={valueOrDash(profile.division)} />
                  <Spec label="MEMBER SINCE" value={valueOrDash((profile as UserProfile & { memberSince?: string }).memberSince)} />
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-slate-200 pt-2 mt-2">
                  <div>
                    <p className="font-mono text-[7px] text-slate-500">AUTH HASH</p>
                    <p className="mt-0.5 font-mono text-[9px] font-bold text-[#000080]">{profile.janSevaId ? `RPF-${profile.janSevaId.slice(-8)}` : "—"}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[8px] font-black text-green-800 border border-green-200">
                    <CheckCircle2 className="h-3 w-3" />
                    VERIFIED
                  </div>
                </div>
              </div>
              <div className="bg-[#138808] h-2 w-full shrink-0"></div>
            </div>
          </div>
        </div>

        <p className="mt-2 text-center text-[9px] font-medium text-slate-400">
          {flipped ? (lang === "hi" ? "पीछे की तरफ • फिर टैप करें" : "Back side • tap again") : (lang === "hi" ? "सामने की तरफ • टैप करके पलटें" : "Front side • tap to flip")}
        </p>
      </div>

      {/* Card Services */}
      <div className="mx-auto max-w-[340px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-2.5 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#000080]" />
          <h5 className="text-[11px] font-black uppercase tracking-[0.12em] text-[#000080]">
            {lang === "hi" ? "कार्ड सुविधाएं" : "Card Services"}
          </h5>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ActionButton icon={Download} label={lang === "hi" ? "PDF" : "PDF"} onClick={handleDownloadPDF} loading={pdfLoading} />
          <ActionButton icon={Printer} label={lang === "hi" ? "प्रिंट" : "Print"} onClick={handlePrint} />
          <ActionButton icon={QrCode} label={lang === "hi" ? "सत्यापन" : "Verify"} onClick={() => setShowVerify(true)} />
          <ActionButton icon={Share2} label={lang === "hi" ? "शेयर" : "Share"} onClick={handleShare} />
        </div>
        <button
          type="button"
          onClick={handleRenew}
          disabled={renewing}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#138808] px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:shadow-md disabled:opacity-60"
        >
          <Award className="h-4 w-4" />
          {renewing ? (lang === "hi" ? "प्रोसेसिंग…" : "Processing…") : lang === "hi" ? "सदस्यता नवीनीकरण" : "Renew Membership"}
        </button>

        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-bold text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            {lang === "hi" ? "कार्ड अपडेट हो गया है।" : "Membership card updated successfully."}
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerify && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Verify member card">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#000080]">RP FOUNDATION</p>
                <h3 className="mt-1 text-lg font-black text-[#000080]">{lang === "hi" ? "सदस्य सत्यापन" : "Member Verification"}</h3>
              </div>
              <button type="button" onClick={() => setShowVerify(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-auto mt-5 w-48 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <QRCode value={verifyUrl} size={180} style={{ width: "100%", height: "auto" }} bgColor="#FFFFFF" fgColor="#000080" level="Q" />
            </div>
            <div className="mt-4 rounded-2xl bg-[#FF9933]/10 p-3 text-center border border-[#FF9933]/20">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#FF9933]">Member ID</p>
              <p className="mt-1 font-mono text-sm font-black text-[#000080]">{valueOrDash(profile.janSevaId)}</p>
            </div>
            <a href={verifyUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#000080] px-4 py-3 text-xs font-black text-white hover:bg-[#000066]">
              <ShieldCheck className="h-4 w-4" />
              {lang === "hi" ? "ऑनलाइन सत्यापन खोलें" : "Open Online Verification"}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[8px] font-bold tracking-[0.13em] text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-[11px] font-black ${accent ? "text-red-600" : "text-[#000080]"}`}>{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, loading = false }: { icon: typeof Download; label: string; onClick: () => void; loading?: boolean }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      disabled={loading}
      className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-[9px] font-bold text-slate-600 transition hover:border-[#FF9933]/30 hover:bg-[#FF9933]/5 hover:text-[#FF9933] disabled:opacity-50"
    >
      <Icon className="h-4 w-4" />
      <span>{loading ? "..." : label}</span>
    </button>
  );
}