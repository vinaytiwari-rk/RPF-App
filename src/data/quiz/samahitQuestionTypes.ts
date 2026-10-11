export type QuestionCategory =
  | "current_affairs"
  | "mathematics"
  | "english"
  | "reasoning"
  | "general_knowledge";

export type OptionId = "opt_a" | "opt_b" | "opt_c" | "opt_d";

export interface QuestionSource {
  name: string;
  url: string;
  pubDate?: string;
  verificationDate: string;
  status: "verified" | "under_review";
}

export interface SamahitQuestion {
  id: string;
  category: QuestionCategory;
  subcategory: string;
  questionEn: string;
  questionHi: string;
  optionsEn: [string, string, string, string];
  optionsHi: [string, string, string, string];
  correctOptionId: OptionId;
  correctIndex: 0 | 1 | 2 | 3;
  explanationEn: string;
  explanationHi: string;
  difficulty: "easy" | "medium" | "hard";
  source: QuestionSource;
  createdAt: string;
  fingerprint: string;
  isActive: boolean;
}

export interface CategoryQuota {
  category: QuestionCategory;
  nameEn: string;
  nameHi: string;
  targetPercentage: number;
  quotaCount: number;
}

export interface TestAttemptQuestion extends SamahitQuestion {
  displayOptionsEn: [string, string, string, string];
  displayOptionsHi: [string, string, string, string];
  displayCorrectIndex: number;
  optionOrder: number[]; // e.g. [2, 0, 1, 3] mapping display index to original
}

export interface SamahitTestAttempt {
  attemptId: string;
  durationMinutes: number;
  totalQuestions: number;
  categoryQuotas: Record<QuestionCategory, number>;
  questions: TestAttemptQuestion[];
  answerKey: Record<string, { correctOptionId: OptionId; correctIndex: number }>;
  startedAt: string;
}

export interface TestResultEvaluation {
  attemptId: string;
  durationMinutes: number;
  totalQuestions: number;
  attemptedCount: number;
  correctCount: number;
  wrongCount: number;
  scorePercentage: number;
  grade: "A+" | "A" | "B+" | "B" | "C" | "D" | "E";
  categoryBreakdown: Record<QuestionCategory, { total: number; correct: number; percentage: number }>;
  passed: boolean;
}
