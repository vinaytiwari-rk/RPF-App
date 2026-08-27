import React, { useMemo, useState } from "react";
import { CheckCircle2, Globe2, Search, ShieldCheck, ExternalLink, HelpCircle } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Source = { name: string; nameHi: string; url: string; description: string; descriptionHi: string };

const xcancel = (handle: string) => `https://xcancel.com/${handle.replace(/^@/, "")}`;
const DEFAULT_SOURCES: Source[] = [
  { name: "PIB Fact Check", nameHi: "पीआईबी फैक्ट चेक", url: xcancel("PIBFactCheck"), description: "Press Information Bureau fact-checks regarding government policies and schemes.", descriptionHi: "सरकारी नीतियों और योजनाओं के संबंध में प्रेस सूचना ब्यूरो द्वारा तथ्य-जांच।" },
  { name: "Vishvas News", nameHi: "विश्वास न्यूज़", url: "https://www.vishvasnews.com/", description: "A leading Indian multilingual fact-checking website.", descriptionHi: "भारत की एक प्रमुख बहुभाषी तथ्य-जांच वेबसाइट।" },
  { name: "India Today Anti Fake News War", nameHi: "इंडिया टुडे एंटी फेक न्यूज़ वॉर", url: xcancel("IndiaTodayFacts"), description: "India Today fact-checks addressing viral misinformation.", descriptionHi: "India Today द्वारा वायरल भ्रामक जानकारियों की तथ्य-जांच।" },
  { name: "PTI Fact Check", nameHi: "पीटीआई फैक्ट चेक", url: xcancel("ptifactcheck"), description: "PTI's official fact-check handle.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) का आधिकारिक तथ्य-जांच हैंडल।" },
  { name: "MEA Fact Check", nameHi: "विदेश मंत्रालय फैक्ट चेक", url: xcancel("MEAIndia"), description: "Ministry of External Affairs official updates and clarifications.", descriptionHi: "विदेश मंत्रालय के आधिकारिक अपडेट और स्पष्टीकरण।" },
  { name: "Jansampark MP Fact Check", nameHi: "जनसंपर्क मध्य प्रदेश फैक्ट चेक", url: xcancel("MPJansampark"), description: "Madhya Pradesh Government public information and fact-check updates.", descriptionHi: "मध्य प्रदेश सरकार के जनसंपर्क और तथ्य-जांच अपडेट।" },
  { name: "NewsMeter Fact Check", nameHi: "न्यूज़मीटर फैक्ट चेक", url: xcancel("NewsMeter"), description: "Independent digital fact-checking and investigative journalism.", descriptionHi: "स्वतंत्र डिजिटल तथ्य-जांच और खोजी पत्रकारिता।" },
  { name: "UP Police Viral Check", nameHi: "यूपी पुलिस वायरल चेक", url: xcancel("uppolice"), description: "Uttar Pradesh Police official public-information updates.", descriptionHi: "उत्तर प्रदेश पुलिस के आधिकारिक जन-सूचना अपडेट।" },
  { name: "Info UP Fact Check", nameHi: "इन्फो यूपी फैक्ट चेक", url: xcancel("InfoUPFactCheck"), description: "Uttar Pradesh information and public-relations fact-check updates.", descriptionHi: "उत्तर प्रदेश सूचना एवं जनसंपर्क विभाग के तथ्य-जांच अपडेट।" },
  { name: "Dainik Bhaskar No Fake News", nameHi: "दैनिक भास्कर - नो फेक न्यूज़", url: "https://www.bhaskar.com/no-fake-news/", description: "Fact-checks by Dainik Bhaskar.", descriptionHi: "दैनिक भास्कर द्वारा तथ्य-जांच।" },
  { name: "BoomLive Fact Check", nameHi: "बूमलाइव फैक्ट चेक", url: "https://www.boomlive.in/fact-check", description: "Independent digital journalism and fact-checking.", descriptionHi: "स्वतंत्र डिजिटल पत्रकारिता और तथ्य-जांच।" },
  { name: "Alt News", nameHi: "ऑल्ट न्यूज़", url: "https://www.altnews.in/", description: "A leading Indian fact-checking website.", descriptionHi: "भारत की एक प्रमुख तथ्य-जांच वेबसाइट।" },
  { name: "OpIndia Fact Check", nameHi: "ऑपइंडिया फैक्ट चेक", url: "https://www.opindia.com/category/fact-check/", description: "Fact checks and news analysis by OpIndia.", descriptionHi: "ऑपइंडिया द्वारा तथ्य-जांच और समाचार विश्लेषण।" },
  { name: "Snopes", nameHi: "स्नोप्स (Snopes)", url: "https://www.snopes.com/fact-check/", description: "Reference source for myths, rumors and misinformation.", descriptionHi: "अफवाहों, मिथकों और गलत सूचनाओं की पड़ताल का स्रोत।" },
  { name: "PolitiFact", nameHi: "पॉलिटिफैक्ट", url: "https://politifact.com/", description: "Fact-checking political and public claims.", descriptionHi: "राजनीतिक और सार्वजनिक दावों की तथ्य-जांच।" },
  { name: "FactCheck.org", nameHi: "फैक्टचेक.org", url: "https://www.factcheck.org/", description: "Monitoring the factual accuracy of public statements.", descriptionHi: "सार्वजनिक बयानों की तथ्यात्मक सटीकता की निगरानी।" },
  { name: "Reuters Fact Check", nameHi: "रॉयटर्स फैक्ट चेक", url: "https://www.reuters.com/fact-check/", description: "Global fact-checking of claims and misinformation.", descriptionHi: "दावों और गलत सूचनाओं की वैश्विक तथ्य-जांच।" },
  { name: "AP News Fact Check", nameHi: "एपी न्यूज़ फैक्ट चेक", url: "https://apnews.com/ap-fact-check", description: "Fact-checking and accountability journalism from AP.", descriptionHi: "एसोसिएटेड प्रेस (AP) द्वारा तथ्य-जांच।" },
  { name: "BBC Verify", nameHi: "बीबीसी वेरीफाई", url: "https://www.bbc.com/news/bbcverify", description: "BBC verification and forensic journalism.", descriptionHi: "BBC का सत्यापन और फोरेंसिक पत्रकारिता।" },
  { name: "PTI Fact Check Website", nameHi: "पीटीआई फैक्ट चेक वेबसाइट", url: "https://www.ptinews.com/fact-check", description: "Fact-check initiative by the Press Trust of India.", descriptionHi: "प्रेस ट्रस्ट ऑफ इंडिया (PTI) की तथ्य-जांच पहल।" },
  { name: "NewsChecker", nameHi: "न्यूज़चेकर", url: "https://newschecker.in/", description: "Dedicated to fact-checking and debunking misinformation.", descriptionHi: "गलत सूचनाओं का पर्दाफाश करने के लिए समर्पित।" },
  { name: "Originality.ai Fact Checker", nameHi: "Originality.ai फैक्ट चेकर", url: "https://originality.ai/automated-fact-checker", description: "Automated claim-checking tool.", descriptionHi: "स्वचालित दावे-जांच टूल।" }
];

