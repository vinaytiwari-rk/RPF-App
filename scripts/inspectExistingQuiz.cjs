const fs = require('fs');
const path = require('path');

console.log('=== INSPECTION OF EXISTING QUIZ ARTIFACTS ===');

// 1. Inspect src/data/quiz/quizQuestionBank.ts
try {
  const qbContent = fs.readFileSync('src/data/quiz/quizQuestionBank.ts', 'utf8');
  const qMatches = qbContent.match(/questionEn:\s*["'`]/g) || [];
  console.log('1. src/data/quiz/quizQuestionBank.ts question count:', qMatches.length);
} catch (e) {
  console.error('Error reading quizQuestionBank.ts:', e.message);
}

// 2. Inspect public/data/quiz/cache
try {
  const cacheDir = 'public/data/quiz/cache';
  if (fs.existsSync(cacheDir)) {
    const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json'));
    let totalCachedQuestions = 0;
    const fileStats = [];
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(cacheDir, f), 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          totalCachedQuestions += parsed.length;
          fileStats.push({ file: f, count: parsed.length });
        }
      } catch (err) {}
    }
    console.log(`2. public/data/quiz/cache: ${files.length} cache files with ${totalCachedQuestions} total questions.`);
    fileStats.forEach(s => console.log(`   - ${s.file}: ${s.count} questions`));
  } else {
    console.log('2. public/data/quiz/cache does not exist.');
  }
} catch (e) {
  console.error('Error inspecting cache:', e.message);
}

// 3. Inspect other files in project
console.log('=== END INSPECTION ===');
