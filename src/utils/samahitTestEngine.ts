import {
  SamahitQuestion,
  QuestionCategory,
  OptionId,
  SamahitTestAttempt,
  TestAttemptQuestion,
  TestResultEvaluation
} from "../data/quiz/samahitQuestionTypes";
import {
  SAMAHIT_QUESTION_BANK,
  HUGGINGFACE_QUESTIONS,
  WIKIPEDIA_AI_QUESTIONS,
  CATEGORY_PERCENTAGES,
  getQuestionsByCategory,
  getQuestionCountByCategory
} from "../data/quiz/samahitQuestionBank";

export interface TestPreset {
  durationMinutes: number;
  questionCount: number;
  labelEn: string;
  labelHi: string;
  badge?: string;
}

export const TEST_PRESETS: TestPreset[] = [
  { durationMinutes: 5, questionCount: 10, labelEn: "5 Min • 10 Questions", labelHi: "5 मिनट • 10 प्रश्न", badge: "Express" },
  { durationMinutes: 10, questionCount: 25, labelEn: "10 Min • 25 Questions", labelHi: "10 मिनट • 25 प्रश्न", badge: "Popular" },
  { durationMinutes: 15, questionCount: 50, labelEn: "15 Min • 50 Questions", labelHi: "15 मिनट • 50 प्रश्न", badge: "Recommended" },
  { durationMinutes: 30, questionCount: 100, labelEn: "30 Min • 100 Questions", labelHi: "30 मिनट • 100 प्रश्न", badge: "Challenger" },
  { durationMinutes: 45, questionCount: 150, labelEn: "45 Min • 150 Questions", labelHi: "45 मिनट • 150 प्रश्न", badge: "Advanced" },
  { durationMinutes: 60, questionCount: 300, labelEn: "60 Min • 300 Questions", labelHi: "60 मिनट • 300 प्रश्न", badge: "Grand Marathon" }
];

const CATEGORY_ORDER: QuestionCategory[] = [
  "general_knowledge",
  "current_affairs",
  "reasoning",
  "mathematics",
  "english"
];

/**
 * Calculates deterministic category quotas using the Largest Remainder Method (Hare-Niemeyer).
 * Ensures category counts always sum exactly to totalQuestions and are proportional to weights:
 * - Current Affairs: 25%
 * - Mathematics: 10%
 * - English: 10%
 * - Reasoning: 20%
 * - General Knowledge: 35%
 */
export function calculateCategoryQuotas(totalQuestions: number): Record<QuestionCategory, number> {
  const quotas: Partial<Record<QuestionCategory, number>> = {};
  const remainders: { category: QuestionCategory; remainder: number; weight: number }[] = [];

  let allocatedSum = 0;

  for (const cat of CATEGORY_ORDER) {
    const weight = CATEGORY_PERCENTAGES[cat] / 100;
    const exact = totalQuestions * weight;
    const integerPart = Math.floor(exact);
    const rem = exact - integerPart;

    quotas[cat] = integerPart;
    allocatedSum += integerPart;
    remainders.push({ category: cat, remainder: rem, weight });
  }

  const surplus = totalQuestions - allocatedSum;

  if (surplus > 0) {
    // Sort descending by remainder; break ties by highest category weight
    remainders.sort((a, b) => {
      if (Math.abs(b.remainder - a.remainder) > 0.0001) {
        return b.remainder - a.remainder;
      }
      return b.weight - a.weight;
    });

    for (let i = 0; i < surplus; i++) {
      const cat = remainders[i].category;
      quotas[cat] = (quotas[cat] || 0) + 1;
    }
  }

  return quotas as Record<QuestionCategory, number>;
}

/**
 * Shuffles an array in place with Fisher-Yates algorithm.
 */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface GenerateTestOptions {
  shuffleOptions?: boolean;
  attemptIdPrefix?: string;
}

/**
 * Validates question availability against required quotas.
 */
