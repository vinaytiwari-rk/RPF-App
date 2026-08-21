import React, { useEffect, useRef, useState } from "react";
import { X, Instagram, Facebook, Youtube, Twitter, Globe } from "lucide-react";
import BrandLoader from "./BrandLoader";

interface InAppWebViewProps { url:string; title?:string; platform?:string; onClose:()=>void; }
const PLATFORM_ICON: Record<string, React.ElementType>={instagram:Instagram,facebook:Facebook,youtube:Youtube,x:Twitter,twitter:Twitter};

/** RPF's own in-app browser surface. Keep all supported services inside the app. */
export default function InAppWebView({url,title,platform,onClose}:InAppWebViewProps){
 const [status,setStatus]=useState<"loading"|"loaded"|"slow">("loading");
 const timeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{
   setStatus("loading");
   timeoutRef.current=setTimeout(()=>setStatus(prev=>prev==="loading"?"slow":prev),12000);
   return()=>{if(timeoutRef.current)clearTimeout(timeoutRef.current)};
 },[url]);
 const Icon=(platform&&PLATFORM_ICON[platform.toLowerCase()])||Globe;
 let hostname="";try{hostname=new URL(url).hostname.replace(/^www\./,"")}catch{hostname=url}
 return <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col animate-fadeIn">
   <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-slate-600"/></div>
    <div className="flex-1 min-w-0"><p className="text-xs font-black text-slate-900 truncate">{title||hostname}</p><p className="text-[10px] text-slate-400 truncate">{hostname}</p></div>
    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-700 flex items-center justify-center shrink-0 transition" aria-label="Close"><X className="w-4 h-4 text-white"/></button>
   </div>
   <div className="flex-1 relative bg-white">
    {status==="loading"&&<div className="absolute inset-0 flex items-center justify-center bg-white z-10"><BrandLoader size="md" label="Opening"/></div>}
    {status==="slow"&&<div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 rounded-full bg-slate-900 text-white text-[10px] px-3 py-1.5 shadow">Still opening… you can wait or go back</div>}
    <iframe src={url} title={title||"RPF Browser"} className="w-full h-full border-0" onLoad={()=>setStatus("loaded")} sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"/>
   </div>
 </div>;
}
