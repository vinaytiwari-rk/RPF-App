import { useEffect, useState, type ChangeEvent } from "react";
import { Award, ChevronRight, Globe, HeartHandshake, IdCard, Mail, Phone, Settings, ShieldCheck, Upload, User, Users, LogOut, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type VolunteerMeta = { registration_number?: string; registeredAt?: string; registered_at?: string; full_name?: string; avatar?: string; approval_status?: string };

export default function Profile() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user, language, setLanguage, logout } = useAuth();
  const { settings } = useApp();
  const hi = lang === "hi" || language === "hi";
  const name = user?.name?.trim() || (hi ? "नागरिक" : "Citizen");
  const [avatar, setAvatar] = useState("");
  const [volunteer, setVolunteer] = useState<VolunteerMeta | null>(null);
  const localAvatarKey = `@rpf_profile_avatar:${user?.id || "guest"}`;

  useEffect(() => {
    try { setAvatar(localStorage.getItem(localAvatarKey) || user?.avatar || ""); } catch { setAvatar(user?.avatar || ""); }
  }, [localAvatarKey, user?.avatar]);

  useEffect(() => {
    if (!user?.id || !(user.role === "volunteer" || user.isVolunteer)) return;
    const token = localStorage.getItem("@rpf_token");
    fetch("/api/volunteers/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setVolunteer(d.volunteer || null))
      .catch(() => setVolunteer(null));
  }, [user?.id, user?.role, user?.isVolunteer]);

  const handleAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 720;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d"); if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", .82);
        try { localStorage.setItem(localAvatarKey, compressed); } catch {}
        setAvatar(compressed);
        window.dispatchEvent(new CustomEvent("rpf-avatar-changed", { detail: compressed }));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file); e.target.value = "";
  };

  const isVolunteer = user?.role === "volunteer" || !!user?.isVolunteer;
  const registrationNo = volunteer?.registration_number || user?.registration_number || user?.volunteerData?.registration_number || user?.volunteerData?.registrationNumber || "";
  const sinceRaw = volunteer?.registeredAt || user?.volunteerData?.registeredAt || user?.volunteerData?.registered_at || user?.volunteerData?.created_at || user?.volunteerData?.createdAt;
  const volunteerSince = sinceRaw ? new Date(sinceRaw).toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "long", year: "numeric" }) : "";
  const initials = name.split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();

  const items = [
    { icon: IdCard, title: hi ? "जन सेवा कार्ड" : "Jan Seva Card", sub: hi ? "डिजिटल फ्लिप कार्ड • PDF/JPEG डाउनलोड" : "Digital flip card • PDF/JPEG download", route: "/jan-seva-card", gradient: "from-[#FF9933] to-[#F59E0B]" },
    { icon: Award, title: hi ? "मेरे प्रमाणपत्र" : "My Certificates", sub: hi ? "आपकी सेवा के प्रमाणपत्र" : "Certificates earned through service", route: "/my-certificates", gradient: "from-[#7C3AED] to-[#EC4899]" },
    { icon: Settings, title: hi ? "सेटिंग्स" : "Settings", sub: hi ? "ऐप को अपनी पसंद के अनुसार बदलें" : "Personalize your app experience", route: "/settings", gradient: "from-[#0EA5E9] to-[#38BDF8]" },
  ];

  return <main className="min-h-full bg-[#f8fafc] pb-12 text-slate-900"><div className="mx-auto max-w-3xl px-3.5 py-5 sm:px-6">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(0,0,0,.08)]"><div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FDE047] to-[#138808]"/><div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl"/><div className="relative p-5 sm:p-7">
      <div className="flex items-start gap-4"><div className="relative shrink-0"><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-lg"><div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[26px] bg-slate-50 text-2xl font-black text-[#000080]">{avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover"/> : initials || <User className="h-9 w-9"/>}</div></div><label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#000080] text-white shadow-md"><Upload className="h-4 w-4"/><input type="file" accept="image/*" className="hidden" onChange={handleAvatar}/></label></div><div className="min-w-0 flex-1 pt-1"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p><h1 className="mt-1 truncate text-[23px] font-black text-[#000080]">{name}</h1><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{(user?.role || "citizen").replace(/_/g, " ")}</p>{user?.phone && <p className="mt-1 text-[11px] text-slate-500">{user.phone}</p>}</div></div>
      {isVolunteer && <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3"><div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3"><p className="text-[8px] font-black uppercase tracking-wider text-orange-500">Volunteer No.</p><p className="mt-1 break-all text-[12px] font-black text-slate-800">{registrationNo || "—"}</p></div><div className="rounded-2xl border border-green-100 bg-green-50/70 p-3"><p className="text-[8px] font-black uppercase tracking-wider text-green-600">Volunteer Since</p><p className="mt-1 text-[12px] font-black text-slate-800">{volunteerSince || "—"}</p></div><div className="col-span-2 rounded-2xl border border-violet-100 bg-violet-50/70 p-3 sm:col-span-1"><p className="text-[8px] font-black uppercase tracking-wider text-violet-600">Status</p><p className="mt-1 text-[12px] font-black text-slate-800">{volunteer?.approval_status === "approved" || user?.janSevaCardStatus === "approved" ? "Active • Card Ready" : "Active Volunteer"}</p></div></div>}
      <div className="mt-5 grid grid-cols-3 rounded-2xl border border-slate-100 bg-slate-50/70 text-center"><div className="border-r border-slate-200 py-3"><ShieldCheck className="mx-auto h-4 w-4 text-[#138808]"/><p className="mt-1 text-[9px] font-bold text-slate-500">{hi ? "सत्यापित" : "Verified"}</p></div><div className="border-r border-slate-200 py-3"><Users className="mx-auto h-4 w-4 text-[#7C3AED]"/><p className="mt-1 text-[9px] font-bold text-slate-500">{hi ? "समुदाय" : "Community"}</p></div><div className="py-3"><Award className="mx-auto h-4 w-4 text-[#FF9933]"/><p className="mt-1 text-[9px] font-bold text-slate-500">{hi ? "सेवा" : "Seva"}</p></div></div>
    </div></motion.section>

    <section className="mt-5 grid gap-2.5 sm:grid-cols-3">{items.map(({ icon: Icon, title, sub, route, gradient }) => <motion.button key={title} whileHover={{ y: -2 }} whileTap={{ scale: .985 }} onClick={() => navigate(route)} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}><Icon className="h-5 w-5 text-white"/></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black text-slate-800">{title}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{sub}</span></span><ChevronRight className="h-4 w-4 text-slate-300"/></motion.button>)}</section>

    <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500"><FileText className="h-5 w-5"/></span><div><h2 className="text-[15px] font-black text-slate-800">{hi ? "RP FOUNDATION से संपर्क" : "Contact RP FOUNDATION"}</h2><p className="text-[10px] text-slate-500">{hi ? "सीधे संपर्क और आधिकारिक वेबसाइट" : "Direct contact and official website"}</p></div></div><div className="mt-3 grid gap-2.5 sm:grid-cols-2"><a href={settings.tollFree ? `tel:${settings.tollFree.replace(/[^+\d]/g, "")}` : undefined} className="flex items-center gap-3 rounded-xl bg-green-50 p-3"><Phone className="h-4 w-4 text-green-700"/><span><span className="block text-[9px] font-black uppercase text-green-700">Helpline</span><span className="block text-[11px] font-black text-slate-700">{settings.tollFree || "—"}</span></span></a><a href={settings.email ? `mailto:${settings.email}` : undefined} className="flex items-center gap-3 rounded-xl bg-sky-50 p-3"><Mail className="h-4 w-4 text-sky-700"/><span><span className="block text-[9px] font-black uppercase text-sky-700">Email</span><span className="block text-[11px] font-black text-slate-700">{settings.email || "—"}</span></span></a></div>{settings.webUrl && <a href={settings.webUrl} target="_blank" rel="noreferrer" className="mt-2.5 flex items-center gap-2 rounded-xl bg-violet-50 p-3 text-[10px] font-black text-violet-700"><Globe className="h-4 w-4"/>{settings.webUrl}</a>}</section>

    <button onClick={() => { void logout(); navigate("/"); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[12px] font-black text-red-600"><LogOut className="h-4 w-4"/>{hi ? "लॉग आउट" : "Log out"}</button>
    <p className="mt-6 text-center text-[9px] font-bold tracking-[.16em] text-slate-300">SEVA • SAMARPAN • SANKALP</p>
  </div></main>;
}
