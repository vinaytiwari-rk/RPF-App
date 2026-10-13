import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle2, Award, Play, Shield,
  BookOpen, Sparkles, Layers, BarChart2, Globe, Cpu,
  Library, Search, Loader2, ExternalLink
} from "lucide-react";
import {
  TEST_PRESETS,
  TestPreset,
  generateSamahitTest,
  generateHuggingFaceTest,
  generateGroundedAITest,
  generateTripleFusionTest
} from "../utils/samahitTestEngine";
import {
  generateGroundedAIQuestions,
  fetchWikipediaPreview
} from "../services/geminiQuizService";
import { SamahitTestAttempt } from "../data/quiz/samahitQuestionTypes";
import OnlineTestRunnerModal from "../components/quiz/OnlineTestRunnerModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

type Lang = "en" | "hi";
type TestEngineMode = "fusion" | "ai_wiki" | "huggingface" | "samahit";

interface PopularTopic {
  id: string;
  labelHi: string;
  labelEn: string;
  query: string;
  badge: string;
}

const POPULAR_TOPICS: PopularTopic[] = [
  { id: "constitution", labelHi: "भारतीय संविधान", labelEn: "Indian Constitution", query: "Constitution of India", badge: "Polity" },
  { id: "indus_valley", labelHi: "सिंधु घाटी सभ्यता", labelEn: "Indus Valley Civilisation", query: "Indus Valley Civilisation", badge: "Ancient History" },
  { id: "freedom_struggle", labelHi: "स्वतंत्रता संग्राम", labelEn: "Indian Independence Movement", query: "Indian independence movement", badge: "Modern History" },
  { id: "science_tech", labelHi: "सामान्य विज्ञान व तकनीक", labelEn: "General Science & Tech", query: "Science and technology in India", badge: "Science" },
  { id: "environment", labelHi: "पर्यावरण व जैव विविधता", labelEn: "Environment & Ecology", query: "Environment of India", badge: "Ecology" },
  { id: "economy", labelHi: "भारतीय अर्थव्यवस्था व RBI", labelEn: "Indian Economy & RBI", query: "Reserve Bank of India", badge: "Economy" },
  { id: "space_isro", labelHi: "अंतरिक्ष अन्वेषण व ISRO", labelEn: "Space Exploration & ISRO", query: "Indian Space Research Organisation", badge: "Space Tech" }
];

