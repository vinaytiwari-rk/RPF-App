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
} from "lucide-react";
import QRCode from "react-qr-code";

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

  return (
    <div className="space-y-5" id="jan-seva-card-section">
      <div className="mx-auto max-w-[440px]">
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
              {lang === "hi" ? "डिजिटल सदस्य पहचान" : "Digital Member Identity"}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {lang === "hi" ? "कार्ड पर टैप करके विवरण देखें" : "Tap the card to view credentials"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[10px] font-bold text-teal-700 transition hover:bg-teal-100"
          >
            <RotateCw className="h-3.5 w-3.5" />
            {lang === "hi" ? "फ्लिप" : "Tap to Flip"}
          </button>
        </div>

        <div className="[perspective:1000px]">
          <button
            type="button"
            aria-label={lang === "hi" ? "सदस्य कार्ड पलटें" : "Flip member card"}
            onClick={() => setFlipped((value) => !value)}
            className="relative block aspect-[1.58/1] w-full rounded-2xl text-left outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
          >
            <div
              className={`absolute inset-0 transition-transform duration-[700ms] [transform-style:preserve-3d] [backface-visibility:hidden] ${
                flipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
              }`}
            >
              {/* FRONT */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl border border-teal-200/70 bg-gradient-to-br from-indigo-700 via-teal-600 to-emerald-600 p-5 text-white shadow-[0_22px_55px_rgba(13,148,136,0.22)] [backface-visibility:hidden]">
                <div className="pointer-events-none absolute -right-14 -bottom-16 h-44 w-44 rounded-full bg-white/15 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full bg-cyan-200/15 blur-3xl" />

                <div className="relative flex items-start justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/25 bg-white/15 text-xs font-black backdrop-blur-md">RPF</div>
                    <div>
                      <p className="text-xs font-black tracking-[0.16em]">RP FOUNDATION</p>
                      <p className="mt-0.5 text-[9px] font-semibold tracking-[0.12em] text-teal-50/90">JAN SEVA • MEMBER</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[9px] font-black tracking-wide backdrop-blur-md">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {lang === "hi" ? "सत्यापित ID" : "VERIFIED ID"}
                  </span>
                </div>

                <div className="relative mt-4 flex h-[calc(100%-70px)] items-stretch justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/30 bg-white/15 text-sm font-black backdrop-blur-md">
                        {profile.profileImage ? (
                          <img src={profile.profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{profile.name?.trim()?.slice(0, 1)?.toUpperCase() || "R"}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/65">{lang === "hi" ? "सदस्य नाम" : "MEMBER NAME"}</p>
                        <p className="truncate text-base font-black tracking-tight">{valueOrDash(profile.name)}</p>
                        <p className="mt-0.5 text-[9px] font-semibold text-white/75">{valueOrDash(profile.role)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/60">ID NUMBER</p>
                        <p className="mt-0.5 font-mono text-[11px] font-bold">{valueOrDash(profile.janSevaId)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/60">REGION</p>
                        <p className="mt-0.5 truncate text-[10px] font-bold">{valueOrDash(profile.division)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wide text-white/90">
                      <Sparkles className="h-3.5 w-3.5" />
                      {lang === "hi" ? "डिजिटल सदस्य प्रमाण" : "Digital member credential"}
                    </div>
                  </div>

                  <div
                    role="presentation"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowVerify(true);
                    }}
                    className="w-[92px] shrink-0 self-center rounded-xl border border-white/25 bg-white/15 p-2 backdrop-blur-md transition hover:bg-white/20"
                  >
                    <div className="rounded-lg bg-white p-2">
                      <QRCode value={verifyUrl} size={160} style={{ width: "100%", height: "auto" }} bgColor="#FFFFFF" fgColor="#155e75" level="Q" />
                    </div>
                    <p className="mt-1.5 flex items-center justify-center gap-1 text-[7px] font-black tracking-[0.12em] text-white">
                      <QrCode className="h-2.5 w-2.5" />
                      SCAN VERIFY
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-bold tracking-[0.18em] text-white/55">
                  TAP • FLIP • VERIFY
                </div>
              </div>

              {/* BACK */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl border border-teal-200/60 bg-gradient-to-br from-slate-700 via-slate-600 to-teal-800 p-5 text-white shadow-[0_22px_55px_rgba(15,118,110,0.18)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-300/10 blur-3xl" />
                <div className="relative border-b border-white/15 pb-3">
                  <p className="text-[9px] font-black tracking-[0.2em] text-teal-100/80">OFFICIAL MEMBER CREDENTIALS</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-sm font-black tracking-wide">RP FOUNDATION</p>
                    <span className="text-[9px] font-bold tracking-[0.14em] text-white/60">EST. 2026</span>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
                  <Spec label="BLOOD GROUP" value={valueOrDash(profile.bloodGroup)} accent />
                  <Spec label="REGISTERED PHONE" value={valueOrDash(profile.phone)} />
                  <Spec label="NODAL REGION" value={valueOrDash(profile.division)} />
                  <Spec label="MEMBER SINCE" value={valueOrDash((profile as UserProfile & { memberSince?: string }).memberSince)} />
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between border-t border-white/15 pt-3">
                  <div>
                    <p className="font-mono text-[8px] text-white/55">AUTH HASH</p>
                    <p className="mt-0.5 font-mono text-[9px] font-bold tracking-wide text-white/80">{profile.janSevaId ? `RPF-${profile.janSevaId.slice(-8)}` : "—"}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/25 bg-emerald-300/10 px-2.5 py-1.5 text-[8px] font-black tracking-wide text-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    VERIFIED RECORD
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-semibold text-slate-400">
          <RotateCw className="h-3 w-3" />
          {lang === "hi" ? "कार्ड पर टैप करके पीछे की जानकारी देखें" : "Tap card to flip between identity and credentials"}
        </div>
      </div>

      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600" />
          <h5 className="text-xs font-black uppercase tracking-[0.12em] text-slate-700">
            {lang === "hi" ? "कार्ड सुविधाएं" : "Card Services"}
          </h5>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ActionButton icon={Download} label={lang === "hi" ? "PDF" : "Download ID"} onClick={() => window.print()} />
          <ActionButton icon={QrCode} label={lang === "hi" ? "सत्यापन" : "Verify QR"} onClick={() => setShowVerify(true)} />
          <ActionButton icon={Share2} label={lang === "hi" ? "शेयर" : "Share"} onClick={handleShare} />
          <ActionButton icon={RotateCw} label={lang === "hi" ? "फ्लिप" : "Flip"} onClick={() => setFlipped((value) => !value)} />
        </div>
        <button
          type="button"
          onClick={handleRenew}
          disabled={renewing}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-xs font-black text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60"
        >
          <Award className="h-4 w-4" />
          {renewing ? (lang === "hi" ? "प्रोसेसिंग…" : "Processing…") : lang === "hi" ? "सदस्यता नवीनीकरण" : "Renew Membership"}
        </button>

        {success && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {lang === "hi" ? "कार्ड अपडेट हो गया है।" : "Membership card updated successfully."}
          </div>
        )}
      </div>

      {showVerify && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Verify member card">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-600">RP FOUNDATION</p>
                <h3 className="mt-1 text-lg font-black text-slate-800">{lang === "hi" ? "सदस्य सत्यापन" : "Member Verification"}</h3>
              </div>
              <button type="button" onClick={() => setShowVerify(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-auto mt-5 w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <QRCode value={verifyUrl} size={220} style={{ width: "100%", height: "auto" }} bgColor="#FFFFFF" fgColor="#155e75" level="Q" />
            </div>
            <div className="mt-4 rounded-2xl bg-teal-50 p-3 text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-teal-600">Member ID</p>
              <p className="mt-1 font-mono text-sm font-black text-slate-700">{valueOrDash(profile.janSevaId)}</p>
            </div>
            <a href={verifyUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-xs font-black text-white hover:bg-teal-700">
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
      <p className="font-mono text-[8px] font-bold tracking-[0.13em] text-white/50">{label}</p>
      <p className={`mt-1 truncate text-[11px] font-black ${accent ? "text-rose-200" : "text-white"}`}>{value}</p>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: typeof Download; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-[9px] font-bold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
