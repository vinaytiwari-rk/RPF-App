import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const walk=d=>fs.existsSync(d)?fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith(".json")?[path.join(d,e.name)]:[]):[];
const ids=new Set();let total=0;
for(const f of walk("data/question-bank/packs")){const p=JSON.parse(fs.readFileSync(f,"utf8"));assert.ok(p.packId&&Number.isInteger(p.version)&&Array.isArray(p.questions),f);for(const q of p.questions){total++;assert.ok(q.id&&!ids.has(q.id),"duplicate/missing ID: "+q.id);ids.add(q.id);for(const k of ["questionEn","questionHi","explanationEn","explanationHi"])assert.ok(q[k]?.trim(),q.id+": "+k);for(const k of ["optionsEn","optionsHi"])assert.ok(Array.isArray(q[k])&&q[k].length===4&&q[k].every(v=>v?.trim()),q.id+": "+k);assert.ok(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4,q.id+": correctIndex");}}
const portal=fs.readFileSync("src/pages/OnlineTestCenterPage.tsx","utf8");assert.ok(portal.includes("listQuestionPackTopics")&&portal.includes("loadQuestionPack"),"portal integration");
console.log("Question-bank integrity tests passed:",ids.size,"unique IDs across",total,"questions.");
