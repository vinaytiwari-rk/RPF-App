import {
  SAMAHIT_QUESTION_BANK,
  TOTAL_SAMAHIT_QUESTIONS,
  CATEGORY_PERCENTAGES,
  getQuestionCountByCategory
} from "../src/data/quiz/samahitQuestionBank";
import {
  TEST_PRESETS,
  calculateCategoryQuotas,
  generateSamahitTest,
  evaluateSamahitTest
} from "../src/utils/samahitTestEngine";

console.log("=================================================");
console.log("  SAMAHIT QUESTION BANK VALIDATION SUITE        ");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    if (details) console.error(`       Details: ${details}`);
    process.exitCode = 1;
  }
}

// 1. Total Volume & Category Counts
console.log("--- 1. Question Bank Volume & Category Breakdown ---");
console.log(`Total questions integrated: ${TOTAL_SAMAHIT_QUESTIONS}`);
const counts = getQuestionCountByCategory();
console.log("Counts by category:", counts);

assert(TOTAL_SAMAHIT_QUESTIONS >= 300, "Sufficient questions to support 300-question marathon test", `Current total: ${TOTAL_SAMAHIT_QUESTIONS}`);
assert(counts.current_affairs >= 75, "Current Affairs meets minimum requirement of 75 questions", `Current: ${counts.current_affairs}`);
assert(counts.mathematics >= 30, "Mathematics meets minimum requirement of 30 questions", `Current: ${counts.mathematics}`);
assert(counts.english >= 30, "English meets minimum requirement of 30 questions", `Current: ${counts.english}`);
assert(counts.reasoning >= 60, "Reasoning meets minimum requirement of 60 questions", `Current: ${counts.reasoning}`);
assert(counts.general_knowledge >= 105, "General Knowledge meets minimum requirement of 105 questions", `Current: ${counts.general_knowledge}`);

// 2. Schema, Option IDs & Correct Index Integrity
console.log("\n--- 2. Schema & Bilingual Parity Verification ---");
const idSet = new Set<string>();
const textEnSet = new Set<string>();
const answerKeyDistribution: Record<string, number> = { opt_a: 0, opt_b: 0, opt_c: 0, opt_d: 0 };
let malformedQuestions = 0;
let bilingualErrors = 0;

for (const q of SAMAHIT_QUESTION_BANK) {
  if (idSet.has(q.id)) {
    console.error(`Duplicate question ID detected: ${q.id}`);
    malformedQuestions++;
  }
  idSet.add(q.id);

  const cleanEn = q.questionEn.trim().toLowerCase();
  if (textEnSet.has(cleanEn)) {
    console.error(`Duplicate question text detected: ${q.questionEn}`);
    malformedQuestions++;
  }
  textEnSet.add(cleanEn);

  if (!q.questionEn || !q.questionHi || q.questionEn.length < 5 || q.questionHi.length < 5) {
    bilingualErrors++;
  }

  if (!Array.isArray(q.optionsEn) || q.optionsEn.length !== 4) {
    malformedQuestions++;
  }
  if (!Array.isArray(q.optionsHi) || q.optionsHi.length !== 4) {
    malformedQuestions++;
  }

  if (q.correctIndex < 0 || q.correctIndex > 3) {
    malformedQuestions++;
  }

  const expectedOptionId = ["opt_a", "opt_b", "opt_c", "opt_d"][q.correctIndex];
  if (q.correctOptionId !== expectedOptionId) {
    malformedQuestions++;
  }

  if (!q.explanationEn || !q.explanationHi) {
    bilingualErrors++;
  }

  if (!q.source || !q.source.name || !q.source.verificationDate) {
    malformedQuestions++;
  }

  answerKeyDistribution[q.correctOptionId] = (answerKeyDistribution[q.correctOptionId] || 0) + 1;
}

assert(malformedQuestions === 0, "All questions adhere strictly to MCQ schema with 4 valid options", `Errors: ${malformedQuestions}`);
assert(bilingualErrors === 0, "Every question has complete English and Hindi translations for question, options, and explanation", `Errors: ${bilingualErrors}`);
assert(idSet.size === TOTAL_SAMAHIT_QUESTIONS, "All question IDs are unique");

// 3. Answer-Key Distribution Audit
console.log("\n--- 3. Answer-Key Distribution Audit ---");
console.log("Overall Answer Distribution across bank:", answerKeyDistribution);
const total = TOTAL_SAMAHIT_QUESTIONS;
for (const [key, count] of Object.entries(answerKeyDistribution)) {
  const pct = Math.round((count / total) * 100);
  console.log(`  ${key}: ${count} (${pct}%)`);
  assert(pct >= 10 && pct <= 45, `Option ${key} is reasonably balanced (10% - 45%)`, `Actual: ${pct}%`);
}

// 4. Test Presets & Largest Remainder Quota Validation
console.log("\n--- 4. Test Presets & Quota Rounding Verification ---");
for (const preset of TEST_PRESETS) {
  const quotas = calculateCategoryQuotas(preset.questionCount);
  const sumQuotas = Object.values(quotas).reduce((a, b) => a + b, 0);

  console.log(`Duration: ${preset.durationMinutes} mins | Total: ${preset.questionCount} Qs -> Quotas:`, quotas);
  assert(sumQuotas === preset.questionCount, `Category quotas sum exactly to requested total (${preset.questionCount})`, `Sum: ${sumQuotas}`);

  // Test attempt generation
  const attempt = generateSamahitTest(preset.questionCount, preset.durationMinutes, { shuffleOptions: true });
  assert(attempt.questions.length === preset.questionCount, `Attempt generated exactly ${preset.questionCount} questions`);

  // Verify uniqueness of selected questions within the attempt
  const attemptIds = new Set(attempt.questions.map((q) => q.id));
  assert(attemptIds.size === preset.questionCount, `No duplicate questions in attempt of ${preset.questionCount} questions`);

  // Verify answer evaluation correctness
  // Simulate 100% correct answers
  const perfectAnswers: Record<string, number> = {};
  for (const q of attempt.questions) {
    perfectAnswers[q.id] = attempt.answerKey[q.id].correctIndex;
  }
  const evalResult = evaluateSamahitTest(attempt, perfectAnswers);
  assert(evalResult.scorePercentage === 100 && evalResult.grade === "A+", `Attempt evaluation produces 100% and A+ for perfect answers`);
  assert(evalResult.correctCount === preset.questionCount, `Correct count matches total questions`);
}

console.log("\n=================================================");
console.log(`  VALIDATION SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log("=================================================");
