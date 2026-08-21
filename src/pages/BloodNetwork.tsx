import React, { useEffect, useState } from "react";
import { Droplet, ExternalLink, Loader2, ArrowLeft, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useOutletContext } from "react-router-dom";
import { openExternalLink } from "../utils/browser";

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY = ["Normal", "Urgent", "Emergency"];
const ERAKTKOSH_URL = "https://eraktkosh.mohfw.gov.in/eraktkoshPortal/#/";
type Choice = "home" | "local";

function SiteIcon({ url }: { url: string }) {
  const [bad, setBad] = useState(false);
  let icon = "";
  try {
    icon = `${new URL(url).origin}/favicon.ico`;
  } catch {}
  return (
    <span className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 overflow-hidden p-2">
      {!bad && icon ? (
        <img src={icon} alt="eRaktKosh" className="w-full h-full object-contain" onError={() => setBad(true)} />
      ) : (
        <Droplet className="w-7 h-7 text-red-600 fill-red-500" />
      )}
    </span>
  );
}

export default function BloodNetwork() {
  const { user } = useAuth();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  const id = (user as any)?.id;
  const [choice, setChoice] = useState<Choice>("home");
  const [member, setMember] = useState<boolean | null>(null);
  const [bloodGroup, setBloodGroup] = useState("");
  const [joinGroup, setJoinGroup] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [units, setUnits] = useState("1");
  const [requestGroup, setRequestGroup] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const access = await fetch(`/api/blood-network/access?volunteerId=${encodeURIComponent(id)}`);
      const data = await access.json();
      if (!access.ok) throw new Error(data.error || "Unable to load Blood Network");
      setMember(!!data.member);
      setBloodGroup(data.volunteer?.blood_group || "");
      if (!data.member) return;
      const [reqRes, noteRes] = await Promise.all([
        fetch(`/api/blood-network/requests?volunteerId=${encodeURIComponent(id)}`),
        fetch(`/api/blood-network/notifications?recipientId=${encodeURIComponent(id)}`)
      ]);
      const reqData = await reqRes.json();
      const noteData = await noteRes.json();
      setRequests(reqData.requests || []);
      setUnread((noteData.notifications || []).filter((x: any) => !x.is_read).length);
    } catch (e: any) {
      setError(e.message || (hi ? "नेटवर्क डेटा लोड नहीं हो सका।" : "Unable to load Blood Network."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (choice === "local") refresh();
  }, [choice, id]);

  const join = async () => {
    if (!joinGroup) return setError(hi ? "कृपया Blood Group चुनें।" : "Please select a Blood Group.");
    setLoading(true);
    try {
      const response = await fetch("/api/blood-network/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: id, bloodGroup: joinGroup })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to join");
      await refresh();
    } catch (e: any) {
      setError(e.message || "Unable to join Blood Network.");
      setLoading(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!patientName || !requestGroup || !units || !hospitalName || !contactPhone) {
      return setError(hi ? "कृपया सभी आवश्यक जानकारी भरें।" : "Please fill all required fields.");
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/blood-network/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterId: id, patientName, bloodGroup: requestGroup, unitsRequired: Number(units), hospitalName, contactPhone, urgency, notes })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit requisition");
      setPatientName("");
      setHospitalName("");
      setContactPhone("");
      setUnits("1");
      setRequestGroup("");
      setUrgency("Normal");
      setNotes("");
      await refresh();
    } catch (e: any) {
      setError(e.message || "Unable to submit requisition.");
    } finally {
      setSubmitting(false);
    }
  };

  const accept = async (requestId: string) => {
    try {
      const response = await fetch(`/api/blood-network/requests/${requestId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to accept request");
      await refresh();
    } catch (e: any) {
      setError(e.message || "Unable to accept request.");
    }
  };

  if (choice === "home") {
    return (
      <div className="min-h-screen bg-slate-50 p-5 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-5">
          <div className="text-center mb-3">
            <Droplet className="w-16 h-16 text-red-600 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-slate-800">{hi ? "ब्लड नेटवर्क" : "Blood Network"}</h1>
            <p className="text-sm text-slate-500 mt-2">{hi ? "अपनी पसंद की रक्त सेवा चुनें" : "Choose the blood service you need"}</p>
          </div>
          <button type="button" onClick={() => setChoice("local")} className="w-full text-left bg-white rounded-3xl p-6 shadow-sm border border-red-100 flex items-center gap-5 active:scale-[.99]">
            <span className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
              <Droplet className="w-7 h-7 text-red-600" />
            </span>
            <span className="flex-1">
              <span className="block text-lg font-black text-slate-800">RPF Blood Connect</span>
              <span className="block text-sm text-slate-500 mt-1">{hi ? "RPF समुदाय के भीतर रक्त अनुरोध और स्वयंसेवक नेटवर्क" : "Blood requests and volunteer support within the RPF community"}</span>
            </span>
            <span className="text-red-600 font-black">→</span>
          </button>
          <button type="button" onClick={() => openExternalLink(ERAKTKOSH_URL, navigate)} className="w-full text-left bg-white rounded-3xl p-6 shadow-sm border border-red-100 flex items-center gap-5 active:scale-[.99]">
            <SiteIcon url={ERAKTKOSH_URL} />
            <span className="flex-1">
              <span className="block text-lg font-black text-slate-800">eRaktKosh</span>
              <span className="block text-sm text-slate-500 mt-1">{hi ? "सरकारी रक्त उपलब्धता और रक्त केंद्र सेवाएं" : "Government blood availability and blood centre services"}</span>
            </span>
            <span className="text-red-600 font-black">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading && member === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>;
  if (!member) return <div className="min-h-screen bg-slate-50 p-5 flex items-center justify-center"><div className="w-full max-w-md bg-white rounded-3xl p-7 text-center shadow-xl"><button onClick={() => setChoice("home")} className="mb-4 text-sm font-bold text-slate-500 inline-flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> {hi ? "वापस" : "Back"}</button><Droplet className="w-14 h-14 text-red-600 mx-auto mb-4" /><h2 className="text-xl font-black text-slate-800">RPF Blood Connect</h2><p className="text-sm text-slate-500 mt-3">{hi ? "नेटवर्क में शामिल होकर रक्त सहायता से जुड़ें।" : "Join the local volunteer network to support blood requests."}</p>{error && <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">{error}</div>}<select value={joinGroup} onChange={(e) => setJoinGroup(e.target.value)} className="mt-5 w-full p-3 border rounded-xl text-sm font-bold"><option value="">Select Blood Group</option>{GROUPS.map((group) => <option key={group}>{group}</option>)}</select><button onClick={join} disabled={loading} className="mt-4 w-full py-3 rounded-xl bg-red-600 text-white font-black text-xs uppercase">{loading ? "Joining…" : "Yes, Become a Member"}</button></div></div>;
  return <div className="min-h-screen bg-slate-50 p-4 md:p-6"><div className="max-w-5xl mx-auto space-y-5"><div className="bg-red-700 text-white rounded-3xl p-5 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><button onClick={() => setChoice("home")} className="p-2 rounded-xl bg-white/10"><ArrowLeft className="w-5 h-5" /></button><div><p className="text-[10px] uppercase tracking-widest text-red-100">RPF Blood Connect</p><h1 className="text-xl font-black mt-1">{bloodGroup} Volunteer Network</h1></div></div><div className="flex items-center gap-1 text-xs font-bold"><Bell className="w-4 h-4" /> {unread}</div></div>{error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">{error}</div>}<div className="grid md:grid-cols-2 gap-5"><section className="bg-white rounded-2xl p-5 shadow-sm"><h2 className="font-black text-slate-800 mb-4">{hi ? "रक्त अनुरोध" : "Request Blood"}</h2><form onSubmit={submit} className="space-y-3"><input required placeholder="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full p-3 border rounded-xl text-sm" /><select required value={requestGroup} onChange={(e) => setRequestGroup(e.target.value)} className="w-full p-3 border rounded-xl text-sm"><option value="">Blood Group</option>{GROUPS.map((group) => <option key={group}>{group}</option>)}</select><input required type="number" min="1" placeholder="Units Required" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full p-3 border rounded-xl text-sm" /><input required placeholder="Hospital Name & Location" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className="w-full p-3 border rounded-xl text-sm" /><input required placeholder="Contact Phone Number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full p-3 border rounded-xl text-sm" /><select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full p-3 border rounded-xl text-sm">{URGENCY.map((item) => <option key={item}>{item}</option>)}</select><textarea placeholder="Additional Notes / Details" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full p-3 border rounded-xl text-sm resize-none" /><button disabled={submitting} className="w-full py-3 rounded-xl bg-red-600 text-white font-black text-xs uppercase">{submitting ? "Submitting…" : "Submit Requisition"}</button></form></section><section className="bg-white rounded-2xl p-5 shadow-sm"><div className="flex items-center justify-between mb-4"><h2 className="font-black text-slate-800">Requirements</h2><span className="text-[10px] font-black bg-red-50 text-red-700 px-2 py-1 rounded">{requests.length}</span></div><div className="space-y-3 max-h-[650px] overflow-y-auto">{requests.length === 0 ? <p className="text-sm text-slate-500">No active matching requirements.</p> : requests.map((request) => <article key={request.id} className="border rounded-2xl p-4"><p className="text-lg font-black text-red-700">{request.blood_group} · {request.units_required} unit(s)</p><p className="text-sm font-bold text-slate-800 mt-1">{request.patient_name}</p><p className="text-xs text-slate-500">{request.hospital_name}</p><p className="text-xs text-slate-500">Contact: {request.contact_phone}</p><p className="text-xs font-bold text-slate-600 mt-2">{request.urgency}</p>{request.requester_id !== id && <button type="button" onClick={() => accept(request.id)} className="mt-3 px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-black">Accept & Help</button>}</article>)}</div></section></div></div></div>;
}
