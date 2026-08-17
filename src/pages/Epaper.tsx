import React from "react";
import { BookOpen, CalendarDays, ChevronRight, ExternalLink, Newspaper } from "lucide-react";
import { useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";
type Paper = { name:string; nameHi:string; url:string };
const PAPERS:Paper[]=[
{name:"Free Press Journal",nameHi:"फ्री प्रेस जर्नल",url:"https://epaper.freepressjournal.in/"},
{name:"People's Samachar",nameHi:"पीपुल्स समाचार",url:"https://epapers.peoplessamachar.in/"},
{name:"Mid-Day",nameHi:"मिड-डे",url:"https://epaper.mid-day.com/"},
{name:"Aaj Tak",nameHi:"आज तक",url:"https://epaper.aajtak.in/"},
{name:"Financial Express",nameHi:"फाइनेंशियल एक्सप्रेस",url:"https://epaper.financialexpress.com/"},
{name:"The Telegraph",nameHi:"द टेलीग्राफ",url:"https://epaper.telegraphindia.com/"},
{name:"Live Hindustan",nameHi:"लाइव हिन्दुस्तान",url:"https://epaper.livehindustan.com/"},
{name:"Lokdesh Bhopal",nameHi:"लोकदेश भोपाल",url:"https://lokdesh.com/bhopal-e-papers/"},
{name:"Hitavada",nameHi:"हितवाद",url:"https://www.ehitavada.com/index.php?edition=BMpage&date={{DATE}}&page=1"},
{name:"Central Chronicle",nameHi:"सेंट्रल क्रॉनिकल",url:"https://www.centralchronicle.com/epaper/"},
{name:"Navbharat Live",nameHi:"नवभारत लाइव",url:"https://epaper.navbharatlive.com/"},
{name:"Pradesh Today",nameHi:"प्रदेश टुडे",url:"https://epaper.pradeshtoday.com/"},
{name:"Mint",nameHi:"मिंट",url:"https://epaper.livemint.com/"},
{name:"The Daily Guardian",nameHi:"द डेली गार्जियन",url:"https://epaper.thedailyguardian.com/"},
{name:"Subah Savere Bhopal",nameHi:"सुबह सवेरे भोपाल",url:"https://epaper.subahsavere.news/view/2912/bhopal"},
{name:"Dainik Navajyoti",nameHi:"दैनिक नवज्योति",url:"https://epaper.dainiknavajyoti.com/"},
{name:"Navarashtra",nameHi:"नवराष्ट्र",url:"https://epaper.navarashtra.com/"},
{name:"Prabhat Khabar",nameHi:"प्रभात खबर",url:"https://epaper.prabhatkhabar.com/"}
];
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function resolvedUrl(url:string){return url.replace("{{DATE}}",today());}
export default function Epaper(){const{lang}=useOutletContext<{lang:Lang}>();const isHi=lang==="hi";const dateLabel=new Date().toLocaleDateString(isHi?"hi-IN":"en-IN",{day:"numeric",month:"long",year:"numeric"});return <main className="min-h-full bg-[#fbf8f2] pb-10"><div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5"><section className="relative overflow-hidden rounded-[26px] border border-amber-200/70 bg-gradient-to-br from-[#fff8e7] via-white to-indigo-50 p-5 shadow-sm sm:p-7"><div className="relative"><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.2em] text-[#a84424]"><Newspaper className="h-4 w-4"/>{isHi?"दैनिक ई-पेपर":"Daily E-paper"}</div><h1 className="mt-2 text-[27px] font-black tracking-tight text-[#3b1f1f] sm:text-4xl">{isHi?"आज के समाचार पत्र":"Today's Newspapers"}</h1><p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600">{isHi?"एक ही जगह से प्रमुख दैनिक ई-पेपर पढ़ें। किसी अखबार पर टैप करके उसका आज का संस्करण खोलें।":"Read the leading daily e-papers from one place. Tap any newspaper to open its latest edition."}</p><div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-[11px] font-bold text-[#7f1d1d]"><CalendarDays className="h-4 w-4"/>{dateLabel}</div></div></section><section className="mt-5 grid gap-3 sm:grid-cols-2">{PAPERS.map((paper,index)=><a key={paper.name} href={resolvedUrl(paper.url)} target="_blank" rel="noopener noreferrer" className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${index%4===0?"bg-rose-50 text-rose-700 ring-rose-100":index%4===1?"bg-orange-50 text-orange-700 ring-orange-100":index%4===2?"bg-indigo-50 text-indigo-700 ring-indigo-100":"bg-emerald-50 text-emerald-700 ring-emerald-100"}`}><BookOpen className="h-5 w-5"/></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black leading-tight text-[#3b1f1f]">{isHi?paper.nameHi:paper.name}</span><span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500"><ExternalLink className="h-3 w-3"/>{isHi?"आज का संस्करण खोलें":"Open today's edition"}</span></span><ChevronRight className="h-5 w-5 shrink-0 text-slate-300"/></a>)}</section><p className="mt-5 px-1 text-center text-[10px] leading-5 text-slate-400">{isHi?"ई-पेपर संबंधित प्रकाशकों की वेबसाइटों पर सीधे खुलते हैं। उपलब्धता और संस्करण उनके अपने प्रकाशन समय पर निर्भर हैं।":"E-papers open directly on the publishers' websites. Edition availability follows each publisher's publication schedule."}</p></div></main>;}
