import React, { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { 
  FileText, Download, RotateCw, Trash2, ArrowUp, ArrowDown, 
  Plus, Edit3, Shield, Check, AlertCircle, RefreshCw, ZoomIn, 
  ZoomOut, Eye, Layers, Type, Stamp
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

export default function PdfStudioEditorEngine({ isHi, downloadBlob, copyToClipboard }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PDF Page Management
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(0);

  // Editor Tools & Annotations
  const [activeTab, setActiveTab] = useState<"pages" | "text" | "watermark" | "security">("pages");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);
  const [watermarkSize, setWatermarkSize] = useState(48);

  // Text Stamp
  const [customText, setCustomText] = useState("VERIFIED & APPROVED");
  const [stampColor, setStampColor] = useState("#10B981"); // emerald green
  const [stampPosition, setStampPosition] = useState<"top" | "center" | "bottom">("bottom");

  // Page Numbers
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
      setSelectedPageIndex(0);
      setSuccessMsg(isHi ? `PDF लोड हो गया (${count} पृष्ठ)` : `PDF loaded successfully (${count} pages)`);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load PDF file");
      setLoading(false);
    }
  };

  // Rotate a specific page
  const rotatePage = (idx: number, delta: number = 90) => {
    setPages(prev => prev.map((p, i) => {
      if (i === idx) {
        return { ...p, rotation: (p.rotation + delta) % 360 };
      }
      return p;
    }));
  };

  // Toggle delete status of a page
  const toggleDeletePage = (idx: number) => {
    setPages(prev => {
      const next = prev.map((p, i) => i === idx ? { ...p, isDeleted: !p.isDeleted } : p);
      const remaining = next.filter(p => !p.isDeleted);
      if (remaining.length === 0) {
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

  // Rotate all pages at once
  const rotateAllPages = (delta: number = 90) => {
    setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + delta) % 360 })));
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

      // Filter active pages in order
      const activePages = pages.filter(p => !p.isDeleted);

      for (let i = 0; i < activePages.length; i++) {
        const meta = activePages[i];
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [meta.pageIndex]);

        // Apply page rotation
        copiedPage.setRotation(degrees(meta.rotation));

        const { width, height } = copiedPage.getSize();

        // 1. Apply watermark if enabled in tab or configured
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

        // 2. Apply Custom Text / Stamp
        if (customText.trim()) {
          const textY = stampPosition === "top" ? height - 40 : stampPosition === "center" ? height / 2 : 30;
          copiedPage.drawText(customText, {
            x: 40,
            y: textY,
            size: 14,
            color: rgb(0.06, 0.72, 0.5), // emerald
          });
        }

        // 3. Add page numbers if checked
        if (addPageNumbers) {
          copiedPage.drawText(`Page ${i + 1} of ${activePages.length}`, {
            x: width - 100,
            y: 20,
            size: 10,
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
      {/* 1. Header File Uploader */}
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
          {/* 2. Studio Toolbar Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("pages")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "pages"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isHi ? "पृष्ठ प्रबंधक (Pages)" : "Pages"}</span>
              <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[10px] text-rose-800">
                {activePagesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("watermark")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "watermark"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Stamp className="h-3.5 w-3.5" />
              <span>{isHi ? "वाटरमार्क (Watermark)" : "Watermark"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("text")}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === "text"
                  ? "border-rose-600 text-rose-700 bg-rose-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Type className="h-3.5 w-3.5" />
              <span>{isHi ? "टेक्स्ट व स्टैम्प (Stamp)" : "Stamp & Text"}</span>
            </button>
          </div>

          {/* 3. Tab Contents */}

          {/* Tab A: Page Reorder, Rotate & Delete */}
          {activeTab === "pages" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">
                  {isHi ? `कुल पृष्ठ: ${pages.length} (सक्रिय: ${activePagesCount})` : `Total: ${pages.length} pages (${activePagesCount} active)`}
                </span>
                <button
                  type="button"
                  onClick={() => rotateAllPages(90)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>{isHi ? "सभी 90° घुमाएं" : "Rotate All 90°"}</span>
                </button>
              </div>

              {/* Page Grid Cards */}
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
                    {/* Page Top Bar */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>{isHi ? `पृष्ठ ${idx + 1}` : `Page ${idx + 1}`}</span>
                      {p.rotation > 0 && (
                        <span className="rounded bg-rose-100 px-1 text-[9px] text-rose-800">
                          {p.rotation}°
                        </span>
                      )}
                    </div>

                    {/* Page Thumbnail Representation */}
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

                    {/* Page Actions */}
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
                        title={p.isDeleted ? "Restore Page" : "Delete Page"}
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

              {/* Page Numbering Option */}
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

          {/* Tab B: Watermark Controls */}
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

              <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">{isHi ? "वाटरमार्क प्रीव्यू:" : "Watermark Preview:"} </span>
                <span className="text-sm font-black text-slate-700 tracking-wider ml-1">
                  {watermarkText || (isHi ? "(खाली)" : "(Empty)")}
                </span>
              </div>
            </div>
          )}

          {/* Tab C: Text Annotation & Approval Stamp */}
          {activeTab === "text" && (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "आधिकारिक स्टैम्प / टेक्स्ट एनोटेशन" : "Official Stamp / Approval Text"}
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder="VERIFIED & APPROVED / कार्यालय प्रति"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isHi ? "स्टैम्प स्थिति (Position)" : "Stamp Position"}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["top", "center", "bottom"] as const).map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setStampPosition(pos)}
                      className={`rounded-lg py-2 text-xs font-bold border capitalize ${
                        stampPosition === pos 
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs" 
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {pos === "top" ? (isHi ? "ऊपर (Top)" : "Top") : pos === "center" ? (isHi ? "मध्य (Center)" : "Center") : (isHi ? "नीचे (Bottom)" : "Bottom")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Action Export Button */}
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
