import React, { useEffect, useState } from "react";
import { X, Instagram, Facebook, Youtube, Twitter, Globe } from "lucide-react";
import BrandLoader from "./BrandLoader";
import { openExternalLink } from "../utils/browser";

interface InAppWebViewProps { url:string; title?:string; platform?:string; onClose:()=>void; }
const PLATFORM_ICON: Record<string, React.ElementType>={instagram:Instagram,facebook:Facebook,youtube:Youtube,x:Twitter,twitter:Twitter};

/** Opens the destination in the app's native InAppBrowser WebView. */
export default function InAppWebView({url,title,platform,onClose}:InAppWebViewProps){
 const [opening,setOpening]=useState(true);
 const Icon=(platform&&PLATFORM_ICON[platform.toLowerCase()])||Globe;
 let hostname="";try{hostname=new URL(url).hostname.replace(/^www\./,"")}catch{hostname=url}
 useEffect(()=>{
  let active=true;
  void openExternalLink(url,undefined,title||hostname).finally(()=>{
   if(active){setOpening(false);setTimeout(()=>{if(active)onClose()},150)}
  });
  return()=>{active=false};
 },[url,title,hostname,onClose]);
 return <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-8 text-center">
   <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Icon className="w-7 h-7 text-[#000080]"/></div>
   {opening?<BrandLoader size="md" label="Opening in app"/>:<p className="text-sm font-black text-slate-900">Opened</p>}
   <button onClick={onClose} className="mt-6 px-5 py-3 rounded-xl bg-[#000080] text-white text-xs font-bold flex items-center gap-2"><X className="w-4 h-4"/>Cancel</button>
 </div>;
}
