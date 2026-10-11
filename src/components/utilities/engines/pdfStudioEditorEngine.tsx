import React, { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { 
  FileText, Download, RotateCw, Trash2, ArrowUp, ArrowDown, 
  Plus, Edit3, Shield, Check, AlertCircle, RefreshCw, ZoomIn, 
  ZoomOut, Eye, Layers, Type, Stamp, Eraser, PenTool, Image as ImageIcon,
  Square, ShieldAlert
} from "lucide-react";

interface Props {
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

interface PageMeta {
  pageIndex: number; // 0-based original index
  pageNumber: number; // display number
  rotation: number; // 0, 90, 180, 270
  isDeleted: boolean;
}

interface RedactCorrection {
  id: string;
  pageNumber: number; // 1-based target page
  x: number;
  y: number;
  width: number;
  height: number;
  type: "whiteout" | "blackout";
  replacementText?: string;
  textColor?: string;
  fontSize?: number;
}

export default function PdfStudioEditorEngine({ isHi, downloadBlob, copyToClipboard }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PDF Page Management
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);

  // Active Studio Tab
  const [activeTab, setActiveTab] = useState<"pages" | "correct" | "signature" | "watermark" | "stamp">("pages");

  // 1. Redaction / Whiteout / Text Correction states
  const [corrections, setCorrections] = useState<RedactCorrection[]>([]);
  const [corrType, setCorrType] = useState<"whiteout" | "blackout">("whiteout");
  const [corrX, setCorrX] = useState<number>(50);
  const [corrY, setCorrY] = useState<number>(500);
  const [corrW, setCorrW] = useState<number>(180);
  const [corrH, setCorrH] = useState<number>(24);
  const [corrText, setCorrText] = useState<string>("");
  const [corrFontSize, setCorrFontSize] = useState<number>(12);

  // 2. Freehand Signature Pad states
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [sigPosition, setSigPosition] = useState<"bottom-right" | "bottom-left" | "center">("bottom-right");
  const [sigScale, setSigScale] = useState<number>(100);

  // 3. Watermark states
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkSize, setWatermarkSize] = useState(48);

  // 4. Official Stamp states
  const [stampText, setStampText] = useState("VERIFIED & APPROVED");
  const [stampPosition, setStampPosition] = useState<"top" | "center" | "bottom">("bottom");
  const [stampColor, setStampColor] = useState<"green" | "blue" | "red">("green");

  // 5. Page Numbers
  const [addPageNumbers, setAddPageNumbers] = useState(false);

  // Handle PDF file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const buffer = await f.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setPdfBytes(bytes);

      const pdfDoc = await PDFDocument.load(bytes);
      const count = pdfDoc.getPageCount();
      setPageCount(count);

      const initialPages: PageMeta[] = [];
      for (let i = 0; i < count; i++) {
        const page = pdfDoc.getPage(i);
        const rot = page.getRotation().angle;
        initialPages.push({
          pageIndex: i,
          pageNumber: i + 1,
          rotation: rot,
          isDeleted: false,
        });
      }
      setPages(initialPages);
      setSelectedPageNum(1);
      setSuccessMsg(isHi ? `PDF लोड हो गया (${count} पृष्ठ)` : `PDF loaded successfully (${count} pages)`);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load PDF file");
      setLoading(false);
    }
  };

  // Signature Canvas Drawing Logic
  useEffect(() => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1E3A8A"; // Deep Blue Ink
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Add a correction patch
  const addCorrection = () => {
    const newCorr: RedactCorrection = {
      id: "corr_" + Date.now(),
      pageNumber: selectedPageNum,
      x: corrX,
      y: corrY,
      width: corrW,
      height: corrH,
      type: corrType,
      replacementText: corrText.trim() || undefined,
      fontSize: corrFontSize,
    };
    setCorrections(prev => [...prev, newCorr]);
    setCorrText("");
    setSuccessMsg(isHi ? "सुधार पट्टी जोड़ी गई" : "Correction patch added");
  };

  // Remove a correction patch
  const removeCorrection = (id: string) => {
    setCorrections(prev => prev.filter(c => c.id !== id));
  };

  // Rotate a specific page
  const rotatePage = (idx: number, delta: number = 90) => {
    setPages(prev => prev.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + delta) % 360 } : p));
  };

  // Toggle delete status of a page
  const toggleDeletePage = (idx: number) => {
    setPages(prev => {
      const next = prev.map((p, i) => i === idx ? { ...p, isDeleted: !p.isDeleted } : p);
      if (next.filter(p => !p.isDeleted).length === 0) {
        setError(isHi ? "कम से कम 1 पृष्ठ रखना आवश्यक है" : "You must keep at least 1 page");
        return prev;
      }
      return next;
    });
  };

  // Move page up / down
  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    setPages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, item);
      return arr;
    });
  };

  // Compile and Export edited PDF
  const exportEditedPdf = async () => {
    if (!pdfBytes) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      // Signature image png buffer if drawn
      let embeddedSigImage: any = null;
      if (hasSignature && sigCanvasRef.current) {
        const dataUrl = sigCanvasRef.current.toDataURL("image/png");
        const sigPngBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
        embeddedSigImage = await newPdf.embedPng(sigPngBytes);
      }

      const activePages = pages.filter(p => !p.isDeleted);

      for (let i = 0; i < activePages.length; i++) {
        const meta = activePages[i];
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [meta.pageIndex]);

        // Apply rotation
        copiedPage.setRotation(degrees(meta.rotation));
        const { width, height } = copiedPage.getSize();

        // 1. Apply Whiteout / Blackout / Text Replacement Corrections
        const pageCorrs = corrections.filter(c => c.pageNumber === meta.pageNumber);
        for (const corr of pageCorrs) {
          // Draw rectangle patch
          const fillColor = corr.type === "whiteout" ? rgb(1, 1, 1) : rgb(0.1, 0.1, 0.1);
          copiedPage.drawRectangle({
            x: corr.x,
            y: corr.y,
            width: corr.width,
            height: corr.height,
            color: fillColor,
          });

          // Draw Replacement Text over the patch
          if (corr.replacementText) {
            copiedPage.drawText(corr.replacementText, {
              x: corr.x + 4,
              y: corr.y + 4,
              size: corr.fontSize || 12,
              color: corr.type === "whiteout" ? rgb(0, 0, 0) : rgb(1, 1, 1),
            });
          }
        }

        // 2. Embed Signature on selected page or last page
        if (embeddedSigImage && (meta.pageNumber === selectedPageNum || (!corrections.length && i === activePages.length - 1))) {
          const sigW = (120 * sigScale) / 100;
          const sigH = (50 * sigScale) / 100;
          const posX = sigPosition === "bottom-right" ? width - sigW - 50 : sigPosition === "bottom-left" ? 50 : width / 2 - sigW / 2;
          const posY = 50;
          copiedPage.drawImage(embeddedSigImage, {
            x: posX,
            y: posY,
            width: sigW,
            height: sigH,
          });
        }

        // 3. Watermark
        if (watermarkText.trim()) {
          copiedPage.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: watermarkSize,
            color: rgb(0.6, 0.6, 0.6),
            opacity: watermarkOpacity,
            rotate: degrees(45),
          });
        }

        // 4. Official Stamp
        if (stampText.trim()) {
          const textY = stampPosition === "top" ? height - 35 : stampPosition === "center" ? height / 2 : 30;
          const sColor = stampColor === "green" ? rgb(0.06, 0.72, 0.5) : stampColor === "red" ? rgb(0.88, 0.2, 0.2) : rgb(0.15, 0.4, 0.9);
          copiedPage.drawText(`[ ${stampText} ]`, {
            x: 40,
            y: textY,
            size: 13,
            color: sColor,
          });
        }

        // 5. Sequential Page Numbers
        if (addPageNumbers) {
          copiedPage.drawText(`Page ${i + 1} of ${activePages.length}`, {
            x: width - 90,
            y: 18,
            size: 9,
            color: rgb(0.3, 0.3, 0.3),
          });
        }

        newPdf.addPage(copiedPage);
      }

      const editedBytes = await newPdf.save();
      const blob = new Blob([editedBytes], { type: "application/pdf" });
      const outName = `${file ? file.name.replace(/\.[^/.]+$/, "") : "document"}_edited_studio.pdf`;
      downloadBlob(blob, outName);
      setSuccessMsg(isHi ? `संपादित PDF सफलतापूर्वक डाउनलोड हुआ: ${outName}` : `Edited PDF exported: ${outName}`);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to export PDF");
      setLoading(false);
    }
  };

  const activePagesCount = pages.filter(p => !p.isDeleted).length;

  return (
    <div className="space-y-4">
      {/* File Uploader */}
      <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/40 p-4 text-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          id="pdf-studio-file-upload"
          className="hidden"
        />
        <label htmlFor="pdf-studio-file-upload" className="cursor-pointer">
          <FileText className="mx-auto h-8 w-8 text-rose-600" />
          <p className="mt-1 text-xs font-semibold text-rose-950">
            {file ? file.name : isHi ? "PDF फ़ाइल चुनें (PDF Studio Editor)" : "Select PDF Document (PDF Studio Editor)"}
          </p>
          <p className="text-[10px] text-rose-700">
            {isHi ? "100% सुरक्षित व ऑफलाइन वर्कस्पेस (कोई फ़ाइल सर्वर पर नहीं जाती)" : "100% private client-side PDF Studio"}
          </p>
        </label>
      </div>

      {file && (
        <>
          {/* Studio Navigation Bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "pages"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isHi ? "पेज क्रम व रोटेट" : "Pages & Order"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("correct")}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "correct"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>{isHi ? "टेक्स्ट सुधार व सफेदी (Whiteout)" : "Correct / Redact"}</span>
              {corrections.length > 0 && (
                <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[10px] text-rose-800">
                  {corrections.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("signature")}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "signature"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>{isHi ? "हस्ताक्षर (Digital Sign)" : "Digital Signature"}</span>
              {hasSignature && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("watermark")}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "watermark"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stamp className="h-3.5 w-3.5" />
              <span>{isHi ? "वाटरमार्क" : "Watermark"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("stamp")}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all ${
                activeTab === "stamp"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              <span>{isHi ? "मोहर / स्टैम्प" : "Official Stamp"}</span>
            </button>
          </div>

          {/* TAB 1: Pages Management */}
          {activeTab === "pages" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  {isHi ? `कुल पृष्ठ: ${pages.length} (सक्रिय: ${activePagesCount})` : `Total: ${pages.length} pages (${activePagesCount} active)`}
                </span>
                <button
                  type="button"
                  onClick={() => setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })))}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>{isHi ? "सभी 90° घुमाएं" : "Rotate All 90°"}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
                {pages.map((p, idx) => (
                  <div
                    key={p.pageIndex}
                    className={`relative rounded-xl border p-2 flex flex-col justify-between transition-all ${
                      p.isDeleted 
                        ? "border-red-200 bg-red-50/60 opacity-60" 
                        : "border-slate-200 bg-slate-50/70 hover:border-rose-400"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>{isHi ? `पृष्ठ ${idx + 1}` : `Page ${idx + 1}`}</span>
                      {p.rotation > 0 && (
                        <span className="rounded bg-rose-100 px-1 text-[9px] text-rose-800">
                          {p.rotation}°
                        </span>
                      )}
                    </div>

                    <div 
                      className={`h-20 rounded-lg border border-dashed flex items-center justify-center font-bold text-xs ${
                        p.isDeleted 
                          ? "border-red-300 text-red-500 bg-red-100/50" 
                          : "border-slate-300 text-slate-400 bg-white"
                      }`}
                    >
                      {p.isDeleted ? (
                        <span className="text-[10px] text-red-600 uppercase font-black">{isHi ? "हटाया गया" : "Deleted"}</span>
                      ) : (
                        <div className="text-center space-y-1">
                          <FileText className="mx-auto h-5 w-5 text-rose-400" />
                          <span className="text-[9px] text-slate-400">PDF Page</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0 || p.isDeleted}
                          onClick={() => movePage(idx, idx - 1)}
                          title="Move Up"
                          className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === pages.length - 1 || p.isDeleted}
                          onClick={() => movePage(idx, idx + 1)}
                          title="Move Down"
                          className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={p.isDeleted}
                          onClick={() => rotatePage(idx, 90)}
                          title="Rotate 90°"
                          className="p-1 rounded text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                        >
                          <RotateCw className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleDeletePage(idx)}
                        className={`p-1 rounded ${
                          p.isDeleted 
                            ? "text-emerald-700 hover:bg-emerald-100 font-bold text-[10px]" 
                            : "text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {p.isDeleted ? (isHi ? "पुनर्स्थापित" : "Undo") : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add-page-numbers-checkbox"
                  checked={addPageNumbers}
                  onChange={e => setAddPageNumbers(e.target.checked)}
                  className="rounded accent-rose-600"
                />
                <label htmlFor="add-page-numbers-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  {isHi ? "प्रत्येक पृष्ठ के नीचे पेज नंबर जोड़ें (Page X of Y)" : "Add sequential page numbers (Page X of Y)"}
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Text Correction & Whiteout Redaction */}
          {activeTab === "correct" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 space-y-1">
                <p className="font-bold">{isHi ? "💡 टेक्स्ट सुधार व सफेदी टूल (Text Correction):" : "💡 Text Correction & Redaction:"}</p>
                <p className="text-[11px] leading-relaxed">
                  {isHi 
                    ? "गलत नाम, जन्मतिथि या पते को सफेद पट्टी (Whiteout) से छिपाएं और उसके ऊपर अपना नया सही टेक्स्ट टाइप करें।" 
                    : "Cover misspelled words, dates or errors with a clean whiteout patch and type your new replacement text over it."}
                </p>
              </div>

              {/* Target Page Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "किस पृष्ठ पर सुधारना है?" : "Target Page"}</label>
                  <select
                    value={selectedPageNum}
                    onChange={e => setSelectedPageNum(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                  >
                    {pages.filter(p => !p.isDeleted).map(p => (
                      <option key={p.pageNumber} value={p.pageNumber}>
                        {isHi ? `पृष्ठ ${p.pageNumber}` : `Page ${p.pageNumber}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "पट्टी प्रकार" : "Patch Style"}</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setCorrType("whiteout")}
                      className={`rounded-lg py-2 text-xs font-bold border ${corrType === "whiteout" ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                    >
                      {isHi ? "सफेद (Whiteout)" : "Whiteout"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCorrType("blackout")}
                      className={`rounded-lg py-2 text-xs font-bold border ${corrType === "blackout" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                    >
                      {isHi ? "काला (Blackout)" : "Blackout"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Replacement Text Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "नया सही टेक्स्ट (New Replacement Text):" : "Replacement Text (Optional):"}
                </label>
                <input
                  type="text"
                  value={corrText}
                  onChange={e => setCorrText(e.target.value)}
                  placeholder={isHi ? "जैसे: सही नाम, नई तारीख या सही पता दर्ज करें" : "e.g. Correct Name, New Date or Address"}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
              </div>

              {/* Coordinates & Size Sliders */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>X स्थिति (दाएं-बाएं):</span>
                    <span className="font-bold">{corrX}px</span>
                  </div>
                  <input type="range" min="10" max="500" value={corrX} onChange={e => setCorrX(Number(e.target.value))} className="w-full accent-rose-600" />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>Y स्थिति (ऊपर-नीचे):</span>
                    <span className="font-bold">{corrY}px</span>
                  </div>
                  <input type="range" min="20" max="800" value={corrY} onChange={e => setCorrY(Number(e.target.value))} className="w-full accent-rose-600" />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>पट्टी चौड़ाई (Width):</span>
                    <span className="font-bold">{corrW}px</span>
                  </div>
                  <input type="range" min="30" max="400" value={corrW} onChange={e => setCorrW(Number(e.target.value))} className="w-full accent-rose-600" />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span>पट्टी ऊंचाई (Height):</span>
                    <span className="font-bold">{corrH}px</span>
                  </div>
                  <input type="range" min="12" max="100" value={corrH} onChange={e => setCorrH(Number(e.target.value))} className="w-full accent-rose-600" />
                </div>
              </div>

              <button
                type="button"
                onClick={addCorrection}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-black"
              >
                <Plus className="h-4 w-4" />
                <span>{isHi ? "यह सुधार पैच जोड़ें" : "Add Correction Patch"}</span>
              </button>

              {/* Applied Corrections List */}
              {corrections.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-2">
                  <p className="text-[11px] font-bold text-slate-700">{isHi ? "जोड़े गए सुधार पैच:" : "Applied Patches:"}</p>
                  {corrections.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800">#{i + 1} Page {c.pageNumber} ({c.type})</span>
                        {c.replacementText && <span className="ml-2 text-rose-700 font-semibold">"{c.replacementText}"</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCorrection(c.id)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Digital Signature */}
          {activeTab === "signature" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "उंगली या माउस से डिजिटल हस्ताक्षर बनाएं:" : "Draw your digital signature below:"}
                </label>
                <div className="rounded-xl border-2 border-slate-300 bg-slate-50 flex justify-center p-2">
                  <canvas
                    ref={sigCanvasRef}
                    width={320}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="bg-white rounded-lg border border-slate-200 shadow-xs cursor-crosshair touch-none"
                  />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">
                    {hasSignature ? (isHi ? "हस्ताक्षर दर्ज हुआ ✓" : "Signature recorded ✓") : (isHi ? "बॉक्स में साइन करें" : "Sign in the box above")}
                  </span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    {isHi ? "साफ़ करें (Clear)" : "Clear Signature"}
                  </button>
                </div>
              </div>

              {/* Signature Position */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "हस्ताक्षर की स्थिति (Position):" : "Signature Position:"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "bottom-right", labelEn: "Bottom Right", labelHi: "नीचे दाएं" },
                    { id: "bottom-left", labelEn: "Bottom Left", labelHi: "नीचे बाएं" },
                    { id: "center", labelEn: "Center", labelHi: "मध्य" },
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setSigPosition(pos.id as any)}
                      className={`rounded-lg py-2 text-xs font-bold border ${sigPosition === pos.id ? "bg-rose-600 text-white border-rose-600" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                    >
                      {isHi ? pos.labelHi : pos.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Watermark */}
          {activeTab === "watermark" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "वाटरमार्क टेक्स्ट (Watermark Text)" : "Watermark Text"}
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={e => setWatermarkText(e.target.value)}
                  placeholder="CONFIDENTIAL / DRAFT / OFFICIAL"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isHi ? "पारदर्शिता (Opacity)" : "Opacity"}</span>
                    <span>{Math.round(watermarkOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={e => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isHi ? "फॉन्ट साइज़" : "Font Size"}</span>
                    <span>{watermarkSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="80"
                    step="4"
                    value={watermarkSize}
                    onChange={e => setWatermarkSize(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Official Stamp */}
          {activeTab === "stamp" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "आधिकारिक मोहर / स्टैम्प टेक्स्ट:" : "Stamp / Seal Text:"}
                </label>
                <input
                  type="text"
                  value={stampText}
                  onChange={e => setStampText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? "मोहर रंग (Stamp Color):" : "Color:"}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: "green", label: "Green" },
                      { id: "blue", label: "Blue" },
                      { id: "red", label: "Red" },
                    ].map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setStampColor(c.id as any)}
                        className={`rounded-lg py-1.5 text-xs font-bold border capitalize ${stampColor === c.id ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isHi ? "स्थिति (Position):" : "Position:"}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["top", "center", "bottom"] as const).map(pos => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setStampPosition(pos)}
                        className={`rounded-lg py-1.5 text-xs font-bold border capitalize ${stampPosition === pos ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Export Button */}
          <button
            type="button"
            onClick={exportEditedPdf}
            disabled={loading || activePagesCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 py-3.5 text-sm font-black text-white shadow-md hover:bg-rose-800 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>{isHi ? "संपादित PDF तैयार हो रहा है..." : "Compiling Edited PDF..."}</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>{isHi ? `संपादित PDF डाउनलोड करें (${activePagesCount} पृष्ठ)` : `Export Edited PDF (${activePagesCount} pages)`}</span>
              </>
            )}
          </button>
        </>
      )}

      {/* Status Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-800 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
