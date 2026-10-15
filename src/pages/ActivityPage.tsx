import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Activity, Award, Camera, CheckCircle2, Clock, FileText, Loader2,
  MapPin, MessagesSquare, Play, Search, Send, ShieldCheck, Square, Users
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

type Lang = "en" | "hi";
type Tab = "overview" | "duty" | "reports" | "network" | "chat" | "certificates";
type Volunteer = { id: string; name: string; city?: string; skills?: string[] | string; role?: string };
type Message = { id: string; authorName: string; text: string; createdAt: string };
type DutySession = {
  id: string; initiative_name: string; clock_in_time: string;
  clock_out_time?: string; duration_minutes?: number; status: "active" | "completed";
};
type LeaderboardItem = { id: string; name: string; total_duty_minutes?: number; approved_reports_count?: number; total_points?: number };

const tabs: { id: Tab; en: string; hi: string; icon: React.ElementType }[] = [
  { id: "overview", en: "Overview", hi: "अवलोकन", icon: Activity },
  { id: "duty", en: "Live Duty", hi: "लाइव ड्यूटी", icon: Clock },
  { id: "reports", en: "Field Reports", hi: "फील्ड रिपोर्ट", icon: FileText },
  { id: "network", en: "Volunteer Network", hi: "स्वयंसेवक नेटवर्क", icon: Users },
  { id: "chat", en: "Community Chat", hi: "सामुदायिक चैट", icon: MessagesSquare },
  { id: "certificates", en: "Certificates", hi: "प्रमाणपत्र", icon: Award },
];

