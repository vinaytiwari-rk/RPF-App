import { SamahitQuestion, QuestionCategory } from "./samahitQuestionTypes";
import { CURRENT_AFFAIRS_QUESTIONS } from "./questions/currentAffairs";
import { MATHEMATICS_QUESTIONS } from "./questions/mathematics";
import { ENGLISH_QUESTIONS } from "./questions/english";
import { REASONING_QUESTIONS } from "./questions/reasoning";
import { GENERAL_KNOWLEDGE_QUESTIONS } from "./questions/generalKnowledge";

export * from "./samahitQuestionTypes";

export const SAMAHIT_QUESTION_BANK: SamahitQuestion[] = [
  ...CURRENT_AFFAIRS_QUESTIONS,
  ...MATHEMATICS_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...REASONING_QUESTIONS,
  ...GENERAL_KNOWLEDGE_QUESTIONS
];

export const TOTAL_SAMAHIT_QUESTIONS = SAMAHIT_QUESTION_BANK.length;

export const CATEGORY_PERCENTAGES: Record<QuestionCategory, number> = {
  current_affairs: 25,
  mathematics: 10,
  english: 10,
  reasoning: 20,
  general_knowledge: 35
};

export const CATEGORY_LABELS: Record<QuestionCategory, { en: string; hi: string }> = {
  current_affairs: { en: "Current Affairs", hi: "करेंट अफेयर्स" },
  mathematics: { en: "Mathematics", hi: "गणित" },
  english: { en: "English", hi: "अंग्रेजी" },
  reasoning: { en: "Reasoning", hi: "तर्कशक्ति (रीजनिंग)" },
  general_knowledge: { en: "General Knowledge", hi: "सामान्य ज्ञान" }
};

export function getQuestionsByCategory(category: QuestionCategory): SamahitQuestion[] {
  return SAMAHIT_QUESTION_BANK.filter((q) => q.category === category && q.isActive);
}

export function getQuestionCountByCategory(): Record<QuestionCategory, number> {
  return {
    current_affairs: CURRENT_AFFAIRS_QUESTIONS.filter((q) => q.isActive).length,
    mathematics: MATHEMATICS_QUESTIONS.filter((q) => q.isActive).length,
    english: ENGLISH_QUESTIONS.filter((q) => q.isActive).length,
    reasoning: REASONING_QUESTIONS.filter((q) => q.isActive).length,
    general_knowledge: GENERAL_KNOWLEDGE_QUESTIONS.filter((q) => q.isActive).length
  };
}

export function getQuestionById(id: string): SamahitQuestion | undefined {
  return SAMAHIT_QUESTION_BANK.find((q) => q.id === id);
}
