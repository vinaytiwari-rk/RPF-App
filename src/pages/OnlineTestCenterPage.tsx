import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, GraduationCap, Flame, Scale, BookOpen, Atom,
  BrainCircuit, Monitor, Play, Clock, Award, ShieldCheck, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { QUIZ_TOPICS, QuizTopic } from "../data/quiz/quizQuestionBank";
import OnlineTestRunnerModal from "../components/quiz/OnlineTestRunnerModal";
import { useAuth } from "../context/AuthContext";
import { loadQuestionPack, toQuizTopic } from "../lib/quizQuestionBankPacks";
import { listQuestionPackTopics } from "../lib/questionBankCatalog";

type Lang = "en" | "hi";

const DAILY_PACK_ID = "current-affairs-2026-10-pilot";

const TOPIC_ICONS: Record<string, React.ElementType> = {
  Flame,
  Scale,
  BookOpen,
  Atom,
  BrainCircuit,
  Monitor,
};

export default function OnlineTestCenterPage() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [activeTopic, setActiveTopic] = useState<QuizTopic | null>(null);
  const [packTopics, setPackTopics] = useState<QuizTopic[]>([]);
  const [isLoadingPack, setIsLoadingPack] = useState(false);

  useEffect(() => {
    let mounted = true;
    void listQuestionPackTopics().then((topics) => {
      if (mounted) setPackTopics(topics);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const packTopicIds = useMemo(() => new Set(packTopics.map((topic) => topic.id)), [packTopics]);

  const handleStartTopic = async (topic: QuizTopic) => {
    const isDailyTopic = topic.id === "daily_current_affairs";
    const isRemotePack = packTopicIds.has(topic.id);
    if (!isDailyTopic && !isRemotePack) {
      if (!topic.questions.length) {
        toast.error(isHi ? "इस टेस्ट में अभी प्रश्न उपलब्ध नहीं हैं।" : "No questions are available for this test yet.");
        return;
      }
      setActiveTopic(topic);
      return;
    }

    const packId = isDailyTopic ? DAILY_PACK_ID : topic.id;
    setIsLoadingPack(true);
    try {
      const pack = await loadQuestionPack(packId);
      if (pack?.questions.length) {
        setActiveTopic(toQuizTopic(pack));
      } else if (isDailyTopic && topic.questions.length) {
        // Keep the bundled legacy set available if the remote pack has not been cached yet.
        setActiveTopic(topic);
        toast((isHi ? "ऑफलाइन बैकअप प्रश्न इस्तेमाल हो रहे हैं।" : "Using the bundled offline fallback."));
      } else {
        toast.error(isHi
          ? "यह प्रश्न-पैक अभी डाउनलोड नहीं है। इंटरनेट चालू करके एक बार टेस्ट खोलें।"
          : "This question pack is not downloaded yet. Connect to the internet and open it once.");
      }
    } finally {
      setIsLoadingPack(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/services");
    }
  };

  const legacyTopics = QUIZ_TOPICS.slice(1);
  const remoteTopics = packTopics.filter((topic) => topic.id !== DAILY_PACK_ID);
  const visibleTopics = [
    ...legacyTopics,
    ...remoteTopics.filter((topic) => !legacyTopics.some((legacy) => legacy.id === topic.id))
  ];

  return (
    <div className="min-h-screen bg-[#FFF7E8] p-3 sm:p-5 pb-32">
      <header className="rounded-3xl bg-[#F0FAF4] p-5 shadow-sm border border-emerald-100/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#245D45]">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <GraduationCap className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#245D45]">
              {isHi ? "समाहित ऑनलाइन परीक्षा व मॉक टेस्ट" : "Samahit Online Test & Assessment"}
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
          {isHi ? "ऑनलाइन टेस्ट एवं मूल्यांकन पोर्टल" : "Online Test & Mock Exam Portal"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#52685C] max-w-xl">
          {isHi
            ? "सरकारी भर्ती, सामान्य ज्ञान, तार्किक क्षमता और करेंट अफेयर्स के मॉक टेस्ट। टेस्ट पूरा करें और प्रशस्ति पत्र प्राप्त करें।"
            : "Mock exams for government recruitment, general knowledge, reasoning and current affairs."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-900">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
            {isHi ? "ऑफलाइन फ्रेंडली" : "Offline friendly"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            {isHi ? "PDF सर्टिफिकेट" : "PDF certificate"}
          </span>
          {packTopics.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
              <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
              {packTopics.length} {isHi ? "डाउनलोड करने योग्य पैक" : "question packs"}
            </span>
          )}
        </div>
      </header>

      <section className="mt-4">
        {QUIZ_TOPICS.slice(0, 1).map((daily) => (
          <div
            key={daily.id}
            onClick={() => void handleStartTopic(daily)}
            role="button"
            tabIndex={0}
            aria-disabled={isLoadingPack}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") void handleStartTopic(daily);
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-5 text-white shadow-lg transition hover:scale-[1.01] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                🔥 {isHi ? "करेंट अफेयर्स विशेष टेस्ट" : "Current Affairs Test"}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
                <Clock className="h-3 w-3" /> {daily.durationMinutes} {isHi ? "मिनट" : "mins"}
              </span>
            </div>

            <h2 className="mt-3 text-lg sm:text-xl font-black leading-snug">
              {isHi ? daily.titleHi : daily.titleEn}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-lg">
              {isHi ? daily.descHi : daily.descEn}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-3">
              <span className="text-xs font-bold text-amber-100">
                {daily.questionsCount} {isHi ? "प्रश्न" : "Questions"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-orange-950 shadow group-hover:bg-amber-50">
                <Play className="h-3.5 w-3.5 fill-current" />
                {isLoadingPack ? (isHi ? "लोड हो रहा है..." : "Loading...") : (isHi ? "टेस्ट शुरू करें" : "Start Test")}
              </span>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-6">
        <h3 className="text-base font-black text-[#243B32] mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-emerald-700" />
          {isHi ? "सभी विषयवार मॉक टेस्ट:" : "Subject-wise Mock Tests:"}
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTopics.map((topic) => {
            const IconComponent = TOPIC_ICONS[topic.iconName] || BookOpen;
            return (
              <div
                key={topic.id}
                onClick={() => void handleStartTopic(topic)}
                role="button"
                tabIndex={0}
                aria-disabled={isLoadingPack}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") void handleStartTopic(topic);
                }}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#D8E8DB] bg-white p-4 shadow-xs transition hover:border-[#245D45] hover:shadow-md cursor-pointer text-left"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#245D45] group-hover:bg-[#245D45] group-hover:text-white transition">
                      <IconComponent className="h-5 w-5" />
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      <Clock className="h-3 w-3" /> {topic.durationMinutes} min
                    </span>
                  </div>

                  <h4 className="mt-3 text-sm sm:text-base font-extrabold text-[#243B32] group-hover:text-[#245D45] transition line-clamp-1">
                    {isHi ? topic.titleHi : topic.titleEn}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {isHi ? topic.descHi : topic.descEn}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-bold text-[#245D45]">
                  <span className="text-[11px] text-slate-400">
                    {topic.questionsCount} {isHi ? "प्रश्न" : "Questions"}
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition text-emerald-800">
                    {isHi ? "टेस्ट दें" : "Take Test"}
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTopic && (
        <OnlineTestRunnerModal
          key={activeTopic.id}
          topic={activeTopic}
          onClose={() => setActiveTopic(null)}
          lang={lang}
          userName={user?.displayName || user?.name || "Samahit Student"}
        />
      )}
    </div>
  );
}
