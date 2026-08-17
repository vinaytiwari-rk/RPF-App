import React, { useMemo } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Lang = "en" | "hi";
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
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isHi = lang === "hi";
  const current = normalize(params.get("url") || HOME);
  const frameUrl = useMemo(() => getFrameUrl(current), [current]);
  const title = useMemo(() => {
    try {
      return new URL(current).hostname.replace(/^www\./, "");
    } catch {
      return "RPF";
    }
  }, [current]);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back to RPF"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-900">
              {isHi ? "RPF रीडिंग मोड" : "RPF Reading Mode"}
            </p>
            <p className="truncate text-[10px] text-slate-500">{title}</p>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 bg-white">
        <iframe
          key={frameUrl}
          src={frameUrl}
          title={title}
          className="h-[calc(100vh-64px)] w-full border-0"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </main>
    </div>
  );
}
