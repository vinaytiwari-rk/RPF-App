import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X, Clock, CheckCircle2, XCircle, Award, RotateCcw,
  Download, Share2, ChevronRight, ChevronLeft, ShieldCheck,
  AlertCircle, Sparkles, BookOpen, Globe, BarChart3, LogIn
} from "lucide-react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { QuizTopic, QuizQuestion } from "../../data/quiz/quizQuestionBank";
import {
  SamahitTestAttempt,
  TestAttemptQuestion,
  TestResultEvaluation,
  QuestionCategory
} from "../../data/quiz/samahitQuestionTypes";
import { evaluateSamahitTest } from "../../utils/samahitTestEngine";
import { CATEGORY_LABELS } from "../../data/quiz/samahitQuestionBank";
import { saveBlobToDownloads } from "../../utils/nativeFileDownload";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

interface Props {
  attempt?: SamahitTestAttempt;
  topic?: QuizTopic;
  onClose: () => void;
  lang?: "en" | "hi";
  userName?: string;
}

export default function OnlineTestRunnerModal({
  attempt,
  topic,
  onClose,
  lang: initialLang = "hi",
  userName: propUserName = "Candidate"
}: Props) {
  const { user, token } = useAuth();
  const [currentLang, setCurrentLang] = useState<"en" | "hi">(initialLang);
  const isHi = currentLang === "hi";

  const resolvedUserName =
    user?.name || (user as any)?.full_name || propUserName || "Candidate";

  // Attempt questions
  const attemptQuestions = useMemo(() => {
    if (attempt) {
      return attempt.questions;
    }
    if (topic) {
      // Backward compatibility for legacy topic
      return topic.questions.map((q, idx) => ({
        id: q.id || `leg_${idx}`,
        category: "general_knowledge" as QuestionCategory,
        subcategory: "general",
        questionEn: q.questionEn,
        questionHi: q.questionHi,
        optionsEn: q.optionsEn as [string, string, string, string],
        optionsHi: q.optionsHi as [string, string, string, string],
        correctOptionId: ["opt_a", "opt_b", "opt_c", "opt_d"][q.correctIndex] as any,
        correctIndex: q.correctIndex as any,
        displayOptionsEn: q.optionsEn as [string, string, string, string],
        displayOptionsHi: q.optionsHi as [string, string, string, string],
        displayCorrectIndex: q.correctIndex,
        optionOrder: [0, 1, 2, 3],
        explanationEn: q.explanationEn,
        explanationHi: q.explanationHi,
        difficulty: "medium" as const,
        source: { name: "RP Foundation", url: "https://therpfoundation.org", verificationDate: "2026-03-10", status: "verified" as const },
        createdAt: new Date().toISOString(),
        fingerprint: String(idx),
        isActive: true
      }));
    }
    return [];
  }, [attempt, topic]);

  const totalQuestions = attemptQuestions.length;
  const durationMinutes = attempt ? attempt.durationMinutes : (topic ? topic.durationMinutes : 10);

  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [evaluation, setEvaluation] = useState<TestResultEvaluation | null>(null);
  const [savedCertificateId, setSavedCertificateId] = useState<string | null>(null);
  const [savingCertificate, setSavingCertificate] = useState(false);
  const [showQuestionPalette, setShowQuestionPalette] = useState(false);

  const saveAttemptedRef = useRef(false);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Timer Countdown
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQ: TestAttemptQuestion | undefined = attemptQuestions[currentIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted || !currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex
    }));
  };

  const handleSubmitTest = () => {
    if (isSubmitted) return;

    if (attempt) {
      const evalRes = evaluateSamahitTest(attempt, userAnswers);
      setEvaluation(evalRes);
    } else {
      // Legacy fallback evaluation
      let correct = 0;
      attemptQuestions.forEach((q) => {
        if (userAnswers[q.id] === q.displayCorrectIndex) {
          correct++;
        }
      });
      const pct = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
      setEvaluation({
        attemptId: `leg_${Date.now()}`,
        durationMinutes,
        totalQuestions,
        attemptedCount: Object.keys(userAnswers).length,
        correctCount: correct,
        wrongCount: Object.keys(userAnswers).length - correct,
        scorePercentage: pct,
        grade: pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : pct >= 40 ? "D" : "E",
        categoryBreakdown: {
          current_affairs: { total: 0, correct: 0, percentage: 0 },
          general_knowledge: { total: totalQuestions, correct, percentage: pct },
          mathematics: { total: 0, correct: 0, percentage: 0 },
          english: { total: 0, correct: 0, percentage: 0 },
          reasoning: { total: 0, correct: 0, percentage: 0 }
        },
        passed: pct >= 40
      });
    }

    setIsSubmitted(true);
    toast.success(isHi ? "टेस्ट सफलतापूर्वक सबमिट हुआ!" : "Test submitted successfully!");
  };

  // Auto-save certificate to database when submitted and user is logged in
  useEffect(() => {
    if (!isSubmitted || !evaluation || saveAttemptedRef.current) return;
    saveAttemptedRef.current = true;

    const certId = `RPF-TEST-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setSavedCertificateId(certId);

    if (user?.id && token) {
      setSavingCertificate(true);
      fetch("/api/test-certificates/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          certificate_id: certId,
          candidate_name: resolvedUserName,
          duration_minutes: durationMinutes,
          total_questions: evaluation.totalQuestions,
          correct_count: evaluation.correctCount,
          score_percentage: evaluation.scorePercentage,
          grade: evaluation.grade,
          category_breakdown: evaluation.categoryBreakdown
        })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            toast.success(
              isHi
                ? "प्रमाणपत्र आपकी प्रोफाइल (My Certificates) में सुरक्षित हो गया!"
                : "Certificate saved permanently to your profile!"
            );
          }
        })
        .catch((err) => {
          console.warn("Could not save certificate to server:", err);
        })
        .finally(() => {
          setSavingCertificate(false);
        });
    }
  }, [isSubmitted, evaluation, user?.id, token, resolvedUserName, durationMinutes, isHi]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate Official PDF Certificate complying with Section 10
  const downloadOfficialCertificate = async () => {
    if (!evaluation) return;
    try {
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const width = 297;
      const height = 210;
      const certId = savedCertificateId || `RPF-TEST-${Date.now().toString().slice(-8).toUpperCase()}`;

      // Outer Dual Borders
      doc.setLineWidth(3.5);
      doc.setDrawColor(36, 93, 69); // #245D45 Emerald
      doc.rect(10, 10, width - 20, height - 20);

      doc.setLineWidth(1.2);
      doc.setDrawColor(217, 119, 6); // Amber / Gold
      doc.rect(14, 14, width - 28, height - 28);

      // Embedded Official Logo
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = "anonymous";
        logoImg.src = "/assets/logo.png";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        if (logoImg.width) {
          doc.addImage(logoImg, "PNG", width / 2 - 14, 20, 28, 22);
        }
      } catch {
        // Continue if logo image fetch has any CORS issue
      }

      // 1. Organization Name: exactly "RP Foundation" (NEVER "RP Foundation Samahit")
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(36, 93, 69); // Emerald
      doc.text("RP Foundation", width / 2, 49, { align: "center" });

      // 2. Certificate Title: "CERTIFICATE OF ACHIEVEMENT"
      doc.setFontSize(16);
      doc.setTextColor(217, 119, 6); // Amber
      doc.text("CERTIFICATE OF ACHIEVEMENT", width / 2, 59, { align: "center" });

      // Decorative divider
      doc.setLineWidth(0.6);
      doc.setDrawColor(200, 160, 80);
      doc.line(width / 2 - 50, 63, width / 2 + 50, 63);

      // 3. Award attribution line
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text("This certificate is awarded to", width / 2, 75, { align: "center" });

      // 4. Candidate Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(20, 33, 61);
      doc.text(resolvedUserName.toUpperCase(), width / 2, 89, { align: "center" });

      // 5. Completion text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(80, 80, 80);
      doc.text(
        "for completing the online test and achieving the following result.",
        width / 2,
        101,
        { align: "center" }
      );

      // 6. Score & Grade Card Box
      doc.setFillColor(240, 250, 244);
      doc.roundedRect(width / 2 - 60, 109, 120, 28, 4, 4, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(36, 93, 69);
      doc.text(
        `Grade: ${evaluation.grade}     |     Percentage: ${evaluation.scorePercentage}%`,
        width / 2,
        122,
        { align: "center" }
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Correct: ${evaluation.correctCount} / ${evaluation.totalQuestions} Questions  •  Duration: ${evaluation.durationMinutes} Minutes`,
        width / 2,
        130,
        { align: "center" }
      );

      // 7. App attribution line: ONLY place "Samahit" appears
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(36, 93, 69);
      doc.text("Online Test through Samahit App", width / 2, 149, { align: "center" });

      // 8. Footer Metadata: Certificate ID and Date
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 90, 90);
      doc.text(`Certificate ID: ${certId}`, 24, 182);

      const testDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.text(`Date: ${testDate}`, width - 24, 182, { align: "right" });

      // Authorized Signature line
      doc.setLineWidth(0.4);
      doc.setDrawColor(180, 180, 180);
      doc.line(width / 2 - 35, 178, width / 2 + 35, 178);
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text("Authorized Examination Authority", width / 2, 183, { align: "center" });
      doc.text("RP Foundation Knowledge Wing", width / 2, 187, { align: "center" });

      const filename = `RP_Foundation_Certificate_${certId}.pdf`;
      const blob = doc.output("blob");
      await saveBlobToDownloads(blob, filename, "application/pdf");
      toast.success(
        isHi
          ? "प्रशस्ति पत्र Downloads में सेव हो गया!"
          : "Certificate saved to your Downloads!"
      );
    } catch (error) {
      console.error("Certificate download failed:", error);
      toast.error(
        isHi
          ? "सर्टिफिकेट सेव नहीं हो सका। कृपया पुनः प्रयास करें।"
          : "Could not save certificate. Please try again."
      );
    }
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-[94vh] sm:h-[90vh] w-full max-w-3xl flex-col rounded-t-[28px] sm:rounded-3xl bg-[#FFFBF2] shadow-2xl border border-emerald-100 overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 bg-[#F0FAF4] px-4 py-3 sm:px-6 sm:py-3.5">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-800 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                RP Foundation
              </span>
              <span className="text-[11px] font-bold text-emerald-900 hidden sm:inline">
                {isHi ? "समाहित ऑनलाइन परीक्षा" : "SAMAHIT Online Test"}
              </span>
              {!isSubmitted && (
                <span
                  className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                    timeLeft < 180 ? "bg-red-100 text-red-700 animate-pulse" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
            <h2 className="mt-1 truncate text-sm sm:text-base font-black text-[#243B32]">
              {isHi
                ? `${durationMinutes} मिनट • ${totalQuestions} प्रश्न (द्विभाषी परीक्षा)`
                : `${durationMinutes} Min • ${totalQuestions} Questions (Bilingual Assessment)`}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setCurrentLang((prev) => (prev === "hi" ? "en" : "hi"))}
              className="flex items-center gap-1 rounded-xl bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs hover:bg-emerald-50"
              title="Toggle Language"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isHi ? "EN" : "हिंदी"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if (!isSubmitted) setShowExitConfirm(true);
                else onClose();
              }}
              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-2xs border border-slate-200 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        {!isSubmitted ? (
          currentQ ? (
            <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4 sm:p-6 pb-20">
              {/* Top Progress & Category Indicator */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>
                      {isHi ? "प्रश्न संख्या" : "Question"}: <b>{currentIndex + 1}</b> / {totalQuestions}
                    </span>
                    <span className="rounded-md bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-black uppercase">
                      {isHi
                        ? CATEGORY_LABELS[currentQ.category]?.hi || currentQ.category
                        : CATEGORY_LABELS[currentQ.category]?.en || currentQ.category}
                    </span>
                    {currentQ.source?.name && (
                      <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                        <Globe className="h-2.5 w-2.5 text-amber-600" />
                        {currentQ.source.name}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuestionPalette((p) => !p)}
                    className="text-[11px] text-emerald-800 underline font-bold"
                  >
                    {isHi ? `प्रश्नावली (${answeredCount}/${totalQuestions})` : `Grid (${answeredCount}/${totalQuestions})`}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>

                {/* Collapsible Question Palette Grid */}
                {showQuestionPalette && (
                  <div className="mt-3 rounded-2xl bg-white p-3 border border-emerald-100 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 mb-2">
                      {isHi ? "सीधे किसी भी प्रश्न पर जाएं:" : "Jump to question:"}
                    </p>
                    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-h-36 overflow-y-auto p-1">
                      {attemptQuestions.map((q, idx) => {
                        const isAns = userAnswers[q.id] !== undefined;
                        const isCurr = idx === currentIndex;
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => {
                              setCurrentIndex(idx);
                              setShowQuestionPalette(false);
                            }}
                            className={`h-7 rounded-lg text-[11px] font-black transition ${
                              isCurr
                                ? "bg-amber-500 text-white ring-2 ring-amber-300"
                                : isAns
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Statement Card */}
                <div className="mt-4 rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-emerald-100/90">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm sm:text-base font-black text-[#243B32] leading-relaxed">
                      Q{currentIndex + 1}. {isHi ? currentQ.questionHi : currentQ.questionEn}
                    </p>
                  </div>
                </div>

                {/* Options List */}
                <div className="mt-4 space-y-2.5">
                  {(isHi ? currentQ.displayOptionsHi : currentQ.displayOptionsEn).map((optText, optIdx) => {
                    const isSelected = userAnswers[currentQ.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(optIdx)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left text-xs sm:text-sm font-semibold transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs scale-[1.01]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black border ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-100 text-slate-500 border-slate-300"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {isHi ? "पिछला प्रश्न" : "Previous"}
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="flex items-center gap-1 rounded-xl bg-[#245D45] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800"
                  >
                    {isHi ? "अगला प्रश्न" : "Next"}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitTest}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 animate-pulse"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isHi ? "टेस्ट सबमिट करें" : "Submit Test"}
                  </button>
                )}
              </div>
            </div>
          ) : null
        ) : (
          /* RESULT SCREEN */
          evaluation && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-5 text-[#243B32]">
              {/* Scorecard Banner */}
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-emerald-100 text-emerald-800">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="mt-2 text-xl font-black text-[#243B32]">
                  {evaluation.scorePercentage >= 70
                    ? isHi ? "शानदार प्रदर्शन! बधाई!" : "Outstanding Performance! Congratulations!"
                    : isHi ? "ऑनलाइन मूल्यांकन पूर्ण हुआ!" : "Online Assessment Completed!"}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  RP Foundation • {isHi ? "समाहित ऑनलाइन परीक्षा परिणाम" : "SAMAHIT Online Test Scorecard"}
                </p>

                {/* Score Stats Grid */}
                <div className="mt-4 grid grid-cols-3 gap-3 max-w-md mx-auto">
                  <div className="rounded-2xl bg-white p-3 shadow-2xs border border-emerald-100">
                    <span className="block text-2xl font-black text-emerald-800">
                      {evaluation.grade}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {isHi ? "ग्रेड" : "Grade"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-2xs border border-emerald-100">
                    <span className="block text-2xl font-black text-[#243B32]">
                      {evaluation.scorePercentage}%
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {isHi ? "अंक प्रतिशत" : "Percentage"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-white p-3 shadow-2xs border border-emerald-100">
                    <span className="block text-2xl font-black text-emerald-700">
                      {evaluation.correctCount}/{evaluation.totalQuestions}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {isHi ? "सही उत्तर" : "Correct"}
                    </span>
                  </div>
                </div>

                {/* Certificate Download CTA */}
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={downloadOfficialCertificate}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#245D45] px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
                  >
                    <Download className="h-4 w-4" />
                    {isHi
                      ? "RP Foundation प्रशस्ति पत्र (PDF) डाउनलोड करें"
                      : "Download Official Certificate (PDF)"}
                  </button>
                </div>

                {/* Profile Save Status or Login Prompt */}
                <div className="mt-3 text-xs">
                  {user?.id ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      {isHi
                        ? "यह प्रमाणपत्र आपके प्रोफाइल में हमेशा के लिए सुरक्षित हो गया है।"
                        : "Certificate is permanently linked to your profile."}
                    </span>
                  ) : (
                    <div className="rounded-xl bg-amber-50 p-2 border border-amber-200 text-amber-900 flex items-center justify-center gap-2">
                      <LogIn className="h-3.5 w-3.5 text-amber-700" />
                      <span>
                        {isHi
                          ? "प्रमाणपत्र को अपनी प्रोफाइल में सुरक्षित रखने के लिए कृपया लॉगिन करें।"
                          : "Log in to permanently save certificates to your profile."}
                      </span>
                      <Link
                        to="/login"
                        className="underline font-black text-emerald-800"
                        onClick={onClose}
                      >
                        {isHi ? "लॉगिन करें" : "Login"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* 5-Category Breakdown */}
              <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-2xs">
                <h4 className="text-xs sm:text-sm font-black text-[#243B32] mb-3 flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-emerald-700" />
                  {isHi ? "विषयवार प्रदर्शन विश्लेषण (5 श्रेणियां):" : "Category Performance Breakdown:"}
                </h4>
                <div className="space-y-3">
                  {(Object.keys(evaluation.categoryBreakdown) as QuestionCategory[]).map((cat) => {
                    const data = evaluation.categoryBreakdown[cat];
                    if (!data || data.total === 0) return null;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>
                            {isHi ? CATEGORY_LABELS[cat]?.hi : CATEGORY_LABELS[cat]?.en} ({data.correct}/{data.total})
                          </span>
                          <span className="font-extrabold text-emerald-800">{data.percentage}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all"
                            style={{ width: `${data.percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detailed Question Review with Bilingual Explanation */}
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#243B32] mb-3 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-emerald-700" />
                  {isHi ? "विस्तृत उत्तर कुंजी एवं व्याख्या:" : "Answer Key & Explanations:"}
                </h4>
                <div className="space-y-3">
                  {attemptQuestions.map((q, idx) => {
                    const chosenIdx = userAnswers[q.id];
                    const isCorrect = chosenIdx === q.displayCorrectIndex;
                    const isSkipped = chosenIdx === undefined;

                    return (
                      <div
                        key={q.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-[#243B32] leading-snug">
                            {idx + 1}. {isHi ? q.questionHi : q.questionEn}
                          </span>
                          {isCorrect ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                              <CheckCircle2 className="h-3 w-3" /> {isHi ? "सही" : "Correct"}
                            </span>
                          ) : isSkipped ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 shrink-0">
                              {isHi ? "छोड़ा गया" : "Skipped"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 shrink-0">
                              <XCircle className="h-3 w-3" /> {isHi ? "गलत" : "Incorrect"}
                            </span>
                          )}
                        </div>

                        <div className="rounded-xl bg-slate-50 p-2.5 space-y-1">
                          <p className="font-semibold text-slate-700">
                            {isHi ? "सही उत्तर:" : "Correct Answer:"}{" "}
                            <b className="text-emerald-800">
                              {isHi
                                ? q.displayOptionsHi[q.displayCorrectIndex]
                                : q.displayOptionsEn[q.displayCorrectIndex]}
                            </b>
                          </p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            💡 <b>{isHi ? "व्याख्या:" : "Explanation:"}</b>{" "}
                            {isHi ? q.explanationHi : q.explanationEn}
                          </p>
                          {q.source?.name && (
                            <div className="pt-1 text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                              <Globe className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="font-semibold">{isHi ? "प्रमाणित स्रोत:" : "Verified Source:"}</span>
                              {q.source.url ? (
                                <a
                                  href={q.source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-900 font-bold underline inline-flex items-center gap-0.5"
                                >
                                  {q.source.name}
                                </a>
                              ) : (
                                <span className="font-bold text-slate-700">{q.source.name}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )
        )}

        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-xl border border-slate-200">
              <AlertCircle className="mx-auto h-9 w-9 text-amber-600" />
              <h3 className="mt-2 text-base font-black text-slate-800">
                {isHi ? "क्या आप परीक्षा छोड़ना चाहते हैं?" : "Exit Assessment?"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {isHi
                  ? "यदि आप अभी बाहर निकलते हैं तो आपकी परीक्षा प्रगति सुरक्षित नहीं होगी।"
                  : "If you exit now, your current answers will be discarded."}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700"
                >
                  {isHi ? "परीक्षा जारी रखें" : "Resume Test"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow"
                >
                  {isHi ? "हाँ, बाहर निकलें" : "Yes, Exit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
