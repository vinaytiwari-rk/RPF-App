import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { 
  Heart, 
  Search, 
  ExternalLink, 
  Globe, 
  Building2, 
  Pill, 
  Droplet, 
  ShieldCheck, 
  Baby, 
  Smile, 
  BookOpen, 
  Activity, 
  Stethoscope 
} from "lucide-react";
import { openExternalLink } from "../utils/browser";

type Lang = "en" | "hi";

const HEALTH_LINKS = [
  { name: "eRaktkosh", url: "https://eraktkosh.mohfw.gov.in/eraktkoshPortal/#/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Government blood availability and blood center locator portal." },
  { name: "WHO", url: "https://www.who.int/news", category: "Global Bodies", categoryHi: "वैश्विक संस्थाएं", desc: "World Health Organization news and updates." },
  { name: "NCDC India", url: "https://ncdc.gov.in/", category: "Global Bodies", categoryHi: "सरकारी संस्थाएं", desc: "National Centre for Disease Control (MoHFW India)." },
  { name: "NIH", url: "https://www.nih.gov/", category: "Global Bodies", categoryHi: "वैश्विक संस्थाएं", desc: "National Institutes of Health official website." },
  { name: "Know Drugs", url: "https://www.drugs.com/", category: "Reference & Tools", categoryHi: "संदर्भ और उपकरण", desc: "Prescription drug information and database." },
  { name: "DailyMed", url: "https://dailymed.nlm.nih.gov/dailymed/", category: "Reference & Tools", categoryHi: "संदर्भ और उपकरण", desc: "Official database of FDA drug labels." },
  { name: "Jan Aushadi Kendra", url: "https://janaushadhi.gov.in/near-by-kendra", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Locate nearby affordable generic medicine centers." },
  { name: "Ayushman Bharat", url: "https://beneficiary.nha.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "National health beneficiary portal." },
  { name: "ABHA ID", url: "https://abha.abdm.gov.in/abha/v3/register", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Register for Ayushman Bharat Health Account ID." },
  { name: "Ayush", url: "https://ayush.gov.in/schemes", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Ministry of AYUSH schemes and updates." },
  { name: "eSanjeevani", url: "https://esanjeevani.mohfw.gov.in/#/patient/signin", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "National telemedicine portal patient sign-in." },
  { name: "CGHS", url: "https://cghs.mohfw.gov.in/AHIMSG5/hissso/Login?slug=know-your-wc", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Central Government Health Scheme portal." },
  { name: "ECHS", url: "https://echs.sourceinfosys.com/", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Ex-Servicemen Contributory Health Scheme." },
  { name: "ESIC", url: "https://esic.gov.in/esishospital/esis-hospital-bhopal", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Employees' State Insurance Corporation Bhopal Hospital." },
  { name: "Ayushman Arogya Mandir", url: "https://aam.mohfw.gov.in/home/login", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Ayushman Arogya Mandir official login." },
  { name: "Ayusham Bharat Digital Mission", url: "https://abdm.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Official ABDM health ecosystem portal." },
  { name: "PradhanMantri Jan Arogya Yojna", url: "https://beneficiary.nha.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "PMJAY beneficiary lookup and scheme details." },
  { name: "IPHS", url: "https://iphs.mohfw.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Indian Public Health Standards." },
  { name: "IHIP", url: "https://ihip.mohfw.gov.in/#!/", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "Integrated Health Information Platform." },
  { name: "eHospita", url: "https://nextgen.ehospital.gov.in/login", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "NextGen eHospital patient & doctor login." },
  { name: "eCare", url: "https://ecare.mohfw.gov.in/", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Official eCare MoHFW dashboard." },
  { name: "eDantseva", url: "https://edantseva.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "National oral health portal." },
  { name: "U-Win", url: "https://uwinselfregistration.mohfw.gov.in/login", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "U-Win immunization self-registration." },
  { name: "SOCH", url: "https://sochnaco.mohfw.gov.in/login/#/login", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "Strategic Information Management System (NACO)." },
  { name: "SAKSHAT", url: "https://www.sashakt-hwc.mohfw.gov.in/home", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "Sashakt Health & Wellness Centers portal." },
  { name: "RCH", url: "https://rch.mohfw.gov.in/RCH/HomePage.aspx", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "Reproductive and Child Health portal." },
  { name: "NIKSAY", url: "https://communitysupport.nikshay.in/#", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "TB patient community support portal." },
  { name: "PMSSY", url: "https://www.pmssy-mohfw.nic.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Pradhan Mantri Swasthya Suraksha Yojana." },
  { name: "PMSMA", url: "https://pmsma.mohfw.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Pradhan Mantri Surakshit Matritva Abhiyan." },
  { name: "PMNDP", url: "https://pmndp.mohfw.gov.in/en", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Pradhan Mantri National Dialysis Portal." },
  { name: "Oxycare", url: "https://oxycare.gov.in/ocmis/oxycare.aspx", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Oxygen management information system." },
  { name: "CDSCO", url: "https://cdscoonline.gov.in/CDSCO/cdscoDrugs", category: "Global Bodies", categoryHi: "वैश्विक संस्थाएं", desc: "Central Drugs Standard Control Organization." },
  { name: "ART SURROGACY", url: "https://artsurrogacy.gov.in/", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "National ART & Surrogacy registry." },
  { name: "Tele MANAS", url: "https://telemanas.mohfw.gov.in/home", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Mental health helpline and support portal." },
  { name: "MoHFW Main Portal", url: "https://main.mohfw.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Ministry of Health & Family Welfare official portal." },
  { name: "TMC", url: "https://tmc.gov.in/abha", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Tata Memorial Centre ABHA integration." },
  { name: "MCC", url: "https://mcc.nic.in/", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "Medical Counselling Committee." },
  { name: "NMC", url: "https://www.nmc.org.in/", category: "Global Bodies", categoryHi: "वैश्विक संस्थाएं", desc: "National Medical Commission." },
  { name: "CIP", url: "https://cipranchi.nic.in/en", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Central Institute of Psychiatry Ranchi." },
  { name: "NACO", url: "https://www.naco.gov.in/", category: "Global Bodies", categoryHi: "वैश्विक संस्थाएं", desc: "National AIDS Control Organisation." },
  { name: "TB-Mukt Bharat", url: "https://mybharat.gov.in/yuva_register", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "TB-free India youth registration portal." },
  { name: "Co-WIN", url: "https://selfregistration.cowin.gov.in/", category: "Welfare & Services", categoryHi: "कल्याण और सेवाएं", desc: "Co-WIN vaccination registration." },
  { name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", category: "Research & Journals", categoryHi: "शोध और पत्रिकाएं", desc: "NIH database of biomedical literature." },
  { name: "DynaMed", url: "https://www.dynamed.com/", category: "Research & Journals", categoryHi: "शोध और पत्रिकाएं", desc: "Evidence-based clinical decision support tool." },
  { name: "JAMA", url: "https://jamanetwork.com/", category: "Research & Journals", categoryHi: "शोध और पत्रिकाएं", desc: "Journal of the American Medical Association." },
  { name: "NEJM", url: "https://www.nejm.org/", category: "Research & Journals", categoryHi: "शोध और पत्रिकाएं", desc: "New England Journal of Medicine." },
  { name: "AMA", url: "https://www.ama-assn.org/", category: "Research & Journals", categoryHi: "शोध और पत्रिकाएं", desc: "American Medical Association." },
  { name: "ClinicalTrails", url: "https://clinicaltrials.gov/", category: "Programs & Registries", categoryHi: "कार्यक्रम और रजिस्ट्रियां", desc: "Registry of clinical trials globally." },
  { name: "Zocdoc", url: "https://www.zocdoc.com/?dd_referrer=", category: "Reference & Tools", categoryHi: "संदर्भ और उपकरण", desc: "Find local doctors and book appointments." },
  { name: "OHSU", url: "https://www.ohsu.edu/", category: "Clinical & Hospitals", categoryHi: "क्लीनिकल और अस्पताल", desc: "Oregon Health & Science University." },
  { name: "Medlineplus", url: "https://medlineplus.gov/", category: "Reference & Tools", categoryHi: "संदर्भ और उपकरण", desc: "Trusted health information from the US National Library of Medicine." },
  { name: "Jivi AI", url: "https://www.jivi.ai/", category: "Reference & Tools", categoryHi: "संदर्भ और उपकरण", desc: "AI-driven medical assistant and diagnostics portal." }
];

function WebsiteLogo({ url, label }: { url: string; label: string }) {
  const [failed, setFailed] = useState(false);
  let logo = "";
  try {
    logo = `${new URL(url).origin}/favicon.ico`;
  } catch {}
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {!failed && logo ? (
        <img src={logo} alt={`${label} logo`} className="h-full w-full object-contain" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <Globe className="h-5 w-5 text-teal-700" />
      )}
    </div>
  );
}

export default function HealthCare() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    HEALTH_LINKS.forEach(link => set.add(hi ? link.categoryHi : link.category));
    return ["All", ...Array.from(set)];
  }, [hi]);

  const filteredLinks = useMemo(() => {
    return HEALTH_LINKS.filter(link => {
      const categoryMatch = activeTab === "All" || (hi ? link.categoryHi : link.category) === activeTab;
      const searchMatch = !search.trim() || 
        link.name.toLowerCase().includes(search.toLowerCase()) || 
        (hi ? link.categoryHi : link.category).toLowerCase().includes(search.toLowerCase()) ||
        link.desc.toLowerCase().includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeTab, search, hi]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-fadeIn font-sans pb-28">
      {/* Header Area */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 pt-6 pb-6 px-5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl text-white tracking-wide">
              {hi ? "स्वास्थ्य सेवा" : "Health Care"}
            </h2>
            <p className="text-xs text-teal-100 mt-0.5 font-bold">
              {hi ? "कल्याणकारी योजनाएं, अस्पताल, निदान और चिकित्सा संसाधन" : "Welfare schemes, hospitals, diagnostics & clinical resources"}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-450" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={hi ? "पोर्टल या संसाधन खोजें..." : "Search portals or resources..."}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs outline-none focus:border-teal-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-white border-b border-slate-200 sticky top-0 z-10 shadow-3xs overflow-x-auto no-scrollbar justify-start px-3 gap-2 py-2.5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`py-1.5 px-4 rounded-full text-[10px] uppercase tracking-wider font-extrabold text-center transition shrink-0 ${
              activeTab === cat 
                ? "bg-teal-700 text-white shadow-2xs" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat === "All" ? (hi ? "सभी" : "All") : cat}
          </button>
        ))}
      </div>

      {/* Links Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-16 text-slate-500 font-bold text-xs">
            {hi ? "कोई परिणाम नहीं मिला" : "No resources found"}
          </div>
        ) : (
          filteredLinks.map((link) => (
            <button
              key={link.url}
              type="button"
              onClick={() => openExternalLink(link.url, navigate, link.name)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4.5 text-left transition hover:border-teal-300 hover:shadow-2xs active:scale-[.99] cursor-pointer"
            >
              <WebsiteLogo url={link.url} label={link.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black text-slate-800 truncate">{link.name}</h2>
                  <span className="text-[8.5px] font-black uppercase text-teal-650 tracking-wider bg-teal-50/50 px-1.5 py-0.5 rounded border border-teal-150/40 shrink-0">
                    {hi ? link.categoryHi : link.category}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">
                  {link.desc}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
            </button>
          ))
        )}

        <p className="mt-6 text-center text-[10px] leading-5 text-slate-400 max-w-md mx-auto">
          {hi
            ? "स्रोत अपनी आधिकारिक वेबसाइट पर खुलेंगे ताकि उनके मूल लेख, लॉगिन, कुकी और सुरक्षा सुविधाएँ सही रहें।"
            : "Sources open on their official websites so their original articles, login, cookies and security features work correctly."}
        </p>
      </div>
    </div>
  );
}
