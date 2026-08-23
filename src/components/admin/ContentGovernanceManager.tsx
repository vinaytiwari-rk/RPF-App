import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

type Item = { id:string; content_type:string; title_en:string; title_hi?:string|null; status:string; starts_at?:string|null; expires_at?:string|null; updated_at?:string };
const types=["initiative","announcement","banner","article"];

export default function ContentGovernanceManager(){
  const { token }=useAuth(); const [items,setItems]=useState<Item[]>([]); const [loading,setLoading]=useState(true); const [title,setTitle]=useState(""); const [type,setType]=useState("initiative");
  const headers={Authorization:`Bearer ${token}`};
  const load=async()=>{if(!token)return;setLoading(true);try{const r=await axios.get("/api/admin/content",{headers});setItems(r.data?.data||[])}catch(e:any){toast.error(e?.response?.data?.error||"Unable to load governed content")}finally{setLoading(false)}};
  useEffect(()=>{load()},[token]);
  const create=async()=>{if(!title.trim())return toast.error("Title is required");try{await axios.post("/api/admin/content",{content_type:type,title_en:title.trim()},{headers});setTitle("");toast.success("Saved as draft");load()}catch(e:any){toast.error(e?.response?.data?.error||"Unable to create content")}};
  const action=async(id:string,name:string)=>{try{await axios.post(`/api/admin/content/${id}/${name}`,{}, {headers});toast.success(name==="review"?"Sent for review":name==="publish"?"Published":"Archived");load()}catch(e:any){toast.error(e?.response?.data?.error||"Action failed")}};
  const remove=async(id:string)=>{if(!confirm("Delete this content permanently?"))return;try{await axios.delete(`/api/admin/content/${id}`,{headers});toast.success("Deleted");load()}catch(e:any){toast.error(e?.response?.data?.error||"Delete failed")}};
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
    <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933]">Publication Control</p><h2 className="text-lg font-black">Governed Content</h2><p className="text-xs text-slate-500 mt-1">Nothing here becomes public until an administrator explicitly moves it through Draft → Review → Publish.</p></div>
    <div className="grid gap-2 sm:grid-cols-[150px_1fr_auto]"><select value={type} onChange={e=>setType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">{types.map(x=><option key={x}>{x}</option>)}</select><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Content title" className="rounded-xl border border-slate-200 px-3 py-2 text-sm"/><button onClick={create} className="rounded-xl bg-[#000080] px-4 py-2 text-xs font-black text-white">Create Draft</button></div>
    {loading?<p className="text-xs text-slate-500">Loading…</p>:items.length===0?<p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No governed content yet.</p>:<div className="space-y-2">{items.map(i=><div key={i.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex gap-2 items-center"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase">{i.content_type}</span><span className="text-[10px] font-black uppercase text-[#000080]">{i.status}</span></div><p className="mt-1 text-sm font-black">{i.title_en}</p></div><div className="flex flex-wrap gap-2">{i.status==="draft"&&<button onClick={()=>action(i.id,"review")} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Send to Review</button>}{i.status==="review"&&<button onClick={()=>action(i.id,"publish")} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Publish</button>}{["draft","review","published"].includes(i.status)&&<button onClick={()=>action(i.id,"archive")} className="rounded-lg border px-3 py-1.5 text-xs font-bold">Archive</button>}<button onClick={()=>remove(i.id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700">Delete</button></div></div>)}</div>}
  </section>
}
