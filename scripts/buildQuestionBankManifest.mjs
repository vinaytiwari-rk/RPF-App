#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import crypto from "node:crypto";
const root=process.cwd(),src=path.join(root,"data/question-bank/packs"),registry=path.join(root,"data/question-bank/sources.json"),pub=path.join(root,"public/question-bank");
const builtInFiles=["currentAffairs.ts","mathematics.ts","english.ts","reasoning.ts","generalKnowledge.ts"].map(n=>path.join(root,"src/data/quiz/questions",n));
function walk(d){if(!fs.existsSync(d))return [];return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const f=path.join(d,e.name);return e.isDirectory()?walk(f):e.isFile()&&e.name.endsWith(".json")?[f]:[];});}
const files=walk(src);if(!files.length)throw new Error("No question packs found.");if(!fs.existsSync(registry))throw new Error("Missing sources.json.");
const builtInQuestionCount=builtInFiles.reduce((n,f)=>{if(!fs.existsSync(f))throw new Error("Missing built-in bank file: "+f);return n+(fs.readFileSync(f,"utf8").match(/["']?id["']?\s*:/g)||[]).length;},0);
fs.mkdirSync(pub,{recursive:true});fs.copyFileSync(registry,path.join(pub,"sources.json"));
const packs=[];let verifiedPackQuestionCount=0;
for(const file of files){const raw=fs.readFileSync(file),p=JSON.parse(raw.toString("utf8"));if(!p.packId||!p.subject||!Number.isInteger(p.version)||!Array.isArray(p.questions))throw new Error("Invalid pack metadata: "+file);
const rel=path.relative(src,file).split(path.sep).join("/"),out=path.join(pub,"packs",rel);fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(file,out);
verifiedPackQuestionCount+=p.questions.filter(q=>q.source?.factCheckUrl&&/^\d{4}-\d{2}-\d{2}$/.test(q.source?.verifiedAt||"")).length;
packs.push({packId:p.packId,version:p.version,subject:p.subject,category:p.category||"general-knowledge",titleEn:p.titleEn||p.subject,titleHi:p.titleHi||p.subject,descEn:p.descEn||"",descHi:p.descHi||"",iconName:p.iconName||"BookOpen",color:p.color||"from-emerald-600 to-teal-600",badge:p.badge||"",questionsCount:p.questions.length,durationMinutes:p.durationMinutes||10,url:"/question-bank/packs/"+rel,sha256:crypto.createHash("sha256").update(raw).digest("hex"),sizeBytes:raw.byteLength});}
packs.sort((a,b)=>a.packId.localeCompare(b.packId));const packQuestionCount=packs.reduce((n,p)=>n+p.questionsCount,0);
const manifest={schemaVersion:1,generatedAt:new Date().toISOString(),targetQuestionCount:50000,builtInQuestionCount,packQuestionCount,actualQuestionCount:builtInQuestionCount+packQuestionCount,verifiedPackQuestionCount,packs};
fs.writeFileSync(path.join(pub,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("Manifest:",packs.length,"packs;",packQuestionCount,"pack questions;",manifest.actualQuestionCount,"integrated questions;",Math.max(0,50000-manifest.actualQuestionCount),"remaining to 50,000.");
