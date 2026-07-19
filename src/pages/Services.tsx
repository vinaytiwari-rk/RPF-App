import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Heart,
  Activity,
  AlertTriangle,
  QrCode,
  Users,
  Shield,
  HandHelping,
  Info,
  Compass,
  CheckCircle,
  MapPin,
  Upload,
  Download,
  ArrowLeft,
  Search,
  Share2,
  Phone,
  Globe,
  Mail,
  Eye,
  Sparkles,
  BookOpen,
  GraduationCap,
  Scale,
  FileText,
  Trees,
  Landmark,
  Dumbbell,
  AlertCircle,
  Mic,
  MicOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
// import { supabase } from "../lib/supabaseClient";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Feature {
  title: string;
  desc: string;
  type: "action" | "form" | "info" | "chat" | "map" | "list";
}

interface ServiceItem {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: "urgent" | "involved" | "welfare" | "empowerment" | "civic";
  template: "ActionFormTemplate" | "TicketingTemplate" | "ContentFeedTemplate";
  features: Feature[];
}

/* ─────────────────────────────────────────────
   Geolocation helper — falls back to Bhopal centre if denied
───────────────────────────────────────────── */
const BHOPAL_DEFAULT = { latitude: 23.2599, longitude: 77.4126 };

async function getSafePosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(BHOPAL_DEFAULT);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(BHOPAL_DEFAULT),
      { timeout: 5000 }
    );
  });
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Services() {
  /* ── context & global state ── */
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { user } = useAuth();
  const { settings, cmsConfig } = useApp();
  const isHi = lang === "hi";

  /* ── nav ── */
  const [selected, setSelected] = useState<ServiceItem | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [compactView, setCompactView] = useState(false);

  /* ── Google Search fallback state ── */
  const [webResults, setWebResults] = useState<{title:string;link:string;snippet:string;displayLink:string}[]>([]);
  const [webLoading, setWebLoading] = useState(false);

  /* ── Sub-search inside selected services ── */
  const [subSearch, setSubSearch] = useState("");
  const [subWebResults, setSubWebResults] = useState<{title:string;link:string;snippet:string;displayLink:string}[]>([]);
  const [subWebLoading, setSubWebLoading] = useState(false);

  useEffect(() => {
    setSubSearch("");
    setSubWebResults([]);
    setSubWebLoading(false);
  }, [selected]);

  useEffect(() => {
    if (!subSearch.trim() || !selected) {
      setSubWebResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSubWebLoading(true);
      try {
        const queryTerm = `${selected.titleEn} ${subSearch}`;
        const res = await fetch(
          `/api/search/external?query=${encodeURIComponent(queryTerm)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const data = await res.json();
          setSubWebResults(data.results ?? []);
        }
      } catch {
        setSubWebResults([]);
      } finally {
        setSubWebLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [subSearch, selected]);

  /* ── form state ── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");

  /* ── donate ── */
  const [donateAmount, setDonateAmount] = useState("500");
  const [customAmount, setCustomAmount] = useState("");
  const [monthlyRepeat, setMonthlyRepeat] = useState(false);

  /* ── blood ── */
  const [subType, setSubType] = useState<"request" | "donor">("request");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [donorName, setDonorName] = useState("");
  const [donorAge, setDonorAge] = useState("");

  /* ── jan seva / generic ── */
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [aadhaar, setAadhaar] = useState(""); // raw input, masked before DB write
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [locationText, setLocationText] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Civic Support");

  /* ── voice ── */
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  /* ─────────────────────────────────────
     Voice input (webkitSpeechRecognition)
  ───────────────────────────────────── */
  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = isHi ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setDetails((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoice = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  /* ─────────────────────────────────────
     Mock upload progress
  ───────────────────────────────────── */
  const triggerUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,application/pdf";
    input.onchange = async (event: any) => {
      const file = event.target?.files?.[0];
      if (!file) return;
      
      setUploadPct(10);
      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const fakeProgress = setInterval(() => {
          setUploadPct((prev) => {
            if (prev === null || prev >= 90) {
              clearInterval(fakeProgress);
              return prev;
            }
            return prev + 10;
          });
        }, 100);
        
        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData
        });
        
        clearInterval(fakeProgress);
        if (!response.ok) throw new Error("Upload failed");
        
        const data = await response.json();
        setUploadPct(100);
        setUploadDone(true);
        setUploadedFileUrl(data.url);
      } catch (err) {
        console.error("Document upload failed:", err);
        alert("File upload failed. Please try again.");
        setUploadPct(null);
        setUploadDone(false);
      }
    };
    input.click();
  };

  /* ─────────────────────────────────────
     Reset on service change
  ───────────────────────────────────── */
  const openService = (svc: ServiceItem) => {
    setSelected(svc);
    setIsSuccess(false);
    setUploadDone(false);
    setUploadPct(null);
    setUploadedFileUrl("");
    setFullName(""); setDob(""); setAadhaar(""); setEmail(""); setDetails("");
    setCustomAmount(""); setMonthlyRepeat(false); setLocationText("");
    setDonateAmount("500"); setBloodGroup("O+"); setDonorName(""); setDonorAge("");
    setSubType("request"); setTicketCategory("Civic Support");
  };

  /* ─────────────────────────────────────
     Form submit → Firestore
  ───────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setIsSubmitting(true);

    try {
      const pos = await getSafePosition();
      let payload: Record<string, any> = {};

      if (selected.template === "ActionFormTemplate") {
        if (selected.id === "donate") {
          payload = {
            amount: donateAmount === "Other" ? customAmount : donateAmount,
            monthlyRepeat,
          };
        } else if (selected.id === "jan_seva") {
          payload = {
            fullName,
            dob,
            // ── Aadhaar compliance masking ──
            aadhaar: "[Aadhaar Redacted for Privacy]",
            documentUploaded: uploadDone,
          };
        } else {
          payload = { fullName, email, details };
        }
      } else if (selected.template === "TicketingTemplate") {
        if (selected.id === "blood" && subType === "donor") {
          payload = { type: "blood_donor", donorName, donorAge, bloodGroup };
        } else {
          payload = {
            type: "incident_report",
            category: selected.id === "blood" ? bloodGroup : ticketCategory,
            location: locationText || "Bhopal",
            details,
          };
        }
      } else {
        payload = { details };
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? "guest",
          citizenName: user?.name ?? fullName ?? donorName ?? "Anonymous",
          citizenPhone: user?.phone ?? "",
          serviceName: selected.titleEn,
          submissionData: JSON.stringify({
            ...payload,
            uploadedFileUrl, // save the live file URL from local storage
            serviceId: selected.id,
            serviceNameEn: selected.titleEn,
            serviceNameHi: selected.titleHi,
            latitude: pos.latitude,
            longitude: pos.longitude
          }),
          status: "pending",
          timestamp: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error("Failed to submit welfare application");

      setIsSuccess(true);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────────────────────────────
     21 Services configuration
  ───────────────────────────────────── */
  const services: ServiceItem[] = [
    /* ── URGENT ── */
    {
      id: "donate", titleEn: "Donate Now", titleHi: "दान सहायता",
      descEn: "Support causes & donate securely", descHi: "सुरक्षित रूप से दान करें",
      icon: Heart, color: "text-red-600 bg-red-50 border-red-200", category: "urgent",
      template: "ActionFormTemplate",
      features: [
        { title: isHi ? "सहयोग राशि चयन" : "Quick-tier Amount Selector", desc: "₹500, ₹1000, ₹5000 or custom.", type: "action" },
        { title: isHi ? "80G टैक्स सर्टिफिकेट" : "80G Tax Certificate", desc: "Auto-generate and download PDF.", type: "form" },
        { title: isHi ? "मासिक दान टॉगल" : "Recurring Donation Toggle", desc: "Automated monthly subscription.", type: "action" },
      ],
    },
    {
      id: "blood", titleEn: "Blood Network", titleHi: "रक्त नेटवर्क",
      descEn: "Request or donate blood instantly", descHi: "तुरंत रक्त अनुरोध या रक्तदान करें",
      icon: Activity, color: "text-red-700 bg-rose-50 border-rose-200", category: "urgent",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "आपातकालीन रक्त अनुरोध" : "Emergency Blood Broadcast", desc: "Post group, hospital & units needed.", type: "form" },
        { title: isHi ? "रक्तदाता पंजीकरण" : "Donor Registry", desc: "Submit blood type & last donation date.", type: "form" },
        { title: isHi ? "रक्त बैंक लाइव मैप" : "Live Blood Bank Map", desc: "Locate nearby banks and donors.", type: "map" },
      ],
    },
    {
      id: "complaint", titleEn: "File Grievance", titleHi: "शिकायत पंजीकरण",
      descEn: "Register your civic grievance", descHi: "शिकायत दर्ज करें",
      icon: AlertTriangle, color: "text-amber-600 bg-amber-50 border-amber-200", category: "urgent",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "शिकायत विवरण" : "Multi-category Description", desc: "Text & audio note attachments.", type: "form" },
        { title: isHi ? "प्रमाण अपलोड" : "Evidence Uploader", desc: "Upload photos of civic issue.", type: "action" },
        { title: isHi ? "GPS ट्रैकर" : "GPS Tag & Tracker", desc: "Auto-capture location, track ticket.", type: "map" },
      ],
    },
    {
      id: "disaster", titleEn: "Disaster Management", titleHi: "आपदा प्रबंधन",
      descEn: "Emergency relief & rescue mapping", descHi: "आपातकालीन राहत एवं बचाव",
      icon: AlertCircle, color: "text-rose-600 bg-rose-50 border-rose-200", category: "urgent",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "SOS अलर्ट" : "One-tap SOS Alert", desc: "Broadcast GPS to nearby rescue teams.", type: "action" },
        { title: isHi ? "सुरक्षित चेक-इन" : "Mark Yourself Safe", desc: "Status board for family tracking.", type: "list" },
        { title: isHi ? "जियो-बाधा अलर्ट" : "Geo-fenced Alerts", desc: "Live disaster warnings and shelters.", type: "info" },
      ],
    },
    /* ── INVOLVED ── */
    {
      id: "jan_seva", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड",
      descEn: "Apply for digital Jan Seva identity pass", descHi: "जन सेवा कार्ड के लिए आवेदन करें",
      icon: QrCode, color: "text-blue-700 bg-blue-50 border-blue-200", category: "involved",
      template: "ActionFormTemplate",
      features: [
        { title: isHi ? "डिजिटल KYC" : "Multi-step Digital KYC", desc: "Fill name, DOB, upload ID docs.", type: "form" },
        { title: isHi ? "QR पास" : "Instant QR Pass", desc: "Download secure digital pass.", type: "action" },
        { title: isHi ? "लाभ डैशबोर्ड" : "Benefit Dashboard", desc: "Local discounts & subsidies.", type: "list" },
      ],
    },
    {
      id: "volunteer", titleEn: "Volunteer Opportunities", titleHi: "स्वयंसेवक अवसर",
      descEn: "Join social initiatives & log hours", descHi: "स्वयंसेवक बनें और बदलाव लाएं",
      icon: Users, color: "text-purple-600 bg-purple-50 border-purple-200", category: "involved",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "कौशल फ़िल्टर" : "Skill-based Matching", desc: "Teaching, IT, Fieldwork etc.", type: "list" },
        { title: isHi ? "इवेंट कैलेंडर" : "Event Calendar Signup", desc: "Weekend drives & food camps.", type: "action" },
        { title: isHi ? "घंटे लॉगर" : "Hours Logger", desc: "Log volunteer hours, download certificates.", type: "form" },
      ],
    },
    /* ── WELFARE ── */
    {
      id: "women", titleEn: "Women Support", titleHi: "महिला सहायता",
      descEn: "Safe-house registries & counseling", descHi: "महिलाओं के लिए सुरक्षा और कल्याण",
      icon: Shield, color: "text-pink-600 bg-pink-50 border-pink-200", category: "welfare",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "24/7 सुरक्षित चैट" : "Encrypted Counseling Chat", desc: "Private helpline with expert aids.", type: "chat" },
        { title: isHi ? "पैनिक बटन" : "Hidden Panic Exit", desc: "Instantly clears cache, returns to home.", type: "action" },
        { title: isHi ? "आश्रय निर्देशिका" : "Safe Houses Directory", desc: "Map of immediate shelter spots.", type: "map" },
      ],
    },
    {
      id: "seniors", titleEn: "Senior Citizens", titleHi: "वरिष्ठ नागरिक",
      descEn: "Doorstep checkups & elder care", descHi: "वरिष्ठ नागरिकों के लिए सहायता",
      icon: HandHelping, color: "text-orange-600 bg-orange-50 border-orange-200", category: "welfare",
      template: "ActionFormTemplate",
      features: [
        { title: isHi ? "घर बैठे डॉक्टर" : "Doorstep Medical Scheduler", desc: "Book diagnostics at home.", type: "form" },
        { title: isHi ? "दवा अलार्म" : "Medication Alerts", desc: "Customized reminder board.", type: "list" },
        { title: isHi ? "डिजिटल साक्षरता" : "Digital Literacy", desc: "Weekly mobile/internet training.", type: "action" },
      ],
    },
    {
      id: "children", titleEn: "Children Welfare", titleHi: "बाल कल्याण",
      descEn: "Scholarships & abuse reporting", descHi: "बाल पोषण एवं सहायता",
      icon: Info, color: "text-amber-500 bg-amber-50 border-amber-100", category: "welfare",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "अनाम रिपोर्ट" : "Anonymous Abuse Reporter", desc: "Securely report child abuse.", type: "form" },
        { title: isHi ? "दत्तक गाइड" : "Adoption Guide", desc: "Counselor booking & document flow.", type: "list" },
        { title: isHi ? "छात्रवृत्ति ट्रैकर" : "Scholarship Tracker", desc: "Real-time academic grant updates.", type: "list" },
      ],
    },
    {
      id: "animals", titleEn: "Animal Welfare", titleHi: "पशु कल्याण",
      descEn: "Stray rescue & adoption registry", descHi: "बेसहारा पशुओं की सहायता",
      icon: Compass, color: "text-emerald-700 bg-emerald-50 border-emerald-200", category: "welfare",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "घायल पशु रिपोर्ट" : "Stray Distress Reporter", desc: "Photo + location for rescue teams.", type: "form" },
        { title: isHi ? "गोद लेने की सूची" : "Adoption Catalog", desc: "Browse shelter stray profiles.", type: "list" },
        { title: isHi ? "चारा वितरण हब" : "Feeding Volunteer Registry", desc: "Match feeders with coordinates.", type: "map" },
      ],
    },
    {
      id: "farmer", titleEn: "Farmer Support", titleHi: "किसान सहयोग",
      descEn: "Crop diagnostic & market pricing", descHi: "कृषि सहायता और प्रशिक्षण",
      icon: Compass, color: "text-green-700 bg-green-50 border-green-200", category: "welfare",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "मंडी रेट्स" : "Local APMC Mandi Rates", desc: "Live prices for local crops.", type: "list" },
        { title: isHi ? "फसल रोग निदान" : "Crop Disease Diagnostics", desc: "Upload image for expert analysis.", type: "form" },
        { title: isHi ? "मौसम सलाह" : "Agrarian Weather Advisory", desc: "Soil-based localized updates.", type: "info" },
      ],
    },
    {
      id: "youth", titleEn: "Youth Support", titleHi: "युवा विकास",
      descEn: "Career counseling & test prep", descHi: "युवा नेतृत्व एवं रोजगार",
      icon: Users, color: "text-indigo-600 bg-indigo-50 border-indigo-200", category: "welfare",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "करियर काउंसलिंग" : "Career Counseling Matrix", desc: "Book 1-on-1 virtual mentoring.", type: "action" },
        { title: isHi ? "परीक्षा पोर्टल" : "Exams Prep Portal", desc: "Free syllabus & mock papers.", type: "list" },
        { title: isHi ? "मानसिक स्वास्थ्य फोरम" : "Peer Support Forum", desc: "Anonymous sharing dashboard.", type: "chat" },
      ],
    },
    /* ── EMPOWERMENT ── */
    {
      id: "education", titleEn: "Education Support", titleHi: "शिक्षा सहयोग",
      descEn: "Free textbooks & scholarship portals", descHi: "छात्रवृत्ति और पुस्तक सहायता",
      icon: BookOpen, color: "text-blue-600 bg-blue-50 border-blue-200", category: "empowerment",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "डिजिटल पुस्तकालय" : "Digital Textbook Library", desc: "Download NCERT guides & video lessons.", type: "list" },
        { title: isHi ? "छात्रवृत्ति प्रविष्टि" : "BPL Scholarship Entry", desc: "Apply for private center sponsorships.", type: "form" },
        { title: isHi ? "अध्ययन केंद्र खोजक" : "Literacy Map Finder", desc: "Locate nearest study groups.", type: "map" },
      ],
    },
    {
      id: "health", titleEn: "Health Services", titleHi: "स्वास्थ्य सेवाएं",
      descEn: "Clinic appointment & medicine", descHi: "स्वास्थ्य शिविर और चिकित्सा",
      icon: Heart, color: "text-green-600 bg-emerald-50 border-emerald-200", category: "empowerment",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "टेलीकंसल्टेशन" : "Teleconsultation Scheduler", desc: "Book at RP Seva centers.", type: "form" },
        { title: isHi ? "दवा खोजक" : "Medicine Finder", desc: "Generic medicine availability.", type: "list" },
        { title: isHi ? "स्वास्थ्य संकेतक" : "Health Metrics Checker", desc: "BMI and wellness tracker.", type: "form" },
      ],
    },
    {
      id: "skills", titleEn: "Skills Training", titleHi: "कौशल प्रशिक्षण",
      descEn: "Tailoring, coding & mechanical courses", descHi: "निशुल्क प्रशिक्षण कोर्स",
      icon: GraduationCap, color: "text-purple-700 bg-purple-50 border-purple-200", category: "empowerment",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "वीडियो क्लास" : "VOD Certification Courses", desc: "Tailoring, repairs, coding videos.", type: "list" },
        { title: isHi ? "ऑनलाइन परीक्षा" : "Automated Testing Hub", desc: "Submit tests & download certificates.", type: "action" },
        { title: isHi ? "जॉब वैकेंसी" : "Job Vacancy Board", desc: "Recruitment links for trainees.", type: "list" },
      ],
    },
    {
      id: "schemes", titleEn: "Government Schemes", titleHi: "सरकारी योजनाएं",
      descEn: "Eligibility calculator & guides", descHi: "आधार, राशन एवं PM आवास सहायता",
      icon: Info, color: "text-teal-700 bg-teal-50 border-teal-200", category: "empowerment",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "पात्रता कैलकुलेटर" : "Scheme Eligibility Calculator", desc: "Ayushman, PMAY eligibility check.", type: "form" },
        { title: isHi ? "आवेदन निर्देशिका" : "How-To Breakdown", desc: "Document checklist for govt aid.", type: "list" },
        { title: isHi ? "डाउनलोड हब" : "Direct PDF Download Hub", desc: "Official registration forms archive.", type: "action" },
      ],
    },
    /* ── CIVIC ── */
    {
      id: "human_rights", titleEn: "Human Rights", titleHi: "मानवाधिकार",
      descEn: "Legal aid registry & rights guide", descHi: "कानूनी जागरूकता हेल्पलाइन",
      icon: Scale, color: "text-blue-700 bg-blue-50 border-blue-200", category: "civic",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "निःशुल्क कानूनी सहायता" : "Legal Aid Application", desc: "Apply for wage theft or abuse cases.", type: "form" },
        { title: isHi ? "अधिकार ऑडियो गाइड" : "Multilingual Rights Guide", desc: "Know your constitutional guarantees.", type: "list" },
        { title: isHi ? "डिजिटल याचिका" : "Petition Forum", desc: "Sign collective civic letters.", type: "action" },
      ],
    },
    {
      id: "consumer", titleEn: "Consumer Protection", titleHi: "उपभोक्ता संरक्षण",
      descEn: "Billing frauds & barcode checks", descHi: "उपभोक्ता शिकायत निवारण",
      icon: FileText, color: "text-amber-700 bg-amber-50 border-amber-200", category: "civic",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "शिकायत पत्र जनरेटर" : "Court File Generator", desc: "Auto-compile consumer court docs.", type: "form" },
        { title: isHi ? "बारकोड स्कैनर" : "Barcode Cert Scan", desc: "AI verifying product quality.", type: "action" },
        { title: isHi ? "धोखाधड़ी चेतावनी" : "Scam Alerts Board", desc: "Live local business fraud warnings.", type: "list" },
      ],
    },
    {
      id: "environment", titleEn: "Environment", titleHi: "पर्यावरण विकास",
      descEn: "Plantation drives & waste reporting", descHi: "वृक्षारोपण एवं हरित विकास",
      icon: Trees, color: "text-emerald-700 bg-emerald-50 border-emerald-200", category: "civic",
      template: "TicketingTemplate",
      features: [
        { title: isHi ? "वृक्षारोपण" : "Plantation Drive Signup", desc: "Register for seed planting events.", type: "action" },
        { title: isHi ? "कचरा रिपोर्ट" : "Waste Dump Reporter", desc: "Geo-tag illegal dump coordinates.", type: "form" },
        { title: isHi ? "कार्बन स्कोर" : "Footprint Questionnaire", desc: "Assess household carbon score.", type: "form" },
      ],
    },
    {
      id: "culture", titleEn: "Culture & Heritage", titleHi: "संस्कृति व धरोहर",
      descEn: "Walking tours & folk art archives", descHi: "धरोहर संरक्षण एवं राष्ट्रीय गौरव",
      icon: Landmark, color: "text-amber-800 bg-amber-50 border-amber-200", category: "civic",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "धरोहर टूर" : "Heritage Walking Tour", desc: "Book weekly historic site tours.", type: "form" },
        { title: isHi ? "लोक कला वृत्तचित्र" : "Folk Art Repository", desc: "Tribal art videos & profiles.", type: "list" },
        { title: isHi ? "कारीगर प्रदर्शनी" : "Artisan Exhibition App", desc: "Traditional creators apply for booths.", type: "action" },
      ],
    },
    {
      id: "fitness", titleEn: "Fitness & Sports", titleHi: "फिटनेस और खेल",
      descEn: "Open gym directories & tournaments", descHi: "सामुदायिक जिम एवं खेल प्रतियोगिता",
      icon: Dumbbell, color: "text-slate-700 bg-slate-50 border-slate-200", category: "civic",
      template: "ContentFeedTemplate",
      features: [
        { title: isHi ? "जिम खोजक" : "Free Open Gym Locator", desc: "Closest parks and playgrounds.", type: "map" },
        { title: isHi ? "टूर्नामेंट पंजीकरण" : "Tournament Signup", desc: "Register teams for local cups.", type: "form" },
        { title: isHi ? "वर्कआउट ट्रैकर" : "Daily Workout Tracker", desc: "Gender & age-based routine.", type: "list" },
      ],
    },
  ];

  /* ─────────────────────────────────────
     Filtering
  ───────────────────────────────────── */
  const categories = [
    { id: "all", en: "All Services", hi: "सभी सेवाएं" },
    { id: "urgent", en: "⚡ Urgent Core", hi: "⚡ महत्वपूर्ण" },
    { id: "involved", en: "🤝 Involved", hi: "🤝 जुड़ें" },
    { id: "welfare", en: "🫂 Welfare", hi: "🫂 कल्याण" },
    { id: "empowerment", en: "📚 Info", hi: "📚 सशक्तिकरण" },
    { id: "civic", en: "⚖️ Civic", hi: "⚖️ नागरिक" },
  ];

  const allServices = [
    ...services,
    ...(cmsConfig.customServices ?? [])
  ];

  const filtered = allServices.filter((s) => {
    const enabled = settings?.servicesStatus?.[s.id] !== false;
    const matchesCat = category === "all" || s.category === category;
    const matchesSearch =
      (s.titleEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (s.titleHi ?? "").toLowerCase().includes(search.toLowerCase());
    return enabled && matchesCat && matchesSearch;
  });

  /* Google Search fallback — fires on any search input query */
  useEffect(() => {
    if (!search.trim()) { setWebResults([]); return; }
    const timer = setTimeout(async () => {
      setWebLoading(true);
      try {
        const res = await fetch(
          `/api/search/external?query=${encodeURIComponent(search.trim())}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const data = await res.json();
          setWebResults(data.results ?? []);
        }
      } catch (err) {
        console.error("Web search fetch failed:", err);
        setWebResults([]);
      } finally {
        setWebLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);


  /* ─────────────────────────────────────
     Reusable features list
  ───────────────────────────────────── */
  const FeatureList = ({ features }: { features: Feature[] }) => (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <h6 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
        {isHi ? "सक्रिय विशेषताएं" : "Active Features"}
      </h6>
      <div className="space-y-2">
        {features.map((f, i) => (
          <div key={i} className="flex gap-2.5 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF9933] mt-1.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-slate-800">{f.title ?? ""}</p>
              <p className="text-[8px] text-slate-500 leading-tight">{f.desc ?? ""}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ─────────────────────────────────────
     Success state shared across templates
  ───────────────────────────────────── */
  const SuccessCard = ({ msg }: { msg: string }) => (
    <div className="text-center py-6 space-y-3">
      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-sm text-green-800">
        {isHi ? "सफलतापूर्वक सबमिट किया गया!" : "Submitted Successfully!"}
      </h4>
      <p className="text-[10px] text-slate-500 max-w-xs mx-auto">{msg}</p>
    </div>
  );

  /* ─────────────────────────────────────
     Voice mic button
  ───────────────────────────────────── */
  const VoiceButton = () => (
    <button
      type="button"
      onClick={isListening ? stopVoice : startVoice}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition ${
        isListening
          ? "bg-red-500 text-white border-red-500 animate-pulse"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {isListening ? (
        <><MicOff className="w-3 h-3" />{isHi ? "रोकें" : "Stop"}</>
      ) : (
        <><Mic className="w-3 h-3" />{isHi ? "बोलें" : "Voice Input"}</>
      )}
    </button>
  );

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <div className="p-5 flex-1 flex flex-col min-h-screen bg-slate-50/50 pb-24 relative overflow-hidden">

      {/* ── Decorative backdrop ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] opacity-[0.03] pointer-events-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#D4AF37]" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5l2 15 15-15-5 25 15-5-25 5 15 15-25-2 5 25-15-15-5 15-15-15-5 15-5-25-25 2 15-15-25-5 15-5-15-25 15 15z" />
        </svg>
      </div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4 relative z-10">
        {selected ? (
          <button
            onClick={() => { setSelected(null); setIsSuccess(false); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            {isHi ? "वापस" : "Back"}
          </button>
        ) : (
          <div>
            <h3 className="font-display font-extrabold text-base text-[#000080] flex items-center gap-1">
              {isHi ? "आरपी नागरिक सेवा संगम" : "RP Civic Services Hub"}
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <p className="text-[10px] text-slate-500 font-bold">
              {isHi ? "21 जनकल्याण सेवाएं • एक संकल्प" : "21 Active Welfare Services • Single Platform"}
            </p>
          </div>
        )}
        <button
          onClick={() => setCompactView((g) => !g)}
          className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition-all ${
            compactView ? "bg-purple-600 text-white animate-pulse" : "bg-slate-200 text-slate-700"
          }`}
        >
          🌌 {isHi ? "कॉम्पैक्ट" : "Compact"}
        </button>
      </div>

      {/* ══════════════════════════════════════
          SERVICE DETAIL VIEW
      ══════════════════════════════════════ */}
      {selected ? (
        <div className="flex-1 flex flex-col space-y-4 relative z-10">
          {/* Service title banner */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected.color} shadow-inner shrink-0`}>
                {React.createElement(selected.icon, { className: "w-5 h-5" })}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#000080]">
                  {isHi ? selected.titleHi : selected.titleEn}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {isHi ? selected.descHi : selected.descEn}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Template A: ActionFormTemplate ─── */}
          {selected.template === "ActionFormTemplate" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
              <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b pb-1.5">
                {isHi ? "सेवा आवेदन मॉड्यूल" : "Service Intake & Transaction Wizard"}
              </h5>

              {isSuccess ? (
                <>
                  <SuccessCard msg={isHi ? "आपका डिजिटल प्रमाणपत्र तैयार है।" : "Your digital certificate has been generated."} />
                  <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#000080] text-white rounded-xl text-xs font-bold shadow-md">
                    <Download className="w-4 h-4" />
                    {isHi ? "सर्टिफिकेट डाउनलोड करें" : "Download PDF Certificate"}
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Donate */}
                  {selected.id === "donate" && (
                    <>
                      <label className="text-[10px] font-extrabold text-slate-700 block">
                        {isHi ? "सहयोग राशि चुनें" : "Select Contribution Amount"}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {["500", "1000", "5000", "Other"].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setDonateAmount(amt)}
                            className={`py-2 text-xs font-bold rounded-xl border transition ${
                              donateAmount === amt
                                ? "bg-[#FF9933] text-white border-[#FF9933]"
                                : "bg-slate-50 text-slate-700 border-slate-200"
                            }`}
                          >
                            {amt === "Other" ? (isHi ? "अन्य" : "Other") : `₹${amt}`}
                          </button>
                        ))}
                      </div>
                      {donateAmount === "Other" && (
                        <input
                          type="number" placeholder={isHi ? "कस्टम राशि दर्ज करें" : "Enter custom amount"}
                          className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:border-[#FF9933]"
                          value={customAmount} onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      )}
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-600">
                          {isHi ? "मासिक रूप से दान दोहराएं" : "Repeat donation monthly"}
                        </span>
                        <input type="checkbox" checked={monthlyRepeat} onChange={(e) => setMonthlyRepeat(e.target.checked)} className="accent-[#FF9933]" />
                      </div>
                    </>
                  )}

                  {/* Jan Seva KYC — Aadhaar masked */}
                  {selected.id === "jan_seva" && (
                    <>
                      <input type="text" required
                        placeholder={isHi ? "पूरा नाम" : "Full Name"}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                      />
                      <input type="text" required
                        placeholder={isHi ? "जन्म तिथि (DD/MM/YYYY)" : "DOB (DD/MM/YYYY)"}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                        value={dob} onChange={(e) => setDob(e.target.value)}
                      />
                      <div className="relative">
                        <input type="text" required maxLength={12}
                          placeholder={isHi ? "आधार संख्या (सुरक्षित)" : "Aadhaar Number (Secure)"}
                          className="w-full text-xs border border-slate-200 rounded-xl p-2.5 pr-28"
                          value={aadhaar}
                          onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          🔒 {isHi ? "गोपनीय" : "Masked before save"}
                        </span>
                      </div>
                      <div
                        onClick={triggerUpload}
                        className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50 cursor-pointer hover:border-indigo-300 transition"
                      >
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500 font-bold">
                          {uploadPct !== null ? `${uploadPct}% ${isHi ? "अपलोड हो रहा है..." : "Uploading..."}` : (isHi ? "पहचान दस्तावेज अपलोड करें" : "Upload Verification Document")}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Generic form */}
                  {selected.id !== "donate" && selected.id !== "jan_seva" && (
                    <>
                      <input type="text" required
                        placeholder={isHi ? "पूरा नाम" : "Full Name"}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                      />
                      <input type="email"
                        placeholder={isHi ? "ई-मेल पता" : "Email Address"}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="flex gap-2 items-start">
                        <textarea required
                          placeholder={isHi ? "विवरण लिखें" : "Enter details"}
                          className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 h-16 resize-none"
                          value={details} onChange={(e) => setDetails(e.target.value)}
                        />
                        <VoiceButton />
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 bg-[#000080] text-white font-bold rounded-xl text-xs shadow-md hover:bg-navy-dark transition disabled:opacity-50"
                  >
                    {isSubmitting ? (isHi ? "प्रक्रिया जारी है..." : "Processing...") : (isHi ? "सुरक्षित सबमिट करें" : "Verify & Proceed Securely")}
                  </button>
                </form>
              )}

              <FeatureList features={selected.features} />
            </div>
          )}

          {/* ─── Template B: TicketingTemplate ─── */}
          {selected.template === "TicketingTemplate" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
              <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b pb-1.5">
                {isHi ? "शिकायत व आपातकालीन नेटवर्क" : "Report Incident & Request Help"}
              </h5>

              {selected.id === "blood" && (
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {(["request", "donor"] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setSubType(t)}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg text-center transition ${
                        subType === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-600"
                      }`}
                    >
                      {t === "request" ? (isHi ? "रक्त की आवश्यकता" : "Request Blood") : (isHi ? "रक्तदाता बनें" : "Register as Donor")}
                    </button>
                  ))}
                </div>
              )}

              {isSuccess ? (
                <>
                  <SuccessCard msg={isHi ? "नजदीकी स्वयंसेवक जल्द संपर्क करेंगे।" : "A volunteer has been assigned to your request."} />
                  <div className="p-3 bg-slate-50 rounded-xl text-center text-[9px] font-mono text-slate-500 border">
                    Ticket ID: REG-{Math.floor(100000 + Math.random() * 900000)}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Blood donor sub-form */}
                  {selected.id === "blood" && subType === "donor" ? (
                    <>
                      <input type="text" required placeholder={isHi ? "नाम" : "Name"}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                        value={donorName} onChange={(e) => setDonorName(e.target.value)}
                      />
                      <input type="number" required placeholder={isHi ? "उम्र" : "Age"}
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                        value={donorAge} onChange={(e) => setDonorAge(e.target.value)}
                      />
                      <select className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                        value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                      >
                        {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      {selected.id !== "blood" && (
                        <input type="text"
                          placeholder={isHi ? "स्थान / पता" : "Incident Location"}
                          className="w-full text-xs border border-slate-200 rounded-xl p-2.5"
                          value={locationText} onChange={(e) => setLocationText(e.target.value)}
                        />
                      )}

                      {selected.id === "blood" && (
                        <select className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                          value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}
                        >
                          <option value="">Select Required Blood Group</option>
                          {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      )}

                      {selected.id !== "blood" && (
                        <select className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-white"
                          value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value)}
                        >
                          <option value="Civic Support">Civic Support</option>
                          <option value="Consumer Redressal">Consumer Redressal</option>
                          <option value="Emergency Rescue">Emergency Rescue</option>
                          <option value="Environmental Issue">Environmental Issue</option>
                          <option value="Human Rights">Human Rights</option>
                        </select>
                      )}

                      <div className="flex gap-2 items-start">
                        <textarea required
                          placeholder={isHi ? "समस्या का विस्तृत विवरण" : "Describe the issue..."}
                          className="flex-1 text-xs border border-slate-200 rounded-xl p-2.5 h-16 resize-none"
                          value={details} onChange={(e) => setDetails(e.target.value)}
                        />
                        <VoiceButton />
                      </div>

                      <div className="flex gap-2">
                        <button type="button" onClick={triggerUpload}
                          className="flex-1 py-2 border border-slate-200 rounded-xl text-[10px] font-bold bg-slate-50 flex items-center justify-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                          {uploadPct !== null ? `${uploadPct}%` : (isHi ? "फ़ाइल अपलोड" : "Attach Image")}
                        </button>
                        <button type="button"
                          className="flex-1 py-2 border border-slate-200 rounded-xl text-[10px] font-bold bg-slate-50 flex items-center justify-center gap-1"
                          onClick={async () => {
                            const pos = await getSafePosition();
                            setLocationText(`${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}`);
                          }}
                        >
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {isHi ? "GPS टैग करें" : "GPS Tag"}
                        </button>
                      </div>
                    </>
                  )}

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3 bg-[#000080] text-white font-bold rounded-xl text-xs shadow-md hover:bg-navy-dark transition disabled:opacity-50"
                  >
                    {isSubmitting ? (isHi ? "दर्ज हो रहा है..." : "Submitting...") : (isHi ? "शिकायत दर्ज करें" : "Submit Ticket Now")}
                  </button>
                </form>
              )}

              <FeatureList features={selected.features} />
            </div>
          )}

          {/* ─── Template C: ContentFeedTemplate ─── */}
          {selected.template === "ContentFeedTemplate" && (() => {
            const localFeatures = selected.features.filter(f => 
              !subSearch.trim() || 
              (f.title ?? "").toLowerCase().includes(subSearch.toLowerCase()) || 
              (f.desc ?? "").toLowerCase().includes(subSearch.toLowerCase())
            );

            return (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-4">
                <h5 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b pb-1.5">
                  {isHi ? "सूचना व संसाधन हब" : "Resources Directory & Information Hub"}
                </h5>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input type="text"
                    placeholder={isHi ? "संसाधन खोजें..." : "Search resources..."}
                    className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:border-[#000080] outline-none"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto no-scrollbar">
                  {/* Local filtered features */}
                  {localFeatures.map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 hover:bg-slate-100 transition">
                      <h6 className="text-[10px] font-bold text-slate-800">{item.title}</h6>
                      <p className="text-[8.5px] text-slate-500 leading-tight mt-1">{item.desc}</p>
                      <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/60">
                        <button className="text-[8px] font-bold text-[#FF9933] flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {isHi ? "जानकारी देखें" : "View Details"}
                        </button>
                        <button className="text-[8px] font-bold text-slate-500 flex items-center gap-1">
                          <Share2 className="w-3 h-3" />
                          {isHi ? "साझा करें" : "Share"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {localFeatures.length === 0 && !subWebLoading && subWebResults.length === 0 && (
                    <p className="text-center text-[10px] text-slate-400 font-bold py-4">
                      {isHi ? "कोई स्थानीय संसाधन नहीं मिला।" : "No local resources matched."}
                    </p>
                  )}

                  {/* Web search loading */}
                  {subWebLoading && (
                    <div className="flex justify-center py-4">
                      <div className="w-5 h-5 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Integrated web search results from CSE */}
                  {!subWebLoading && subWebResults.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-150">
                      <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                        {isHi ? "🌐 वेब से संबंधित जानकारी" : "🌐 Related Web Info"}
                      </p>
                      {subWebResults.map((r, i) => (
                        <a key={i} href={r.link} target="_blank" rel="noreferrer"
                          className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-xl p-2.5 hover:border-[#FF9933] transition shadow-xs block"
                        >
                          <img
                            src={`https://www.google.com/s2/favicons?sz=16&domain_url=${r.link}`}
                            alt=""
                            className="w-3.5 h-3.5 rounded-sm shrink-0 mt-0.5"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-[#000080] leading-snug line-clamp-2">{r.title}</p>
                            <p className="text-[8px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">{r.snippet}</p>
                            <p className="text-[7.5px] text-[#FF9933] font-semibold mt-1 truncate">{r.displayLink || r.link}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

      ) : (
        /* ══════════════════════════════════════
            SERVICE GRID VIEW
        ══════════════════════════════════════ */
        <div className="flex-1 flex flex-col space-y-4 relative z-10">
          {/* Global Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input type="text"
              placeholder={isHi ? "21 जन कल्याणकारी योजनाएं खोजें..." : "Search among 21 welfare services..."}
              className="w-full bg-white border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-[#000080] shadow-sm font-bold placeholder-slate-400"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[9.5px] font-bold border transition whitespace-nowrap ${
                  category === cat.id
                    ? "bg-[#000080] text-white border-[#000080] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200/80"
                }`}
              >
                {isHi ? cat.hi : cat.en}
              </button>
            ))}
          </div>

          {/* 21 service cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {filtered.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <button key={svc.id} onClick={() => openService(svc)}
                  className={`bg-white/95 border border-slate-200/70 shadow-sm p-3 text-center flex flex-col items-center justify-center gap-2 h-28 rounded-2xl transition-all duration-700 ease-in-out ${
                    compactView ? "translate-y-[260px] rotate-[10deg] opacity-75" : "translate-y-0 rotate-0 opacity-100"
                  }`}
                  style={{ transitionDelay: `${idx * 25}ms` }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${svc.color} shadow-inner`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="font-bold text-[9px] text-slate-800 leading-tight line-clamp-2 px-0.5">
                    {isHi ? svc.titleHi : svc.titleEn}
                  </h4>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="space-y-3 py-4">
              <p className="text-center text-xs font-bold text-slate-400">
                {isHi ? "कोई स्थानीय सेवा नहीं मिली।" : "No local service matched."}
              </p>
            </div>
          )}

          {/* Web Search results shown below services when searching */}
          {search.trim().length > 0 && (
            <div className="space-y-3 py-2 border-t border-slate-100 mt-2">
              {webLoading && (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#000080] border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!webLoading && webResults.length > 0 && (
                <div className="space-y-2 text-left">
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-[#FF9933] rounded-xs"></span>
                    {isHi ? "🌐 इंटरनेट से योजनाएं और समाचार" : "🌐 Related Schemes & Web Info"}
                  </p>
                  <div className="space-y-2">
                    {webResults.map((r, i) => (
                      <a key={i} href={r.link} target="_blank" rel="noreferrer"
                        className="flex items-start gap-2.5 bg-white border border-slate-200 rounded-2xl p-3 hover:border-[#FF9933] hover:shadow-sm transition group"
                      >
                        <img
                          src={`https://www.google.com/s2/favicons?sz=16&domain_url=${r.link}`}
                          alt=""
                          className="w-4 h-4 rounded-sm shrink-0 mt-0.5"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-[#000080] group-hover:underline leading-snug line-clamp-2">{r.title}</p>
                          <p className="text-[8.5px] text-slate-500 mt-0.5 line-clamp-2">{r.snippet}</p>
                          <p className="text-[8px] text-[#FF9933] font-semibold mt-1 truncate">{r.displayLink || r.link}</p>
                        </div>
                        <svg className="w-3 h-3 text-slate-400 group-hover:text-[#FF9933] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Footer support bar ── */}
      {!selected && (
        <div className="mt-4 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg relative z-10">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                {isHi ? "टोल-फ्री नागरिक सहायता" : "Toll-Free Helpline"}
              </p>
              <p className="text-[10px] font-bold font-mono">{settings?.tollFree || "1800-569-0991"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={settings?.webUrl ? (settings.webUrl.startsWith("http") ? settings.webUrl : `https://${settings.webUrl}`) : "https://therpfoundation.org"} target="_blank" rel="noreferrer"
              className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </a>
            <a href={`mailto:${settings?.email || "info@therpfoundation.org"}`}
              className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
