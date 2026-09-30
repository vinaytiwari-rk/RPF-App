import React, { useEffect, useState, useRef } from "react";
import { Award, ArrowLeft, Download, FileText, Sparkles, ShieldCheck, Printer, CheckCircle2, User } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLoader from "../components/BrandLoader";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";

type CertificateRule = { id:string; title:string; title_hi?:string; min_hours:number; min_reports:number; min_tasks:number; active:boolean };
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
  const { user, token } = useAuth();
  const hi = outletContext?.lang === "hi";

  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [progress, setProgress] = useState({ hours: 0, reports: 0, tasks: 0 });
  const [rules, setRules] = useState<CertificateRule[]>([]);

  const certRef = useRef<HTMLDivElement>(null);
  const verificationBase = "https://appapi.therpfoundation.org/api/certificates/verify/";

  useEffect(() => {
    if (!user?.id) { setItems([]); setSelectedCert(null); setLoading(false); return; }
    fetch(`/api/volunteers/me/certificates?volunteer_id=${encodeURIComponent(user.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setProgress({ hours: Number(d.progress?.hours || 0), reports: Number(d.progress?.reports || 0), tasks: Number(d.progress?.tasks || 0) });
        setRules(Array.isArray(d.rules) ? d.rules : []);
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
      const response = await fetch(`/api/certificates/download/${encodeURIComponent(selectedCert.certificate_id)}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
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
            {items.length === 0 && (
              <section className="rounded-2xl border border-[#D8E8DB] bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#243B32]">{hi ? "अभी कोई प्रमाणपत्र जारी नहीं हुआ" : "No certificate has been issued yet"}</h2>
                <p className="mt-1 text-sm text-slate-500">{hi ? "आपकी Activity के वास्तविक सेवा रिकॉर्ड के आधार पर पात्रता पूरी होने पर प्रमाणपत्र स्वतः बनेगा।" : "Certificates are generated automatically when your recorded Activity meets a configured condition."}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[#F0FAF4] p-3"><b className="block text-lg text-[#245D45]">{progress.hours.toFixed(1)}</b><span className="text-[10px] text-slate-500">Hours</span></div>
                  <div className="rounded-xl bg-[#FFF7E8] p-3"><b className="block text-lg text-[#B45309]">{progress.reports}</b><span className="text-[10px] text-slate-500">Reports</span></div>
                  <div className="rounded-xl bg-slate-50 p-3"><b className="block text-lg text-[#243B32]">{progress.tasks}</b><span className="text-[10px] text-slate-500">Tasks</span></div>
                </div>
                {rules.length > 0 && <div className="mt-4 space-y-2"><p className="text-[10px] font-bold uppercase tracking-wider text-[#245D45]">{hi ? "पात्रता की शर्तें" : "Eligibility conditions"}</p>{rules.map(rule => <div key={rule.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600"><b className="text-[#243B32]">{hi ? (rule.title_hi || rule.title) : rule.title}</b><div className="mt-1">≥ {rule.min_hours} hours · ≥ {rule.min_reports} reports · ≥ {rule.min_tasks} completed tasks</div></div>)}</div>}
              </section>
            )}

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
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#243B32]">
                    {hi ? "प्रमाणपत्र पूर्वावलोकन" : "Certificate Preview"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="inline-flex items-center gap-1.5 rounded-xl border border-[#B9E5CC] bg-white px-3 py-2 text-xs font-bold text-[#245D45]">
                      <Printer className="h-4 w-4" /> {hi ? "प्रिंट" : "Print"}
                    </button>
                    <button onClick={handleDownload} disabled={downloadBusy} className="inline-flex items-center gap-1.5 rounded-xl bg-[#245D45] px-3 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-60">
                      <Download className="h-4 w-4" /> {downloadBusy ? "PDF..." : (hi ? "PDF" : "Download PDF")}
                    </button>
                  </div>
                </div>

                <div ref={certRef} className="relative overflow-hidden rounded-[28px] border-4 border-[#D7A93A] bg-white p-6 sm:p-8 shadow-sm text-center text-[#243B32] print:rounded-none print:shadow-none">
                  <div className="pointer-events-none absolute inset-2 rounded-[22px] border-2 border-[#E7C65A]/70" />

                  <div className="relative flex flex-col items-center gap-2">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#D7A93A] bg-white p-1 shadow-sm">
                      <img src="/assets/rpf-samahit-icon.png" alt="RP Foundation" className="h-full w-full object-contain" />
                    </div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#167C5A]">RP Foundation Social Welfare Trust</p>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243B32]">{hi ? selectedCert.titleHi : selectedCert.title}</h3>
                  </div>

                  <p className="mt-6 text-xs sm:text-sm text-slate-500 italic">
                    {hi ? "यह प्रमाणपत्र गर्वपूर्वक प्रदान किया जाता है:" : "This certificate is proudly awarded to:"}
                  </p>
                  <h2 className="mx-auto mt-2 max-w-xl border-b-2 border-[#D7A93A] pb-2 text-2xl sm:text-3xl font-bold text-[#243B32]">
                    {selectedCert.recipient_name}
                  </h2>

                  <p className="mx-auto mt-5 max-w-2xl text-xs sm:text-sm leading-7 text-slate-600">
                    {hi
                      ? `समुदाय सेवा में ${selectedCert.duty_hours || 0} घंटे के समर्पित योगदान के लिए यह प्रमाणपत्र प्रदान किया जाता है।`
                      : `This certificate recognizes dedicated contribution to community welfare, including ${selectedCert.duty_hours || 0} recorded volunteer hours.`}
                  </p>

                  <div className="mt-6 grid grid-cols-[auto_1fr] items-end gap-5 border-t border-slate-200 pt-5 text-left">
                    <div className="rounded-xl border border-[#D8E8DB] bg-[#F0FAF4] p-2.5">
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[#245D45]">{hi ? "सत्यापन" : "Verify"}</p>
                      <QRCode value={`${verificationBase}${selectedCert.certificate_id}`} size={78} bgColor="#ffffff" fgColor="#243B32" />
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Certificate ID</p>
                      <p className="break-all font-mono text-xs font-bold text-[#243B32]">{selectedCert.certificate_id}</p>
                      <p className="mt-1 text-[10px] text-slate-500">Issued: {new Date(selectedCert.issue_date).toLocaleDateString("en-IN")}</p>
                      <div className="mt-6 ml-auto w-fit border-t border-slate-400 pt-1">
                        <p className="font-serif text-sm font-bold text-[#243B32]">Rohit Pandit</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#B45309]">Founder, RP Foundation</p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[9px] text-slate-400">Verification is based on the certificate record stored by Samahit.</p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
