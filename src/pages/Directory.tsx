import React from "react";
import { BookOpen, ExternalLink, PhoneCall, Globe, LayoutList, Building2 } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

const DIRECTORIES = [
  { 
    name: "Contact Directory", 
    nameHi: "संपर्क निर्देशिका",
    url: "https://www.india.gov.in/directory/contact-directory", 
    description: "Search for important government contacts and officials.",
    descriptionHi: "महत्वपूर्ण सरकारी संपर्कों और अधिकारियों की खोज करें।",
    Icon: PhoneCall
  },
  { 
    name: "Web Directory", 
    nameHi: "वेब निर्देशिका",
    url: "https://www.india.gov.in/directory/web-directory", 
    description: "Explore official websites of various government departments.",
    descriptionHi: "विभिन्न सरकारी विभागों की आधिकारिक वेबसाइटों का अन्वेषण करें।",
    Icon: Globe
  },
  { 
    name: "Public Utilities", 
    nameHi: "सार्वजनिक उपयोगिताएँ",
    url: "https://www.india.gov.in/directory/public-utilities", 
    description: "Find public utilities and services near you.",
    descriptionHi: "अपने आस-पास सार्वजनिक उपयोगिताएँ और सेवाएँ खोजें।",
    Icon: Building2
  },
  { 
    name: "Helpline", 
    nameHi: "हेल्पलाइन",
    url: "https://www.india.gov.in/directory/helpline", 
    description: "National emergency and public service helpline numbers.",
    descriptionHi: "राष्ट्रीय आपातकालीन और सार्वजनिक सेवा हेल्पलाइन नंबर।",
    Icon: LayoutList
  }
];

export default function Directory() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const isHi = lang === "hi";

  return (
    <main className="min-h-full bg-[#fbf8f2] pb-10">
      <div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5">
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

        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          {DIRECTORIES.map(dir => {
            const Icon = dir.Icon;
            return (
              <button 
                key={dir.url} 
                type="button" 
                onClick={() => navigate(`/browser?url=${encodeURIComponent(dir.url)}`)} 
                className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[13px] font-black leading-tight text-slate-900">{isHi ? dir.nameHi : dir.name}</h2>
                  <p className="mt-1 text-[11px] font-medium text-slate-500">{isHi ? dir.descriptionHi : dir.description}</p>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            );
          })}
        </section>
      </div>
    </main>
  );
}
