import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
const DEFAULT_SOURCES = [
  { name: "PIB Fact Check", nameHi: "पीआईबी फैक्ट चेक", url: "https://xcancel.com/pibfactcheck", description: "Press Information Bureau fact-checks regarding government policies and schemes.", descriptionHi: "सरकारी नीतियों और योजनाओं के संबंध में प्रेस सूचना ब्यूरो द्वारा तथ्य-जांच।" },
  { name: "Vishvas News", nameHi: "विश्वास न्यूज़", url: "https://www.vishvasnews.com/", description: "A leading Indian multilingual fact-checking website.", descriptionHi: "भारत की एक प्रमुख बहुभाषी तथ्य-जांच वेबसाइट।" },
  { name: "India Today Anti Fake News War", nameHi: "इंडिया टुडे एंटी फेक न्यूज़ वॉर", url: "https://xcancel.com/IndiaTodayFacts", description: "India Today fact-checks addressing viral misinformation.", descriptionHi: "इंडिया टुडे द्वारा वायरल भ्रामक जानकारियों की तथ्य-जांच।" },
  { name: "PTI Fact Check (X)", nameHi: "पीटीआई फैक्ट चेक (X)", url: "https://xcancel.com/ptifactcheck", description: "PTI's official fact-check handle on X/Twitter.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "MEA Fact Check", nameHi: "विदेश मंत्रालय फैक्ट चेक", url: "https://xcancel.com/MEAFactCheck", description: "Ministry of External Affairs official fact-checking handle.", descriptionHi: "विदेश मंत्रालय का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "Jansampark MP Fact Check", nameHi: "जनसंपर्क मध्य प्रदेश फैक्ट चेक", url: "https://xcancel.com/jansamparkFC", description: "Madhya Pradesh Government's official public relations fact-checker.", descriptionHi: "मध्य प्रदेश सरकार का आधिकारिक जनसंपर्क तथ्य-जांच हैंडल।" },
  { name: "NewsMeter Fact Check", nameHi: "न्यूज़मीटर फैक्ट चेक", url: "https://xcancel.com/newsmeterfacts", description: "Independent digital fact-checking and investigative journalism.", descriptionHi: "स्वतंत्र डिजिटल तथ्य-जांच और खोजी पत्रकारिता।" },
  { name: "UP Police Viral Check", nameHi: "यूपी पुलिस वायरल चेक", url: "https://xcancel.com/UPPViralCheck", description: "Uttar Pradesh Police official handle for checking viral rumors.", descriptionHi: "उत्तर प्रदेश पुलिस का वायरल अफवाहों की जांच का आधिकारिक हैंडल।" },
  { name: "Info UP Fact Check", nameHi: "इन्फो यूपी फैक्ट चेक", url: "https://xcancel.com/InfoUPFactcheck", description: "Information & Public Relations Department of UP fact-checking handle.", descriptionHi: "सूचना एवं जनसंपर्क विभाग (उत्तर प्रदेश) का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "Dainik Bhaskar No Fake News", nameHi: "दैनिक भास्कर - नो फेक न्यूज़", url: "https://www.bhaskar.com/no-fake-news/", description: "Fact-checks by Dainik Bhaskar.", descriptionHi: "दैनिक भास्कर द्वारा तथ्य-जांच।" },
  { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
  { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "A leading Indian fact-checking website.", descriptionHi: "भारत की एक प्रमुख तथ्य-जांच वेबसाइट।" }
];

export default function FactCheck() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { cmsConfig } = useApp();
  const navigate = useNavigate();
  const hi = lang === "hi";
  
  const rawSources = Array.isArray(cmsConfig?.factCheckSources) && cmsConfig.factCheckSources.length > 0 
    ? cmsConfig.factCheckSources 
    : DEFAULT_SOURCES;

  const sources = rawSources.filter((s: any) => 
    !s.name?.toLowerCase().includes("google fact check") && 
    !s.url?.toLowerCase().includes("toolbox.google.com/factcheck")
  );

  return (
    <main className="min-h-full bg-slate-50 pb-28">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#000080]">
                {hi ? "फैक्ट चेक" : "Fact Check"}
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                {hi ? "दावों और खबरों की तथ्य-जांच के लिए उपयोगी स्रोत" : "Useful sources for checking claims and news"}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {sources.map((source) => (
              <button
                key={source.url}
                type="button"
                onClick={() => openExternalLink(source.url, navigate)}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white hover:shadow-sm active:scale-[.99]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-black text-slate-800">
                    {hi ? source.nameHi : source.name}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {hi ? source.descriptionHi : source.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-5 text-center text-[10px] leading-5 text-slate-400">
            {hi
              ? "स्रोत अपनी आधिकारिक वेबसाइट पर खुलेंगे ताकि उनके मूल लेख, लॉगिन, कुकी और सुरक्षा सुविधाएँ सही रहें।"
              : "Sources open on their official websites so their original articles, login, cookies and security features work correctly."}
          </p>
        </section>
      </div>
    </main>
  );
}
