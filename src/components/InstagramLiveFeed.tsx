import React, { useEffect, useRef } from 'react';
import { Instagram, Settings } from 'lucide-react';

interface InstagramLiveFeedProps {
  widgetId: string;
}

export default function InstagramLiveFeed({ widgetId }: InstagramLiveFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetId) return;

    // Load Elfsight script dynamically
    const script = document.createElement('script');
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.setAttribute("data-use-service-core", "");
    script.defer = true;
    
    // Only append if it doesn't exist to prevent duplicates in React StrictMode
    if (!document.querySelector(`script[src="${script.src}"]`)) {
      document.body.appendChild(script);
    }
  }, [widgetId]);

  if (!widgetId) {
    return (
      <div className="w-full rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
          <Settings className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="mt-4 text-sm font-black text-slate-800">Live Instagram Feed Pending</h3>
        <p className="mt-2 text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          <b>Admin Note:</b> Please paste your free Elfsight Widget ID in <code className="bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[9px] text-[#000080]">src/config/featuredPost.ts</code> to automatically load all posts and videos from @rpfoundationofficial.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-sm" ref={containerRef}>
      <div className={`elfsight-app-${widgetId}`}></div>
    </div>
  );
}
