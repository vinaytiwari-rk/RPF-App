import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, Clock, FileText, Loader2, ShieldCheck, Send, XCircle } from "lucide-react";

type Application = { name:string; gender:string; dob:string; address:string; idType:string; idNumber:string; status:"pending"|"approved"|"rejected"; cardNo:string|null; submittedAt:string };
const empty = { name:"", gender:"", dob:"", address:"", idNumber:"" };

export default function JanSevaCardLive(){
  const [application,setApplication]=useState<Application|null>(null);
  const [form,setForm]=useState(empty);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  const load=async()=>{setLoading(true);setError("");try{const r=await axios.get("/api/cards/my");setApplication(r.data?.application||null)}catch{setError("Card information could not be loaded.")}finally{setLoading(false)}};
  useEffect(()=>{load()},[]);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError("");if(!form.name.trim()||!form.gender||!form.dob||!form.address.trim()||!/^[0-9]{12}$/.test(form.idNumber)){setError("Please complete all fields and enter a valid 12-digit Aadhaar number.");return}setSaving(true);try{await axios.post("/api/cards",{...form,idType:"aadhaar"});await load()}catch(err:any){setError(err?.response?.data?.error||"Application could not be submitted.")}finally{setSaving(false)}};
  if(loading)return <div className="flex min-h-[320px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#000080]"/></div>;
  if(application)return <div className="p-5 sm:p-6 space-y-5">
    <div id="jan-seva-card-front" className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"/>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933]">RPF Digital Identity</p><h2 className="mt-1 text-xl font-black text-[#000080]">{application.name}</h2><p className="mt-1 text-xs text-slate-500">Jan Seva Card application</p></div><Status status={application.status}/></div>
        <div className="mt-5 grid gap-3 text-sm"><Row label="Status" value={application.status}/>{application.cardNo&&<Row label="Card number" value={application.cardNo}/>}<Row label="Address" value={application.address}/><Row label="Submitted" value={new Date(application.submittedAt).toLocaleDateString()}/></div>
      </div>
    </div>
    {application.status==="pending"&&<p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">Your application is awaiting review. A final card number is issued only after approval.</p>}
    {application.status==="rejected"&&<p className="rounded-2xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">This application was not approved. Please contact RPF support for the next step.</p>}
  </div>;
  return <form onSubmit={submit} className="p-5 sm:p-6 space-y-4">
    <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933]">Jan Seva Card</p><h2 className="mt-1 text-xl font-black text-[#000080]">Apply for verification</h2><p className="mt-1 text-xs text-slate-500">A card number is issued only by the backend after admin approval.</p></div>
    {error&&<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
    <Input label="Full name" value={form.name} onChange={v=>setForm({...form,name:v})}/>
    <div className="grid grid-cols-2 gap-3"><Input label="Gender" value={form.gender} onChange={v=>setForm({...form,gender:v})}/><Input label="Date of birth" type="date" value={form.dob} onChange={v=>setForm({...form,dob:v})}/></div>
    <Input label="Residential address" value={form.address} onChange={v=>setForm({...form,address:v})}/><Input label="Aadhaar number" inputMode="numeric" value={form.idNumber} onChange={v=>setForm({...form,idNumber:v.replace(/\D/g,"").slice(0,12)})}/>
    <button disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#000080] px-4 text-sm font-black text-white disabled:opacity-60">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}{saving?"Submitting…":"Submit for review"}</button>
  </form>
}
function Input({label,value,onChange,type="text",inputMode}:{label:string;value:string;onChange:(v:string)=>void;type?:string;inputMode?:any}){return <label className="block text-xs font-bold text-slate-700">{label}<input required type={type} inputMode={inputMode} value={value} onChange={e=>onChange(e.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#000080]"/></label>}
function Row({label,value}:{label:string;value:string}){return <div className="flex gap-3"><span className="w-24 shrink-0 text-slate-400">{label}</span><span className="font-semibold text-slate-800 break-words">{value}</span></div>}
function Status({status}:{status:Application["status"]}){const map={approved:[CheckCircle2,"text-green-700 bg-green-50","Approved"],pending:[Clock,"text-amber-700 bg-amber-50","Under review"],rejected:[XCircle,"text-red-700 bg-red-50","Not approved"]} as const;const [Icon,cls,label]=map[status];return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${cls}`}><Icon className="h-3.5 w-3.5"/>{label}</span>}
