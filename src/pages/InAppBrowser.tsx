import React,{useEffect,useRef,useState}from 'react';
import {useSearchParams}from 'react-router-dom';
import {Capacitor}from '@capacitor/core';
import {isExternalWebUrl,normalizeExternalWebUrl}from '../utils/browser';
const RPF_WEB_ORIGIN='https://appapi.therpfoundation.org';
export default function InAppBrowser(){
 const[params]=useSearchParams();
 const rawUrl=normalizeExternalWebUrl(params.get('url')||'')||'';
 const frameRef=useRef<HTMLIFrameElement>(null);
 const[error,setError]=useState('');
 const[controls,setControls]=useState(false);
 const[menu,setMenu]=useState(false);
 const[desktop,setDesktop]=useState(false);
 useEffect(()=>{setError(!rawUrl||!isExternalWebUrl(rawUrl)?'Invalid or unsupported web URL.':'');},[rawUrl]);
 const frameHistory=(d:'back'|'forward')=>{try{d==='back'?frameRef.current?.contentWindow?.history.back():frameRef.current?.contentWindow?.history.forward();}catch{}};
 const proxyPath=rawUrl?`/api/gov/web-proxy?url=${encodeURIComponent(rawUrl)}&clean=1`:'';
 const proxyUrl=proxyPath?(Capacitor.isNativePlatform()?`${RPF_WEB_ORIGIN}${proxyPath}`:proxyPath):'';
 const clearData=()=>{try{sessionStorage.clear();}catch{}setMenu(false);};
 // App navigation stays inside the persistent RPF browser shell.
 return <div className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-white" onClick={()=>setControls(v=>!v)}>
  <header onClick={e=>e.stopPropagation()} className={`absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b bg-white/95 px-3 shadow-sm transition-transform ${controls?'translate-y-0':'-translate-y-full'}`}>
   <h1 className="text-[15px] font-black text-[#000080]">RPF Web View</h1>
   <div className="flex gap-1"><button onClick={()=>frameHistory('back')} className="h-10 w-10 text-xl">‹</button><button onClick={()=>frameHistory('forward')} className="h-10 w-10 text-xl">›</button><button onClick={()=>setMenu(v=>!v)} className="h-10 w-10 text-lg">⋮</button></div>
   {menu&&<div className="absolute right-2 top-12 z-30 w-56 rounded-2xl border bg-white p-2 text-sm shadow-xl"><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>setDesktop(v=>!v)}>{desktop?'Mobile view':'Desktop view'}</button><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>frameRef.current?.contentWindow?.location.reload()}>Refresh</button><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>window.prompt('Find in page')}>Find in page</button><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>alert('Reading mode is available when supported by the page.')}>Reading mode</button><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>alert('Bookmarks and history are available in the RPF browser session.')}>Bookmarks & history</button><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>{clearData();alert('Browser cache and session data cleared.')}}>Clear cache, cookies & data</button><button className="w-full rounded-xl px-3 py-2 text-left" onClick={()=>alert('Incognito browsing is handled by the native RPF browser when available.')}>New incognito window</button></div>}
  </header>
  <main className="min-h-0 flex-1 bg-white">{error||!rawUrl?<div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">{error||'Web page unavailable.'}</div>:<iframe ref={frameRef} title="RPF Web View" src={proxyUrl} className="h-full w-full border-0 bg-white" style={desktop?{width:'250%',height:'250%',transform:'scale(.4)',transformOrigin:'top left'}:undefined} allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; picture-in-picture" allowFullScreen/>}</main>
  <footer onClick={e=>e.stopPropagation()} className={`absolute inset-x-0 bottom-0 z-20 border-t bg-white/95 p-2 text-center text-xs text-slate-500 transition-transform ${controls?'translate-y-0':'translate-y-full'}`}>Tap anywhere to hide controls • RPF Web View</footer>
 </div>;
}
