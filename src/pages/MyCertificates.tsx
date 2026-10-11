import React, { useEffect, useState, useRef } from "react";
import { Award, ArrowLeft, Download, Printer, CheckCircle2, GraduationCap, Play } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLoader from "../components/BrandLoader";
import { toast } from "react-hot-toast";
import QRCode from "react-qr-code";
import { saveBlobToDownloads } from "../utils/nativeFileDownload";

type CertificateRule = {
  id: string;
  title: string;
  title_hi?: string;
  min_hours: number;
  min_reports: number;
  min_tasks: number;
  active: boolean;
};

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

type TestCertificate = {
  id: string;
  certificate_id: string;
  user_id: string;
  candidate_name: string;
  duration_minutes: number;
  total_questions: number;
  correct_count: number;
  score_percentage: number;
  grade: string;
  category_breakdown?: any;
  issue_date: string;
};

export default function MyCertificates() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ lang?: "en" | "hi" }>();
  const { user, token } = useAuth();
  const hi = outletContext?.lang === "hi";

  const [activeTab, setActiveTab] = useState<"volunteer" | "test">("test");
  const [items, setItems] = useState<Certificate[]>([]);
  const [testCerts, setTestCerts] = useState<TestCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [selectedTestCert, setSelectedTestCert] = useState<TestCertificate | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [progress, setProgress] = useState({ hours: 0, reports: 0, tasks: 0 });
  const [rules, setRules] = useState<CertificateRule[]>([]);

  const certRef = useRef<HTMLDivElement>(null);
  const verificationBase = "https://appapi.therpfoundation.org/api/certificates/verify/";

  useEffect(() => {
    if (!user?.id) {
      setItems([]);
      setTestCerts([]);
      setSelectedCert(null);
      setSelectedTestCert(null);
      setLoading(false);
      return;
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch volunteer certificates and test assessment certificates concurrently
    Promise.allSettled([
      fetch("/api/volunteers/me/certificates", { headers }).then((r) =>
        r.ok ? r.json() : Promise.reject()
      ),
      fetch("/api/test-certificates/my", { headers }).then((r) =>
        r.ok ? r.json() : Promise.reject()
      )
    ])
      .then(([volRes, testRes]) => {
        // Handle volunteer certificates
        if (volRes.status === "fulfilled") {
          const d = volRes.value;
          setProgress({
            hours: Number(d.progress?.hours || 0),
            reports: Number(d.progress?.reports || 0),
            tasks: Number(d.progress?.tasks || 0)
          });
          setRules(Array.isArray(d.rules) ? d.rules : []);
          const mapped: Certificate[] = Array.isArray(d.certificates)
            ? d.certificates.map((x: any) => ({
                id: x.id,
                certificate_id: x.certificate_id,
                title: x.title || "Certificate of Recognition",
                titleHi: x.title_hi || "सेवा सम्मान प्रमाणपत्र",
                issue_date: x.issue_date,
                recipient_name: x.recipient_name || user.name || "Volunteer",
                role: x.role || "Volunteer",
                duty_hours: Number(x.duty_hours || 0)
              }))
            : [];
          setItems(mapped);
          setSelectedCert(mapped[0] || null);
        }

        // Handle test certificates
        if (testRes.status === "fulfilled") {
          const td = testRes.value;
          const tmapped: TestCertificate[] = Array.isArray(td.certificates) ? td.certificates : [];
          setTestCerts(tmapped);
          setSelectedTestCert(tmapped[0] || null);
        }
      })
      .catch(() => {
        toast.error(hi ? "प्रमाणपत्र लोड नहीं हो सके" : "Certificates could not be loaded");
      })
      .finally(() => setLoading(false));
  }, [user?.id, token, user?.name, hi]);

  const handlePrint = () => window.print();

  const handleDownloadVolunteer = async () => {
    if (!selectedCert || downloadBusy) return;
    setDownloadBusy(true);
    try {
      const response = await fetch(
        `/api/certificates/download/${encodeURIComponent(selectedCert.certificate_id)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      await saveBlobToDownloads(
        blob,
        `Certificate_${selectedCert.certificate_id}.pdf`,
        "application/pdf"
      );
      toast.success(
        hi ? "प्रमाणपत्र Downloads/SAMAHIT में सेव हो गया" : "Certificate saved to Downloads/SAMAHIT"
      );
    } catch (error) {
      console.error("Certificate download failed", error);
      toast.error(hi ? "PDF सेव नहीं हो सकी।" : "Could not save the PDF.");
    } finally {
      setDownloadBusy(false);
    }
  };

  const handleDownloadTestCertificate = async (cert: TestCertificate) => {
    if (downloadBusy) return;
    setDownloadBusy(true);
    try {
      const response = await fetch(
        `/api/test-certificates/download/${encodeURIComponent(cert.certificate_id)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      if (!response.ok) {
        throw new Error("Download failed");
      }
      const blob = await response.blob();
      await saveBlobToDownloads(
        blob,
        `RP_Foundation_Certificate_${cert.certificate_id}.pdf`,
        "application/pdf"
      );
      toast.success(
        hi ? "प्रमाणपत्र Downloads में सेव हो गया!" : "Certificate saved to Downloads!"
      );
    } catch (error) {
      console.error("Test certificate download failed", error);
      toast.error(hi ? "सर्टिफिकेट डाउनलोड नहीं हो सका।" : "Could not download certificate.");
    } finally {
      setDownloadBusy(false);
    }
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
              ? "ऑनलाइन परीक्षा मूल्यांकन और जन सेवा गतिविधियों के लिए जारी आधिकारिक आर. पी. फाउंडेशन प्रमाणपत्र। कभी भी डाउनलोड या प्रिंट करें।"
              : "Official certificates of achievement issued by RP Foundation for online test assessments and community services."}
          </p>

          {/* Navigation Tabs */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("test")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "test"
                  ? "bg-[#245D45] text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>{hi ? "ऑनलाइन टेस्ट प्रमाणपत्र" : "Test Certificates"}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "test" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {testCerts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("volunteer")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                activeTab === "volunteer"
                  ? "bg-[#245D45] text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Award className="h-4 w-4" />
              <span>{hi ? "स्वयंसेवक सेवा प्रमाणपत्र" : "Volunteer Certificates"}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === "volunteer" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {items.length}
              </span>
            </button>
          </div>
        </motion.section>

        {loading ? (
          <div className="flex justify-center py-14">
            <BrandLoader size="md" label={hi ? "प्रमाणपत्र लोड हो रहे हैं..." : "Loading certificates..."} />
          </div>
        ) : activeTab === "test" ? (
          /* =========================================================================
             TEST ASSESSMENT CERTIFICATES TAB
             ========================================================================= */
          <div className="space-y-4">
            {testCerts.length === 0 ? (
              <section className="rounded-2xl border border-[#D8E8DB] bg-white p-6 shadow-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h2 className="mt-3 text-base font-bold text-[#243B32]">
                  {hi ? "अभी तक कोई टेस्ट प्रमाणपत्र नहीं है" : "No Test Certificate Issued Yet"}
                </h2>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {hi
                    ? "समाहित ऑनलाइन परीक्षा पोर्टल पर 5 से 60 मिनट की परीक्षा दें और आर. पी. फाउंडेशन का आधिकारिक योग्यता प्रमाणपत्र प्राप्त करें।"
                    : "Complete an assessment on the SAMAHIT Online Test Portal to earn and permanently store your official RP Foundation certificate."}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/online-test")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#245D45] px-5 py-2.5 text-xs font-extrabold text-white shadow hover:bg-emerald-800 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{hi ? "ऑनलाइन टेस्ट अभी शुरू करें" : "Take Online Test Now"}</span>
                </button>
              </section>
            ) : (
              <div className="space-y-3">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#D97706]">
                  {hi ? "आपके अर्जित ऑनलाइन टेस्ट प्रमाणपत्र" : "Your Earned Test Certificates"}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {testCerts.map((cert) => (
                    <div
                      key={cert.certificate_id}
                      className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm flex flex-col justify-between gap-3 hover:border-emerald-300 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            RP Foundation
                          </span>
                          <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            Grade: {cert.grade} ({cert.score_percentage}%)
                          </span>
                        </div>
                        <h3 className="mt-2 text-sm font-black text-[#243B32]">
                          CERTIFICATE OF ACHIEVEMENT
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 mt-0.5">
                          {cert.candidate_name}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {cert.total_questions} Questions • {cert.duration_minutes} Mins •{" "}
                          {new Date(cert.issue_date).toLocaleDateString("en-IN")}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          ID: {cert.certificate_id}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800">
                          Online Test through Samahit App
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDownloadTestCertificate(cert)}
                          disabled={downloadBusy}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#245D45] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-800 disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{downloadBusy ? "..." : hi ? "PDF डाउनलोड" : "Download PDF"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             VOLUNTEER RECOGNITION TAB
             ========================================================================= */
          <>
            {items.length === 0 && (
              <section className="rounded-2xl border border-[#D8E8DB] bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#243B32]">
                  {hi ? "अभी कोई सेवा प्रमाणपत्र जारी नहीं हुआ" : "No volunteer certificate issued yet"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {hi
                    ? "आपकी सेवा गतिविधि के आधार पर पात्रता पूरी होने पर प्रमाणपत्र स्वतः जारी होगा।"
                    : "Certificates are generated automatically when your volunteer hours meet eligibility criteria."}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-[#F0FAF4] p-3">
                    <b className="block text-lg text-[#245D45]">{progress.hours.toFixed(1)}</b>
                    <span className="text-[10px] text-slate-500">Hours</span>
                  </div>
                  <div className="rounded-xl bg-[#FFF7E8] p-3">
                    <b className="block text-lg text-[#B45309]">{progress.reports}</b>
                    <span className="text-[10px] text-slate-500">Reports</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <b className="block text-lg text-[#243B32]">{progress.tasks}</b>
                    <span className="text-[10px] text-slate-500">Tasks</span>
                  </div>
                </div>
                {rules.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#245D45]">
                      {hi ? "पात्रता की शर्तें" : "Eligibility conditions"}
                    </p>
                    {rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600"
                      >
                        <b className="text-[#243B32]">{hi ? rule.title_hi || rule.title : rule.title}</b>
                        <div className="mt-1">
                          ≥ {rule.min_hours} hours · ≥ {rule.min_reports} reports · ≥ {rule.min_tasks} completed tasks
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Certificate List Selector */}
            {items.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#D97706]">
                  {hi ? "उपलब्ध स्वयंसेवक प्रमाणपत्र सूची" : "Issued Volunteer Certificates"}
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
                          <p className="text-xs font-bold text-[#243B32] break-words">
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
            )}

            {/* Official Printable Volunteer Certificate Canvas View */}
            {selectedCert && (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#243B32]">
                    {hi ? "प्रमाणपत्र पूर्वावलोकन" : "Certificate Preview"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#B9E5CC] bg-white px-3 py-2 text-xs font-bold text-[#245D45]"
                    >
                      <Printer className="h-4 w-4" /> {hi ? "प्रिंट" : "Print"}
                    </button>
                    <button
                      onClick={handleDownloadVolunteer}
                      disabled={downloadBusy}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#245D45] px-3 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-60"
                    >
                      <Download className="h-4 w-4" />{" "}
                      {downloadBusy ? "PDF..." : hi ? "PDF" : "Download PDF"}
                    </button>
                  </div>
                </div>

                <div
                  ref={certRef}
                  className="relative overflow-hidden rounded-[28px] border-4 border-[#D7A93A] bg-white p-6 sm:p-8 shadow-sm text-center text-[#243B32] print:rounded-none print:shadow-none"
                >
                  <div className="pointer-events-none absolute inset-2 rounded-[22px] border-2 border-[#E7C65A]/70" />

                  <div className="relative flex flex-col items-center gap-2">
                    <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-[#D7A93A] bg-white p-1 shadow-sm">
                      <img src="/assets/logo.png" alt="RP Foundation" className="h-full w-full object-contain" />
                    </div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#167C5A]">
                      RP Foundation
                    </p>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#243B32]">
                      {hi ? selectedCert.titleHi : selectedCert.title}
                    </h3>
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
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-[#245D45]">
                        {hi ? "सत्यापन" : "Verify"}
                      </p>
                      <QRCode
                        value={`${verificationBase}${selectedCert.certificate_id}`}
                        size={78}
                        bgColor="#ffffff"
                        fgColor="#243B32"
                      />
                    </div>
                    <div className="min-w-0 text-right">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Certificate ID
                      </p>
                      <p className="break-all font-mono text-xs font-bold text-[#243B32]">
                        {selectedCert.certificate_id}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Issued: {new Date(selectedCert.issue_date).toLocaleDateString("en-IN")}
                      </p>
                      <div className="mt-6 ml-auto w-fit border-t border-slate-400 pt-1">
                        <p className="font-serif text-sm font-bold text-[#243B32]">Rohit Pandit</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#B45309]">
                          Founder, RP Foundation
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[9px] text-slate-400">
                    Online Test through Samahit App • RP Foundation
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
