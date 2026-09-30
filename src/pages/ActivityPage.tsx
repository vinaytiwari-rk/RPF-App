import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ClipboardList, Clock, Users, MessagesSquare, Search, Send, ArrowRight, Award } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

type Volunteer = { id: string; name: string; city?: string; skills?: string[] | string; role?: string };
type Message = { id: string; authorName: string; text: string; createdAt: string };
export default function ActivityPage() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const hi = lang === "hi";
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"duty" | "reports" | "network" | "chat" | "certificates">("duty");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [certificateProgress, setCertificateProgress] = useState({ hours: 0, reports: 0, tasks: 0 });
  const [certificateRules, setCertificateRules] = useState<any[]>([]);
  useEffect(() => {
    if (tab !== "certificates") return;
    axios.get("/api/volunteers/me/certificates").then(r => {
      setCertificateProgress({ hours: Number(r.data?.progress?.hours || 0), reports: Number(r.data?.progress?.reports || 0), tasks: Number(r.data?.progress?.tasks || 0) });
      setCertificateRules(Array.isArray(r.data?.rules) ? r.data.rules : []);
    }).catch(() => setError(hi ? "प्रमाणपत्र पात्रता अभी उपलब्ध नहीं है" : "Certificate eligibility is currently unavailable"));
  }, [tab, hi]);
  useEffect(() => {
    if (tab !== "network") return;
    axios.get("/api/public/volunteers").then(r => setVolunteers(Array.isArray(r.data?.data) ? r.data.data : [])).catch(() => setError(hi ? "स्वयंसेवक सूची उपलब्ध नहीं है" : "Volunteer directory unavailable"));
  }, [tab, hi]);
  useEffect(() => {
    if (tab !== "chat" && !selected) return;
    const load = () => axios.get(selected ? `/api/activity/messages/direct/${encodeURIComponent(selected.id)}` : "/api/activity/messages/community")
      .then(r => { setMessages((Array.isArray(r.data?.data) ? r.data.data : []).filter((m: Message) => selected || Date.now() - new Date(m.createdAt).getTime() < 86400000)); setError(""); })
      .catch(() => setError(hi ? "चैट सेवा अभी उपलब्ध नहीं है" : "Chat service is currently unavailable"));
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, [tab, selected, hi]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user || user.role === "guest") { setError(hi ? "संदेश भेजने के लिए लॉगिन करें" : "Sign in to send messages"); return; }
    try {
      await axios.post(selected ? `/api/activity/messages/direct/${encodeURIComponent(selected.id)}` : "/api/activity/messages/community", { text: text.trim() });
      setText("");
      const r = await axios.get(selected ? `/api/activity/messages/direct/${encodeURIComponent(selected.id)}` : "/api/activity/messages/community");
      setMessages(Array.isArray(r.data?.data) ? r.data.data : []);
      setError("");
    } catch { setError(hi ? "संदेश नहीं भेजा जा सका" : "Message could not be sent"); }
  }
  const tabs = [
    { id: "duty", en: "Live Volunteer Duty", hi: "लाइव स्वयंसेवक ड्यूटी", icon: Clock },
    { id: "reports", en: "Field Report", hi: "फील्ड रिपोर्ट", icon: ClipboardList },
    { id: "network", en: "Volunteer Network", hi: "स्वयंसेवक नेटवर्क", icon: Users },
    { id: "chat", en: "Community Chat", hi: "सामुदायिक चैट", icon: MessagesSquare },
    { id: "certificates", en: "Certificates", hi: "प्रमाणपत्र", icon: Award }
  ] as const;
  return <main className="min-h-screen bg-[#FFF7E8] pb-24 text-[#245D45]">
    <header className="bg-gradient-to-r from-[#FFD49A] via-[#FFF7E8] to-[#B9E5CC] px-5 py-7">
      <h1 className="text-2xl font-extrabold">{hi ? "गतिविधि" : "Activity"}</h1>
      <p className="mt-1 text-sm">{hi ? "सेवा ड्यूटी, फील्ड रिपोर्ट और स्वयंसेवक संवाद" : "Volunteer duty, field reports and community connections"}</p>
    </header>
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5">
      <div className="grid grid-cols-2 gap-2">{tabs.map(t => <button key={t.id} onClick={() => { setTab(t.id); setSelected(null); setError(""); }} className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold ${tab === t.id ? "border-[#EAA64F] bg-[#FFD49A]" : "border-[#B9E5CC] bg-white"}`}><t.icon size={18}/>{hi ? t.hi : t.en}</button>)}</div>
      {(tab === "duty" || tab === "reports") && <section className="rounded-2xl border border-[#B9E5CC] bg-white p-5">
        <h2 className="font-bold">{tab === "duty" ? (hi ? "लाइव स्वयंसेवक ड्यूटी" : "Live Volunteer Duty") : (hi ? "फील्ड रिपोर्ट" : "Field Report")}</h2>
        <p className="my-3 text-sm">{tab === "duty" ? (hi ? "अपनी ड्यूटी और सेवा समय देखें।" : "View your assignments and service hours.") : (hi ? "अपनी फील्ड रिपोर्ट दर्ज करें।" : "Submit your field report.")}</p>
        <button className="flex items-center gap-2 rounded-xl bg-[#B9E5CC] px-4 py-3 font-bold" onClick={() => navigate("/duty-tracker")}>{hi ? "खोलें" : "Open"} <ArrowRight size={16}/></button>
      </section>}
      {tab === "network" && <section className="space-y-3">
        <label className="flex items-center gap-2 rounded-xl border border-[#B9E5CC] bg-white p-3"><Search size={18}/><input aria-label="Search volunteers" value={search} onChange={e => setSearch(e.target.value)} placeholder={hi ? "नाम, शहर या कौशल खोजें" : "Search name, city or skills"} className="w-full bg-transparent text-sm outline-none"/></label>
        {volunteers.filter(v => [v.name,v.city,Array.isArray(v.skills)?v.skills.join(" "):v.skills].join(" ").toLowerCase().includes(search.toLowerCase())).map(v => <article key={v.id} className="flex items-center justify-between rounded-xl border border-[#B9E5CC] bg-white p-4"><div><b>{v.name}</b><p className="text-xs">{v.city} · {v.role}</p></div><button className="rounded-xl bg-[#FFD49A] px-3 py-2 text-xs font-bold" onClick={() => { setSelected(v); setTab("chat"); }}>{hi ? "मैसेज" : "Message"}</button></article>)}
      </section>}
      {tab === "certificates" && <section className="rounded-2xl border border-[#B9E5CC] bg-white p-5">
        <div className="flex items-center gap-3"><div className="rounded-xl bg-[#F0FAF4] p-3 text-[#245D45]"><Award size={20}/></div><div><h2 className="font-bold">{hi ? "प्रमाणपत्र पात्रता" : "Certificate Eligibility"}</h2><p className="text-xs text-slate-500">{hi ? "आपकी वास्तविक Activity से प्रमाणपत्र स्वतः जारी होंगे।" : "Certificates are issued automatically from your recorded Activity."}</p></div></div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-[#F0FAF4] p-3"><b className="block text-lg">{certificateProgress.hours.toFixed(1)}</b><span className="text-[10px] text-slate-500">Hours</span></div>
          <div className="rounded-xl bg-[#FFF7E8] p-3"><b className="block text-lg">{certificateProgress.reports}</b><span className="text-[10px] text-slate-500">Reports</span></div>
          <div className="rounded-xl bg-slate-50 p-3"><b className="block text-lg">{certificateProgress.tasks}</b><span className="text-[10px] text-slate-500">Tasks</span></div>
        </div>
        <div className="mt-4 space-y-2">{certificateRules.map(rule => <div key={rule.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"><b>{hi ? (rule.title_hi || rule.title) : rule.title}</b><p className="mt-1 text-slate-500">≥ {rule.min_hours} hours · ≥ {rule.min_reports} reports · ≥ {rule.min_tasks} completed tasks</p></div>)}</div>
        <button onClick={() => navigate("/my-certificates")} className="mt-4 rounded-xl bg-[#245D45] px-4 py-3 text-sm font-bold text-white">{hi ? "मेरे प्रमाणपत्र देखें" : "View My Certificates"}</button>
      </section>}
      {tab === "chat" && <section className="rounded-2xl border border-[#B9E5CC] bg-white p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{selected ? selected.name : (hi ? "सामुदायिक चैट" : "Community Chat")}</h2>{selected && <button onClick={() => setSelected(null)} className="text-xs underline">{hi ? "ओपन चैट" : "Open chat"}</button>}</div>
        {!selected && <p className="mb-3 rounded-lg bg-[#FFF7E8] p-2 text-xs">{hi ? "सभी यूज़र, स्वयंसेवक और एडमिन के संदेश 24 घंटे दिखाई देंगे।" : "Open to users, volunteers and admins. Messages disappear after 24 hours."}</p>}
        <div className="max-h-96 min-h-40 space-y-2 overflow-y-auto">{messages.map(m => <div key={m.id} className="rounded-xl bg-[#EAF5EC] p-3"><b className="text-xs">{m.authorName}</b><p className="break-words text-sm">{m.text}</p><time className="text-[10px]">{new Date(m.createdAt).toLocaleTimeString()}</time></div>)}</div>
        <form onSubmit={send} className="mt-3 flex gap-2"><input maxLength={2000} value={text} onChange={e => setText(e.target.value)} placeholder={hi ? "संदेश लिखें" : "Write a message"} className="min-w-0 flex-1 rounded-xl border border-[#B9E5CC] p-3 text-sm"/><button aria-label="Send" className="rounded-xl bg-[#FFD49A] p-3"><Send size={18}/></button></form>
      </section>}
      {error && <p role="alert" className="rounded-xl bg-[#FFF0DB] p-3 text-sm">{error}</p>}
    </div>
  </main>;
}
