import React, { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle2, Award, Play, Shield,
  BookOpen, Sparkles
} from "lucide-react";
import {
  TEST_PRESETS,
  TestPreset,
  generateTripleFusionTest
} from "../utils/samahitTestEngine";
import { SamahitTestAttempt } from "../data/quiz/samahitQuestionTypes";
import OnlineTestRunnerModal from "../components/quiz/OnlineTestRunnerModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

type Lang = "en" | "hi";

export default function OnlineTestCenterPage() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  // State: selected test duration preset (default: 15 mins / 50 questions)
  const [selectedPreset, setSelectedPreset] = useState<TestPreset>(TEST_PRESETS[2]);
  const [activeAttempt, setActiveAttempt] = useState<SamahitTestAttempt | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/services");
    }
  };

  // Starts the test using Triple Fusion (Samahit Core + Hugging Face Benchmarks + Grounded Questions) by default
  const handleStartTest = () => {
    try {
      const attempt = generateTripleFusionTest(
        selectedPreset.questionCount,
        selectedPreset.durationMinutes,
        [],
        { shuffleOptions: true }
      );
      setActiveAttempt(attempt);
    } catch (err: any) {
      console.error("Test start failed:", err);
      toast.error(err?.message || "Unable to start test attempt");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7E8] p-3 sm:p-5 pb-32">
      {/* Header Banner - Clean Light Theme */}
      <header className="rounded-3xl bg-[#F0FAF4] p-5 sm:p-6 shadow-sm border border-emerald-100/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#245D45]">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Shield className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#245D45]">
              {isHi ? "आर. पी. फाउंडेशन • समाहित पोर्टल" : "RP Foundation • Samahit Portal"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 border border-emerald-200/60 text-[#243B32] shadow-2xs hover:bg-emerald-50 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
        </div>

        <h1 className="mt-3 text-2xl sm:text-3xl font-black text-[#243B32]">
          {isHi ? "समाहित ऑनलाइन परीक्षा पोर्टल" : "SAMAHIT Online Test Portal"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#52685C] max-w-xl leading-relaxed">
          {isHi
            ? "गुणवत्ता-नियंत्रित बहुविकल्पीय वस्तुनिष्ठ परीक्षा। परीक्षा पूरी करने पर तुरंत आर. पी. फाउंडेशन का आधिकारिक योग्यता प्रमाणपत्र (Certificate of Achievement) प्राप्त करें।"
            : "Quality-controlled bilingual multiple choice assessment. Complete the test and receive your official RP Foundation Certificate of Achievement."}
        </p>

        {/* 5-Category Proportional Evaluation Breakdown */}
        <div className="mt-4 pt-3 border-t border-emerald-200/50">
          <p className="text-[11px] font-extrabold text-[#245D45] uppercase tracking-wider mb-2">
            {isHi ? "संतुलित 5-विषय मूल्यांकन पद्धति:" : "Balanced 5-Category Evaluation Scheme:"}
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold text-emerald-950">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {isHi ? "करेंट अफेयर्स — 25%" : "Current Affairs — 25%"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {isHi ? "सामान्य ज्ञान — 35%" : "General Knowledge — 35%"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {isHi ? "तर्कशक्ति — 20%" : "Reasoning — 20%"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              {isHi ? "गणित — 10%" : "Mathematics — 10%"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              {isHi ? "अंग्रेजी — 10%" : "English — 10%"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Test Selection Card */}
      <main className="mt-5 space-y-4">
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#243B32]">
                {isHi ? "परीक्षा अवधि व प्रश्नों की संख्या चुनें" : "Select Test Duration & Question Count"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHi
                  ? "अपनी सुविधानुसार समय सीमा चुनें और वास्तविक परीक्षा जैसा अभ्यास करें।"
                  : "Choose your preferred time duration and question count to begin."}
              </p>
            </div>
          </div>

          {/* Duration Choices Grid - Exactly 6 options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TEST_PRESETS.map((preset) => {
              const isSelected =
                selectedPreset.durationMinutes === preset.durationMinutes &&
                selectedPreset.questionCount === preset.questionCount;

              return (
                <div
                  key={`${preset.durationMinutes}_${preset.questionCount}`}
                  onClick={() => setSelectedPreset(preset)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedPreset(preset);
                  }}
                  className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all cursor-pointer border ${
                    isSelected
                      ? "border-[#245D45] bg-[#F0FAF4] shadow-md ring-2 ring-emerald-600/30 scale-[1.01]"
                      : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/60 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                        isSelected
                          ? "bg-[#245D45] text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {preset.durationMinutes} {isHi ? "मिनट" : "Minutes"}
                    </span>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-200/60 rounded-lg px-2 py-0.5">
                      {preset.badge}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span className="block text-2xl font-black text-[#243B32]">
                      {preset.questionCount}{" "}
                      <span className="text-xs font-bold text-slate-500">
                        {isHi ? "प्रश्न" : "Questions"}
                      </span>
                    </span>
                    <p className="text-xs font-semibold text-slate-600 mt-1">
                      {isHi ? preset.labelHi : preset.labelEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? "text-emerald-800" : "text-slate-400"}>
                      {isSelected
                        ? isHi ? "चयनित (Selected)" : "Selected"
                        : isHi ? "चुनने के लिए टैप करें" : "Click to select"}
                    </span>
                    <div
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-[#245D45] bg-[#245D45]"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action CTA Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold text-slate-500">
                {isHi ? "आपकी वर्तमान पसंद:" : "Current selection:"}
              </span>
              <p className="text-sm font-black text-[#243B32]">
                {selectedPreset.durationMinutes} {isHi ? "मिनट" : "Minutes"} • {selectedPreset.questionCount} {isHi ? "प्रश्न (वस्तुनिष्ठ)" : "Questions (MCQs)"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#245D45] px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg hover:bg-emerald-800 transition active:scale-98"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isHi ? "ऑनलाइन टेस्ट शुरू करें" : "Start Test"}</span>
            </button>
          </div>
        </div>

        {/* Clear Instructions Card */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100 shadow-sm space-y-3">
          <h3 className="text-sm font-black text-[#243B32] flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-700" />
            {isHi ? "महत्वपूर्ण परीक्षा निर्देश" : "Important Test Guidelines"}
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 leading-relaxed font-medium">
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                {isHi
                  ? "सभी प्रश्न हिंदी और अंग्रेजी दोनों भाषाओं में उपलब्ध हैं। आप परीक्षा के दौरान किसी भी समय भाषा बदल सकते हैं।"
                  : "All questions are bilingual in English and Hindi. You can toggle language at any moment during the assessment."}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                {isHi
                  ? "प्रत्येक प्रश्न में 4 विकल्प हैं जिनमें से केवल एक विकल्प सही है। कोई नकारात्मक अंकन नहीं है।"
                  : "Each MCQ has exactly 4 options with one unambiguous correct answer. No negative marking."}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                {isHi
                  ? "परीक्षा सबमिट होते ही तुरंत परिणाम प्रदर्शित होगा और आप RP Foundation का डिजिटल प्रशस्ति पत्र डाउनलोड कर सकेंगे।"
                  : "Upon submitting, your scorecard is displayed immediately and you can download your official RP Foundation Certificate of Achievement."}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                {isHi
                  ? "लॉगिन किए हुए अभ्यर्थियों के प्रमाणपत्र स्वतः उनकी प्रोफाइल (My Certificates) में सुरक्षित हो जाते हैं।"
                  : "Logged-in candidates have their certificates automatically saved to their profile under My Certificates for anytime access."}
              </span>
            </li>
          </ul>
        </div>
      </main>

      {/* Test Runner Modal */}
      {activeAttempt && (
        <OnlineTestRunnerModal
          attempt={activeAttempt}
          onClose={() => setActiveAttempt(null)}
          lang={lang}
          userName={user?.name || (user as any)?.full_name || "Candidate"}
        />
      )}
    </div>
  );
}
