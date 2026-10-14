import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { TEST_PRESETS, calculateCategoryQuotas, generateSamahitTest } from "../src/utils/samahitTestEngine";
import { mapQuestionPackToSamahitQuestions } from "../src/lib/hybridQuestionBank";
const file=path.join(process.cwd(),"data/question-bank/packs/arts-culture/indian-arts-culture-foundations-001.json");
const pack=JSON.parse(fs.readFileSync(file,"utf8"));
const extra=mapQuestionPackToSamahitQuestions(pack);
assert.equal(extra.length,20);
for(const preset of TEST_PRESETS){
 const expected=calculateCategoryQuotas(preset.questionCount);
 assert.equal(Object.values(expected).reduce((a,b)=>a+b,0),preset.questionCount);
 const attempt=generateSamahitTest(preset.questionCount,preset.durationMinutes,{shuffleOptions:true,attemptIdPrefix:"bank-test"},extra);
 assert.equal(attempt.questions.length,preset.questionCount,preset.labelEn+" exact count");
 assert.equal(new Set(attempt.questions.map(q=>q.id)).size,preset.questionCount,preset.labelEn+" no repeats");
 assert.deepEqual(attempt.categoryQuotas,expected,preset.labelEn+" category quotas");
 for(const q of attempt.questions){assert.equal(q.displayOptionsEn[q.displayCorrectIndex],q.optionsEn[q.correctIndex],"English option shuffle: "+q.id);assert.equal(q.displayOptionsHi[q.displayCorrectIndex],q.optionsHi[q.correctIndex],"Hindi option shuffle: "+q.id);assert.equal(attempt.answerKey[q.id].correctIndex,q.displayCorrectIndex);}
}
console.log("Hybrid engine tests passed for all six presets and shuffled answer keys.");
