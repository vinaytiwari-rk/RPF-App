import React, { useState } from "react";
import { Camera, FileText, CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";

interface PrescriptionScannerProps {
  lang: "hi" | "en";
  onMedsExtracted: (meds: string[]) => void;
}

export default function PrescriptionScanner({ lang, onMedsExtracted }: PrescriptionScannerProps) {
  const isHi = lang === "hi";
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleScan = () => {
    setShowPreview(true);
    setScanning(true);
    
    // Simulate OCR scanning process
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 2500);
  };

  const handleApprove = () => {
    // Mock extracted medicines
    const extracted = ["Paracetamol 500mg", "Azithromycin 250mg", "Vitamin C"];
    onMedsExtracted(extracted);
    setShowPreview(false);
    setScanned(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <h4 className="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
          <Camera className="w-4.5 h-4.5 text-blue-600" />
          {isHi ? "स्मार्ट प्रिस्क्रिप्शन स्कैनर" : "Smart Prescription Scanner"}
        </h4>
        <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
          AI OCR
        </span>
      </div>

      <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
        {isHi 
          ? "अपने डॉक्टर के पर्चे (Prescription) की फोटो खींचें। हमारा AI अपने आप दवाइयों के नाम पढ़कर ट्रैकर में जोड़ देगा।" 
          : "Take a photo of your doctor's prescription. Our AI will automatically read and add the medicines to your tracker."}
      </p>

      <button 
        onClick={handleScan}
        className="w-full border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl py-6 flex flex-col items-center justify-center gap-2 transition"
      >
        <UploadCloud className="w-8 h-8 opacity-75" />
        <span className="text-xs font-black">
          {isHi ? "कैमरा खोलें या गैलरी से चुनें" : "Open Camera or Upload Photo"}
        </span>
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-scaleIn">
            <div className="relative h-64 bg-slate-100 flex items-center justify-center">
              {/* Fake Prescription Document */}
              <div className="w-3/4 h-5/6 bg-white shadow-sm border border-slate-200 p-4 font-mono text-[8px] text-slate-400 overflow-hidden relative">
                <div className="border-b border-slate-300 pb-1 mb-2 font-black text-slate-800 text-[10px]">Dr. R. Sharma - MBBS, MD</div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                </div>
                <div className="mt-4 font-black text-blue-800 text-lg">Rx</div>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div><div className="h-2 bg-slate-300 rounded w-2/3"></div></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div><div className="h-2 bg-slate-300 rounded w-1/2"></div></div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div><div className="h-2 bg-slate-300 rounded w-3/4"></div></div>
                </div>

                {/* Scanning Animation overlay */}
                {scanning && (
                  <div className="absolute inset-0 bg-blue-500/20">
                    <div className="w-full h-1 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,1)] animate-scanLine absolute top-0 left-0"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {scanning ? (
                <div className="flex flex-col items-center justify-center text-blue-600 gap-2 py-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-black uppercase tracking-widest text-center">
                    {isHi ? "AI पर्चा पढ़ रहा है..." : "AI is reading prescription..."}
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {isHi ? "3 दवाइयाँ मिलीं" : "3 Medicines Found"}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-[10px] font-bold text-slate-700">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1"><span>Paracetamol 500mg</span> <span className="text-blue-600">08:00 AM</span></div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1"><span>Azithromycin 250mg</span> <span className="text-blue-600">08:00 AM</span></div>
                    <div className="flex justify-between items-center"><span>Vitamin C</span> <span className="text-blue-600">09:00 PM</span></div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {setShowPreview(false); setScanned(false);}}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      {isHi ? "रद्द करें" : "Cancel"}
                    </button>
                    <button 
                      onClick={handleApprove}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
                    >
                      {isHi ? "ट्रैकर में जोड़ें" : "Add to Tracker"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
