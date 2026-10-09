import React, { useState, useEffect } from "react";
import {
  X, Clock, CheckCircle2, XCircle, Award, RotateCcw,
  Download, Share2, ChevronRight, ChevronLeft, ShieldCheck,
  AlertCircle, Sparkles, BookOpen
} from "lucide-react";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { QuizTopic, QuizQuestion } from "../../data/quiz/quizQuestionBank";
import { createRandomizedAttempt } from "../../utils/quizAttempt";
import { saveBlobToDownloads } from "../../utils/nativeFileDownload";

interface Props {
  topic: QuizTopic;
  onClose: () => void;
  lang?: "en" | "hi";
  userName?: string;
}

export default function OnlineTestRunnerModal({
  topic,
  onClose,
  lang = "hi",
  userName = "Student"
}: Props) {
  const isHi = lang === "hi";

  // Each attempt uses a fresh random subset and randomized option order.
  const [attemptQuestions] = useState(() => createRandomizedAttempt(topic.questions, 7));

  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(topic.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const currentQ: QuizQuestion = attemptQuestions[currentIndex];
  const totalQuestions = attemptQuestions.length;

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    toast.success(isHi ? "टेस्ट सफलतापूर्वक सबमिट हुआ!" : "Test submitted successfully!");
  };

  // Score Calculation
  const correctCount = Object.entries(userAnswers).filter(
    ([qIdx, ansIdx]) => attemptQuestions[Number(qIdx)].correctIndex === Number(ansIdx)
  ).length;

  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Time format mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Download Certificate PDF
  const downloadCertificate = async () => {
    try {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const width = 297;
    const height = 210;

    // Elegant Border
    doc.setLineWidth(3);
    doc.setDrawColor(36, 93, 69); // Emerald
    doc.rect(10, 10, width - 20, height - 20);

    doc.setLineWidth(1);
    doc.setDrawColor(217, 119, 6); // Amber
    doc.rect(14, 14, width - 28, height - 28);

    // Header Emblem
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(36, 93, 69);
    doc.text("RP FOUNDATION SAMAHIT", width / 2, 38, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(217, 119, 6);
    doc.text("CERTIFICATE OF MERIT & ASSESSMENT", width / 2, 48, { align: "center" });

    // Decorative line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(70, 53, width - 70, 53);

    // Body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text("This is officially awarded to", width / 2, 68, { align: "center" });

    // Candidate Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(20, 33, 61);
    doc.text(userName.toUpperCase() || "CANDIDATE", width / 2, 82, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `for outstanding performance in the Online Assessment of:`,
      width / 2,
      96,
      { align: "center" }
    );

    // Subject Topic
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(36, 93, 69);
    doc.text(`"${topic.titleEn}"`, width / 2, 108, { align: "center" });

    // Score Badge Box
    doc.setFillColor(240, 250, 244);
    doc.roundedRect(width / 2 - 50, 118, 100, 28, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(36, 93, 69);
    doc.text(`Score: ${correctCount} / ${totalQuestions} (${percentage}%)`, width / 2, 130, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      percentage >= 70 ? "Grade: Excellent / First Division" : "Grade: Qualified / Assessment Completed",
      width / 2,
      138,
      { align: "center" }
    );

    // Footer Dates & Signatures
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date of Examination: ${new Date().toLocaleDateString("en-GB")}`, 35, 175);
    doc.text(`Certificate ID: RPF-TST-${Date.now().toString().slice(-6)}`, 35, 182);

    doc.line(width - 95, 172, width - 35, 172);
    doc.text("Authorized Examiner", width - 65, 178, { align: "center" });
    doc.text("RP Foundation Knowledge Wing", width - 65, 184, { align: "center" });

    const filename = `RPF_Certificate_${topic.id}_${percentage}pct.pdf`;
    await saveBlobToDownloads(doc.output("blob"), filename, "application/pdf");
    toast.success(isHi ? "सर्टिफिकेट Downloads/SAMAHIT में सेव हो गया!" : "Certificate saved to Downloads/SAMAHIT!");
    } catch (error) {
      console.error("Mock exam certificate download failed", error);
      toast.error(isHi ? "सर्टिफिकेट सेव नहीं हो सका। कृपया फिर प्रयास करें।" : "Could not save certificate. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex h-[92vh] sm:h-[88vh] w-full max-w-2xl flex-col rounded-t-[28px] sm:rounded-3xl bg-[#FFFBF2] shadow-2xl border border-emerald-100 overflow-hidden"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-emerald-900/10 bg-[#F0FAF4] px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-700/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                {topic.badge || (isHi ? "मॉक टेस्ट" : "Mock Test")}
              </span>
              {!isSubmitted && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                  <Clock className="h-3 w-3" />
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
            <h2 className="mt-1 truncate text-base sm:text-lg font-black text-[#243B32]">
              {isHi ? topic.titleHi : topic.titleEn}
            </h2>
          </div>

          <button
            onClick={() => {
              if (!isSubmitted) setShowExitConfirm(true);
              else onClose();
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-xs border border-slate-200 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL CONTENT: TEST RUNNING OR RESULT */}
        {!isSubmitted ? (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4 sm:p-6 pb-20">
            {/* Progress Bar & Question Counter */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span>
                  {isHi ? "प्रश्न संख्या" : "Question"} <b>{currentIndex + 1}</b> / {totalQuestions}
                </span>
                <span>
                  {isHi ? "हल किए:" : "Answered:"} <b>{Object.keys(userAnswers).length}</b>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Question Statement */}
              <div className="mt-5 rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-emerald-100/80">
                <p className="text-sm sm:text-base font-black text-[#243B32] leading-relaxed">
                  Q{currentIndex + 1}. {isHi ? currentQ.questionHi : currentQ.questionEn}
                </p>
              </div>

              {/* Options List */}
              <div className="mt-4 space-y-2.5">
                {(isHi ? currentQ.optionsHi : currentQ.optionsEn).map((opt, optIdx) => {
                  const isSelected = userAnswers[currentIndex] === optIdx;
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
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {isHi ? "पिछला" : "Previous"}
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="flex items-center gap-1 rounded-xl bg-[#245D45] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800"
                >
                  {isHi ? "अगला" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700 animate-pulse"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isHi ? "टेस्ट पूरा करें व सबमिट करें" : "Submit Test"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* RESULT SCREEN */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 space-y-5 text-[#243B32]">
            {/* Scorecard Hero */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-emerald-100 text-emerald-700">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="mt-2 text-lg font-black text-[#243B32]">
                {percentage >= 70
                  ? isHi ? "शानदार प्रदर्शन! बधाई!" : "Excellent Performance!"
                  : isHi ? "टेस्ट पूर्ण हुआ!" : "Assessment Completed!"}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {isHi ? "आपका स्कोर व परिणाम विवरण:" : "Your test scorecard:"}
              </p>

              {/* Big Numbers */}
              <div className="mt-4 flex justify-center gap-6">
                <div className="rounded-2xl bg-white px-4 py-2.5 shadow-2xs border border-emerald-100">
                  <span className="block text-2xl font-black text-emerald-800">
                    {correctCount} / {totalQuestions}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">{isHi ? "सही उत्तर" : "Correct"}</span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-2.5 shadow-2xs border border-emerald-100">
                  <span className="block text-2xl font-black text-[#243B32]">{percentage}%</span>
                  <span className="text-[11px] font-bold text-slate-500">{isHi ? "अंक प्रतिशत" : "Percentage"}</span>
                </div>
              </div>

              {/* Certificate Download Button */}
              <button
                type="button"
                onClick={downloadCertificate}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#245D45] px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md hover:bg-emerald-800 transition"
              >
                <Download className="h-4 w-4" />
                {isHi ? "प्रशस्ति पत्र (Certificate PDF) डाउनलोड करें" : "Download Certificate PDF"}
              </button>
            </div>

            {/* Answer Key & Explanations */}
            <div>
              <h4 className="text-sm font-black text-[#243B32] mb-3 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-700" />
                {isHi ? "सभी प्रश्नों के सही उत्तर व व्याख्या:" : "Answer Key & Explanations:"}
              </h4>
              <div className="space-y-3">
                {attemptQuestions.map((q, idx) => {
                  const userChoice = userAnswers[idx];
                  const isCorrect = userChoice === q.correctIndex;
                  const isSkipped = userChoice === undefined;

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
                            <CheckCircle2 className="h-3 w-3" /> सही
                          </span>
                        ) : isSkipped ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 shrink-0">
                            छोड़ा गया
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 shrink-0">
                            <XCircle className="h-3 w-3" /> गलत
                          </span>
                        )}
                      </div>

                      <div className="rounded-xl bg-slate-50 p-2.5 space-y-1">
                        <p className="font-semibold text-slate-700">
                          {isHi ? "सही उत्तर:" : "Correct Answer:"}{" "}
                          <b className="text-emerald-800">
                            {isHi ? q.optionsHi[q.correctIndex] : q.optionsEn[q.correctIndex]}
                          </b>
                        </p>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          💡 <b>{isHi ? "व्याख्या:" : "Explanation:"}</b>{" "}
                          {isHi ? q.explanationHi : q.explanationEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Exit Confirmation Dialog */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-xl border border-slate-200">
              <AlertCircle className="mx-auto h-9 w-9 text-amber-600" />
              <h3 className="mt-2 text-base font-black text-slate-800">
                {isHi ? "क्या आप टेस्ट छोड़ना चाहते हैं?" : "Exit Test?"}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {isHi
                  ? "यदि आप अभी बाहर निकलते हैं तो आपकी प्रगति सुरक्षित नहीं होगी।"
                  : "If you exit now, your current progress will be lost."}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700"
                >
                  {isHi ? "टेस्ट जारी रखें" : "Keep Going"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow"
                >
                  {isHi ? "बाहर निकलें" : "Yes, Exit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
