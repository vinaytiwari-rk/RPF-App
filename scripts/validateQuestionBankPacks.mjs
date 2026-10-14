#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
const root=process.cwd(), packsRoot=path.join(root,"data/question-bank/packs"), sourcesPath=path.join(root,"data/question-bank/sources.json");
const staticFiles=["currentAffairs.ts","mathematics.ts","english.ts","reasoning.ts","generalKnowledge.ts"].map(n=>path.join(root,"src/data/quiz/questions",n));
const errors=[], ids=new Map(), packPrompts=new Map(), subjects=new Map();
function walk(dir){if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const f=path.join(dir,e.name);return e.isDirectory()?walk(f):e.isFile()&&e.name.endsWith(".json")?[f]:[];});}
function norm(v){return String(v??"").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();}
function https(v){try{return new URL(v).protocol==="https:";}catch{return false;}}
function fail(s){errors.push(s);}
let sourceIds=new Set();try{sourceIds=new Set(JSON.parse(fs.readFileSync(sourcesPath,"utf8")).sources.map(s=>s.id));}catch(e){fail("Cannot read source registry: "+e.message);}
let builtIn=0;const staticPrompts=new Map();
for(const file of staticFiles){if(!fs.existsSync(file)){fail("Missing built-in file: "+file);continue;}const s=fs.readFileSync(file,"utf8");builtIn+=(s.match(/["']?id["']?\s*:/g)||[]).length;for(const m of s.matchAll(/["']?questionEn["']?\s*:\s*"([^"]+)"/g)){const k=norm(m[1]);if(k&&!staticPrompts.has(k))staticPrompts.set(k,path.relative(root,file));}}
const files=walk(packsRoot);if(!files.length)fail("No question packs found.");const packIds=new Set();let total=0,sourceLinked=0;
for(const file of files){const rel=path.relative(root,file);let p;try{p=JSON.parse(fs.readFileSync(file,"utf8"));}catch(e){fail(rel+": invalid JSON: "+e.message);continue;}
if(!p||!Array.isArray(p.questions)){fail(rel+": questions array required");continue;}
if(!p.packId||!p.subject||!Number.isInteger(p.version)||p.version<1)fail(rel+": packId, subject and positive version required");
if(packIds.has(p.packId))fail(rel+": duplicate packId "+p.packId);packIds.add(p.packId);
if(p.questionsCount!==undefined&&p.questionsCount!==p.questions.length)fail(rel+": questionsCount mismatch");
if(p.questionCount!==undefined&&p.questionCount!==p.questions.length)fail(rel+": questionCount mismatch");
subjects.set(p.subject,(subjects.get(p.subject)||0)+p.questions.length);
const ca=/current[-_ ]affairs/i.test((p.subject||"")+" "+(p.category||""));
for(const [i,q] of p.questions.entries()){total++;const where=rel+" #"+(i+1)+" "+(q?.id||"missing-id");if(!q||typeof q!=="object"){fail(where+": question object required");continue;}
if(!q.id||typeof q.id!=="string")fail(where+": stable id required");else if(ids.has(q.id))fail(where+": duplicate ID also in "+ids.get(q.id));else ids.set(q.id,where);
for(const k of ["questionEn","questionHi","explanationEn","explanationHi"])if(typeof q[k]!=="string"||!q[k].trim())fail(where+": "+k+" required");
for(const k of ["optionsEn","optionsHi"])if(!Array.isArray(q[k])||q[k].length!==4||q[k].some(v=>typeof v!=="string"||!v.trim()))fail(where+": "+k+" must contain four non-empty strings");
if(!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>3)fail(where+": correctIndex must be 0..3");else{if(q.answerEn&&q.optionsEn?.[q.correctIndex]!==q.answerEn)fail(where+": answerEn mismatch");if(q.answerHi&&q.optionsHi?.[q.correctIndex]!==q.answerHi)fail(where+": answerHi mismatch");}
const key=norm(q.questionEn);if(key){if(packPrompts.has(key))fail(where+": duplicate English prompt also in "+packPrompts.get(key));else packPrompts.set(key,where);if(staticPrompts.has(key))fail(where+": duplicate built-in prompt in "+staticPrompts.get(key));}
if(q.source){if(!sourceIds.has(q.source.sourceId))fail(where+": sourceId not registered");if(!https(q.source.articleUrl))fail(where+": articleUrl must be HTTPS");if(!/^\d{4}-\d{2}-\d{2}$/.test(q.source.verifiedAt||""))fail(where+": verifiedAt must be YYYY-MM-DD");if(q.source.factCheckUrl&&!https(q.source.factCheckUrl))fail(where+": factCheckUrl must be HTTPS");if(q.source.factCheckUrl&&/^\d{4}-\d{2}-\d{2}$/.test(q.source.verifiedAt||""))sourceLinked++;}else if(ca)fail(where+": current-affairs source metadata required");
if(ca&&(!q.source?.sourceId||!q.source?.articleUrl||!q.source?.verifiedAt||!q.source?.factCheckUrl))fail(where+": current-affairs verification metadata incomplete");
}}
console.log("SAMAHIT Question Bank Pack Validation");console.log("Built-in static questions:",builtIn);console.log("Pack questions:",total,"across",files.length,"packs");console.log("Integrated candidate pool:",builtIn+total,"/ 50000;",Math.max(0,50000-builtIn-total),"remaining");console.log("Pack counts by subject:",Object.fromEntries(subjects));console.log("Source-linked pack questions with verification dates:",sourceLinked);
for(const e of errors)console.error("[FAIL]",e);if(errors.length){console.error("Validation failed:",errors.length,"error(s).");process.exit(1);}console.log("Validation passed.");
