#!/usr/bin/env node
import assert from "node:assert/strict";import fs from "node:fs";import path from "node:path";
const file=path.join(process.cwd(),"data/question-bank/packs/arts-culture/indian-arts-culture-foundations-001.json");
const p=JSON.parse(fs.readFileSync(file,"utf8"));assert.equal(p.packId,"indian-arts-culture-foundations-001");assert.equal(p.questions.length,20);assert.equal(p.questionsCount,20);
assert.equal(new Set(p.questions.map(q=>q.id)).size,20,"question IDs must be unique");
const expected=["Buddhist religious art","The second and first centuries BCE","The Gupta period","1983","Buddhism","Emperor Ashoka","1989","Shiva","The mid-fifth to sixth centuries CE","Mumbai","Ramayana","2008","Dussehra","2021","The ten-day worship of Goddess Durga","2023","2017","2010","2016","Traditional brass and copper utensil-making among the Thatheras of Jandiala Guru"];
const distribution=[0,0,0,0];
for(const [i,q] of p.questions.entries()){assert.equal(q.optionsEn[q.correctIndex],expected[i],"English key mismatch: "+q.id);assert.equal(q.answerEn,expected[i],"answerEn mismatch: "+q.id);assert.equal(q.optionsHi[q.correctIndex],q.answerHi,"Hindi key mismatch: "+q.id);assert.ok(q.source?.articleUrl&&q.source?.factCheckUrl&&q.source?.verifiedAt,"source metadata missing: "+q.id);distribution[q.correctIndex]++;}
assert.deepEqual(distribution,[5,5,5,5],"answer-key distribution should be balanced");
console.log("Pack answer-key tests passed: 20 questions; sources checked; A/B/C/D = 5/5/5/5.");
