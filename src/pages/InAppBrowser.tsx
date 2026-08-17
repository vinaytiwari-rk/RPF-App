import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const HOME = "https://www.google.com";
const PROXY_HOSTS = new Set([
  "www.india.gov.in",
  "india.gov.in",
  "www.myscheme.gov.in",
  "myscheme.gov.in",
  "www.calculator.net",
  "calculator.net",
]);

function normalize(value: string) {
  const v = value.trim();
  if (!v) return HOME;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v)) return `https://${v}`;
  return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
}

function getFrameUrl(url: string) {
  try {
    const u = new URL(url);
    if (PROXY_HOSTS.has(u.hostname.toLowerCase())) {
      return `/api/gov/web-proxy?url=${encodeURIComponent(url)}`;
    }
  } catch {}
  return url;
}

export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const current = normalize(params.get("url") || HOME);
  const frameUrl = useMemo(() => getFrameUrl(current), [current]);

  return (
    <div className="relative flex min-h-screen flex-col bg-white pb-24">
      <button
        onClick={() => navigate(-1)}
        aria-label="Back"
        className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-sm backdrop-blur"
      >
        <ArrowLeft className="h-4 w-4 text-slate-700" />
      </button>
      <main className="min-h-0 flex-1 bg-white">
        <iframe
          key={frameUrl}
          src={frameUrl}
          title="RPF Web Content"
          className="h-[calc(100vh-96px)] w-full border-0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </main>
    </div>
  );
}
