import React, { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, GraduationCap, Flame, Scale, BookOpen, Atom,
  BrainCircuit, Monitor, Play, Clock, CheckCircle2, Award,
  Sparkles, ShieldCheck, ChevronRight, Search, Loader2,
  Landmark, Shield, Flag, Globe, Compass, TrendingUp,
  Palette, Trees, Dna, Zap, Layers, RefreshCw
} from "lucide-react";
import { QUIZ_TOPICS, QuizTopic } from "../data/quiz/quizQuestionBank";
import { GK_EXAM_SUBJECTS, CatalogSubject, CatalogTopic, TOTAL_GK_TOPICS } from "../data/quiz/quizCatalog";
import { fetchTopicQuestions } from "../services/geminiQuizService";
import OnlineTestRunnerModal from "../components/quiz/OnlineTestRunnerModal";
import { useAuth } from "../context/AuthContext";

type Lang = "en" | "hi";

const SUBJECT_ICONS: Record<string, React.ElementType> = {
  Landmark,
  Shield,
  Flag,
  Scale,
  Globe,
  Compass,
  Award,
  TrendingUp,
  Palette,
  Monitor,
  Trees,
  Dna,
  Atom,
  Zap,
  BookOpen
};

export default function OnlineTestCenterPage() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("ancient_history");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTopic, setActiveTopic] = useState<QuizTopic | null>(null);
  const [loadingTopicId, setLoadingTopicId] = useState<string | null>(null);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/services");
    }
  };

  const selectedSubject = useMemo(() => {
    return GK_EXAM_SUBJECTS.find((s) => s.id === selectedSubjectId) || GK_EXAM_SUBJECTS[0];
  }, [selectedSubjectId]);

  // Filter topics based on search query or selected subject
  const displayedTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return selectedSubject ? selectedSubject.topics : [];
    }
    // Search across all 388 topics
    const matched: { topic: CatalogTopic; subject: CatalogSubject }[] = [];
    GK_EXAM_SUBJECTS.forEach((subj) => {
      subj.topics.forEach((top) => {
        if (
          top.titleEn.toLowerCase().includes(q) ||
          top.titleHi.toLowerCase().includes(q) ||
          subj.titleEn.toLowerCase().includes(q) ||
          subj.titleHi.toLowerCase().includes(q)
        ) {
          matched.push({ topic: top, subject: subj });
        }
      });
    });
    return matched.map((m) => m.topic);
  }, [searchQuery, selectedSubject]);

  const handleStartTopicTest = async (topic: CatalogTopic, subject: CatalogSubject) => {
    // Check if topic is already in legacy hardcoded quiz bank
    const legacyTopic = QUIZ_TOPICS.find((t) => t.id === topic.id);
    if (legacyTopic && legacyTopic.questions.length > 0) {
      setActiveTopic(legacyTopic);
      return;
    }

    setLoadingTopicId(topic.id);
    try {
      const questions = await fetchTopicQuestions(topic, subject.titleEn);
      const runtimeTopic: QuizTopic = {
        id: topic.id,
        titleEn: topic.titleEn,
        titleHi: topic.titleHi,
        descEn: `Comprehensive mock test on ${topic.titleEn} (${subject.titleEn}). Standard UPSC / SSC pattern.`,
        descHi: `${subject.titleHi} के अंतर्गत ${topic.titleHi} पर आधारित मानक वस्तुनिष्ठ परीक्षा।`,
        iconName: subject.icon,
        color: subject.color,
        badge: topic.badge,
        questionsCount: questions.length,
        durationMinutes: topic.durationMinutes || 10,
        questions
      };
      setActiveTopic(runtimeTopic);
    } catch (err) {
      console.error("Failed to load topic test", err);
    } finally {
      setLoadingTopicId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7E8] p-3 sm:p-5 pb-32">
      {/* Header Banner */}
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
            ? "UPSC, State PSC, SSC, रेलवे व सरकारी भर्ती हेतु 14 मुख्य विषयों के 388+ मानक टॉपिक्स। टेस्ट पूरा करें और तुरंत डिजिटल प्रशस्ति पत्र (Merit Certificate) प्राप्त करें।"
            : "Standard mock exams for UPSC, State PSC, SSC & Govt recruitments across 14 subjects & 388+ topics. Submit test and download instant Merit Certificate."}
        </p>

        {/* Quick Highlights */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-900">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
            <Layers className="h-3.5 w-3.5 text-emerald-700" />
            {isHi ? `14 विषय • ${TOTAL_GK_TOPICS} टॉपिक्स` : `14 Subjects • ${TOTAL_GK_TOPICS} Topics`}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            {isHi ? "Gemini AI सत्यापित प्रश्न" : "AI Verified Questions"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            {isHi ? "सर्टिफिकेट डाउनलोड उपलब्ध" : "PDF Certificate Included"}
          </span>
        </div>
      </header>

      {/* Featured Daily Current Affairs Hero Card */}
      <section className="mt-4">
        {QUIZ_TOPICS.slice(0, 1).map((daily) => (
          <div
            key={daily.id}
            onClick={() => setActiveTopic(daily)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveTopic(daily);
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-5 text-white shadow-lg transition hover:scale-[1.01] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                🔥 {isHi ? "आज का विशेष लाइव टेस्ट" : "Today's Live Test"}
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
                {daily.questionsCount} {isHi ? "प्रश्नों का मानक सेट" : "questions standard set"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-black text-orange-950 shadow group-hover:bg-amber-50">
                <Play className="h-3.5 w-3.5 fill-current" />
                {isHi ? "अभी टेस्ट शुरू करें" : "Start Test Now"}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Realtime Search Bar across 388+ topics */}
      <div className="mt-5 relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isHi
                ? "388+ टॉपिक्स में खोजें (उदा. सिंधु घाटी, हड़प्पा, संसद, संविधान, कोशिका, मौर्य...)"
                : "Search across 388+ topics (e.g. Indus Valley, Parliament, Cell Biology, Mauryas...)"
            }
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-emerald-100 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 14 Master Subjects Horizontal Pill Selector */}
      {!searchQuery && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#243B32] uppercase tracking-wider">
              {isHi ? "14 मुख्य विषय (Master Subjects)" : "14 Master Subjects"}
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              {selectedSubject?.totalTopics} {isHi ? "टॉपिक्स" : "topics"}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {GK_EXAM_SUBJECTS.map((subj) => {
              const IconComp = SUBJECT_ICONS[subj.icon] || BookOpen;
              const isSelected = subj.id === selectedSubjectId;

              return (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? "bg-[#245D45] text-white shadow-md scale-[1.02]"
                      : "bg-white text-slate-700 border border-emerald-100/80 hover:bg-emerald-50/50"
                  }`}
                >
                  <IconComp className={`h-3.5 w-3.5 ${isSelected ? "text-amber-300" : "text-emerald-700"}`} />
                  <span>{isHi ? subj.titleHi : subj.titleEn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {subj.totalTopics}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Topics Grid */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-black text-[#243B32] flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-700" />
            {searchQuery
              ? isHi
                ? `खोज परिणाम (${displayedTopics.length} टॉपिक्स):`
                : `Search Results (${displayedTopics.length} topics):`
              : isHi
              ? `${selectedSubject.titleHi} (${displayedTopics.length} टॉपिक्स):`
              : `${selectedSubject.titleEn} (${displayedTopics.length} topics):`}
          </h3>
        </div>

        {displayedTopics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 text-xs">
            {isHi ? "कोई टॉपिक नहीं मिला। कृपया दूसरा शब्द खोजें।" : "No topics found matching your query."}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayedTopics.map((topic) => {
              const currentSubj =
                GK_EXAM_SUBJECTS.find((s) => s.id === topic.subjectId) || selectedSubject;
              const IconComponent = SUBJECT_ICONS[currentSubj.icon] || BookOpen;
              const isLoading = loadingTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  onClick={() => !isLoading && handleStartTopicTest(topic, currentSubj)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !isLoading) {
                      handleStartTopicTest(topic, currentSubj);
                    }
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border border-[#D8E8DB] bg-white p-4 shadow-xs transition hover:border-[#245D45] hover:shadow-md cursor-pointer text-left ${
                    isLoading ? "opacity-75 pointer-events-none" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#245D45] group-hover:bg-[#245D45] group-hover:text-white transition">
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          {topic.badge || "UPSC / SSC"}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> {topic.durationMinutes || 10} min
                        </span>
                      </div>
                    </div>

                    <h4 className="mt-3 text-sm font-extrabold text-[#243B32] group-hover:text-[#245D45] transition leading-snug">
                      {isHi ? topic.titleHi : topic.titleEn}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                      {currentSubj.titleHi} • {topic.questionsCount} {isHi ? "मानक प्रश्न" : "standard MCQs"}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-bold text-[#245D45]">
                    <span className="text-[11px] text-slate-400">
                      {topic.questionsCount} {isHi ? "ऑब्जेक्टिव प्रश्न" : "MCQs"}
                    </span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition text-emerald-800">
                      {isLoading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
                          <span className="text-emerald-700">{isHi ? "लोड हो रहा है..." : "Generating..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{isHi ? "टेस्ट दें" : "Take Test"}</span>
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Test Runner Modal */}
      {activeTopic && (
        <OnlineTestRunnerModal
          topic={activeTopic}
          onClose={() => setActiveTopic(null)}
          lang={lang}
          userName={user?.displayName || user?.name || "Samahit Student"}
        />
      )}
    </div>
  );
}

