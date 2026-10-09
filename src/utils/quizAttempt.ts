import type { QuizQuestion } from "../data/quiz/quizQuestionBank";

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Makes a new local exam attempt: picks a random subset, randomizes question
 * order, and randomizes bilingual answer options while keeping correctIndex valid.
 * No server or network request is needed.
 */
export function createRandomizedAttempt(
  questionBank: QuizQuestion[],
  requestedCount = 7,
): QuizQuestion[] {
  if (!Array.isArray(questionBank) || questionBank.length === 0) return [];

  const count = Math.min(Math.max(1, Math.floor(requestedCount)), questionBank.length);
  return shuffle(questionBank)
    .slice(0, count)
    .map((question) => {
      const optionOrder = shuffle(question.optionsEn.map((_, index) => index));
      return {
        ...question,
        optionsEn: optionOrder.map((index) => question.optionsEn[index]),
        optionsHi: optionOrder.map((index) => question.optionsHi[index]),
        correctIndex: optionOrder.indexOf(question.correctIndex),
      };
    });
}
