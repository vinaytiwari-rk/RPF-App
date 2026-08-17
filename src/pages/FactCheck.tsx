import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

type Lang = "en" | "hi";
const SOURCES = [
  { name: "Dainik Bhaskar No Fake News", nameHi: "दैनिक भास्कर - नो फेक न्यूज़", url: "https://www.bhaskar.com/no-fake-news/", description: "Fact-checks by Dainik Bhaskar.", descriptionHi: "दैनिक भास्कर द्वारा तथ्य-जांच।" },
  { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
  { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "A leading Indian fact-checking website.", descriptionHi: "भारत की एक प्रमुख तथ्य-जांच वेबसाइट।" },
  { name: "OpIndia Fact Check", nameHi: "ऑपइंडिया फैक्ट चेक", url: "https://www.opindia.com/category/fact-check/", description: "Fact checks and news analysis by OpIndia.", descriptionHi: "ऑपइंडिया द्वारा तथ्य-जांच और समाचार विश्लेषण।" },
  { name: "Snopes", nameHi: "स्नोप्स (Snopes)", url: "https://www.snopes.com/fact-check/", description: "Internet reference source for urban legends, myths, and misinformation.", descriptionHi: "इंटरनेट पर अफवाहों और मिथकों की पड़ताल का प्रमुख स्रोत।" },
  { name: "PolitiFact", nameHi: "पॉलिटिफैक्ट", url: "https://politifact.com/", description: "Fact-checking US politics and global news.", descriptionHi: "अमेरिकी राजनीति और वैश्विक समाचारों की तथ्य-जांच।" },
  { name: "FactCheck.org", nameHi: "फैक्टचेक.org", url: "https://www.factcheck.org/", description: "Monitoring the factual accuracy of statements.", descriptionHi: "बयानों की तथ्यात्मक सटीकता की निगरानी।" },
  { name: "Reuters Fact Check", nameHi: "रॉयटर्स फैक्ट चेक", url: "https://www.reuters.com/fact-check/", description: "Fact-checking claims and misinformation globally.", descriptionHi: "वैश्विक स्तर पर दावों और गलत सूचनाओं की तथ्य-जांच।" },
  { name: "AP News Fact Check", nameHi: "एपी न्यूज़ फैक्ट चेक", url: "https://apnews.com/ap-fact-check", description: "Fact-checking and accountability journalism from The Associated Press.", descriptionHi: "एसोसिएटेड प्रेस (AP) द्वारा तथ्य-जांच।" },
  { name: "BBC Verify", nameHi: "बीबीसी वेरीफाई", url: "https://www.bbc.com/news/bbcverify", description: "Transparency and forensic journalism by the BBC.", descriptionHi: "बीबीसी द्वारा पारदर्शिता और फोरेंसिक पत्रकारिता।" },
  { name: "PTI Fact Check", nameHi: "पीटीआई फैक्ट चेक", url: "https://www.ptinews.com/fact-check", description: "Fact check initiative by the Press Trust of India.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) की तथ्य-जांच पहल।" },
  { name: "NewsChecker", nameHi: "न्यूज़चेकर", url: "https://newschecker.in/", description: "Dedicated to fact-checking and debunking misinformation.", descriptionHi: "गलत सूचनाओं का पर्दाफाश करने के लिए समर्पित।" },
];

export default function FactCheck() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  return <main className="min-h-full bg-slate-50 pb-28"><div className="mx-auto w-full max-w-3xl px-4 py-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-6 w-6" /></div><div><h1 className="text-2xl font-black text-[#000080]">{hi ? "फैक्ट चेक" : "Fact Check"}</h1><p className="mt-1 text-xs text-slate-500">{hi ? "दावों और खबरों की तथ्य-जांच के लिए उपयोगी स्रोत" : "Useful sources for checking claims and news"}</p></div></div><div className="mt-6 space-y-3">{SOURCES.map(source => <button key={source.url} type="button" onClick={() => openExternalLink(source.url, navigate)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white hover:shadow-sm active:scale-[.99]"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><ExternalLink className="h-5 w-5" /></div><div className="min-w-0 flex-1"><h2 className="text-sm font-black text-slate-800">{hi ? source.nameHi : source.name}</h2><p className="mt-1 text-xs text-slate-500">{hi ? source.descriptionHi : source.description}</p></div></button>)}</div><p className="mt-5 text-center text-[10px] leading-5 text-slate-400">{hi ? "स्रोत अपनी आधिकारिक वेबसाइट पर खुलेंगे ताकि उनके मूल लेख, लॉगिन, कुकी और सुरक्षा सुविधाएँ सही रहें।" : "Sources open on their official websites so their original articles, login, cookies and security features work correctly."}</p></section></div></main>;
}
