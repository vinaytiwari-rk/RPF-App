import React, { useEffect, useState, useRef } from "react";
import { Award, ArrowLeft, Download, FileText, Sparkles, ShieldCheck, Printer, CheckCircle2, User } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLoader from "../components/BrandLoader";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";

type Certificate = {
  id: string;
  certificate_id: string;
  title: string;
  titleHi: string;
  issue_date: string;
  recipient_name: string;
  role: string;
  duty_hours?: number;
};

export default function MyCertificates() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ lang?: "en" | "hi" }>();
  const { user } = useAuth();
  const hi = outletContext?.lang === "hi";

  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);

  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) { setItems([]); setSelectedCert(null); setLoading(false); return; }
    fetch(`/api/volunteers/me/certificates?volunteer_id=${encodeURIComponent(user.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const mapped: Certificate[] = Array.isArray(d.certificates) ? d.certificates.map((x: any) => ({
          id: x.id,
          certificate_id: x.certificate_id,
          title: x.title || "Certificate of Recognition",
          titleHi: x.title_hi || "सेवा सम्मान प्रमाणपत्र",
          issue_date: x.issue_date,
          recipient_name: x.recipient_name || user.name || "Volunteer",
          role: x.role || "Volunteer",
          duty_hours: Number(x.duty_hours || 0)
        })) : [];
        setItems(mapped);
        setSelectedCert(mapped[0] || null);
      })
      .catch(() => { setItems([]); setSelectedCert(null); toast.error(hi ? "प्रमाणपत्र लोड नहीं हो सके" : "Certificates could not be loaded"); })
      .finally(() => setLoading(false));
  }, [user?.id, user?.name, hi]);

  const handlePrint = () => window.print();
  const handleDownload = async () => {
    if (!selectedCert || downloadBusy) return;
    setDownloadBusy(true);
    try {
      const response = await fetch(`/api/certificates/download/${encodeURIComponent(selectedCert.certificate_id)}`, { headers: { ...(user?.id ? {} : {}) } });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `Certificate_${selectedCert.certificate_id}.pdf`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { toast.error(hi ? "PDF डाउनलोड नहीं हो सका" : "PDF download failed"); }
    finally { setDownloadBusy(false); }
  };

  return (
    <main className="min-h-full bg-[#FFF7E8] pb-16 text-[#243B32]">
      <div className="mx-auto max-w-3xl px-4 py-4 space-y-5 sm:px-6">
        {/* Top Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-bold text-[#14213D] shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          {hi ? "वापस" : "Back to Home"}
        </button>

        {/* Hero Header */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[28px] border border-[#D8E8DB] bg-gradient-to-br from-[#FFE5C4] via-white to-[#F0FAF4] p-6 sm:p-7 shadow-sm"
        >
          <div className="flex items-center gap-2 text-[#D97706]">
            <Award className="h-5 w-5" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest">
              RP Foundation Recognition
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#243B32] tracking-tight leading-snug">
            {hi ? "मेरे आधिकारिक प्रमाणपत्र एवं सम्मान" : "Official Certificates & Recognition"}
          </h1>

          <p className="mt-2.5 text-xs sm:text-[13.5px] leading-relaxed text-slate-600 font-medium">
            {hi
              ? "आपकी जन सेवा, स्वास्थ्य शिविरों और स्वयंसेवक कार्य के लिए जारी आधिकारिक आर.पी. फाउंडेशन प्रमाणपत्र। डाउनलोड या प्रिंट करें।"
              : "Official certificates of recognition issued for community service, volunteer duties, and Jan Seva card membership."}
          </p>
        </motion.section>

        {loading ? (
          <div className="flex justify-center py-14">
            <BrandLoader size="md" label={hi ? "प्रमाणपत्र लोड हो रहे हैं" : "Loading certificates..."} />
          </div>
        ) : (
          <>
            {/* Certificate List Selector */}
            <div className="space-y-2">
              <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#D97706]">
                {hi ? "उपलब्ध प्रमाणपत्र सूची" : "Issued Certificates"}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {items.map((cert) => (
                  <button
                    key={cert.certificate_id}
                    onClick={() => setSelectedCert(cert)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      selectedCert?.certificate_id === cert.certificate_id
                        ? "border-[#D97706] bg-[#FFF7E8] shadow-xs"
                        : "border-[#D8E8DB] bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-[#D97706]">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#14213D] truncate">
                          {hi ? cert.titleHi : cert.title}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {cert.certificate_id}
                        </p>
                      </div>
                    </div>
                    {selectedCert?.certificate_id === cert.certificate_id && (
                      <CheckCircle2 className="h-5 w-5 text-[#D97706] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Printable Certificate Canvas View */}
            {selectedCert && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#14213D]">
                    {hi ? "प्रमाणपत्र पूर्वावलोकन (Preview)" : "Certificate Official Document"}
                  </h2>
                  <button
                    onClick={handleDownload} disabled={downloadBusy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#167C5A] px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition-all"
                  >
                    <Printer className="h-4 w-4" />
                    {downloadBusy ? (hi ? "PDF तैयार हो रहा है..." : "Preparing PDF...") : (hi ? "PDF डाउनलोड" : "Download PDF")}
                  </button>\n                  </div>\n                </div>\n\n                <div\n                  ref={certRef}
                  className="overflow-hidden rounded-[28px] border-4 border-[#D7A93A] bg-white p-6 sm:p-8 shadow-sm relative text-center text-[#243B32] space-y-5 print:rounded-none print:shadow-none"
                >
                  {/* Decorative Border Frame */}
                  <div className="absolute inset-2 border-2 border-amber-400/40 rounded-[22px] pointer-events-none" />

                  {/* Header Badge */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#D7A93A] bg-white shadow-sm">\n                      <img src="/assets/rpf-samahit-icon.png" alt="RP Foundation" className="h-full w-full object-contain" />
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D97706] mt-2">
                      RP Foundation Social Welfare Trust
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243B32]">
                      {hi ? selectedCert.titleHi : selectedCert.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 italic">
                    {hi ? "यह प्रमाणपत्र गर्वपूर्वक प्रदान किया जाता है:" : "This certificate is proudly awarded to:"}
                  </p>

                  <div className="border-b-2 border-amber-400/80 pb-2 max-w-md mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14213D]">
                      {selectedCert.recipient_name}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-[13px] leading-relaxed text-slate-600 max-w-lg mx-auto font-medium">
                    {hi
                      ? `आरपी फाउंडेशन के तहत जन सेवा, समाज कल्याण एवं स्वास्थ्य अभियानों में निष्ठापूर्वक ${selectedCert.duty_hours} घंटे का योगदान देने के लिए सम्मानित किया जाता है।`
                      : `In recognition of dedicated service, leadership, and ${selectedCert.duty_hours} hours of volunteer contribution towards community welfare initiatives.`}
                  </p>

                  <div className="flex items-end justify-between gap-4 pt-2 text-left">\n                    <div className="rounded-xl bg-[#F0FAF4] p-2.5 text-left">\n                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#245D45]">Verify Certificate</p>\n                      <QRCode value={`${window.location.origin}/api/certificates/verify/${selectedCert.certificate_id}`} size={72} bgColor="#ffffff" fgColor="#243B32" />\n                    </div>\n                    <div className="min-w-0 flex-1 text-right">\n                      <p className="text-[9px] uppercase tracking-wider text-slate-400">Certificate ID</p>\n                      <p className="break-all font-mono text-xs font-semibold text-[#243B32]">{selectedCert.certificate_id}</p>\n                      <p className="mt-1 text-[10px] text-slate-500">{new Date(selectedCert.issue_date).toLocaleDateString("en-IN")}</p>\n                    </div>\n                  </div>\n\n                  {/* Certificate Footer Meta & Signatures */}
                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-left text-xs font-bold text-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Certificate ID</p>
                      <p className="font-mono text-[#14213D]">{selectedCert.certificate_id}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Date: {new Date(selectedCert.issue_date).toLocaleDateString("en-IN")}</p>
                    </div>

                    <div className="text-right">
                      <div className="inline-block border-b border-slate-400 pb-1 font-serif text-sm font-extrabold text-[#14213D]">
                        Rohit Pandit
                      </div>
                      <p className="text-[10px] text-[#D97706] font-bold uppercase tracking-wider mt-0.5">
                        Founder, RP Foundation
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
