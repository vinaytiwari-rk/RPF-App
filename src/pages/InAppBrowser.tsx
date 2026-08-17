import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const HOME="https://www.google.com";
const PROXY_HOSTS=new Set(["www.india.gov.in","india.gov.in","www.myscheme.gov.in","myscheme.gov.in","www.calculator.net","calculator.net"]);
function normalize(value:string){const v=value.trim();if(!v)return HOME;if(/^https?:\/\//i.test(v))return v;if(/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v))return`https://${v}`;return`https://www.google.com/search?q=${encodeURIComponent(v)}`}
function getFrameUrl(url:string){try{const u=new URL(url);if(PROXY_HOSTS.has(u.hostname.toLowerCase()))return`/api/gov/web-proxy?url=${encodeURIComponent(url)}&clean=1`}catch{}return url}
const CLEAN_CSS=`\nfooter,header,[role="contentinfo"],[aria-label*="cookie" i],[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[id*="advert" i],[class*="advert" i],[id*="banner" i],[class*="banner" i],[id*="popup" i],[class*="popup" i],[class*="modal" i]{display:none!important;visibility:hidden!important}nav,[role="navigation"]{display:none!important}body{margin:0!important;background:#fff!important}main,article,[role="main"],.content,.main-content{max-width:100%!important;width:100%!important;margin:0 auto!important}a{cursor:pointer}`;
function installCleanEngine(frame:HTMLIFrameElement){try{const doc=frame.contentDocument;if(!doc)return false;let style=doc.getElementById("rpf-smart-clean-style")as HTMLStyleElement|null;if(!style){style=doc.createElement("style");style.id="rpf-smart-clean-style";style.textContent=CLEAN_CSS;doc.head?.appendChild(style)}const nodes=doc.querySelectorAll<HTMLElement>("body *");const terms=["accept cookies","cookie policy","we use cookies","subscribe to our newsletter","advertisement","advertisements","privacy policy"];for(const el of Array.from(nodes)){if(el.children.length>8)continue;const t=(el.innerText||"").trim().toLowerCase();if(t&&t.length<180&&terms.some(x=>t.includes(x)))el.style.setProperty("display","none","important")}return true}catch{return false}}
export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [current] = useState(() => normalize(params.get("url") || HOME));
  const frameUrl = useMemo(() => getFrameUrl(current), [current]);
  const [cleanApplied, setCleanApplied] = useState(false);
  
  useEffect(() => {
    let active = true;
    if (Capacitor.isNativePlatform()) {
      Browser.open({ url: current }).catch(console.error);
      // Wait a moment then navigate back so the user doesn't see a blank page
      setTimeout(() => {
        if (active) navigate(-1);
      }, 300);
    }
    return () => { active = false; };
  }, [current, navigate]);

  if (Capacitor.isNativePlatform()) {
    return <div className="min-h-screen bg-white" />;
  }

  const onLoad = () => setCleanApplied(installCleanEngine(frameRef.current!));
  
  return (
    <div className="relative flex min-h-screen flex-col bg-white pb-24">
      <button onClick={() => navigate(-1)} aria-label="Back" className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <ArrowLeft className="h-4 w-4 text-slate-700" />
      </button>
      <main className="min-h-0 flex-1 bg-white">
        <iframe ref={frameRef} key={frameUrl} src={frameUrl} title="RPF Web Content" className="h-[calc(100vh-96px)] w-full border-0" referrerPolicy="strict-origin-when-cross-origin" onLoad={onLoad} />
      </main>
      {cleanApplied && <span className="sr-only" aria-live="polite">Clean page applied</span>}
    </div>
  );
}
