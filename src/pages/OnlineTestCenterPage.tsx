import React, { useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Clock, GraduationCap, Play, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { QUIZ_TOPICS, QuizQuestion, QuizTopic } from "../data/quiz/quizQuestionBank";
import OnlineTestRunnerModal from "../components/quiz/OnlineTestRunnerModal";
import { useAuth } from "../context/AuthContext";

type Lang = "en" | "hi";
type Area = "current_affairs" | "maths" | "english" | "reasoning" | "gk";
type Candidate = { question: QuizQuestion; topic: QuizTopic; area: Area };

const TESTS = [
  { minutes: 5, count: 10 },
  { minutes: 10, count: 25 },
  { minutes: 15, count: 50 },
  { minutes: 30, count: 100 },
  { minutes: 45, count: 150 },
  { minutes: 60, count: 300 }
] as const;

const WEIGHTS: Record<Area, number> = {
  current_affairs: 25,
  maths: 10,
  english: 10,
  reasoning: 20,
  gk: 35
};

function classify(topic: QuizTopic, question: QuizQuestion): Area {
  const text = `${topic.id} ${topic.titleEn} ${question.id} ${question.questionEn}`.toLowerCase();
  if (/current|daily|affair|news|budget|scheme|recent|latest/.test(text)) return "current_affairs";
  if (/math|arithmetic|algebra|number.system|percentage|profit|ratio|geometry|mensuration/.test(text)) return "maths";
  if (/english|grammar|vocabulary|synonym|antonym|tense|preposition|comprehension/.test(text)) return "english";
  if (/reasoning|logical|series|analogy|coding|decoding|direction|blood.relation|syllogism|puzzle/.test(text)) return "reasoning";
  return "gk";
}

function quotas(total: number): Record<Area, number> {
  const areas = Object.keys(WEIGHTS) as Area[];
  const raw = areas.map((area) => ({ area, raw: total * WEIGHTS[area] / 100 }));
  const result = Object.fromEntries(raw.map(({ area, raw: value }) => [area, Math.floor(value)])) as Record<Area, number>;
  let left = total - Object.values(result).reduce((sum, n) => sum + n, 0);
  raw.sort((a, b) => (b.raw - Math.floor(b.raw)) - (a.raw - Math.floor(a.raw)));
  for (let i = 0; i < left; i += 1) result[raw[i].area] += 1;
  return result;
}

function pickQuestions(total: number): { questions: QuizQuestion[]; missing: string[] } {
  const pools: Record<Area, Candidate[]> = {
    current_affairs: [], maths: [], english: [], reasoning: [], gk: []
  };
  QUIZ_TOPICS.forEach((topic) => topic.questions.forEach((question) => {
    pools[classify(topic, question)].push({ question, topic, area: classify(topic, question) });
  }));
  const target = quotas(total);
  const chosen: QuizQuestion[] = [];
  const missing: string[] = [];
  (Object.keys(target) as Area[]).forEach((area) => {
    const pool = [...pools[area]].sort(() => Math.random() - 0.5);
    const need = target[area];
    if (pool.length < need) missing.push(`${area.replace("_", " ")}: need ${need}, available ${pool.length}`);
    chosen.push(...pool.slice(0, need).map((item) => item.question));
  });
  return { questions: chosen.sort(() => Math.random() - 0.5), missing };
}

export default function OnlineTestCenterPage() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isHi = lang === "hi";
  const [selected, setSelected] = useState<number>(15);
  const [activeTopic, setActiveTopic] = useState<QuizTopic | null>(null);
  const test = TESTS.find((item) => item.minutes === selected) ?? TESTS[2];
  const distribution = useMemo(() => quotas(test.count), [test.count]);

  const startTest = () => {
    const result = pickQuestions(test.count);
    if (result.missing.length || result.questions.length !== test.count) {
      toast.error(isHi
        ? `इस टेस्ट के लिए प्रश्न बैंक में पर्याप्त विषय-वार प्रश्न नहीं हैं। कमी: ${result.missing.join("; ") || `need ${test.count}, found ${result.questions.length}`}`
        : `The question bank does not yet have enough questions by subject for this test. Shortage: ${result.missing.join("; ") || `need ${test.count}, found ${result.questions.length}`}`,
        { duration: 7000 });
      return;
    }
    setActiveTopic({
      id: `samahit-test-${test.minutes}m-${Date.now()}`,
      titleEn: `SAMAHIT Online Test — ${test.count} Questions`,
      titleHi: `SAMAHIT ऑनलाइन टेस्ट — ${test.count} प्रश्न`,
      descEn: "Mixed-subject online assessment",
      descHi: "मिश्रित विषयों की ऑनलाइन परीक्षा",
      iconName: "GraduationCap",
      color: "from-emerald-700 to-emerald-900",
      questionsCount: result.questions.length,
      durationMinutes: test.minutes,
      questions: result.questions
    });
  };

  return (
    <main className="min-h-screen bg-[#FFF9EC] p-4 pb-28 sm:p-6">
      <header className="mx-auto max-w-2xl rounded-3xl border border-[#DDE8DF] bg-[#F1F8F3] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#245D45]">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white"><GraduationCap className="h-6 w-6" /></span>
            <div>
              <div className="text-lg font-black tracking-tight">SAMAHIT</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#64806E]">Online Test</div>
            </div>
          </div>
          <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDE8DF] bg-white text-[#245D45]"><ArrowLeft className="h-5 w-5" /></button>
        </div>
        <h1 className="mt-6 text-2xl font-black text-[#243B32] sm:text-3xl">{isHi ? "अपना टेस्ट चुनें" : "Choose Your Test"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#52685C]">{isHi ? "समय चुनें। प्रश्न निर्धारित विषय-अनुपात के अनुसार मिलेंगे।" : "Choose a duration. Questions follow the defined subject distribution."}</p>
      </header>

      <section className="mx-auto mt-5 max-w-2xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TESTS.map((item) => {
            const active = selected === item.minutes;
            return <button key={item.minutes} type="button" onClick={() => setSelected(item.minutes)} aria-pressed={active} className={`rounded-2xl border p-4 text-left transition ${active ? "border-[#26785C] bg-[#DDF3E8] shadow-sm" : "border-[#E5E3DA] bg-white hover:border-[#9EBEAA]"}`}>
              <div className="flex items-center justify-between"><Clock className={`h-5 w-5 ${active ? "text-[#26785C]" : "text-[#789080]"}`} />{active && <span className="text-xs font-black text-[#26785C]">✓</span>}</div>
              <div className="mt-3 text-2xl font-black text-[#174C3C]">{item.minutes} {isHi ? "मिनट" : "min"}</div>
              <div className="mt-1 text-sm font-semibold text-[#527466]">{item.count} {isHi ? "प्रश्न" : "Questions"}</div>
            </button>;
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-[#E5E3DA] bg-white p-4">
          <h2 className="text-sm font-extrabold text-[#243B32]">{isHi ? "टेस्ट विवरण" : "Test Summary"}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#F7FAF7] p-3"><div className="text-xs text-[#64806E]">{isHi ? "प्रश्न" : "Questions"}</div><div className="mt-1 text-xl font-black text-[#174C3C]">{test.count}</div></div>
            <div className="rounded-xl bg-[#F7FAF7] p-3"><div className="text-xs text-[#64806E]">{isHi ? "समय" : "Time limit"}</div><div className="mt-1 text-xl font-black text-[#174C3C]">{test.minutes} {isHi ? "मिनट" : "min"}</div></div>
          </div>
          <div className="mt-3 space-y-2 text-xs text-[#52685C]">
            {([
              ["current_affairs", isHi ? "करेंट अफेयर्स" : "Current Affairs"],
              ["maths", isHi ? "गणित" : "Maths"],
              ["english", isHi ? "अंग्रेज़ी" : "English"],
              ["reasoning", isHi ? "रीज़निंग" : "Reasoning"],
              ["gk", isHi ? "सामान्य ज्ञान" : "General Knowledge"]
            ] as const).map(([key, label]) => <div key={key} className="flex items-center justify-between"><span>{label}</span><span className="font-bold">{WEIGHTS[key]}% · {distribution[key]}</span></div>)}
          </div>
        </div>

        <button type="button" onClick={startTest} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#26785C] px-5 py-4 text-base font-black text-white shadow-sm transition hover:bg-[#1E624A]"><Play className="h-5 w-5 fill-current" />{isHi ? "टेस्ट शुरू करें" : "Start Test"}</button>
        <div className="mt-3 flex items-start gap-2 px-1 text-xs leading-relaxed text-[#64806E]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><span>{isHi ? "प्रश्न उपलब्धता जाँची जाएगी; पर्याप्त प्रश्न न होने पर टेस्ट शुरू नहीं होगा।" : "Question availability is checked before starting; the test will not start if a subject pool is short."}</span></div>
      </section>
      {activeTopic && <OnlineTestRunnerModal topic={activeTopic} onClose={() => setActiveTopic(null)} lang={lang} userName={user?.displayName || user?.name || "Candidate"} />}
    </main>
  );
}
