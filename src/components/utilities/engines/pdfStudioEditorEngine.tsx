import React, { useState, useRef, useEffect, useCallback } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { 
  FileText, Download, RotateCw, Trash2, ArrowUp, ArrowDown, 
  Check, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Eye, Layers, 
  Type, Eraser, PenTool, Search, Highlighter, Bold, Italic, 
  Underline, Move, MousePointer, Plus, Minus, ChevronLeft, ChevronRight,
  Maximize2, X, Palette, Lock, Unlock
} from "lucide-react";

// Set pdf.js worker URL
if (typeof window !== "undefined" && "Worker" in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
}

interface Props {
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

type ToolMode = "select" | "text" | "whiteout" | "highlight" | "draw" | "signature" | "search";

interface VisualAnnotation {
  id: string;
  pageIndex: number; // 0-based
  type: "text" | "whiteout" | "highlight" | "draw" | "signature";
  x: number; // percentage of page width (0 to 100)
  y: number; // percentage of page height (0 to 100)
  width: number; // percentage of page width
  height: number; // percentage of page height
  text?: string;
  fontSize?: number;
  color?: string; // hex
  bgColor?: string; // hex
  isBold?: boolean;
  isItalic?: boolean;
  drawPoints?: { x: number; y: number }[]; // for freehand pen
}

interface PageMeta {
  pageIndex: number;
  rotation: number;
  isDeleted: boolean;
  origWidth: number;
  origHeight: number;
}

export default function PdfStudioEditorEngine({ isHi, downloadBlob, copyToClipboard }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PDF Document & Page States
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0); // 0-based index
  const [totalPages, setTotalPages] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.2); // Canvas zoom scale

  // Tool Modes (Adobe / Foxit style top toolbar)
  const [activeTool, setActiveTool] = useState<ToolMode>("select");

  // Text Formatting State
  const [currentText, setCurrentText] = useState("Type text here...");
  const [currentFontSize, setCurrentFontSize] = useState<number>(14);
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);

  // Search in Document state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ page: number; text: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Annotations on Pages
  const [annotations, setAnnotations] = useState<VisualAnnotation[]>([]);
  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);

  // Canvas Refs
  const pageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Load PDF file and parse with PDF.js & pdf-lib
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

      // 1. PDF.js Document Proxy
      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const doc = await loadingTask.promise;
      setPdfDocProxy(doc);
      setTotalPages(doc.numPages);

      // 2. Extract page metadata
      const initialPages: PageMeta[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const p = await doc.getPage(i);
        const vp = p.getViewport({ scale: 1.0 });
        initialPages.push({
          pageIndex: i - 1,
          rotation: 0,
          isDeleted: false,
          origWidth: vp.width,
          origHeight: vp.height,
        });
      }
      setPages(initialPages);
      setCurrentPage(0);
      setAnnotations([]);
      setSelectedAnnoId(null);
      setSuccessMsg(isHi ? `PDF लोड हुआ: ${doc.numPages} पृष्ठ` : `PDF loaded: ${doc.numPages} pages`);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load PDF file");
      setLoading(false);
    }
  };

  // Render the current PDF page on the background Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDocProxy || !pageCanvasRef.current || totalPages === 0) return;
    const meta = pages[currentPage];
    if (!meta || meta.isDeleted) return;

    try {
      const page = await pdfDocProxy.getPage(currentPage + 1);
      const viewport = page.getViewport({ 
        scale: zoomScale, 
        rotation: meta.rotation 
      });

      const canvas = pageCanvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Page render error:", err);
    }
  }, [pdfDocProxy, currentPage, zoomScale, pages, totalPages]);

  useEffect(() => {
    renderCurrentPage();
  }, [renderCurrentPage]);

  // Click on Canvas to place Text or Whiteout (Adobe Style Direct Interaction)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = (clickX / rect.width) * 100;
    const yPercent = (clickY / rect.height) * 100;

    if (activeTool === "text") {
      const newAnno: VisualAnnotation = {
        id: "text_" + Date.now(),
        pageIndex: currentPage,
        type: "text",
        x: Math.max(0, Math.min(90, xPercent)),
        y: Math.max(0, Math.min(95, yPercent)),
        width: 25,
        height: 6,
        text: currentText || "Sample Text",
        fontSize: currentFontSize,
        color: currentColor,
        isBold: isBold,
        isItalic: isItalic,
      };
      setAnnotations(prev => [...prev, newAnno]);
      setSelectedAnnoId(newAnno.id);
      setActiveTool("select");
    } else if (activeTool === "whiteout") {
      const newAnno: VisualAnnotation = {
        id: "whiteout_" + Date.now(),
        pageIndex: currentPage,
        type: "whiteout",
        x: Math.max(0, Math.min(85, xPercent)),
        y: Math.max(0, Math.min(95, yPercent)),
        width: 15,
        height: 4,
        bgColor: "#FFFFFF",
      };
      setAnnotations(prev => [...prev, newAnno]);
      setSelectedAnnoId(newAnno.id);
      setActiveTool("select");
    } else if (activeTool === "highlight") {
      const newAnno: VisualAnnotation = {
        id: "highlight_" + Date.now(),
        pageIndex: currentPage,
        type: "highlight",
        x: Math.max(0, Math.min(85, xPercent)),
        y: Math.max(0, Math.min(95, yPercent)),
        width: 20,
        height: 3,
        bgColor: "#FEF08A", // soft yellow
      };
      setAnnotations(prev => [...prev, newAnno]);
      setSelectedAnnoId(newAnno.id);
      setActiveTool("select");
    }
  };

  // Freehand Pen / Signature drawing on Overlay Canvas
  const handleMouseDownDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== "draw" && activeTool !== "signature") return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setIsDrawing(true);
    const startPt = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
    setCurrentPoints([startPt]);
  };

  const handleMouseMoveDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pt = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
    setCurrentPoints(prev => [...prev, pt]);

    // Live stroke preview
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = activeTool === "signature" ? "#1E3A8A" : currentColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo((prevPoints[prevPoints.length - 2]?.x || pt.x) * rect.width / 100, (prevPoints[prevPoints.length - 2]?.y || pt.y) * rect.height / 100);
    ctx.lineTo(pt.x * rect.width / 100, pt.y * rect.height / 100);
    ctx.stroke();
  };

  const prevPoints = currentPoints;

  const handleMouseUpDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPoints.length > 1) {
      const annoType: "signature" | "draw" = activeTool === "signature" ? "signature" : "draw";
      const newAnno: VisualAnnotation = {
        id: (activeTool === "signature" ? "sig_" : "draw_") + Date.now(),
        pageIndex: currentPage,
        type: annoType,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        color: activeTool === "signature" ? "#1E3A8A" : currentColor,
        drawPoints: [...currentPoints],
      };
      setAnnotations(prev => [...prev, newAnno]);
      setCurrentPoints([]);
    }
  };

  // Full-Text Search inside PDF (Adobe / Foxit Ctrl+F Search)
  const handlePdfSearch = async () => {
    if (!pdfDocProxy || !searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);

    try {
      const q = searchQuery.toLowerCase().trim();
      const matches: { page: number; text: string }[] = [];

      for (let i = 1; i <= pdfDocProxy.numPages; i++) {
        const page = await pdfDocProxy.getPage(i);
        const textContent = await page.getTextContent();
        const fullText = textContent.items
          .map((item: any) => item.str || "")
          .join(" ");

        if (fullText.toLowerCase().includes(q)) {
          matches.push({ page: i, text: fullText.slice(0, 80) + "..." });
        }
      }

      setSearchResults(matches);
      if (matches.length > 0) {
        setCurrentPage(matches[0].page - 1);
        setSuccessMsg(isHi ? `${matches.length} परिणाम मिले` : `Found ${matches.length} matches`);
      } else {
        setError(isHi ? "कोई परिणाम नहीं मिला" : "No matches found");
      }
      setIsSearching(false);
    } catch (err: unknown) {
      setError("Search failed");
      setIsSearching(false);
    }
  };

  // Move Annotation via Drag or Sliders
  const updateAnnotationText = (id: string, newText: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, text: newText } : a));
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    if (selectedAnnoId === id) setSelectedAnnoId(null);
  };

  // Rotate Current Page
  const rotateCurrentPage = () => {
    setPages(prev => prev.map((p, i) => i === currentPage ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  // Delete Current Page
  const deleteCurrentPage = () => {
    const active = pages.filter(p => !p.isDeleted);
    if (active.length <= 1) {
      setError(isHi ? "कम से कम 1 पृष्ठ रखना आवश्यक है" : "You must keep at least 1 page");
      return;
    }
    setPages(prev => prev.map((p, i) => i === currentPage ? { ...p, isDeleted: true } : p));
    // Jump to next active page
    const nextIdx = pages.findIndex((p, i) => i > currentPage && !p.isDeleted);
    if (nextIdx !== -1) setCurrentPage(nextIdx);
    else setCurrentPage(pages.findIndex(p => !p.isDeleted));
  };

  // Export and Compile Finished PDF (pdf-lib)
  const exportFullPdf = async () => {
    if (!pdfBytes) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();

      const activePages = pages.filter(p => !p.isDeleted);

      for (let i = 0; i < activePages.length; i++) {
        const meta = activePages[i];
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [meta.pageIndex]);
        copiedPage.setRotation(degrees(meta.rotation));

        const { width, height } = copiedPage.getSize();

        // Apply all annotations for this page
        const pageAnnos = annotations.filter(a => a.pageIndex === meta.pageIndex);
        for (const anno of pageAnnos) {
          const absX = (anno.x / 100) * width;
          const absY = height - ((anno.y / 100) * height) - ((anno.height / 100) * height);
          const absW = (anno.width / 100) * width;
          const absH = (anno.height / 100) * height;

          if (anno.type === "whiteout") {
            copiedPage.drawRectangle({
              x: absX,
              y: absY,
              width: absW,
              height: absH,
              color: rgb(1, 1, 1), // Pure Whiteout
            });
          } else if (anno.type === "highlight") {
            copiedPage.drawRectangle({
              x: absX,
              y: absY,
              width: absW,
              height: absH,
              color: rgb(0.99, 0.94, 0.54), // Soft Yellow
              opacity: 0.5,
            });
          } else if (anno.type === "text" && anno.text) {
            // Hex to rgb
            const hex = (anno.color || "#000000").replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
            const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
            const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;

            copiedPage.drawText(anno.text, {
              x: absX,
              y: absY + 4,
              size: anno.fontSize || 14,
              color: rgb(r, g, b),
            });
          }
        }

        newPdf.addPage(copiedPage);
      }

      const editedBytes = await newPdf.save();
      const blob = new Blob([editedBytes], { type: "application/pdf" });
      const outName = `${file ? file.name.replace(/\.[^/.]+$/, "") : "document"}_adobe_edited.pdf`;
      downloadBlob(blob, outName);
      setSuccessMsg(isHi ? `संपादित PDF सफलतापूर्वक डाउनलोड हुआ: ${outName}` : `PDF exported: ${outName}`);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to compile PDF");
      setLoading(false);
    }
  };

  // Annotations for currently rendered page
  const currentPageAnnos = annotations.filter(a => a.pageIndex === currentPage);

  return (
    <div className="space-y-3">
      {/* Full-Screen Workspace Launcher Banner */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-3 text-white shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
            <Maximize2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-black text-white">
              {isHi ? "समर्पित फुल-स्क्रीन PDF स्टूडियो" : "Full-Screen Dedicated PDF Studio"}
            </p>
            <p className="text-[10px] text-slate-400">
              {isHi ? "बड़ा कैनवास, स्मूथ ड्रैग टेक्स्ट, व्हाइटआउट व रोटेट" : "Expansive workspace, smooth movable text, whiteout & rotate"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { window.location.href = "/utilities/pdf-studio"; }}
          className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-black text-white shadow-md hover:bg-rose-500 transition active:scale-95 shrink-0"
        >
          {isHi ? "फुल-स्क्रीन खोलें →" : "Launch Studio →"}
        </button>
      </div>

      {/* 1. Header PDF Loader */}
      {!file && (
        <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/40 p-6 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            id="adobe-pdf-file-upload"
            className="hidden"
          />
          <label htmlFor="adobe-pdf-file-upload" className="cursor-pointer">
            <FileText className="mx-auto h-10 w-10 text-rose-600 animate-pulse" />
            <p className="mt-2 text-sm font-black text-rose-950">
              {isHi ? "Adobe/Foxit स्टाइल PDF खोलें (Interactive Editor)" : "Open PDF in Visual Adobe / Foxit Studio"}
            </p>
            <p className="text-xs text-rose-700 mt-1">
              {isHi ? "क्लिक करके टेक्स्ट लिखें, मिटाएं (Whiteout), साइन करें और सर्च करें—100% ऑफलाइन" : "Click-to-type text, whiteout eraser, draw signature, search & format"}
            </p>
          </label>
        </div>
      )}

      {file && (
        <>
          {/* 2. Professional Adobe/Foxit Top Toolbar */}
          <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm flex flex-wrap items-center justify-between gap-1.5">
            {/* Tool Selector Group */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTool("select")}
                title="Select / Move Tool"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTool === "select" ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <MousePointer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isHi ? "चयन" : "Select"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("text")}
                title="Add Text Anywhere"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTool === "text" ? "bg-rose-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>{isHi ? "टेक्स्ट लिखें" : "Add Text"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("whiteout")}
                title="Whiteout Eraser Patch"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTool === "whiteout" ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Eraser className="h-3.5 w-3.5" />
                <span>{isHi ? "व्हाइटआउट" : "Whiteout"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("highlight")}
                title="Highlighter"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTool === "highlight" ? "bg-yellow-500 text-slate-900" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Highlighter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isHi ? "हाइलाइट" : "Highlight"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("signature")}
                title="Draw Digital Sign"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTool === "signature" ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>{isHi ? "हस्ताक्षर" : "Signature"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool("search")}
                title="Search inside PDF"
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTool === "search" ? "bg-teal-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isHi ? "सर्च" : "Search"}</span>
              </button>
            </div>

            {/* Page & Zoom Navigation Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-1 text-xs font-bold text-slate-800">
                <button
                  type="button"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  className="disabled:opacity-30 hover:text-rose-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span>{currentPage + 1} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  className="disabled:opacity-30 hover:text-rose-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Zoom In / Out */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.max(0.6, z - 0.2))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-bold text-slate-600 w-10 text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Page Actions: Rotate & Delete */}
              <button
                type="button"
                onClick={rotateCurrentPage}
                title="Rotate Page 90°"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={deleteCurrentPage}
                title="Delete Current Page"
                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Sub-toolbar when Text or Search Tool is Active */}
          {activeTool === "text" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-rose-900">{isHi ? "टेक्स्ट टाइप करें:" : "Type Text:"}</span>
              <input
                type="text"
                value={currentText}
                onChange={e => setCurrentText(e.target.value)}
                placeholder="Type here and click on page to place"
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold flex-1 min-w-[160px]"
              />
              <div className="flex items-center gap-1">
                <span className="text-slate-600">{isHi ? "साइज़:" : "Size:"}</span>
                <input
                  type="number"
                  min="8"
                  max="48"
                  value={currentFontSize}
                  onChange={e => setCurrentFontSize(Number(e.target.value))}
                  className="w-14 rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-xs font-bold"
                />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={currentColor}
                  onChange={e => setCurrentColor(e.target.value)}
                  className="h-6 w-6 rounded cursor-pointer border border-slate-300"
                />
              </div>
              <p className="text-[11px] text-rose-700 w-full mt-0.5">
                {isHi ? "👉 नीचे PDF पेज पर जहाँ चाहें वहाँ क्लिक करें, यह टेक्स्ट तुरंत वहाँ लग जाएगा।" : "👉 Click anywhere on the PDF page below to place this text."}
              </p>
            </div>
          )}

          {activeTool === "search" && (
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-2.5 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={isHi ? "दस्तावेज़ में शब्द खोजें (e.g. नाम, क्रमांक, दिनांक)..." : "Search word in PDF..."}
                  className="flex-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={handlePdfSearch}
                  disabled={isSearching}
                  className="rounded-lg bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-800 disabled:opacity-50"
                >
                  {isSearching ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : isHi ? "खोजें" : "Find"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(res.page - 1)}
                      className={`shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
                        currentPage === res.page - 1
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-teal-100"
                      }`}
                    >
                      {isHi ? `पृष्ठ ${res.page}` : `Page ${res.page}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Interactive Live PDF Canvas Workspace (Adobe Style) */}
          <div className="relative flex justify-center overflow-auto rounded-2xl border border-slate-300 bg-slate-200/80 p-4 max-h-[620px] shadow-inner select-none">
            <div
              ref={containerRef}
              onClick={handleOverlayClick}
              className="relative shadow-2xl bg-white border border-slate-300 transition-all cursor-crosshair"
              style={{
                width: pageCanvasRef.current?.width || 600,
                height: pageCanvasRef.current?.height || 850,
              }}
            >
              {/* Background PDF Render Canvas */}
              <canvas ref={pageCanvasRef} className="block pointer-events-none" />

              {/* Freehand Drawing Overlay Canvas */}
              <canvas
                ref={overlayCanvasRef}
                width={pageCanvasRef.current?.width || 600}
                height={pageCanvasRef.current?.height || 850}
                onMouseDown={handleMouseDownDraw}
                onMouseMove={handleMouseMoveDraw}
                onMouseUp={handleMouseUpDraw}
                className="absolute inset-0 pointer-events-auto"
                style={{
                  pointerEvents: activeTool === "draw" || activeTool === "signature" ? "auto" : "none",
                }}
              />

              {/* Interactive Visual Overlay Elements (Text, Whiteout, Highlight) */}
              {currentPageAnnos.map((anno) => {
                const isSelected = selectedAnnoId === anno.id;

                if (anno.type === "whiteout") {
                  return (
                    <div
                      key={anno.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                      style={{
                        left: `${anno.x}%`,
                        top: `${anno.y}%`,
                        width: `${anno.width}%`,
                        height: `${anno.height}%`,
                        backgroundColor: "#FFFFFF",
                      }}
                      className={`absolute border transition-all ${
                        isSelected ? "border-amber-500 shadow-md ring-2 ring-amber-400" : "border-slate-300 border-dashed"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-6 right-0 flex gap-1 bg-white rounded shadow px-1 py-0.5 border border-slate-200 text-[10px]">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteAnnotation(anno.id); }}
                            className="text-red-600 hover:font-bold"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }

                if (anno.type === "highlight") {
                  return (
                    <div
                      key={anno.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                      style={{
                        left: `${anno.x}%`,
                        top: `${anno.y}%`,
                        width: `${anno.width}%`,
                        height: `${anno.height}%`,
                        backgroundColor: anno.bgColor || "rgba(254, 240, 138, 0.6)",
                      }}
                      className={`absolute transition-all ${
                        isSelected ? "border border-yellow-600 ring-2 ring-yellow-400" : "border-transparent"
                      }`}
                    >
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deleteAnnotation(anno.id); }}
                          className="absolute -top-6 right-0 bg-white rounded shadow p-1 border text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                }

                if (anno.type === "text") {
                  return (
                    <div
                      key={anno.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedAnnoId(anno.id); }}
                      style={{
                        left: `${anno.x}%`,
                        top: `${anno.y}%`,
                        color: anno.color || "#000000",
                        fontSize: `${anno.fontSize || 14}px`,
                        fontWeight: anno.isBold ? "bold" : "normal",
                        fontStyle: anno.isItalic ? "italic" : "normal",
                      }}
                      className={`absolute px-1 py-0.5 whitespace-pre rounded transition-all cursor-move ${
                        isSelected ? "border-2 border-rose-500 bg-white/90 shadow-lg ring-2 ring-rose-400" : "border border-transparent hover:border-slate-300"
                      }`}
                    >
                      {isSelected ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={anno.text || ""}
                            onChange={(e) => updateAnnotationText(anno.id, e.target.value)}
                            className="bg-transparent border-b border-rose-400 font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteAnnotation(anno.id); }}
                            className="text-red-600 hover:text-red-800 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span>{anno.text}</span>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* 5. Save & Export Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-xs">
            <div className="text-xs text-emerald-900 font-semibold">
              <span>{isHi ? "कुल एनोटेशन व सुधार:" : "Total Corrections & Edits:"} </span>
              <b className="text-emerald-700 font-black">{annotations.length}</b>
            </div>

            <button
              type="button"
              onClick={exportFullPdf}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-800 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isHi ? "PDF तैयार हो रहा है..." : "Compiling..."}</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{isHi ? "Adobe स्टाइल संपादित PDF डाउनलोड करें" : "Save & Download PDF"}</span>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Status Notifications */}
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
