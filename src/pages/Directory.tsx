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
    <main className="min-h-full bg-[#fbf8f2] pb-10">
      <div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5 space-y-4">
        
        {/* Top Header Card */}
        <section className="relative overflow-hidden rounded-[26px] border border-blue-200/70 bg-gradient-to-br from-[#eff6ff] via-white to-blue-50 p-5 shadow-sm sm:p-7">
          <div className="relative">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.2em] text-blue-800">
              <BookOpen className="h-4 w-4" />
              {isHi ? "राष्ट्रीय निर्देशिका" : "National Directory"}
            </div>
            <h1 className="mt-2 text-[27px] font-black tracking-tight text-slate-900 sm:text-4xl">
              {isHi ? "सरकारी निर्देशिका" : "Government Directory"}
            </h1>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600">
              {isHi
                ? "भारत सरकार की आधिकारिक निर्देशिकाओं तक पहुँचें। संपर्क, वेब लिंक, उपयोगिताएँ और हेल्पलाइन सब एक ही जगह।"
                : "Access official directories of the Government of India. Contacts, web links, utilities, and helplines all in one place."}
            </p>
          </div>
        </section>

        {/* Verification Notice Banner */}
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
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
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]"
            >
              <SiteIcon url={dir.url} label={isHi ? dir.nameHi : dir.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[13px] font-black leading-tight text-slate-900">
                    {isHi ? dir.nameHi : dir.name}
                  </h2>
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    {isHi ? "सत्यापित" : "Official"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-500">
                  {isHi ? dir.descriptionHi : dir.description}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}