function WebsiteLogo({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false);
  let logo = "";
  try {
    logo = `${new URL(url).origin}/favicon.ico`;
  } catch {}
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-2 shadow-2xs">
      {!failed && logo ? (
        <img src={logo} alt={`${label} logo`} className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <Globe2 className="h-4 w-4 text-[#167C5A]" />
      )}
    </div>
  );
}

export default function FactCheck() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { cmsConfig } = useApp();
  const navigate = useNavigate();
  const hi = lang === "hi";

  const [claimInput, setClaimInput] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  const sources = useMemo(() => {
    const configured = Array.isArray(cmsConfig?.factCheckSources) ? cmsConfig.factCheckSources : [];
    const merged = [...configured, ...DEFAULT_SOURCES];
    const seen = new Set<string>();
    return merged.filter((source: any) => {
      const url = String(source?.url || "").trim();
      const name = String(source?.name || "").toLowerCase();
      if (!url || seen.has(url)) return false;
      if (name.includes("google fact check") || url.includes("toolbox.google.com/factcheck")) return false;
      seen.add(url);
      return true;
    });
  }, [cmsConfig]);

  const filteredSources = useMemo(() => {
    if (!filterQuery.trim()) return sources;
    const q = filterQuery.toLowerCase().trim();
    return sources.filter(
      (s: any) => (s.name || "").toLowerCase().includes(q) || (s.nameHi || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q)
    );
  }, [sources, filterQuery]);

  return (
    <main className="min-h-full bg-transparent pb-28 text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-5 space-y-5">
        
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#14213D] p-5 sm:p-7 text-white shadow-md">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#167C5A]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">
                  {hi ? "सत्यापित सूचना" : "Verified Information"}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{hi ? "फैक्ट चेक हब" : "Fact Check Hub"}</h1>
              </div>
            </div>
            <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
              {hi
                ? "व्हाट्सएप, सोशल मीडिया और समाचारों पर फैलने वाले दावों, वायरल वीडियो और संदेशों की प्रामाणिकता जांचें।"
                : "Verify claims, viral messages and news items circulating on social media and messaging platforms."}
            </p>
          </div>
        </section>

        {/* 1. CHECK A CLAIM SECTION */}
        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 backdrop-blur-xs p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#D97706]">
            <HelpCircle className="h-4 w-4" />
            <h2 className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">
              {hi ? "1. दावों की जांच करें" : "1. CHECK A CLAIM"}
            </h2>
          </div>
          <p className="text-xs font-medium text-slate-600 leading-relaxed">
            {hi
              ? "किसी वायरल दावे, खबर या लिंक को यहां दर्ज करें और नीचे दिए गए आधिकारिक फैक्ट चेक एजेंसियों के जरिए उसकी पड़ताल करें:"
              : "Enter a viral claim, headline or news link below to guide your verification across trusted sources:"}
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={claimInput}
                onChange={(e) => {
                  setClaimInput(e.target.value);
                  setFilterQuery(e.target.value);
                }}
                placeholder={hi ? "दावा, समाचार या लिंक यहाँ दर्ज करें..." : "Paste claim, viral headline or link..."}
                className="w-full pl-3.5 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-[#14213D] placeholder:text-slate-400 focus:outline-none focus:border-[#D97706]"
              />
            </div>
            {claimInput && (
              <button
                onClick={() => {
                  setClaimInput("");
                  setFilterQuery("");
                }}
                className="px-3 py-2.5 bg-white border border-slate-200 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* 2. TRUSTED FACT-CHECK SOURCES SECTION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A] flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#167C5A]" />
              {hi ? "2. विश्वसनीय फैक्ट-चेक स्रोत" : "2. TRUSTED FACT-CHECK SOURCES"}
            </h2>
            <span className="text-xs font-bold text-slate-500">{filteredSources.length}</span>
          </div>

          <div className="space-y-2.5">
            {filteredSources.map((source: any) => (
              <button
                key={source.url}
                type="button"
                onClick={() => openExternalLink(source.url, navigate, hi ? source.nameHi : source.name)}
                className="group flex w-full items-center gap-3.5 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs transition hover:border-amber-300/80 hover:shadow-xs active:scale-[.99]"
              >
                <WebsiteLogo url={source.url} label={hi ? source.nameHi : source.name} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs font-bold text-[#14213D] group-hover:text-[#D97706] transition-colors">
                      {hi ? source.nameHi : source.name}
                    </h3>
                    <span className="text-[9px] font-bold bg-emerald-50 text-[#167C5A] border border-emerald-200/80 px-1.5 py-0.5 rounded uppercase">
                      Verified Source
                    </span>
                  </div>
                  <p className="mt-1 text-[11.5px] font-medium text-slate-500 line-clamp-2">{hi ? source.descriptionHi : source.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#14213D]" />
              </button>
            ))}
            {filteredSources.length === 0 && (
              <div className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-8 text-center text-xs font-medium text-slate-500">
                No fact check sources found matching your search.
              </div>
            )}
          </div>

          <p className="pt-2 text-center text-[11px] font-medium leading-relaxed text-slate-500">
            {hi
              ? "सभी स्रोत अपनी आधिकारिक वेबसाइट पर खुलेंगे ताकि उनके मूल लेख, आधिकारिक जांच और सुरक्षा की पुष्टि हो सके।"
              : "Sources open on their official websites so original articles, login, and security features operate correctly."}
          </p>
        </section>
      </div>
    </main>
  );
}
