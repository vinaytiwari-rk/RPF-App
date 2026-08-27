import React, { useState } from "react";
import { BookOpen, ExternalLink, Globe2, ShieldAlert } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

type Lang = "en" | "hi";

const DIRECTORIES = [
  {
    name: "Contact Directory",
    nameHi: "संपर्क निर्देशिका",
    url: "https://www.india.gov.in/directory/contact-directory",
    description: "Search for important government contacts and officials.",
    descriptionHi: "महत्वपूर्ण सरकारी संपर्कों और अधिकारियों की खोज करें।",
  },
  {
    name: "Web Directory",
    nameHi: "वेब निर्देशिका",
    url: "https://www.india.gov.in/directory/web-directory",
    description: "Explore official websites of various government departments.",
    descriptionHi: "विभिन्न सरकारी विभागों की आधिकारिक वेबसाइटों का अन्वेषण करें।",
  },
  {
    name: "Public Utilities",
    nameHi: "सार्वजनिक उपयोगिताएँ",
    url: "https://www.india.gov.in/directory/public-utilities",
    description: "Find public utilities and services near you.",
    descriptionHi: "अपने आस-पास सार्वजनिक उपयोगिताएँ और सेवाएँ खोजें।",
  },
  {
    name: "Helpline",
    nameHi: "हेल्पलाइन",
    url: "https://www.india.gov.in/directory/helpline",
    description: "National emergency and public service helpline numbers.",
    descriptionHi: "राष्ट्रीय आपातकालीन और सार्वजनिक सेवा हेल्पलाइन नंबर।",
  },
];

function SiteIcon({ url, label }: { url: string; label: string }) {
  const [bad, setBad] = useState(false);
  let icon = "";
  try {
    icon = `${new URL(url).origin}/favicon.ico`;
  } catch {}

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {!bad && icon ? (
        <img
          src={icon}
          alt={`${label} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setBad(true)}
        />
      ) : (
        <Globe2 className="h-5 w-5 text-blue-700" />
      )}
    </div>
  );
}

export default function Directory() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  return (
    <main className="min-h-full bg-transparent pb-10 text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6 sm:py-5 space-y-4">
        
        {/* Top Header Card */}
        <section className="relative overflow-hidden rounded-[24px] bg-[#14213D] p-5 sm:p-7 text-white shadow-md">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">
              <BookOpen className="h-4 w-4" />
              {isHi ? "राष्ट्रीय निर्देशिका" : "National Directory"}
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {isHi ? "सरकारी निर्देशिका" : "Government Directory"}
            </h1>
            <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-slate-200 font-medium">
              {isHi
                ? "भारत सरकार की आधिकारिक निर्देशिकाओं तक पहुँचें। संपर्क, वेब लिंक, उपयोगिताएँ और हेल्पलाइन सब एक ही जगह।"
                : "Access official directories of the Government of India. Contacts, web links, utilities, and helplines all in one place."}
            </p>
          </div>
        </section>

        {/* Verification Notice Banner */}
        <div className="flex items-center gap-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 px-4 py-3 text-xs text-[#14213D] font-semibold backdrop-blur-xs shadow-2xs">
          <ShieldAlert className="w-4 h-4 shrink-0 text-[#D97706]" />
          <span>
            {isHi
              ? "आधिकारिक स्रोत से सत्यापन करें — सभी सरकारी पोर्टल्स (.gov.in) सीधे उनके मूल सर्वर से लोड होते हैं।"
              : "Verify from Official Source — All government portals (.gov.in) open directly on official servers."}
          </span>
        </div>

        {/* Directory Grid */}
        <section className="grid gap-3 sm:grid-cols-2">
          {DIRECTORIES.map((dir) => (
            <button
              key={dir.url}
              type="button"
              onClick={() => openExternalLink(dir.url, navigate)}
              className="group flex w-full items-center gap-3.5 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs transition hover:border-amber-300/80 hover:shadow-xs active:scale-[.99]"
            >
              <SiteIcon url={dir.url} label={isHi ? dir.nameHi : dir.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-[14px] font-bold text-[#14213D] group-hover:text-[#D97706] transition-colors">
                    {isHi ? dir.nameHi : dir.name}
                  </h2>
                  <span className="text-[9px] font-bold bg-emerald-50 text-[#167C5A] px-1.5 py-0.5 rounded border border-emerald-200/80 uppercase">
                    {isHi ? "सत्यापित" : "Official"}
                  </span>
                </div>
                <p className="mt-0.5 text-[11.5px] font-medium text-slate-500 line-clamp-2">
                  {isHi ? dir.descriptionHi : dir.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#14213D] transition-colors" />
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