export default function OnlineTestCenterPage() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  // Engine selection: Default to Triple Fusion (Trveni Sangam)
  const [testMode, setTestMode] = useState<TestEngineMode>("fusion");

  // Topic for AI & Wikipedia
  const [selectedTopicQuery, setSelectedTopicQuery] = useState<string>("Constitution of India");
  const [customTopic, setCustomTopic] = useState<string>("");
  const [wikiPreview, setWikiPreview] = useState<{ title: string; extract: string; url: string } | null>(null);
  const [isFetchingWiki, setIsFetchingWiki] = useState<boolean>(false);

  // Test duration preset (default: 15 mins / 50 questions)
  const [selectedPreset, setSelectedPreset] = useState<TestPreset>(TEST_PRESETS[2]);
  const [activeAttempt, setActiveAttempt] = useState<SamahitTestAttempt | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<string>("");

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/services");
    }
  };

  // Fetch Wikipedia preview when topic changes
  useEffect(() => {
    if (testMode === "ai_wiki" || testMode === "fusion") {
      const activeQuery = customTopic.trim() || selectedTopicQuery;
      let isMounted = true;
      setIsFetchingWiki(true);
      fetchWikipediaPreview(activeQuery)
        .then((res) => {
          if (isMounted) setWikiPreview(res);
        })
        .finally(() => {
          if (isMounted) setIsFetchingWiki(false);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [testMode, selectedTopicQuery, customTopic]);

  const handleStartTest = async () => {
    try {
      const effectiveTopic = customTopic.trim() || selectedTopicQuery;

      // 1. Samahit Institutional Core
      if (testMode === "samahit") {
        const attempt = generateSamahitTest(
          selectedPreset.questionCount,
          selectedPreset.durationMinutes,
          { shuffleOptions: true }
        );
        setActiveAttempt(attempt);
        return;
      }

      // 2. Hugging Face Open Benchmarks
      if (testMode === "huggingface") {
        const attempt = generateHuggingFaceTest(
          selectedPreset.questionCount,
          selectedPreset.durationMinutes,
          { shuffleOptions: true }
        );
        setActiveAttempt(attempt);
        return;
      }

      // 3. Gemini AI + Wikipedia Grounded
      if (testMode === "ai_wiki") {
        setIsGenerating(true);
        setGenerationStatus(
          isHi
            ? `Wikipedia से '${effectiveTopic}' के सत्यापित तथ्य प्राप्त किए जा रहे हैं...`
            : `Retrieving verified Wikipedia facts for '${effectiveTopic}'...`
        );

        setTimeout(() => {
          setGenerationStatus(
            isHi
              ? "Gemini 3.8 Flash AI मॉडल द्वारा द्विभाषी UPSC/PSC मानक प्रश्न तैयार किए जा रहे हैं..."
              : "Generating bilingual UPSC/PSC multiple choice questions with Gemini 3.8 Flash AI..."
          );
        }, 1200);

        const countToFetch = Math.min(selectedPreset.questionCount, 25);
        const questions = await generateGroundedAIQuestions(effectiveTopic, "General Studies", countToFetch);

        setGenerationStatus(
          isHi ? "परीक्षण संरचित किया जा रहा है..." : "Finalizing assessment attempt..."
        );

        const attempt = generateGroundedAITest(questions, selectedPreset.durationMinutes, {
          shuffleOptions: true
        });
        setActiveAttempt(attempt);
        return;
      }

      // 4. Triple Fusion (त्रिवेणी संगम): Samahit Core + Wikipedia/Gemini AI + Hugging Face
      if (testMode === "fusion") {
        setIsGenerating(true);
        setGenerationStatus(
          isHi
            ? "त्रिवेणी संगम: Samahit Core, Wikipedia तथ्य एवं Hugging Face डेटासेट्स का समन्वय हो रहा है..."
            : "Triple Fusion: Synthesizing Samahit Core, Wikipedia Grounded AI, and Hugging Face benchmarks..."
        );

        const aiCount = Math.max(3, Math.min(10, Math.floor(selectedPreset.questionCount * 0.3)));
        const aiQuestions = await generateGroundedAIQuestions(effectiveTopic, "General Studies", aiCount);

        const attempt = generateTripleFusionTest(
          selectedPreset.questionCount,
          selectedPreset.durationMinutes,
          aiQuestions,
          { shuffleOptions: true }
        );
        setActiveAttempt(attempt);
        return;
      }
    } catch (err: any) {
      console.error("Test start failed:", err);
      toast.error(err?.message || "Unable to start test attempt");
    } finally {
      setIsGenerating(false);
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
          {isHi ? "समाहित ऑनलाइन परीक्षा केंद्र" : "SAMAHIT Online Examination Center"}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#52685C] max-w-2xl leading-relaxed">
          {isHi
            ? "Wikipedia के सत्यापित तथ्य + Google Gemini AI की प्रश्न निर्माण क्षमता + Hugging Face के राष्ट्रीय बेंचमार्क का त्रिवेणी संगम। परीक्षा पूर्ण करने पर आधिकारिक डिजिटल योग्यता प्रमाणपत्र प्राप्त करें।"
            : "Triple fusion of verified Wikipedia facts + Gemini AI question generation + Hugging Face open datasets. Complete your assessment to receive an official digital Certificate of Achievement."}
        </p>

        {/* 4 Engine Badges Summary */}
        <div className="mt-4 pt-3 border-t border-emerald-200/50 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs text-[#245D45]">
            <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" />
            {isHi ? "त्रिवेणी संगम (Triple Fusion)" : "Triple Fusion Engine"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs text-slate-700">
            <Globe className="h-3 w-3 text-blue-500" />
            {isHi ? "Wikipedia सत्यापित तथ्य" : "Wikipedia Fact-Grounded"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs text-slate-700">
            <Cpu className="h-3 w-3 text-emerald-600" />
            {isHi ? "Gemini 3.8 Flash AI" : "Gemini 3.8 Flash AI"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 border border-emerald-200 shadow-2xs text-slate-700">
            <Library className="h-3 w-3 text-purple-600" />
            {isHi ? "Hugging Face बेंचमार्क्स" : "Hugging Face Datasets"}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mt-5 space-y-4">
        {/* ENGINE SELECTOR TABS */}
        <section className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#243B32] flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-700" />
                {isHi ? "परीक्षा इंजन व प्रश्न स्रोत चुनें" : "Select Examination Engine & Source"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHi
                  ? "अपनी तैयारी के अनुसार परीक्षा का स्वरूप चुनें — AI, Wikipedia, Hugging Face या संस्थागत पाठ्यक्रम।"
                  : "Choose your preferred question engine: Triple Fusion, AI-Wikipedia, Hugging Face, or Institutional Core."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Mode 1: Triple Fusion */}
            <div
              onClick={() => setTestMode("fusion")}
              role="button"
              tabIndex={0}
              className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                testMode === "fusion"
                  ? "border-[#245D45] bg-[#F0FAF4] shadow-md ring-2 ring-emerald-600/30 scale-[1.01]"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-black uppercase rounded-full bg-amber-500 text-white px-2 py-0.5">
                    {isHi ? "सर्वश्रेष्ठ (Recommended)" : "Recommended"}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-black text-[#243B32]">
                  {isHi ? "त्रिवेणी संगम (Triple Fusion)" : "Triple Fusion Test"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  {isHi
                    ? "Samahit Core + Wikipedia/Gemini AI + Hugging Face तीनों का संतुलित मास्टर टेस्ट।"
                    : "Comprehensive synthesis blending Core Syllabus, Wikipedia AI, and Hugging Face benchmarks."}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-800">
                <span>{isHi ? "3-इन-1 हाइब्रिड" : "3-in-1 Master"}</span>
                <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${testMode === "fusion" ? "border-emerald-700 bg-emerald-700" : "border-slate-300"}`}>
                  {testMode === "fusion" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
            </div>

            {/* Mode 2: Gemini AI + Wikipedia */}
            <div
              onClick={() => setTestMode("ai_wiki")}
              role="button"
              tabIndex={0}
              className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                testMode === "ai_wiki"
                  ? "border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/30 scale-[1.01]"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                    <Globe className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-black uppercase rounded-full bg-blue-600 text-white px-2 py-0.5">
                    {isHi ? "लाइव तथ्य" : "Live Grounded"}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-black text-[#243B32]">
                  {isHi ? "Gemini AI + Wikipedia" : "Gemini AI & Wikipedia"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  {isHi
                    ? "Wikipedia के सत्यापित तथ्यों पर आधारित Gemini AI द्वारा रचित ताज़ा द्विभाषी MCQs।"
                    : "Live UPSC-grade bilingual questions generated from verified Wikipedia facts."}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-800">
                <span>{isHi ? "विषय अनुसार" : "Topic-Grounded"}</span>
                <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${testMode === "ai_wiki" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                  {testMode === "ai_wiki" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
            </div>

            {/* Mode 3: Hugging Face Datasets */}
            <div
              onClick={() => setTestMode("huggingface")}
              role="button"
              tabIndex={0}
              className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                testMode === "huggingface"
                  ? "border-purple-600 bg-purple-50/70 shadow-md ring-2 ring-purple-500/30 scale-[1.01]"
                  : "border-slate-200 bg-white hover:border-purple-300 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">
                    <Library className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-black uppercase rounded-full bg-purple-600 text-white px-2 py-0.5">
                    {isHi ? "ओपन डेटा" : "Open Datasets"}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-black text-[#243B32]">
                  {isHi ? "Hugging Face बेंचमार्क" : "Hugging Face Bank"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  {isHi
                    ? "SciQ, Belebele (हिंदी) और AI2-ARC राष्ट्रीय बहुविकल्पीय बेंचमार्क प्रश्नकोष।"
                    : "Standardized open-source benchmarks covering Science, Reasoning, and Hindi reading."}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-800">
                <span>{isHi ? "प्रमाणित MCQs" : "Verified Benchmarks"}</span>
                <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${testMode === "huggingface" ? "border-purple-600 bg-purple-600" : "border-slate-300"}`}>
                  {testMode === "huggingface" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
            </div>

            {/* Mode 4: Samahit Core */}
            <div
              onClick={() => setTestMode("samahit")}
              role="button"
              tabIndex={0}
              className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                testMode === "samahit"
                  ? "border-emerald-700 bg-emerald-50/80 shadow-md ring-2 ring-emerald-600/30 scale-[1.01]"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50 shadow-2xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <Shield className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] font-black uppercase rounded-full bg-emerald-700 text-white px-2 py-0.5">
                    {isHi ? "आधिकारिक" : "Institutional"}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-black text-[#243B32]">
                  {isHi ? "समाहित कोर पाठ्यक्रम" : "Samahit Core Bank"}
                </h3>
                <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                  {isHi
                    ? "330+ क्यूरेटेड 5-श्रेणी (GK, करेंट अफेयर्स, तर्कशक्ति, गणित, अंग्रेजी) संतुलित परीक्षा।"
                    : "Institutional standard syllabus with calibrated 5-category proportional evaluation."}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-900">
                <span>{isHi ? "330+ प्रश्न" : "330+ Verified"}</span>
                <span className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${testMode === "samahit" ? "border-emerald-700 bg-emerald-700" : "border-slate-300"}`}>
                  {testMode === "samahit" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* TOPIC PICKER (Active for Triple Fusion & AI-Wikipedia) */}
        {(testMode === "fusion" || testMode === "ai_wiki") && (
          <section className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#243B32] flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  {isHi ? "विषय चुनें या अपना टॉपिक लिखें (Wikipedia Grounding)" : "Choose Topic or Type Custom (Wikipedia Grounding)"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isHi
                    ? "चयनित विषय के लिए Wikipedia से वास्तविक तथ्य लिए जाएंगे और Gemini AI से परीक्षा-स्तरीय प्रश्न बनेंगे।"
                    : "Real facts will be gathered from Wikipedia for your chosen topic, and Gemini AI will construct the MCQs."}
                </p>
              </div>
            </div>

            {/* Popular Topics Pills */}
            <div className="flex flex-wrap gap-2">
              {POPULAR_TOPICS.map((topic) => {
                const isSelected = selectedTopicQuery === topic.query && !customTopic;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => {
                      setSelectedTopicQuery(topic.query);
                      setCustomTopic("");
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#245D45] text-white shadow-xs scale-102"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                    }`}
                  >
                    <span>{isHi ? topic.labelHi : topic.labelEn}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-white text-slate-500"}`}>
                      {topic.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Topic Input */}
            <div className="relative">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 pl-3 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={
                    isHi
                      ? "या कोई भी अन्य विषय लिखें... (उदा. चंद्रयान 3, नीति आयोग, भारत की नदियां, मौर्य साम्राज्य)"
                      : "Or type any topic... (e.g. Chandrayaan-3, NITI Aayog, Indian Rivers, Mauryan Empire)"
                  }
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                />
                {customTopic && (
                  <button
                    type="button"
                    onClick={() => setCustomTopic("")}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 px-2"
                  >
                    {isHi ? "हटाएं" : "Clear"}
                  </button>
                )}
              </div>
            </div>

            {/* Live Wikipedia Fact Preview Card */}
            {wikiPreview && (
              <div className="rounded-2xl bg-blue-50/80 border border-blue-200/80 p-3.5 text-xs space-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-900 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-blue-700" />
                    {isHi ? "Wikipedia सत्यापित संदर्भ:" : "Verified Wikipedia Reference:"} {wikiPreview.title}
                  </span>
                  <a
                    href={wikiPreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-700 hover:text-blue-900 underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>{isHi ? "लेख देखें" : "View Article"}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
                {wikiPreview.extract && (
                  <p className="text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {wikiPreview.extract}
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* HUGGING FACE DATASETS HIGHLIGHT (When Hugging Face selected) */}
        {testMode === "huggingface" && (
          <section className="rounded-3xl bg-white p-5 sm:p-6 border border-purple-100 shadow-sm space-y-3">
            <h3 className="text-sm sm:text-base font-black text-purple-950 flex items-center gap-2">
              <Library className="h-4 w-4 text-purple-700" />
              {isHi ? "शामिल Hugging Face ओपन मल्टीपल-चॉइस बेंचमार्क:" : "Included Hugging Face Open Datasets:"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-purple-50/60 p-3.5 border border-purple-200/70">
                <span className="text-[10px] font-black uppercase text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  allenai/sciq
                </span>
                <h4 className="mt-2 text-xs font-black text-slate-800">
                  {isHi ? "सामान्य विज्ञान (Science)" : "General Science"}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isHi ? "भौतिक, रसायन और जीव विज्ञान के 4-विकल्पीय वस्तुनिष्ठ प्रश्न।" : "Physics, Chemistry, and Biology objective questions with authentic explanations."}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50/60 p-3.5 border border-purple-200/70">
                <span className="text-[10px] font-black uppercase text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  facebook/belebele
                </span>
                <h4 className="mt-2 text-xs font-black text-slate-800">
                  {isHi ? "हिंदी बोधगम्यता व तर्कशक्ति" : "Hindi Comprehension"}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isHi ? "हिंदी माध्यम के उच्च-स्तरीय कॉम्प्रिहेंशन व विश्लेषणात्मक प्रश्न।" : "High-level Hindi reading comprehension and critical reasoning MCQs."}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-50/60 p-3.5 border border-purple-200/70">
                <span className="text-[10px] font-black uppercase text-purple-700 bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  allenai/ai2_arc
                </span>
                <h4 className="mt-2 text-xs font-black text-slate-800">
                  {isHi ? "वैज्ञानिक तर्कशक्ति (Logic)" : "Scientific Reasoning"}
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isHi ? "तार्किक चिंतन और समस्या समाधान पर आधारित बहुविकल्पीय प्रश्न।" : "Standardized reasoning challenge problems for competitive aptitude."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TEST DURATION & QUESTION COUNT GRID */}
        <section className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100 shadow-sm">
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
                <span className="ml-2 text-xs font-extrabold text-emerald-800 bg-emerald-100/70 rounded-md px-2 py-0.5">
                  {testMode === "fusion"
                    ? isHi ? "त्रिवेणी संगम" : "Triple Fusion"
                    : testMode === "ai_wiki"
                    ? isHi ? "AI + Wikipedia" : "AI + Wiki"
                    : testMode === "huggingface"
                    ? "Hugging Face"
                    : isHi ? "समाहित कोर" : "Samahit Core"}
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleStartTest}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#245D45] px-8 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-lg hover:bg-emerald-800 transition active:scale-98 disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{isHi ? "प्रश्न तैयार हो रहे हैं..." : "Generating Test..."}</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>{isHi ? "ऑनलाइन टेस्ट शुरू करें" : "Start Test"}</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Clear Instructions Card */}
        <section className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100 shadow-sm space-y-3">
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
                  ? "प्रत्येक प्रश्न के साथ उसका प्रामाणिक स्रोत (Wikipedia / Hugging Face / Samahit Core) टैग किया गया है जिसे आप परीक्षा उपरांत सत्यापित कर सकते हैं।"
                  : "Every question is stamped with its verified source (Wikipedia / Hugging Face / Samahit Core) which you can review post-test."}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">•</span>
              <span>
                {isHi
                  ? "परीक्षा सबमिट होते ही तुरंत परिणाम प्रदर्शित होगा और आप RP Foundation का डिजिटल प्रशस्ति पत्र (Certificate of Achievement) डाउनलोड कर सकेंगे।"
                  : "Upon submitting, your scorecard is displayed immediately and you can download your official RP Foundation Certificate of Achievement."}
              </span>
            </li>
          </ul>
        </section>
      </main>

      {/* Loading Modal during AI/Wikipedia Generation */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-2xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl border border-emerald-100 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0FAF4] text-emerald-800">
              <Loader2 className="h-7 w-7 animate-spin text-[#245D45]" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#243B32]">
                {isHi ? "परीक्षण तैयार किया जा रहा है" : "Preparing Your Assessment"}
              </h3>
              <p className="mt-2 text-xs font-semibold text-slate-600 leading-relaxed">
                {generationStatus || (isHi ? "कृपया प्रतीक्षा करें..." : "Please wait...")}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="inline-flex items-center gap-1">🌐 Wikipedia</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">🤖 Gemini AI</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">🤗 Hugging Face</span>
            </div>
          </div>
        </div>
      )}

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
