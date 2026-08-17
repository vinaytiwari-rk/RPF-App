import React,{useEffect,useMemo,useState}from"react";
import{useNavigate,useSearchParams}from"react-router-dom";
import{ArrowLeft,ExternalLink,ShieldCheck}from"lucide-react";

const HOME="https://www.google.com";
const PROXY_HOSTS=new Set(["www.india.gov.in","india.gov.in","www.myscheme.gov.in","myscheme.gov.in","www.calculator.net","calculator.net"]);

function normalize(value:string){const v=value.trim();if(!v)return HOME;if(/^https?:\/\//i.test(v))return v;if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v))return`https://${v}`;return`https://www.google.com/search?q=${encodeURIComponent(v)}`}
function getFrameUrl(url:string){try{const u=new URL(url);if(PROXY_HOSTS.has(u.hostname.toLowerCase()))return`/api/gov/web-proxy?url=${encodeURIComponent(url)}&clean=1`}catch{}return url}
function isExternal(url:string){try{return new URL(url).origin!==window.location.origin}catch{return true}}

export default function InAppBrowser(){
 const navigate=useNavigate();const[params]=useSearchParams();
 const[current]=useState(()=>normalize(params.get("url")||HOME));
 const[opened,setOpened]=useState(false);
 const[attempted,setAttempted]=useState(false);
 const frameUrl=useMemo(()=>getFrameUrl(current),[current]);
 const canProxy=frameUrl!==current;
 useEffect(()=>{
   if(!isExternal(current)||canProxy)return;
   setAttempted(true);
   const win=window.open(current,"_blank","noopener,noreferrer");
   setOpened(!!win);
 },[current,canProxy]);
 const openExternal=()=>{const win=window.open(current,"_blank","noopener,noreferrer");if(!win)window.location.href=current;else setOpened(true)};
 if(!isExternal(current)||canProxy){
   return <div className="relative flex min-h-screen flex-col bg-white pb-24"><button onClick={()=>navigate(-1)} aria-label="Back" className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm"><ArrowLeft className="h-4 w-4 text-slate-700"/></button><main className="min-h-0 flex-1 bg-white"><iframe src={frameUrl} title="RPF Web Content" className="h-[calc(100vh-96px)] w-full border-0" referrerPolicy="strict-origin-when-cross-origin"/></main></div>;
 }
 return <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-5 pb-24"><button onClick={()=>navigate(-1)} aria-label="Back" className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"><ArrowLeft className="h-4 w-4 text-slate-700"/></button><section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck className="h-7 w-7"/></div><h1 className="mt-5 text-xl font-black text-slate-900">Opening website</h1><p className="mt-2 break-all text-xs leading-5 text-slate-500">{current}</p><p className="mt-4 text-sm text-slate-600">External websites are opened in a normal browser tab. This avoids publisher security restrictions that block iframe embedding.</p><button type="button" onClick={openExternal} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#000080] px-5 py-3 text-sm font-bold text-white shadow-sm"><ExternalLink className="h-4 w-4"/>{opened?"Open Again":"Open Website"}</button>{attempted&&!opened&&<p className="mt-3 text-[11px] text-amber-600">If a new tab did not open automatically, tap the button above.</p>}</section></div>;
}
