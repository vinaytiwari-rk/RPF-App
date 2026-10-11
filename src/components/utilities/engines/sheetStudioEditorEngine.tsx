import React from "react";
import { FileSpreadsheet, Maximize2, Sparkles, Download, Check } from "lucide-react";

interface Props {
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function SheetStudioEditorEngine({ isHi }: Props) {
  return (
    <div className="space-y-4">
      {/* Launch Full-screen Studio Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 text-white shadow-lg border border-emerald-900/40">
        <div className="flex items-center gap-3 mb-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-black text-white">
              {isHi ? "समर्पित फुल-स्क्रीन एक्सेल व स्प्रेडशीट स्टूडियो" : "Dedicated Full-Screen Excel & Sheet Studio"}
            </h3>
            <p className="text-xs text-emerald-300/80">
              {isHi ? "100% ऑफलाइन, फॉर्मूला बार, बजट बहीखाता व .xlsx सेव" : "100% offline, formula engine (=SUM), budget ledgers & .xlsx export"}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {isHi
            ? "स्प्रेडशीट व एक्सेल फाइलों में काम करने के लिए बड़ी स्क्रीन और फॉर्मूला बार आवश्यक है। कृपया पूर्ण वर्कस्पेस खोलें।"
            : "Spreadsheet operations require ample screen real estate and an interactive formula bar. Launch the full studio workspace."}
        </p>

        <button
          type="button"
          onClick={() => { window.location.href = "/utilities/sheet-studio"; }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-black text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition active:scale-98"
        >
          <Maximize2 className="h-4 w-4" />
          <span>{isHi ? "फुल-स्क्रीन एक्सेल स्टूडियो खोलें (अनुशंसित) →" : "Launch Full Excel Studio Workspace →"}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
          <p className="font-bold text-slate-900">📊 {isHi ? "गणितीय फॉर्मूले" : "Formulas"}</p>
          <p className="text-[11px] text-slate-500 mt-1">=SUM, =AVERAGE, गुणा (+, -, *, /) स्वतः गणना</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
          <p className="font-bold text-slate-900">💾 {isHi ? "ऑफलाइन डाउनलोड" : "Offline Export"}</p>
          <p className="text-[11px] text-slate-500 mt-1">Microsoft Excel (.xlsx), CSV फ़ाइल व प्रिंट</p>
        </div>
      </div>
    </div>
  );
}
