import React from "react";
import { Music, Video, Maximize2, Sparkles, Scissors, Volume2 } from "lucide-react";

interface Props {
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function MediaStudioEditorEngine({ isHi }: Props) {
  return (
    <div className="space-y-4">
      {/* Launch Full-screen Studio Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-950 via-slate-900 to-slate-900 p-5 text-white shadow-lg border border-violet-900/40">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
            <Music className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">
              {isHi ? "समर्पित फुल-स्क्रीन ऑडियो व वीडियो स्टूडियो" : "Dedicated Full-Screen Audio & Video Studio"}
            </h3>
            <p className="text-xs text-violet-300/80">
              {isHi ? "ऑडियो कटर, 300% वॉल्यूम बूस्टर, वीडियो से ऑडियो निकालना" : "Audio trimmer, 300% volume boost, video audio extractor"}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {isHi
            ? "ऑडियो और वीडियो को ट्रिम करने, वॉल्यूम बूस्ट करने व एचडी फ्रेम कैप्चर करने के लिए पूर्ण स्क्रीन स्टूडियो खोलें।"
            : "Media editing, wave trimming, volume boosting, and frame capturing require full interactive controls."}
        </p>

        <button
          type="button"
          onClick={() => { window.location.href = "/utilities/media-studio"; }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-black text-white shadow-md hover:from-violet-500 hover:to-indigo-500 transition active:scale-98"
        >
          <Maximize2 className="h-4 w-4" />
          <span>{isHi ? "फुल-स्क्रीन मीडिया स्टूडियो खोलें (अनुशंसित) →" : "Launch Full Media Studio Workspace →"}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
          <p className="font-bold text-slate-900">🎵 {isHi ? "ऑडियो संपादन" : "Audio Tools"}</p>
          <p className="text-[11px] text-slate-500 mt-1">ऑडियो कटर, 300% बूस्ट, वॉयस रिकॉर्डर</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
          <p className="font-bold text-slate-900">🎬 {isHi ? "वीडियो टूल्स" : "Video Tools"}</p>
          <p className="text-[11px] text-slate-500 mt-1">MP4 से ऑडियो निकालना, HD फोटो फ्रेम कैप्चर</p>
        </div>
      </div>
    </div>
  );
}