export default function ActivityPage() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const hi = lang === "hi";
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeSession, setActiveSession] = useState<DutySession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [initiative, setInitiative] = useState("Community Service");
  const [dutyNotes, setDutyNotes] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportImage, setReportImage] = useState("");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [certificateProgress, setCertificateProgress] = useState({ hours: 0, reports: 0, tasks: 0 });
  const [certificateRules, setCertificateRules] = useState<any[]>([]);

  const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  async function loadDuty() {
    if (!token) { setActiveSession(null); return; }
    try {
      const response = await fetch("/api/volunteers/duty/active", { headers: authHeaders });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.error || "Could not load duty session");
      setActiveSession(data.session || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : (hi ? "ड्यूटी लोड नहीं हुई।" : "Could not load duty."));
    }
  }

  async function loadLeaderboard() {
    try {
      const response = await fetch("/api/volunteers/leaderboard");
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.error || "Could not load activity metrics");
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
    } catch {
      setLeaderboard([]);
    }
  }

  useEffect(() => {
    void loadDuty();
    void loadLeaderboard();
  }, [token]);

  useEffect(() => {
    if (!activeSession?.clock_in_time) { setElapsedSeconds(0); return; }
    const start = new Date(activeSession.clock_in_time).getTime();
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeSession]);

  useEffect(() => {
    if (tab !== "network") return;
    axios.get("/api/public/volunteers")
      .then(r => setVolunteers(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(() => setError(hi ? "स्वयंसेवक सूची उपलब्ध नहीं है।" : "Volunteer directory is unavailable."));
  }, [tab, hi]);

  useEffect(() => {
    if (tab !== "certificates") return;
    axios.get("/api/volunteers/me/certificates", { headers: authHeaders })
      .then(r => {
        setCertificateProgress({
          hours: Number(r.data?.progress?.hours || 0),
          reports: Number(r.data?.progress?.reports || 0),
          tasks: Number(r.data?.progress?.tasks || 0),
        });
        setCertificateRules(Array.isArray(r.data?.rules) ? r.data.rules : []);
      })
      .catch(() => setError(hi ? "प्रमाणपत्र पात्रता अभी उपलब्ध नहीं है।" : "Certificate eligibility is unavailable."));
  }, [tab, hi, authHeaders]);

  useEffect(() => {
    if (tab !== "chat") return;
    let cancelled = false;
    const load = async () => {
      try {
        const url = selected
          ? `/api/activity/messages/direct/${encodeURIComponent(selected.id)}`
          : "/api/activity/messages/community";
        const response = await axios.get(url, { headers: authHeaders });
        if (!cancelled) setMessages(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch {
        if (!cancelled) setError(hi ? "चैट सेवा उपलब्ध नहीं है।" : "Chat service is unavailable.");
      }
    };
    void load();
    const timer = window.setInterval(load, 20000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [tab, selected, hi, authHeaders]);

  const totals = useMemo(() => ({
    hours: Math.round(leaderboard.reduce((sum, item) => sum + Number(item.total_duty_minutes || 0), 0) / 60),
    reports: leaderboard.reduce((sum, item) => sum + Number(item.approved_reports_count || 0), 0),
    volunteers: leaderboard.length,
  }), [leaderboard]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map(n => String(n).padStart(2, "0")).join(":");
  };

  async function getOptionalLocation() {
    if (!navigator.geolocation) return { lat: null as number | null, lon: null as number | null };
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 })
      );
      return { lat: position.coords.latitude, lon: position.coords.longitude };
    } catch {
      return { lat: null, lon: null };
    }
  }

  async function toggleDuty() {
    if (!token) { setError(hi ? "ड्यूटी के लिए पहले लॉगिन करें।" : "Please sign in before starting duty."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const location = await getOptionalLocation();
      const endpoint = activeSession ? "/api/volunteers/duty/clock-out" : "/api/volunteers/duty/clock-in";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(activeSession
          ? { sessionId: activeSession.id, lat: location.lat, lon: location.lon, notes: dutyNotes }
          : { initiativeName: initiative, lat: location.lat, lon: location.lon, notes: dutyNotes }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Duty update failed.");
      setActiveSession(activeSession ? null : data.session);
      setNotice(activeSession
        ? (hi ? "ड्यूटी समाप्त दर्ज हो गई।" : "Duty completion recorded.")
        : (hi ? "ड्यूटी शुरू हो गई।" : "Duty started successfully."));
      await loadLeaderboard();
    } catch (e) {
      setError(e instanceof Error ? e.message : (hi ? "ड्यूटी अपडेट नहीं हुई।" : "Could not update duty."));
    } finally { setBusy(false); }
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError(hi ? "फोटो 2 MB से छोटी होनी चाहिए।" : "Please choose an image under 2 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setReportImage(String(reader.result || ""));
    reader.onerror = () => setError(hi ? "फोटो पढ़ी नहीं जा सकी।" : "Could not read the image.");
    reader.readAsDataURL(file);
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setError(hi ? "रिपोर्ट जमा करने के लिए लॉगिन करें।" : "Please sign in before submitting a report."); return; }
    if (!reportTitle.trim() || !reportDescription.trim()) {
      setError(hi ? "शीर्षक और विवरण दोनों आवश्यक हैं।" : "A title and description are required.");
      return;
    }
    setBusy(true); setError(""); setNotice("");
    try {
      const location = await getOptionalLocation();
      const response = await fetch("/api/volunteers/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          title: reportTitle.trim(),
          description: reportDescription.trim(),
          locationName: reportLocation.trim(),
          imageUrl: reportImage,
          latitude: location.lat,
          longitude: location.lon,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Field report could not be submitted.");
      setReportTitle(""); setReportDescription(""); setReportLocation(""); setReportImage("");
      setNotice(hi ? "रिपोर्ट सत्यापन के लिए जमा हो गई है।" : "Field report submitted for verification.");
      await loadLeaderboard();
    } catch (e) {
      setError(e instanceof Error ? e.message : (hi ? "रिपोर्ट जमा नहीं हुई।" : "Report submission failed."));
    } finally { setBusy(false); }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || user.role === "guest" || !messageText.trim()) {
      setError(hi ? "संदेश भेजने के लिए लॉगिन करें।" : "Sign in to send a message.");
      return;
    }
    try {
      const url = selected
        ? `/api/activity/messages/direct/${encodeURIComponent(selected.id)}`
        : "/api/activity/messages/community";
      await axios.post(url, { text: messageText.trim() }, { headers: authHeaders });
      setMessageText("");
      const response = await axios.get(url, { headers: authHeaders });
      setMessages(Array.isArray(response.data?.data) ? response.data.data : []);
      setError("");
    } catch (e: any) {
      setError(e?.response?.data?.error || (hi ? "संदेश नहीं भेजा जा सका।" : "Message could not be sent."));
    }
  }

  const filteredVolunteers = volunteers.filter(v =>
    [v.name, v.city, Array.isArray(v.skills) ? v.skills.join(" ") : v.skills]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FFF7E8] pb-24 text-[#245D45]">
      <header className="bg-gradient-to-r from-[#B9E5CC] via-[#FFF7E8] to-[#FFD49A] px-4 py-7 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#B9E5CC] bg-white/80 px-3 py-1 text-xs font-bold">
            <ShieldCheck size={15} /> {hi ? "RP Foundation · सत्यापित सेवा" : "RP Foundation · Verified Service"}
          </p>
          <h1 className="text-3xl font-extrabold">{hi ? "Volunteer Activity" : "Volunteer Activity"}</h1>
          <p className="mt-2 max-w-2xl text-sm">{hi ? "ड्यूटी, फील्ड रिपोर्ट, स्वयंसेवक नेटवर्क और सेवा उपलब्धियों का एक ही स्थान।" : "Manage duty, field reports, volunteer connections and service achievements in one place."}</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-5 px-4 py-5 sm:px-6">
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

        <nav aria-label={hi ? "गतिविधि अनुभाग" : "Activity sections"} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {tabs.map(item => {
            const Icon = item.icon;
            return <button key={item.id} type="button" onClick={() => { setTab(item.id); setError(""); setNotice(""); }}
              aria-current={tab === item.id ? "page" : undefined}
              className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-bold transition ${tab === item.id ? "border-[#245D45] bg-[#245D45] text-white" : "border-[#B9E5CC] bg-white hover:bg-[#F0FAF4]"}`}>
              <Icon size={18} /> {hi ? item.hi : item.en}
            </button>;
          })}
        </nav>

        {tab === "overview" && <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#B9E5CC] bg-white p-4"><Clock className="mb-2" size={20}/><p className="text-2xl font-extrabold">{totals.hours}</p><p className="text-xs">{hi ? "कुल सेवा घंटे" : "Reported duty hours"}</p></div>
            <div className="rounded-2xl border border-[#B9E5CC] bg-white p-4"><CheckCircle2 className="mb-2" size={20}/><p className="text-2xl font-extrabold">{totals.reports}</p><p className="text-xs">{hi ? "स्वीकृत फील्ड रिपोर्ट" : "Approved field reports"}</p></div>
            <div className="rounded-2xl border border-[#B9E5CC] bg-white p-4"><Users className="mb-2" size={20}/><p className="text-2xl font-extrabold">{totals.volunteers}</p><p className="text-xs">{hi ? "लीडरबोर्ड में स्वयंसेवक" : "Volunteers in leaderboard"}</p></div>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => setTab("duty")} className="rounded-2xl border border-[#B9E5CC] bg-white p-5 text-left hover:bg-[#F0FAF4]"><Clock size={24}/><h2 className="mt-3 font-bold">{hi ? "लाइव स्वयंसेवक ड्यूटी" : "Live Volunteer Duty"}</h2><p className="mt-1 text-sm">{hi ? "अपनी ड्यूटी शुरू करें और समय रिकॉर्ड करें।" : "Start a duty and record service time."}</p></button>
            <button onClick={() => setTab("reports")} className="rounded-2xl border border-[#B9E5CC] bg-white p-5 text-left hover:bg-[#F0FAF4]"><FileText size={24}/><h2 className="mt-3 font-bold">{hi ? "फील्ड रिपोर्ट जमा करें" : "Submit a Field Report"}</h2><p className="mt-1 text-sm">{hi ? "अपने कार्य का विवरण और प्रमाण जमा करें।" : "Submit a description and optional evidence."}</p></button>
          </section>
        </>}

        {tab === "duty" && <section className="rounded-2xl border border-[#B9E5CC] bg-white p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">{hi ? "लाइव स्वयंसेवक ड्यूटी" : "Live Volunteer Duty"}</h2>
          <p className="mt-1 text-sm text-slate-600">{hi ? "स्थान की अनुमति वैकल्पिक है। ड्यूटी तभी बदलेगी जब सर्वर पुष्टि करेगा।" : "Location permission is optional. Duty changes only after server confirmation."}</p>
          {activeSession ? <div className="mt-5 rounded-xl bg-[#F0FAF4] p-5 text-center">
            <p className="text-sm font-bold">{activeSession.initiative_name}</p>
            <p className="my-4 font-mono text-4xl font-extrabold">{formatTime(elapsedSeconds)}</p>
            <p className="text-xs text-slate-600">{hi ? "ड्यूटी शुरू हुई" : "Started"}: {new Date(activeSession.clock_in_time).toLocaleString()}</p>
          </div> : <div className="mt-5 space-y-3">
            <label className="block text-sm font-semibold">{hi ? "सेवा गतिविधि" : "Service activity"}
              <select value={initiative} onChange={e => setInitiative(e.target.value)} className="mt-1 w-full rounded-xl border border-[#B9E5CC] bg-white p-3">
                <option>Community Service</option><option>Health Camp & Medical Relief</option><option>Food Relief & Distribution</option><option>Education & Youth Support</option><option>Environment & Plantation</option><option>Disaster Relief</option>
              </select>
            </label>
          </div>}
          <label className="mt-4 block text-sm font-semibold">{hi ? "नोट्स (वैकल्पिक)" : "Notes (optional)"}
            <textarea value={dutyNotes} onChange={e => setDutyNotes(e.target.value)} maxLength={1000} rows={3} className="mt-1 w-full rounded-xl border border-[#B9E5CC] p-3" placeholder={hi ? "आज के कार्य का संक्षिप्त विवरण" : "Brief notes about your work"} />
          </label>
          <button disabled={busy} onClick={() => void toggleDuty()} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-white disabled:opacity-60 ${activeSession ? "bg-rose-700" : "bg-[#245D45]"}`}>
            {busy ? <Loader2 className="animate-spin" size={18}/> : activeSession ? <Square size={18}/> : <Play size={18}/>}
            {activeSession ? (hi ? "ड्यूटी समाप्त करें" : "Complete Duty / Clock Out") : (hi ? "ड्यूटी शुरू करें" : "Start Duty / Clock In")}
          </button>
        </section>}

        {tab === "reports" && <form onSubmit={submitReport} className="space-y-4 rounded-2xl border border-[#B9E5CC] bg-white p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">{hi ? "फील्ड रिपोर्ट" : "Field Report"}</h2>
          <p className="text-sm text-slate-600">{hi ? "जमा की गई रिपोर्ट सत्यापन के बाद ही Impact और प्रमाणपत्रों में गिनी जानी चाहिए।" : "Submitted reports should count toward public impact and certificates only after approval."}</p>
          <label className="block text-sm font-semibold">{hi ? "रिपोर्ट शीर्षक" : "Report title"} *
            <input required maxLength={200} value={reportTitle} onChange={e => setReportTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-[#B9E5CC] p-3" placeholder={hi ? "आज आपने क्या सेवा की?" : "What service did you deliver?"}/>
          </label>
          <label className="block text-sm font-semibold">{hi ? "कार्य विवरण" : "Work description"} *
            <textarea required minLength={10} maxLength={5000} rows={5} value={reportDescription} onChange={e => setReportDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-[#B9E5CC] p-3" placeholder={hi ? "कार्य, लाभार्थी और परिणाम का विवरण" : "Describe the work, beneficiaries and outcome"}/>
          </label>
          <label className="block text-sm font-semibold">{hi ? "स्थान का नाम (वैकल्पिक)" : "Location name (optional)"}
            <input maxLength={200} value={reportLocation} onChange={e => setReportLocation(e.target.value)} className="mt-1 w-full rounded-xl border border-[#B9E5CC] p-3"/>
          </label>
          <label className="block text-sm font-semibold">{hi ? "फोटो प्रमाण (वैकल्पिक, अधिकतम 2 MB)" : "Photo evidence (optional, max 2 MB)"}
            <input type="file" accept="image/*" onChange={handleImage} className="mt-1 block w-full text-sm"/>
          </label>
          {reportImage && <p className="text-xs text-emerald-700">{hi ? "फोटो संलग्न है।" : "Photo attached."}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#245D45] px-4 py-3 font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} {hi ? "सत्यापन के लिए जमा करें" : "Submit for Verification"}</button>
        </form>}

        {tab === "network" && <section className="space-y-3">
          <label className="flex items-center gap-2 rounded-xl border border-[#B9E5CC] bg-white p-3"><Search size={18}/><input aria-label="Search volunteers" value={search} onChange={e => setSearch(e.target.value)} placeholder={hi ? "नाम, शहर या कौशल खोजें" : "Search by name, city or skills"} className="w-full bg-transparent text-sm outline-none"/></label>
          {filteredVolunteers.map(v => <article key={v.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#B9E5CC] bg-white p-4"><div className="min-w-0"><b>{v.name}</b><p className="text-xs text-slate-600">{[v.city, v.role].filter(Boolean).join(" · ")}</p></div><button onClick={() => { setSelected(v); setTab("chat"); }} className="shrink-0 rounded-xl bg-[#FFD49A] px-3 py-2 text-xs font-bold">{hi ? "संदेश" : "Message"}</button></article>)}
          {!filteredVolunteers.length && <p className="rounded-xl bg-white p-5 text-sm text-slate-600">{hi ? "कोई स्वयंसेवक नहीं मिला।" : "No volunteers found."}</p>}
        </section>}

        {tab === "chat" && <section className="rounded-2xl border border-[#B9E5CC] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-bold">{selected ? selected.name : (hi ? "सामुदायिक चैट" : "Community Chat")}</h2>{selected && <button onClick={() => setSelected(null)} className="text-xs underline">{hi ? "सामुदायिक चैट" : "Community chat"}</button>}</div>
          {!selected && <p className="mb-3 rounded-lg bg-[#FFF7E8] p-3 text-xs">{hi ? "संदेश 24 घंटे बाद हटाए जाते हैं।" : "Community messages are removed after 24 hours."}</p>}
          <div className="max-h-96 min-h-36 space-y-2 overflow-y-auto">{messages.map(m => <div key={m.id} className="rounded-xl bg-[#F0FAF4] p-3"><b className="text-xs">{m.authorName}</b><p className="break-words text-sm">{m.text}</p><time className="text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleString()}</time></div>)}</div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2"><input maxLength={2000} value={messageText} onChange={e => setMessageText(e.target.value)} placeholder={hi ? "संदेश लिखें" : "Write a message"} className="min-w-0 flex-1 rounded-xl border border-[#B9E5CC] p-3 text-sm"/><button aria-label={hi ? "संदेश भेजें" : "Send message"} className="rounded-xl bg-[#FFD49A] p-3"><Send size={18}/></button></form>
        </section>}

        {tab === "certificates" && <section className="rounded-2xl border border-[#B9E5CC] bg-white p-5">
          <h2 className="text-xl font-extrabold">{hi ? "प्रमाणपत्र पात्रता" : "Certificate Eligibility"}</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#F0FAF4] p-3"><b className="block text-lg">{certificateProgress.hours.toFixed(1)}</b><span className="text-xs text-slate-600">{hi ? "घंटे" : "Hours"}</span></div>
            <div className="rounded-xl bg-[#FFF7E8] p-3"><b className="block text-lg">{certificateProgress.reports}</b><span className="text-xs text-slate-600">{hi ? "स्वीकृत रिपोर्ट" : "Approved reports"}</span></div>
            <div className="rounded-xl bg-slate-50 p-3"><b className="block text-lg">{certificateProgress.tasks}</b><span className="text-xs text-slate-600">{hi ? "कार्य" : "Tasks"}</span></div>
          </div>
          <div className="mt-4 space-y-2">{certificateRules.map(rule => <div key={rule.id} className="rounded-xl border border-slate-100 p-3 text-sm"><b>{hi ? (rule.title_hi || rule.title) : rule.title}</b><p className="mt-1 text-xs text-slate-600">≥ {rule.min_hours} hours · ≥ {rule.min_reports} reports · ≥ {rule.min_tasks} completed tasks</p></div>)}</div>
          <button onClick={() => navigate("/my-certificates")} className="mt-4 flex items-center gap-2 rounded-xl bg-[#245D45] px-4 py-3 text-sm font-bold text-white"><Award size={17}/> {hi ? "मेरे प्रमाणपत्र देखें" : "View My Certificates"}</button>
        </section>}

        <p className="text-center text-xs text-slate-500">{hi ? "सार्वजनिक Impact में केवल Admin द्वारा स्वीकृत कार्य शामिल होने चाहिए।" : "Only admin-approved work should be counted in public Impact."}</p>
      </div>
    </main>
  );
}
