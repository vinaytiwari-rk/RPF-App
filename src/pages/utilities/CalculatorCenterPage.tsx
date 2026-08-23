import React,{useMemo,useState}from"react";
import{Calculator,ChevronRight,HeartPulse,Wallet,Brain,Clock3,Ruler,Search,ExternalLink}from"lucide-react";
import{useNavigate}from"react-router-dom";
import Shell from"./UtilityPageShell";
import{openExternalLink}from"../../utils/browser";

type Item={id:string;title:string;desc:string;path?:string;url?:string};
type Group={id:string;title:string;icon:any;items:Item[]};

const groups:Group[]=[
  {id:"everyday",title:"Everyday",icon:Calculator,items:[
    {id:"standard",title:"Standard Calculator",desc:"Basic and scientific calculations",path:"/utilities/calculator"},
    {id:"percentage",title:"Percentage Calculator",desc:"Calculate percentages and changes",url:"https://www.calculator.net/percent-calculator.html"},
    {id:"age",title:"Age Calculator",desc:"Calculate age between dates",url:"https://www.calculator.net/age-calculator.html"},
    {id:"date",title:"Date Calculator",desc:"Add or subtract dates and durations",url:"https://www.calculator.net/date-calculator.html"}
  ]},
  {id:"health",title:"Health Awareness",icon:HeartPulse,items:[
    {id:"bmi",title:"BMI Calculator",desc:"Estimate body mass index",path:"/utilities/bmi-calculator"},
    {id:"calorie",title:"Calorie Calculator",desc:"Estimate daily calorie needs",url:"https://www.calculator.net/calorie-calculator.html"},
    {id:"bmr",title:"BMR Calculator",desc:"Estimate basal metabolic rate",url:"https://www.calculator.net/bmr-calculator.html"},
    {id:"pregnancy",title:"Pregnancy Due Date",desc:"Estimate an expected due date",url:"https://www.calculator.net/pregnancy-calculator.html"}
  ]},
  {id:"finance",title:"Finance",icon:Wallet,items:[
    {id:"gst",title:"GST Calculator",desc:"Quick GST calculations",path:"/utilities/gst-calculator"},
    {id:"loan",title:"Loan Calculator",desc:"Estimate loan payments",url:"https://www.calculator.net/loan-calculator.html"},
    {id:"interest",title:"Interest Calculator",desc:"Estimate interest and repayment",url:"https://www.calculator.net/interest-calculator.html"},
    {id:"investment",title:"Investment Calculator",desc:"Estimate investment growth",url:"https://www.calculator.net/investment-calculator.html"}
  ]},
  {id:"conversion",title:"Conversion",icon:Ruler,items:[
    {id:"unit",title:"Unit Converter",desc:"Convert common units",url:"https://www.calculator.net/conversion-calculator.html"},
    {id:"currency",title:"Currency Converter",desc:"Check currency conversions",url:"https://www.calculator.net/currency-calculator.html"}
  ]}
];

export default function CalculatorCenterPage(){
  const n=useNavigate(),[q,setQ]=useState(""),[cat,setCat]=useState("all");
  const filtered=useMemo(()=>groups.map(g=>({...g,items:g.items.filter(i=>(cat==="all"||cat===g.id)&&(!q||i.title.toLowerCase().includes(q.toLowerCase())))})).filter(g=>g.items.length),[q,cat]);
  const open=(item:Item)=>{if(item.path)return n(item.path);if(item.url)return void openExternalLink(item.url,n,item.title);};
  return <Shell title="Calculator Center" icon={<Calculator className="h-4 w-4"/>} onBack={()=>n("/tools")}>
    <div className="space-y-4">
      <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search useful calculators..." className="w-full rounded-xl border p-3 pl-10"/></div>
      <div className="flex gap-2 overflow-x-auto pb-1">{[["all","All"],...groups.map(g=>[g.id,g.title] as const)].map(([id,title])=><button key={id} onClick={()=>setCat(id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-black ${cat===id?"bg-[#000080] text-white":"bg-slate-100 text-slate-600"}`}>{title}</button>)}</div>
      {filtered.map(g=>{const Icon=g.icon;return <section key={g.id}><div className="mb-2 flex items-center gap-2"><Icon className="h-4 w-4 text-[#000080]"/><h2 className="font-black text-slate-800">{g.title}</h2><span className="text-xs text-slate-400">{g.items.length}</span></div><div className="grid gap-2 sm:grid-cols-2">{g.items.map(i=><button key={i.id} onClick={()=>open(i)} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left hover:bg-white"><div className="flex-1"><div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">{i.title}{i.url&&<ExternalLink className="h-3.5 w-3.5 text-slate-400"/>}</div><div className="text-[11px] text-slate-500">{i.desc}</div></div><ChevronRight className="h-4 w-4 text-slate-300"/></button>)}</div></section>})}
      <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">Some calculators open external websites. External links are clearly indicated and are subject to Samahit's external-link disclaimer. Health results are estimates only and do not replace professional advice.</p>
    </div>
  </Shell>;
}
