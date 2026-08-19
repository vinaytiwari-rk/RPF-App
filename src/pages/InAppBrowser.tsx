import React,{useEffect,useRef,useState}from 'react';
import {useNavigate,useSearchParams}from 'react-router-dom';
import {Capacitor}from '@capacitor/core';
import {isExternalWebUrl,normalizeExternalWebUrl}from '../utils/browser';

const RPF_WEB_ORIGIN='https://appapi.therpfoundation.org';
/** Persistent RPF Web View. Native APK always uses the production proxy origin, never the local capacitor:// origin. */
export default function InAppBrowser(){
 const navigate=useNavigate();const[params]=useSearchParams();const rawUrl=normalizeExternalWebUrl(params.get('url')||'')||'';const frameRef=useRef<HTMLIFrameElement>(null);const[error,setError]=useState('');
 useEffect(()=>{if(!rawUrl||!isExternalWebUrl(rawUrl))setError('Invalid or unsupported web URL.');else setError('');},[rawUrl]);
 const frameHistory=(direction:'back'|'forward')=>{try{if(direction==='back')frameRef.current?.contentWindow?.history.back();else frameRef.current?.contentWindow?.history.forward();}catch{}};
 const proxyPath=rawUrl?`/api/gov/web-proxy?url=${encodeURIComponent(rawUrl)}&clean=1`:'';
 // iframe navigation does not pass through window.fetch interception. Use an absolute production URL on Android.
 const proxyUrl=proxyPath?(Capacitor.isNativePlatform()?`${RPF_WEB_ORIGIN}${proxyPath}`:proxyPath):'';
 return <div className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col bg-white">
  <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm"><h1 className="text-[15px] font-black tracking-tight text-[#000080]">RPF Web View</h1><div className="flex items-center gap-1"><button onClick={()=>frameHistory('back')} aria-label="Move back" className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-[#000080] active:bg-orange-50">‹</button><button onClick={()=>frameHistory('forward')} aria-label="Move forward" className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-bold text-[#000080] active:bg-orange-50">›</button></div></header>
  <main className="min-h-0 flex-1 bg-white">{error||!rawUrl?<div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-slate-500">{error||'Web page unavailable.'}</div>:<iframe ref={frameRef} title="RPF Web View" src={proxyUrl} className="h-full w-full border-0 bg-white" allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>}</main>
  <nav className="flex shrink-0 border-t border-slate-200 bg-white px-1 pb-[calc(.35rem+env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_30px_-20px_rgba(0,0,128,.22)]">{[['/','Home','⌂'],['/services','Explore','⌕'],['/notifications','Activity','●'],['/community','Impact','♡'],['/profile','Me','◉']].map(([path,label,icon])=><button key={path} onClick={()=>navigate(path)} className="flex min-h-[68px] flex-1 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium text-slate-500 active:bg-orange-50"><span className="text-[20px] leading-none text-[#000080]">{icon}</span><span>{label}</span></button>)}</nav>
 </div>;
}
