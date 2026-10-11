import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { 
  ArrowLeft, Download, RotateCw, Trash2, ZoomIn, ZoomOut, 
  ChevronLeft, ChevronRight, Type, Eraser, Highlighter, 
  PenTool, Search, Check, AlertCircle, RefreshCw, X,
  Move, Plus, Minus, FileText, Sparkles, Layers, Sliders
} from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import toast from "react-hot-toast";

// Setup PDF.js worker
if (typeof window !== "undefined" && "Worker" in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
}

interface NativeDownloadsPlugin {
  saveToDownloads(options: { filename: string; mimeType: string; data: string }): Promise<{ uri: string; filename: string }>;
}
const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

type ToolMode = "select" | "text" | "whiteout" | "highlight" | "draw";

interface VisualTextBox {
  id: string;
  pageIndex: number;
  text: string;
  xPercent: number; // 0 - 100% of page
  yPercent: number; // 0 - 100% of page
  fontSize: number;
  color: string;
  isBold?: boolean;
}

interface VisualWhiteout {
  id: string;
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
}

interface VisualHighlight {
  id: string;
  pageIndex: number;
  xPercent: number;
  yPercent: number;
  wPercent: number;
  hPercent: number;
}

interface FreehandStroke {
  id: string;
  pageIndex: number;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export default function PdfStudioPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ lang?: "en" | "hi" }>() || {};
  const isHi = context.lang === "hi";

  // PDF Document State
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-based
  const [pageRotations, setPageRotations] = useState<number[]>([]);
  const [deletedPages, setDeletedPages] = useState<boolean[]>([]);
  const [zoomScale, setZoomScale] = useState<number>(1.2);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<ToolMode>("select");

  // Visual Elements
  const [textBoxes, setTextBoxes] = useState<VisualTextBox[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [whiteouts, setWhiteouts] = useState<VisualWhiteout[]>([]);
  const [selectedWhiteoutId, setSelectedWhiteoutId] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<VisualHighlight[]>([]);
  const [strokes, setStrokes] = useState<FreehandStroke[]>([]);

  // Text Tool Current Controls
  const [activeFontSize, setActiveFontSize] = useState<number>(16);
  const [activeColor, setActiveColor] = useState<string>("#000000");

  // Freehand Pen Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawPoints, setCurrentDrawPoints] = useState<{ x: number; y: number }[]>([]);

  // Dragging & Resizing State for Text Boxes & Whiteouts
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    type: "text" | "whiteout";
    mode: "move" | "resize";
    startX: number;
    startY: number;
    initialXPercent: number;
    initialYPercent: number;
    initialFontSize?: number;
    initialWPercent?: number;
    initialHPercent?: number;
    initialPinchDist?: number;
  } | null>(null);

  // Processing & Feedback
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Canvas Refs
  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Load PDF File
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLoading(true);

    try {
      const buffer = await f.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setPdfBytes(bytes);

      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const doc = await loadingTask.promise;
      setPdfDocProxy(doc);
      setNumPages(doc.numPages);
      setCurrentPage(0);
      setPageRotations(new Array(doc.numPages).fill(0));
      setDeletedPages(new Array(doc.numPages).fill(false));
      setTextBoxes([]);
      setWhiteouts([]);
      setHighlights([]);
      setStrokes([]);
      setLoading(false);
      toast.success(isHi ? `PDF लोड हुआ: ${doc.numPages} पृष्ठ` : `PDF loaded: ${doc.numPages} pages`);
    } catch (err) {
      setLoading(false);
      toast.error(isHi ? "PDF लोड करने में विफल" : "Failed to load PDF");
    }
  };

  // Render current page onto Canvas
  const renderPage = useCallback(async () => {
    if (!pdfDocProxy || !pageCanvasRef.current || numPages === 0) return;
    if (deletedPages[currentPage]) return;

    try {
      const page = await pdfDocProxy.getPage(currentPage + 1);
      const rot = pageRotations[currentPage] || 0;
      const viewport = page.getViewport({ scale: zoomScale, rotation: rot });

      const canvas = pageCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      await page.render({ canvasContext: ctx, viewport }).promise;
    } catch (err) {
      console.error("Render error:", err);
    }
  }, [pdfDocProxy, currentPage, zoomScale, pageRotations, deletedPages, numPages]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Click on Page to add element or deselect/apply current active editing
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!workspaceRef.current || draggingItem) return;

    // If an item is already selected, clicking outside immediately confirms & applies it
    if (selectedTextId || selectedWhiteoutId) {
      setSelectedTextId(null);
      setSelectedWhiteoutId(null);
      return;
    }

    const rect = workspaceRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const xPct = (clickX / rect.width) * 100;
    const yPct = (clickY / rect.height) * 100;

    if (activeTool === "text") {
      const newBox: VisualTextBox = {
        id: "tb_" + Date.now(),
        pageIndex: currentPage,
        text: isHi ? "यहाँ टेक्स्ट लिखें..." : "Type text here...",
        xPercent: Math.max(2, Math.min(85, xPct)),
        yPercent: Math.max(2, Math.min(95, yPct)),
        fontSize: activeFontSize,
        color: activeColor,
      };
      setTextBoxes(prev => [...prev, newBox]);
      setSelectedTextId(newBox.id);
      setActiveTool("select");
    } else if (activeTool === "whiteout") {
      const newWo: VisualWhiteout = {
        id: "wo_" + Date.now(),
        pageIndex: currentPage,
        xPercent: Math.max(2, Math.min(80, xPct)),
        yPercent: Math.max(2, Math.min(95, yPct)),
        wPercent: 18,
        hPercent: 4,
      };
      setWhiteouts(prev => [...prev, newWo]);
      setSelectedWhiteoutId(newWo.id);
      setActiveTool("select");
    } else if (activeTool === "highlight") {
      const newHl: VisualHighlight = {
        id: "hl_" + Date.now(),
        pageIndex: currentPage,
        xPercent: Math.max(2, Math.min(80, xPct)),
        yPercent: Math.max(2, Math.min(95, yPct)),
        wPercent: 22,
        hPercent: 3,
      };
      setHighlights(prev => [...prev, newHl]);
      setActiveTool("select");
    }
  };

  // Drag & Resize Handlers for Text Boxes & Whiteouts (Touch, Mouse & Two-finger Pinch)
  const handlePointerDown = (
    id: string,
    type: "text" | "whiteout",
    e: React.MouseEvent | React.TouchEvent,
    mode: "move" | "resize" = "move"
  ) => {
    e.stopPropagation();
    if (type === "text") {
      setSelectedTextId(id);
      setSelectedWhiteoutId(null);
    } else {
      setSelectedWhiteoutId(id);
      setSelectedTextId(null);
    }

    const isTouch = "touches" in e;
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let initialPinchDist: number | undefined = undefined;
    if (isTouch && e.touches.length >= 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDist = Math.hypot(dx, dy);
    }

    const curText = type === "text" ? textBoxes.find(t => t.id === id) : undefined;
    const curWo = type === "whiteout" ? whiteouts.find(w => w.id === id) : undefined;

    setDraggingItem({
      id,
      type,
      mode,
      startX: clientX,
      startY: clientY,
      initialXPercent: curText ? curText.xPercent : (curWo ? curWo.xPercent : 0),
      initialYPercent: curText ? curText.yPercent : (curWo ? curWo.yPercent : 0),
      initialFontSize: curText?.fontSize || 16,
      initialWPercent: curWo?.wPercent || 18,
      initialHPercent: curWo?.hPercent || 4,
      initialPinchDist,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingItem || !workspaceRef.current) return;
      const isTouch = "touches" in e;

      // Two-Finger Pinch-to-Resize on touch screens
      if (isTouch && (e as TouchEvent).touches.length >= 2) {
        const t1 = (e as TouchEvent).touches[0];
        const t2 = (e as TouchEvent).touches[1];
        const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        if (draggingItem.initialPinchDist && draggingItem.initialPinchDist > 0) {
          const ratio = currentDist / draggingItem.initialPinchDist;

          if (draggingItem.type === "text") {
            const baseSize = draggingItem.initialFontSize || 16;
            const newSize = Math.max(10, Math.min(80, Math.round(baseSize * ratio)));
            setTextBoxes(prev => prev.map(tb => tb.id === draggingItem.id ? { ...tb, fontSize: newSize } : tb));
            setActiveFontSize(newSize);
          } else {
            const baseW = draggingItem.initialWPercent || 18;
            const baseH = draggingItem.initialHPercent || 4;
            const newW = Math.max(4, Math.min(60, Number((baseW * ratio).toFixed(1))));
            const newH = Math.max(2, Math.min(30, Number((baseH * ratio).toFixed(1))));
            setWhiteouts(prev => prev.map(wo => wo.id === draggingItem.id ? { ...wo, wPercent: newW, hPercent: newH } : wo));
          }
        }
        return;
      }

      const clientX = isTouch ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = isTouch ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;

      const rect = workspaceRef.current.getBoundingClientRect();
      const deltaXPercent = ((clientX - draggingItem.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - draggingItem.startY) / rect.height) * 100;

      if (draggingItem.mode === "resize") {
        if (draggingItem.type === "text") {
          const deltaPx = clientX - draggingItem.startX;
          const baseSize = draggingItem.initialFontSize || 16;
          const newSize = Math.max(10, Math.min(80, Math.round(baseSize + deltaPx / 4)));
          setTextBoxes(prev => prev.map(tb => tb.id === draggingItem.id ? { ...tb, fontSize: newSize } : tb));
          setActiveFontSize(newSize);
        } else {
          const baseW = draggingItem.initialWPercent || 18;
          const baseH = draggingItem.initialHPercent || 4;
          const newW = Math.max(4, Math.min(80, Number((baseW + deltaXPercent).toFixed(1))));
          const newH = Math.max(2, Math.min(40, Number((baseH + deltaYPercent).toFixed(1))));
          setWhiteouts(prev => prev.map(wo => wo.id === draggingItem.id ? { ...wo, wPercent: newW, hPercent: newH } : wo));
        }
      } else {
        const newXPct = Math.max(0, Math.min(95, draggingItem.initialXPercent + deltaXPercent));
        const newYPct = Math.max(0, Math.min(98, draggingItem.initialYPercent + deltaYPercent));

        if (draggingItem.type === "text") {
          setTextBoxes(prev => prev.map(tb => tb.id === draggingItem.id ? { ...tb, xPercent: newXPct, yPercent: newYPct } : tb));
        } else {
          setWhiteouts(prev => prev.map(wo => wo.id === draggingItem.id ? { ...wo, xPercent: newXPct, yPercent: newYPct } : wo));
        }
      }
    };

    const handlePointerUp = () => {
      setDraggingItem(null);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [draggingItem]);

  // Page Operations
  const rotatePage = () => {
    setPageRotations(prev => {
      const arr = [...prev];
      arr[currentPage] = ((arr[currentPage] || 0) + 90) % 360;
      return arr;
    });
  };

  const deletePage = () => {
    const remaining = deletedPages.filter((d, i) => i !== currentPage && !d).length;
    if (remaining === 0) {
      toast.error(isHi ? "कम से कम 1 पृष्ठ रखना आवश्यक है" : "You must keep at least 1 page");
      return;
    }
    setDeletedPages(prev => {
      const arr = [...prev];
      arr[currentPage] = true;
      return arr;
    });
    // Move to next active page
    const nextIdx = deletedPages.findIndex((d, i) => i > currentPage && !d);
    if (nextIdx !== -1) setCurrentPage(nextIdx);
    else setCurrentPage(deletedPages.findIndex(d => !d));
  };

  // Compile and Save PDF using pdf-lib
  const saveAndExport = async () => {
    if (!pdfBytes) return;
    setLoading(true);

    try {
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      for (let i = 0; i < numPages; i++) {
        if (deletedPages[i]) continue;

        const [copiedPage] = await newPdf.copyPages(sourcePdf, [i]);
        const rot = pageRotations[i] || 0;
        copiedPage.setRotation(degrees(rot));

        const { width, height } = copiedPage.getSize();

        // 1. Draw Whiteout Patches
        const pageWhiteouts = whiteouts.filter(w => w.pageIndex === i);
        for (const wo of pageWhiteouts) {
          const absX = (wo.xPercent / 100) * width;
          const absY = height - ((wo.yPercent / 100) * height) - ((wo.hPercent / 100) * height);
          const absW = (wo.wPercent / 100) * width;
          const absH = (wo.hPercent / 100) * height;

          copiedPage.drawRectangle({
            x: absX,
            y: absY,
            width: absW,
            height: absH,
            color: rgb(1, 1, 1),
          });
        }

        // 2. Draw Highlights
        const pageHighlights = highlights.filter(h => h.pageIndex === i);
        for (const hl of pageHighlights) {
          const absX = (hl.xPercent / 100) * width;
          const absY = height - ((hl.yPercent / 100) * height) - ((hl.hPercent / 100) * height);
          const absW = (hl.wPercent / 100) * width;
          const absH = (hl.hPercent / 100) * height;

          copiedPage.drawRectangle({
            x: absX,
            y: absY,
            width: absW,
            height: absH,
            color: rgb(0.99, 0.94, 0.54),
            opacity: 0.5,
          });
        }

        // 3. Draw Text Boxes
        const pageTexts = textBoxes.filter(t => t.pageIndex === i);
        for (const tb of pageTexts) {
          const absX = (tb.xPercent / 100) * width;
          const absY = height - ((tb.yPercent / 100) * height) - (tb.fontSize || 14);

          const hex = (tb.color || "#000000").replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
          const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
          const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

          copiedPage.drawText(tb.text, {
            x: absX,
            y: Math.max(10, absY),
            size: tb.fontSize || 14,
            color: rgb(r, g, b),
          });
        }

        newPdf.addPage(copiedPage);
      }

      const editedBytes = await newPdf.save();
      const blob = new Blob([editedBytes], { type: "application/pdf" });
      const filename = `${file ? file.name.replace(/\.[^/.]+$/, "") : "document"}_edited.pdf`;

      // Native Capacitor Download / Web fallback
      if (Capacitor.isNativePlatform()) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const dataUrl = reader.result as string;
          await NativeDownloads.saveToDownloads({
            filename,
            mimeType: "application/pdf",
            data: dataUrl,
          });
          toast.success(isHi ? `फ़ाइल Downloads में सेव हुई: ${filename}` : `Saved: ${filename}`);
        };
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
        toast.success(isHi ? `PDF डाउनलोड हुआ: ${filename}` : `PDF downloaded: ${filename}`);
      }

      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      toast.error(isHi ? "PDF सेव करने में विफल" : "Failed to save PDF");
    }
  };

  const activePagesCount = numPages - deletedPages.filter(Boolean).length;
  const curPageTexts = textBoxes.filter(t => t.pageIndex === currentPage);
  const curPageWhiteouts = whiteouts.filter(w => w.pageIndex === currentPage);
  const curPageHighlights = highlights.filter(h => h.pageIndex === currentPage);

  return (
    <div className="flex h-screen w-screen flex-col bg-[#FFF7E8] text-slate-800 overflow-hidden font-sans select-none">
      {/* 1. TOP PREMIUM APP BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/utilities")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition"
            title="Back to Utilities"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              <span>PDF Studio Pro</span>
              <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                Studio
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">
              {file ? file.name : (isHi ? "दस्तावेज़ खोलें" : "Open Document")}
            </p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveAndExport}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isHi ? "PDF सेव करें" : "Save PDF"}</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE / EMPTY STATE */}
      {!file ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="max-w-md rounded-3xl border border-[#D8E8DB] bg-white p-8 text-center shadow-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4 ring-1 ring-rose-200">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              {isHi ? "PDF Studio में संपादन शुरू करें" : "Open PDF in Studio Workspace"}
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {isHi
                ? "सीधे पेज पर क्लिक करके टेक्स्ट लिखें, ड्रैग करके कहीं भी ले जाएं, गलत शब्दों पर व्हाइटआउट लगाएं, और पेज रोटेट करें—पूरी तरह सुरक्षित व निजी।"
                : "Full visual workspace: Click anywhere to type, smoothly drag text boxes, whiteout errors, rotate and delete pages without uploading anywhere."}
            </p>

            <div className="mt-6">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                id="pdf-full-studio-upload"
                className="hidden"
              />
              <label
                htmlFor="pdf-full-studio-upload"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-xs font-black text-white shadow-md hover:bg-rose-500 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>{isHi ? "डिवाइस से PDF फ़ाइल चुनें" : "Select PDF Document"}</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* TOOLBAR TABS (CANVA STYLE) */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <button
                type="button"
                onClick={() => setActiveTool("select")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTool === "select" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Move className="h-3.5 w-3.5" />
                <span>{isHi ? "ड्रैग / मूव" : "Move / Select"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("text")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTool === "text" ? "bg-rose-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>{isHi ? "टेक्स्ट लिखें" : "Add Text"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("whiteout")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTool === "whiteout" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>{isHi ? "व्हाइटआउट (मिटाएं)" : "Whiteout"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("highlight")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTool === "highlight" ? "bg-yellow-400 text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Highlighter className="h-3.5 w-3.5" />
                <span>{isHi ? "हाइलाइट" : "Highlight"}</span>
              </button>
            </div>

            {/* Page Navigation & Zoom Controls */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                  title="Zoom Out"
                  className="hover:text-rose-600 p-0.5"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] w-9 text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                  title="Zoom In"
                  className="hover:text-rose-600 p-0.5"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  className="disabled:opacity-30 hover:text-rose-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span>{currentPage + 1} / {numPages}</span>
                <button
                  type="button"
                  disabled={currentPage >= numPages - 1}
                  onClick={() => setCurrentPage(p => Math.min(numPages - 1, p + 1))}
                  className="disabled:opacity-30 hover:text-rose-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Rotate & Delete Page */}
              <button
                type="button"
                onClick={rotatePage}
                title="Rotate Page"
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={deletePage}
                title="Delete Page"
                className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE TOOL SUB-CONTROLS */}
          {activeTool === "text" && (
            <div className="flex h-10 shrink-0 items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 text-xs">
              <span className="text-slate-600 font-semibold">{isHi ? "फॉन्ट साइज़:" : "Size:"}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveFontSize(s => Math.max(10, s - 2))}
                  className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-bold text-slate-800">{activeFontSize}px</span>
                <button
                  type="button"
                  onClick={() => setActiveFontSize(s => Math.min(48, s + 2))}
                  className="p-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <span className="text-slate-600 font-semibold ml-2">{isHi ? "रंग:" : "Color:"}</span>
              <input
                type="color"
                value={activeColor}
                onChange={e => setActiveColor(e.target.value)}
                className="h-6 w-6 rounded cursor-pointer border border-slate-300"
              />

              <span className="text-rose-600 text-[11px] font-bold ml-auto">
                {isHi ? "👉 नीचे पेज पर जहाँ चाहें क्लिक करें" : "👉 Click anywhere on page to place text"}
              </span>
            </div>
          )}

          {/* 3. VISUAL INTERACTIVE WORKSPACE (CANVAS + DRAGGABLE OVERLAYS) */}
          <div className="flex flex-1 justify-center items-start overflow-auto p-4 sm:p-8 bg-slate-100">
            <div
              ref={workspaceRef}
              onClick={handlePageClick}
              className="relative shadow-2xl bg-white border border-slate-700 rounded-sm transition-transform cursor-crosshair"
              style={{
                width: pageCanvasRef.current?.width || 600,
                height: pageCanvasRef.current?.height || 850,
              }}
            >
              {/* Background PDF Rendered Page */}
              <canvas ref={pageCanvasRef} className="block pointer-events-none" />

              {/* Whiteout Patches (Draggable & Resizable) */}
              {curPageWhiteouts.map(wo => {
                const isSelected = selectedWhiteoutId === wo.id;
                return (
                  <div
                    key={wo.id}
                    onMouseDown={(e) => handlePointerDown(wo.id, "whiteout", e, "move")}
                    onTouchStart={(e) => handlePointerDown(wo.id, "whiteout", e, "move")}
                    style={{
                      left: `${wo.xPercent}%`,
                      top: `${wo.yPercent}%`,
                      width: `${wo.wPercent}%`,
                      height: `${wo.hPercent}%`,
                      backgroundColor: "#FFFFFF",
                    }}
                    className={`absolute cursor-move border transition-all ${
                      isSelected ? "border-amber-500 shadow-md ring-2 ring-amber-400" : "border-slate-300 border-dashed"
                    }`}
                  >
                    {isSelected && (
                      <>
                        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-white rounded shadow-md px-1.5 py-0.5 border border-slate-200 text-[10px] z-30">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWhiteoutId(null);
                            }}
                            title="Apply (लागू करें)"
                            className="text-emerald-700 hover:bg-emerald-50 px-1 py-0.5 rounded font-bold flex items-center gap-0.5"
                          >
                            <Check className="h-3 w-3" />
                            <span>Apply</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWhiteouts(prev => prev.filter(w => w.id !== wo.id));
                              setSelectedWhiteoutId(null);
                            }}
                            className="text-red-600 hover:bg-red-50 p-0.5 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        {/* Bottom-right Corner Resize Handle */}
                        <div
                          onMouseDown={(e) => handlePointerDown(wo.id, "whiteout", e, "resize")}
                          onTouchStart={(e) => handlePointerDown(wo.id, "whiteout", e, "resize")}
                          className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-amber-500 border-2 border-white shadow-md cursor-se-resize z-20 flex items-center justify-center touch-none"
                          title="Drag or Pinch to resize"
                        />
                      </>
                    )}
                  </div>
                );
              })}

              {/* Highlights */}
              {curPageHighlights.map(hl => (
                <div
                  key={hl.id}
                  style={{
                    left: `${hl.xPercent}%`,
                    top: `${hl.yPercent}%`,
                    width: `${hl.wPercent}%`,
                    height: `${hl.hPercent}%`,
                    backgroundColor: "rgba(254, 240, 138, 0.6)",
                  }}
                  className="absolute pointer-events-none"
                />
              ))}

              {/* Draggable, Resizable & Live-Editable Text Boxes */}
              {curPageTexts.map(tb => {
                const isSelected = selectedTextId === tb.id;
                return (
                  <div
                    key={tb.id}
                    onMouseDown={(e) => handlePointerDown(tb.id, "text", e, "move")}
                    onTouchStart={(e) => handlePointerDown(tb.id, "text", e, "move")}
                    style={{
                      left: `${tb.xPercent}%`,
                      top: `${tb.yPercent}%`,
                      fontSize: `${tb.fontSize}px`,
                      color: tb.color,
                    }}
                    className={`absolute rounded px-1.5 py-0.5 cursor-move whitespace-pre font-bold select-none ${
                      isSelected
                        ? "border-2 border-rose-500 bg-white/95 shadow-xl ring-2 ring-rose-400 z-30"
                        : "border border-transparent hover:border-slate-400"
                    }`}
                  >
                    {isSelected ? (
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tb.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTextBoxes(prev => prev.map(t => t.id === tb.id ? { ...t, text: val } : t));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setSelectedTextId(null);
                            }
                          }}
                          className="bg-transparent border-b border-rose-500 font-bold text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        {/* Direct Confirm / Apply Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedTextId(null)}
                          title="Apply Text (लागू करें)"
                          className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs hover:bg-emerald-700 flex items-center gap-0.5"
                        >
                          <Check className="h-3 w-3" />
                          <span>Apply</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTextBoxes(prev => prev.filter(t => t.id !== tb.id));
                            setSelectedTextId(null);
                          }}
                          className="text-red-600 hover:text-red-800 p-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {/* Corner Resize Handle */}
                        <div
                          onMouseDown={(e) => handlePointerDown(tb.id, "text", e, "resize")}
                          onTouchStart={(e) => handlePointerDown(tb.id, "text", e, "resize")}
                          className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-rose-600 border-2 border-white shadow-md cursor-se-resize z-40 flex items-center justify-center touch-none"
                          title="Drag or Pinch to resize text"
                        />
                      </div>
                    ) : (
                      <span>{tb.text}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