export function validateQuotaAvailability(quotas: Record<QuestionCategory, number>): {
  valid: boolean;
  errors: string[];
} {
  const counts = getQuestionCountByCategory();
  const errors: string[] = [];

  for (const cat of CATEGORY_ORDER) {
    const needed = quotas[cat] || 0;
    const available = counts[cat] || 0;
    if (available < needed) {
      errors.push(
        `Insufficient questions for category '${cat}': requested ${needed}, but only ${available} available.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generates an immutable, verified test attempt respecting the 5-category distribution.
 * Fails with a clear error if the question bank is insufficient.
 */
export function generateSamahitTest(
  questionCount: number,
  durationMinutes: number,
  options: GenerateTestOptions = {}
): SamahitTestAttempt {
  const quotas = calculateCategoryQuotas(questionCount);
  const check = validateQuotaAvailability(quotas);

  if (!check.valid) {
    throw new Error(`Cannot start test: ${check.errors.join(" ")}`);
  }

  const selectedQuestions: TestAttemptQuestion[] = [];
  const answerKey: Record<string, { correctOptionId: OptionId; correctIndex: number }> = {};

  for (const cat of CATEGORY_ORDER) {
    const needed = quotas[cat];
    const pool = getQuestionsByCategory(cat);
    const shuffledPool = shuffleArray(pool);
    const chosen = shuffledPool.slice(0, needed);

    for (const q of chosen) {
      // Option order mapping
      let order = [0, 1, 2, 3];
      if (options.shuffleOptions) {
        order = shuffleArray(order);
      }

      const displayOptionsEn: [string, string, string, string] = [
        q.optionsEn[order[0]],
        q.optionsEn[order[1]],
        q.optionsEn[order[2]],
        q.optionsEn[order[3]]
      ];

      const displayOptionsHi: [string, string, string, string] = [
        q.optionsHi[order[0]],
        q.optionsHi[order[1]],
        q.optionsHi[order[2]],
        q.optionsHi[order[3]]
      ];

      const displayCorrectIndex = order.indexOf(q.correctIndex);

      selectedQuestions.push({
        ...q,
        displayOptionsEn,
        displayOptionsHi,
        displayCorrectIndex,
        optionOrder: order
      });

      answerKey[q.id] = {
        correctOptionId: q.correctOptionId,
        correctIndex: displayCorrectIndex
      };
    }
  }

  // Shuffle the final list across categories so the exam questions are interleaved
  const interleavedQuestions = shuffleArray(selectedQuestions);

  const attemptId = `${options.attemptIdPrefix || "st"}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    attemptId,
    durationMinutes,
    totalQuestions: questionCount,
    categoryQuotas: quotas,
    questions: interleavedQuestions,
    answerKey,
    startedAt: new Date().toISOString()
  };
}

/**
 * Transforms raw SamahitQuestion array into a structured SamahitTestAttempt.
 */
function createAttemptFromQuestions(
  questions: SamahitQuestion[],
  durationMinutes: number,
  prefix: string,
  options: GenerateTestOptions = {}
): SamahitTestAttempt {
  const selectedQuestions: TestAttemptQuestion[] = [];
  const answerKey: Record<string, { correctOptionId: OptionId; correctIndex: number }> = {};
  const quotas: Record<QuestionCategory, number> = {
    general_knowledge: 0,
    current_affairs: 0,
    reasoning: 0,
    mathematics: 0,
    english: 0
  };

  for (const q of questions) {
    quotas[q.category] = (quotas[q.category] || 0) + 1;

    let order = [0, 1, 2, 3];
    if (options.shuffleOptions) {
      order = shuffleArray(order);
    }

    const displayOptionsEn: [string, string, string, string] = [
      q.optionsEn[order[0]] || "",
      q.optionsEn[order[1]] || "",
      q.optionsEn[order[2]] || "",
      q.optionsEn[order[3]] || ""
    ];

    const displayOptionsHi: [string, string, string, string] = [
      q.optionsHi[order[0]] || q.optionsEn[order[0]] || "",
      q.optionsHi[order[1]] || q.optionsEn[order[1]] || "",
      q.optionsHi[order[2]] || q.optionsEn[order[2]] || "",
      q.optionsHi[order[3]] || q.optionsEn[order[3]] || ""
    ];

    const displayCorrectIndex = order.indexOf(q.correctIndex);

    selectedQuestions.push({
      ...q,
      displayOptionsEn,
      displayOptionsHi,
      displayCorrectIndex,
      optionOrder: order
    });

    answerKey[q.id] = {
      correctOptionId: q.correctOptionId,
      correctIndex: displayCorrectIndex
    };
  }

  const attemptId = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    attemptId,
    durationMinutes,
    totalQuestions: selectedQuestions.length,
    categoryQuotas: quotas,
    questions: selectedQuestions,
    answerKey,
    startedAt: new Date().toISOString()
  };
}

/**
 * Generates an assessment using Hugging Face's open multiple-choice benchmark datasets (SciQ, Belebele, AI2-ARC).
 */
export function generateHuggingFaceTest(
  questionCount: number,
  durationMinutes: number,
  options: GenerateTestOptions = {}
): SamahitTestAttempt {
  const pool = shuffleArray(HUGGINGFACE_QUESTIONS);
  const chosen = pool.slice(0, Math.min(questionCount, pool.length));
  return createAttemptFromQuestions(chosen, durationMinutes, "hf", options);
}

/**
 * Generates an assessment using Gemini AI questions grounded in Wikipedia facts.
 */
export function generateGroundedAITest(
  aiQuestions: SamahitQuestion[],
  durationMinutes: number,
  options: GenerateTestOptions = {}
): SamahitTestAttempt {
  return createAttemptFromQuestions(aiQuestions, durationMinutes, "ai_wiki", options);
}

/**
 * Triple Fusion (त्रिवेणी संगम): Blends Samahit Institutional Core + Gemini/Wikipedia AI + Hugging Face Benchmarks into one comprehensive exam.
 */
export function generateTripleFusionTest(
  questionCount: number,
  durationMinutes: number,
  aiQuestions: SamahitQuestion[] = [],
  options: GenerateTestOptions = {}
): SamahitTestAttempt {
  // Triple Fusion: Blends Samahit Core, Hugging Face benchmarks, and Wikipedia Grounded + Gemini AI questions
  const effectiveAiPool = aiQuestions.length > 0 ? aiQuestions : WIKIPEDIA_AI_QUESTIONS;

  const countAI = Math.min(effectiveAiPool.length, Math.max(1, Math.floor(questionCount * 0.3)));
  const remaining = questionCount - countAI;
  const countHF = Math.min(HUGGINGFACE_QUESTIONS.length, Math.max(1, Math.floor(remaining * 0.4)));
  const countSamahit = questionCount - countAI - countHF;

  const samahitPool = shuffleArray(SAMAHIT_QUESTION_BANK).slice(0, countSamahit);
  const hfPool = shuffleArray(HUGGINGFACE_QUESTIONS).slice(0, countHF);
  const aiPool = shuffleArray(effectiveAiPool).slice(0, countAI);

  const combined = shuffleArray([...samahitPool, ...hfPool, ...aiPool]);
  return createAttemptFromQuestions(combined, durationMinutes, "fusion", options);
}

/**
 * Calculates grade based on score percentage according to standard academic scale.
 */
export function calculateGrade(percentage: number): "A+" | "A" | "B+" | "B" | "C" | "D" | "E" {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "E";
}

/**
 * Evaluates a completed test attempt against its saved answer key.
 */
export function evaluateSamahitTest(
  attempt: SamahitTestAttempt,
  userAnswers: Record<string, number> // questionId -> chosen displayIndex
): TestResultEvaluation {
  let correctCount = 0;
  let wrongCount = 0;
  let attemptedCount = 0;

  const categoryBreakdown: Record<
    QuestionCategory,
    { total: number; correct: number; percentage: number }
  > = {
    current_affairs: { total: 0, correct: 0, percentage: 0 },
    mathematics: { total: 0, correct: 0, percentage: 0 },
    english: { total: 0, correct: 0, percentage: 0 },
    reasoning: { total: 0, correct: 0, percentage: 0 },
    general_knowledge: { total: 0, correct: 0, percentage: 0 }
  };

  for (const q of attempt.questions) {
    categoryBreakdown[q.category].total++;
    const chosenIndex = userAnswers[q.id];

    if (chosenIndex !== undefined && chosenIndex >= 0) {
      attemptedCount++;
      const expectedIndex = attempt.answerKey[q.id]?.correctIndex;

      if (chosenIndex === expectedIndex) {
        correctCount++;
        categoryBreakdown[q.category].correct++;
      } else {
        wrongCount++;
      }
    }
  }

  // Calculate percentages per category
  for (const cat of CATEGORY_ORDER) {
    const total = categoryBreakdown[cat].total;
    const correct = categoryBreakdown[cat].correct;
    categoryBreakdown[cat].percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  }

  const scorePercentage =
    attempt.totalQuestions > 0 ? Math.round((correctCount / attempt.totalQuestions) * 100) : 0;

  const grade = calculateGrade(scorePercentage);
  const passed = scorePercentage >= 40;

  return {
    attemptId: attempt.attemptId,
    durationMinutes: attempt.durationMinutes,
    totalQuestions: attempt.totalQuestions,
    attemptedCount,
    correctCount,
    wrongCount,
    scorePercentage,
    grade,
    categoryBreakdown,
    passed
  };
}
