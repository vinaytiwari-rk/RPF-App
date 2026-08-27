import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Award, ChevronRight, Globe, HeartHandshake, IdCard, Mail, Phone, Settings, Instagram, Twitter, Facebook, Linkedin, ShieldCheck, Upload, User, Users, LogOut, FileText, Loader2, Camera, Sparkles, BadgeCheck } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type VolunteerMeta = {
  registration_number?: string;
  registeredAt?: string;
  registered_at?: string;
  created_at?: string;
  createdAt?: string;
  full_name?: string;
  avatar?: string;
  approval_status?: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: Lang }>();
  const { user, language, logout } = useAuth();
  const { settings } = useApp();
  const hi = lang === "hi" || language === "hi";
  const name = user?.name?.trim() || (hi ? "नागरिक" : "Citizen");
  const [avatar, setAvatar] = useState("");
  const [volunteer, setVolunteer] = useState<VolunteerMeta | null>(null);
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const localAvatarKey = `@rpf_profile_avatar:${user?.id || "guest"}`;

  useEffect(() => {
    try { setAvatar(localStorage.getItem(localAvatarKey) || user?.avatar || ""); }
    catch { setAvatar(user?.avatar || ""); }
  }, [localAvatarKey, user?.avatar]);

  useEffect(() => {
    if (!user?.id) { setVolunteer(null); return; }
    let cancelled = false;
    setVolunteerLoading(true);
    const token = localStorage.getItem("@rpf_token");
    fetch("/api/volunteers/me", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (!cancelled) setVolunteer(d?.volunteer || null); })
      .catch(() => { if (!cancelled) setVolunteer(null); })
      .finally(() => { if (!cancelled) setVolunteerLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

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
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
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

  const isVolunteer = user?.role === "volunteer" || !!user?.isVolunteer || !!volunteer;
  const registrationNo = volunteer?.registration_number || user?.registration_number || user?.volunteerData?.registration_number || user?.volunteerData?.registrationNumber || "";
  const sinceRaw = volunteer?.registeredAt || volunteer?.registered_at || volunteer?.created_at || volunteer?.createdAt || user?.volunteerData?.registeredAt || user?.volunteerData?.registered_at || user?.volunteerData?.created_at || user?.volunteerData?.createdAt;
  const volunteerSince = sinceRaw ? new Date(sinceRaw).toLocaleDateString(hi ? "hi-IN" : "en-IN", { month: "long", year: "numeric" }) : "";
  const initials = name.split(/\s+/).map(p => p[0]).slice(0, 2).join("").toUpperCase();
  const roleLabel = (user?.role || "citizen").replace(/_/g, " ");
  const accountItems = useMemo(() => [
    { icon: IdCard, title: hi ? "जन सेवा कार्ड" : "Jan Seva Card", sub: hi ? "अपना डिजिटल सेवा कार्ड देखें और साझा करें" : "View and share your digital seva card", route: "/jan-seva-card", gradient: "from-[#FF9933] to-[#F59E0B]" },
    { icon: Award, title: hi ? "मेरे प्रमाणपत्र" : "My Certificates", sub: hi ? "आपकी सेवा से जुड़े प्रमाणपत्र" : "Certificates earned through service", route: "/my-certificates", gradient: "from-[#7C3AED] to-[#EC4899]" },
    { icon: Settings, title: hi ? "सेटिंग्स" : "Settings", sub: hi ? "भाषा और ऐप अनुभव को नियंत्रित करें" : "Control language and app experience", route: "/settings", gradient: "from-[#0EA5E9] to-[#38BDF8]" },
  ], [hi]);

  const accountContact = [
    user?.phone ? { icon: Phone, label: hi ? "मोबाइल" : "Mobile", value: user.phone } : null,
    user?.email ? { icon: Mail, label: hi ? "ईमेल" : "Email", value: user.email } : null,
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string }[];

  return (
    <main className="min-h-full bg-transparent pb-28 text-slate-900 font-sans selection:bg-orange-100">
      <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FDE047] to-[#138808]" />
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute -left-20 -bottom-28 h-64 w-64 rounded-full bg-orange-100/40 blur-3xl" />
        <div className="relative p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-lg sm:h-28 sm:w-28">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[26px] bg-slate-50 text-2xl font-black text-[#000080]">
                  {avatar ? <img src={avatar} alt={hi ? "प्रोफाइल फोटो" : "Profile photo"} className="h-full w-full object-cover" /> : initials || <User className="h-9 w-9" />}
                </div>
              </div>
              <label className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#000080] text-white shadow-md" title={hi ? "प्रोफाइल फोटो बदलें" : "Change profile photo"}>
                <Camera className="h-4 w-4" /><input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </label>
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p>
                {isVolunteer && <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-green-700"><BadgeCheck className="h-3 w-3" /> {hi ? "वालंटियर" : "Volunteer"}</span>}
              </div>
              <h1 className="mt-1 truncate text-[23px] font-black text-[#000080] sm:text-[26px]">{name}</h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">{roleLabel}</p>
              <p className="mt-2 max-w-xl text-[11px] leading-5 text-slate-500">{hi ? "यह आपका RPF Seva App का व्यक्तिगत क्षेत्र है। यहां आपकी सेवा पहचान, कार्ड, प्रमाणपत्र और ऐप सेटिंग्स एक जगह मिलेंगी।" : "Your personal space in the RPF Seva App — keep your seva identity, card, certificates and app settings together."}</p>
            </div>
          </div>

          {isVolunteer && <div className="mt-5 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50/80 via-white to-orange-50/70 p-3.5">
            <div className="mb-2 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm"><HeartHandshake className="h-4 w-4" /></span><div><p className="text-[11px] font-black text-slate-800">{hi ? "RPF सेवा पहचान" : "RPF Seva Identity"}</p><p className="text-[9px] text-slate-500">{hi ? "आपकी वालंटियर जानकारी" : "Your volunteer information"}</p></div></div><span className={`rounded-full px-2 py-1 text-[8px] font-black ${volunteer?.approval_status === "approved" || user?.janSevaCardStatus === "approved" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{volunteer?.approval_status === "approved" || user?.janSevaCardStatus === "approved" ? (hi ? "सक्रिय" : "Active") : (hi ? "प्रक्रिया में" : "In progress")}</span></div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white bg-white/80 p-2.5"><p className="text-[8px] font-black uppercase tracking-wider text-orange-500">{hi ? "वालंटियर नं." : "Volunteer No."}</p>{volunteerLoading ? <Loader2 className="mt-1 h-4 w-4 animate-spin text-orange-500" /> : <p className="mt-1 break-all text-[11px] font-black text-slate-800">{registrationNo || (hi ? "उपलब्ध नहीं" : "Not available")}</p>}</div>
              <div className="rounded-xl border border-white bg-white/80 p-2.5"><p className="text-[8px] font-black uppercase tracking-wider text-green-600">{hi ? "सेवा शुरू" : "Serving since"}</p>{volunteerLoading ? <Loader2 className="mt-1 h-4 w-4 animate-spin text-green-600" /> : <p className="mt-1 text-[11px] font-black text-slate-800">{volunteerSince || (hi ? "उपलब्ध नहीं" : "Not available")}</p>}</div>
              <button onClick={() => navigate("/jan-seva-card")} className="col-span-2 flex items-center justify-between rounded-xl border border-white bg-white/80 p-2.5 text-left transition hover:bg-white sm:col-span-1"><span><p className="text-[8px] font-black uppercase tracking-wider text-violet-600">{hi ? "सेवा कार्ड" : "Seva Card"}</p><p className="mt-1 text-[11px] font-black text-slate-800">{hi ? "कार्ड खोलें" : "Open card"}</p></span><ChevronRight className="h-4 w-4 text-slate-300" /></button>
            </div>
          </div>}

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" /><p className="text-[11px] font-black text-slate-800">{hi ? "खाता जानकारी" : "Account information"}</p></div>
            {accountContact.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{accountContact.map(({ icon: Icon, label, value }) => <div key={label} className="flex min-w-0 items-center gap-2.5 rounded-xl bg-white p-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon className="h-4 w-4" /></span><span className="min-w-0"><span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">{label}</span><span className="block truncate text-[10px] font-bold text-slate-700">{value}</span></span></div>)}</div> : <p className="mt-2 text-[10px] leading-5 text-slate-500">{hi ? "आपकी उपलब्ध खाता जानकारी यहां सुरक्षित रूप से दिखाई जाएगी।" : "Available account details will appear here."}</p>}
          </div>
        </div>
      </motion.section>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between px-1"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{hi ? "आपका RPF स्पेस" : "YOUR RPF SPACE"}</p><h2 className="mt-0.5 text-[17px] font-black text-[#000080]">{hi ? "त्वरित पहुंच" : "Quick access"}</h2></div><Sparkles className="h-4 w-4 text-orange-400" /></div>
        <div className="grid gap-2.5 sm:grid-cols-3">{accountItems.map(({ icon: Icon, title, sub, route, gradient }) => <motion.button key={title} whileHover={{ y: -2 }} whileTap={{ scale: .985 }} onClick={() => navigate(route)} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}><Icon className="h-5 w-5 text-white" /></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black text-slate-800">{title}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{sub}</span></span><ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" /></motion.button>)}</div>
      </section>

      <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500"><FileText className="h-5 w-5" /></span><div><h2 className="text-[15px] font-black text-slate-800">{hi ? "RP FOUNDATION से संपर्क" : "Contact RP FOUNDATION"}</h2><p className="text-[10px] text-slate-500">{hi ? "जरूरत होने पर आधिकारिक संपर्क माध्यम" : "Official contact channels when you need them"}</p></div></div>
        {(settings.tollFree || settings.email || settings.webUrl) ? <div className="mt-3 grid gap-2.5 sm:grid-cols-2">{settings.tollFree && <a href={`tel:${settings.tollFree.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 rounded-xl bg-green-50 p-3 transition hover:bg-green-100"><Phone className="h-4 w-4 text-green-700" /><span><span className="block text-[9px] font-black uppercase text-green-700">{hi ? "हेल्पलाइन" : "Helpline"}</span><span className="block text-[11px] font-black text-slate-700">{settings.tollFree}</span></span></a>}{settings.email && <a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-xl bg-sky-50 p-3 transition hover:bg-sky-100"><Mail className="h-4 w-4 text-sky-700" /><span className="min-w-0"><span className="block text-[9px] font-black uppercase text-sky-700">Email</span><span className="block truncate text-[11px] font-black text-slate-700">{settings.email}</span></span></a>}{settings.webUrl && <a href={settings.webUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-violet-50 p-3 text-[10px] font-black text-violet-700 transition hover:bg-violet-100 sm:col-span-2"><Globe className="h-4 w-4 shrink-0" /> <span className="truncate">{settings.webUrl}</span><ChevronRight className="ml-auto h-4 w-4 shrink-0" /></a>}</div> : <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[10px] leading-5 text-slate-500">{hi ? "आधिकारिक संपर्क विवरण उपलब्ध होने पर यहां दिखाई देंगे।" : "Official contact details will appear here when configured."}</p>}
      </section>

      <section className="mt-5 rounded-[24px] border border-red-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-red-400">{hi ? "खाता" : "ACCOUNT"}</p><h2 className="mt-0.5 text-[14px] font-black text-slate-800">{hi ? "सत्र और सुरक्षा" : "Session & security"}</h2><p className="mt-1 text-[10px] text-slate-500">{hi ? "इस डिवाइस पर अपना RPF खाता सुरक्षित रखें।" : "Keep your RPF account secure on this device."}</p></div><button onClick={() => { void logout(); navigate("/"); }} className="flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[10px] font-black text-red-600 transition hover:bg-red-100"><LogOut className="h-4 w-4" />{hi ? "लॉग आउट" : "Log out"}</button></div>
      </section>

      <div className="mt-6 flex items-center justify-center gap-2 text-center"><Users className="h-3.5 w-3.5 text-green-600" /><p className="text-[9px] font-bold tracking-[.16em] text-slate-300">SEVA • SAMARPAN • SANKALP</p></div>
    </div>
  </main>
  );
}
