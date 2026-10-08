import React from "react";
import { Tv } from "lucide-react";

export default function LiveTVStudio() {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm min-h-[500px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Tv className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">Live TV & Broadcasting Studio</h2>
          <p className="text-xs font-medium text-slate-500">Manage M3U8 streams, internet radio stations, and media links.</p>
        </div>
      </div>
      <div className="text-center py-20 text-slate-400 text-xs font-medium">
        Module Under Construction
      </div>
    </div>
  );
}
