import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft, Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  ZoomIn, ZoomOut, Crop, Type, Sparkles, Sliders, Brush, Trash2,
  Undo2, RefreshCw, Plus, Check, X, Move, Stamp, Image as ImageIcon
} from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import toast from "react-hot-toast";

interface NativeDownloadsPlugin {
  saveToDownloads(options: { filename: string; mimeType: string; data: string }): Promise<{ uri: string; filename: string }>;
}
const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

type ActiveTab = "adjust" | "crop" | "text" | "stamps" | "brush";

interface DraggableText {
  id: string;
  text: string;
  xPercent: number; // 0-100% of image
  yPercent: number;
  fontSize: number;
  color: string;
  bgColor: "none" | "dark" | "light" | "red";
  isBold: boolean;
}

interface DraggableStamp {
  id: string;
  label: string;
  subLabel?: string;
  xPercent: number;
  yPercent: number;
  color: string;
}

export default function ImageStudioPage() {
  const navigate = useNavigate();
  const context = useOutletContext<{ lang?: "en" | "hi" }>() || {};
  const isHi = context.lang === "hi";

  // Image Source
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Active Tool Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>("adjust");

  // Adjustments State
  const [brightness, setBrightness] = useState<number>(100); // 50 - 150
  const [contrast, setContrast] = useState<number>(100);   // 50 - 150
  const [saturation, setSaturation] = useState<number>(100); // 0 - 200
  const [blur, setBlur] = useState<number>(0);             // 0 - 10
  const [filterPreset, setFilterPreset] = useState<string>("none"); // 'none' | 'grayscale' | 'sepia' | 'vintage' | 'invert'

  // Transforms
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Crop State
  const [cropAspect, setCropAspect] = useState<string>("free"); // 'free', '1:1', '4:3', '16:9', '3:4'

  // Draggable Texts & Stamps
  const [textBoxes, setTextBoxes] = useState<DraggableText[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [stamps, setStamps] = useState<DraggableStamp[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);

  // New text properties
  const [textInput, setTextInput] = useState<string>("");
  const [activeFontSize, setActiveFontSize] = useState<number>(24);
  const [activeTextColor, setActiveTextColor] = useState<string>("#FFFFFF");
  const [activeTextBg, setActiveTextBg] = useState<"none" | "dark" | "light" | "red">("dark");

  // Brush / Freehand Drawing
  const [isBrushActive, setIsBrushActive] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#EF4444");
  const [brushSize, setBrushSize] = useState<number>(6);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingStrokes, setDrawingStrokes] = useState<{ xPct: number; yPct: number; color: string; size: number; isNew: boolean }[]>([]);

  // Dragging interaction state
  const [draggingItem, setDraggingItem] = useState<{
    id: string;
    type: "text" | "stamp";
    startX: number;
    startY: number;
    initialXPct: number;
    initialYPct: number;
  } | null>(null);

  // Zoom & Viewport
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [exportFormat, setExportFormat] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [exportQuality, setExportQuality] = useState<number>(0.92);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  // Load Image when file is selected
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        // Reset studio parameters
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setBlur(0);
        setFilterPreset("none");
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setTextBoxes([]);
        setStamps([]);
        setDrawingStrokes([]);
        setZoomScale(1);
        toast.success(isHi ? "इमेज सफलतापूर्वक लोड हुई" : "Image loaded into Studio");
      };
      img.src = src;
    };
    reader.readAsDataURL(f);
  };

  // Redraw Canvas when adjustments change
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !imageElement) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions accounting for 90/270 rotation
    const isSideways = rotation === 90 || rotation === 270;
    const naturalWidth = imageElement.naturalWidth || 800;
    const naturalHeight = imageElement.naturalHeight || 600;

    canvas.width = isSideways ? naturalHeight : naturalWidth;
    canvas.height = isSideways ? naturalWidth : naturalHeight;

    ctx.save();

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filters string
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (blur > 0) filterString += ` blur(${blur}px)`;
    if (filterPreset === "grayscale") filterString += ` grayscale(100%)`;
    else if (filterPreset === "sepia") filterString += ` sepia(90%)`;
    else if (filterPreset === "invert") filterString += ` invert(100%)`;
    else if (filterPreset === "vintage") filterString += ` sepia(50%) contrast(120%)`;

    ctx.filter = filterString;

    // Center translation for rotation & flips
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw base image centered
    ctx.drawImage(
      imageElement,
      -naturalWidth / 2,
      -naturalHeight / 2,
      naturalWidth,
      naturalHeight
    );

    ctx.restore();

    // Draw freehand strokes onto canvas
    if (drawingStrokes.length > 0) {
      ctx.save();
      for (let i = 0; i < drawingStrokes.length; i++) {
        const stroke = drawingStrokes[i];
        const x = (stroke.xPct / 100) * canvas.width;
        const y = (stroke.yPct / 100) * canvas.height;
        ctx.fillStyle = stroke.color;
        ctx.beginPath();
        ctx.arc(x, y, stroke.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }, [imageElement, brightness, contrast, saturation, blur, filterPreset, rotation, flipH, flipV, drawingStrokes]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer dragging handler (smooth touch & mouse)
  const handlePointerDown = (
    id: string,
    type: "text" | "stamp",
    clientX: number,
    clientY: number,
    initialXPct: number,
    initialYPct: number
  ) => {
    if (type === "text") {
      setSelectedTextId(id);
      setSelectedStampId(null);
    } else {
      setSelectedStampId(id);
      setSelectedTextId(null);
    }

    setDraggingItem({
      id,
      type,
      startX: clientX,
      startY: clientY,
      initialXPct,
      initialYPct,
    });
  };

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingItem || !workspaceRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const rect = workspaceRef.current.getBoundingClientRect();
      const deltaXPercent = ((clientX - draggingItem.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - draggingItem.startY) / rect.height) * 100;

      const newXPct = Math.max(1, Math.min(94, draggingItem.initialXPct + deltaXPercent));
      const newYPct = Math.max(1, Math.min(94, draggingItem.initialYPct + deltaYPercent));

      if (draggingItem.type === "text") {
        setTextBoxes(prev => prev.map(t => t.id === draggingItem.id ? { ...t, xPercent: newXPct, yPercent: newYPct } : t));
      } else {
        setStamps(prev => prev.map(s => s.id === draggingItem.id ? { ...s, xPercent: newXPct, yPercent: newYPct } : s));
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

  // Adding Text Box
  const addTextBox = () => {
    const txt = textInput.trim() || (isHi ? "यहाँ लिखें" : "Enter Text");
    const newBox: DraggableText = {
      id: "txt_" + Date.now(),
      text: txt,
      xPercent: 30,
      yPercent: 40,
      fontSize: activeFontSize,
      color: activeTextColor,
      bgColor: activeTextBg,
      isBold: true,
    };
    setTextBoxes(prev => [...prev, newBox]);
    setSelectedTextId(newBox.id);
    setTextInput("");
    toast.success(isHi ? "टेक्स्ट जोड़ा गया! इसे ड्रैग करके कहीं भी रखें।" : "Text added! Drag anywhere on image.");
  };

  // Adding Pre-designed Badges/Stamps
  const addStamp = (label: string, color: string, sub?: string) => {
    const newStamp: DraggableStamp = {
      id: "stamp_" + Date.now(),
      label,
      subLabel: sub,
      xPercent: 35,
      yPercent: 40,
      color,
    };
    setStamps(prev => [...prev, newStamp]);
    setSelectedStampId(newStamp.id);
    toast.success(isHi ? `स्टैम्प लगाया: ${label}` : `Stamp added: ${label}`);
  };

  // Brush drawing handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBrushActive || !canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingStrokes(prev => [...prev, { xPct, yPct, color: brushColor, size: brushSize, isNew: true }]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isBrushActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setDrawingStrokes(prev => [...prev, { xPct, yPct, color: brushColor, size: brushSize, isNew: false }]);
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  // Aspect Ratio Crop Execution
  const applyAspectCrop = (ratio: number) => {
    if (!canvasRef.current || !imageElement) return;
    const canvas = canvasRef.current;
    const curW = canvas.width;
    const curH = canvas.height;

    let targetW = curW;
    let targetH = curH;

    if (curW / curH > ratio) {
      targetW = curH * ratio;
    } else {
      targetH = curW / ratio;
    }

    const startX = (curW - targetW) / 2;
    const startY = (curH - targetH) / 2;

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = targetW;
    cropCanvas.height = targetH;
    const cCtx = cropCanvas.getContext("2d");
    if (!cCtx) return;

    cCtx.drawImage(canvas, startX, startY, targetW, targetH, 0, 0, targetW, targetH);

    const newImg = new Image();
    newImg.onload = () => {
      setImageElement(newImg);
      toast.success(isHi ? "क्रॉप लागू हुआ" : "Crop applied");
    };
    newImg.src = cropCanvas.toDataURL("image/png");
  };

  // Compile Final Image with Draggable Texts & Stamps
  const saveAndExport = async () => {
    if (!canvasRef.current || !imageElement) return;
    setLoading(true);

    try {
      // Create offscreen compile canvas
      const compCanvas = document.createElement("canvas");
      compCanvas.width = canvasRef.current.width;
      compCanvas.height = canvasRef.current.height;
      const ctx = compCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      // Draw base rendered image
      ctx.drawImage(canvasRef.current, 0, 0);

      // Render Draggable Stamps onto final image
      for (const stamp of stamps) {
        const x = (stamp.xPercent / 100) * compCanvas.width;
        const y = (stamp.yPercent / 100) * compCanvas.height;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.08); // Slight organic stamp angle

        // Badge Pill / Box
        ctx.strokeStyle = stamp.color;
        ctx.lineWidth = Math.max(3, compCanvas.width * 0.004);
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        const boxW = Math.max(160, compCanvas.width * 0.22);
        const boxH = Math.max(50, compCanvas.height * 0.08);
        ctx.beginPath();
        ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 10);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = stamp.color;
        ctx.font = `bold ${Math.max(16, Math.round(compCanvas.width * 0.022))}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stamp.label, 0, stamp.subLabel ? -boxH * 0.15 : 0);

        if (stamp.subLabel) {
          ctx.fillStyle = "#64748B";
          ctx.font = `bold ${Math.max(11, Math.round(compCanvas.width * 0.013))}px sans-serif`;
          ctx.fillText(stamp.subLabel, 0, boxH * 0.22);
        }

        ctx.restore();
      }

      // Render Draggable Texts onto final image
      for (const tb of textBoxes) {
        const x = (tb.xPercent / 100) * compCanvas.width;
        const y = (tb.yPercent / 100) * compCanvas.height;

        ctx.save();
        const baseSize = tb.fontSize * (compCanvas.width / 600);
        ctx.font = `${tb.isBold ? "bold" : "normal"} ${Math.round(baseSize)}px sans-serif`;
        ctx.textBaseline = "top";

        // Measure text for badge background
        const metrics = ctx.measureText(tb.text);
        const paddingX = baseSize * 0.35;
        const paddingY = baseSize * 0.2;
        const textH = baseSize * 1.2;

        if (tb.bgColor !== "none") {
          ctx.fillStyle =
            tb.bgColor === "dark"
              ? "rgba(15, 23, 42, 0.85)"
              : tb.bgColor === "light"
              ? "rgba(255, 255, 255, 0.92)"
              : "rgba(220, 38, 38, 0.9)";
          ctx.beginPath();
          ctx.roundRect(x - paddingX, y - paddingY, metrics.width + paddingX * 2, textH + paddingY, 6);
          ctx.fill();
        }

        ctx.fillStyle = tb.color;
        ctx.fillText(tb.text, x, y);
        ctx.restore();
      }

      // Convert to Blob
      const ext = exportFormat === "image/jpeg" ? "jpg" : exportFormat === "image/png" ? "png" : "webp";
      const filename = `Studio_Image_${Date.now()}.${ext}`;

      compCanvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Export failed");

        if (Capacitor.isNativePlatform()) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const dataUrl = reader.result as string;
            await NativeDownloads.saveToDownloads({
              filename,
              mimeType: exportFormat,
              data: dataUrl,
            });
            toast.success(isHi ? `इमेज Downloads में सेव हुई: ${filename}` : `Saved to Downloads: ${filename}`);
          };
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          window.setTimeout(() => URL.revokeObjectURL(url), 60000);
          toast.success(isHi ? `इमेज डाउनलोड हुई: ${filename}` : `Image downloaded: ${filename}`);
        }
        setLoading(false);
      }, exportFormat, exportQuality);
    } catch (err) {
      setLoading(false);
      toast.error(isHi ? "इमेज एक्सपोर्ट विफल" : "Failed to export image");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#0F172A] text-slate-100 overflow-hidden font-sans select-none fixed inset-0 z-50">
      {/* 1. TOP PREMIUM HEADER BAR */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-[#1E293B] px-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/utilities")}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            title="Back to Utilities"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Image Studio Pro</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                100% Offline
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {imageFile ? imageFile.name : (isHi ? "फ़ोटो खोलें" : "Open Image")}
            </p>
          </div>
        </div>

        {imageElement && (
          <div className="flex items-center gap-2">
            {/* Format Selector */}
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-slate-200 border border-slate-700 focus:outline-none"
            >
              <option value="image/jpeg">JPG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
            </select>

            <button
              type="button"
              onClick={saveAndExport}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-black text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isHi ? "इमेज सेव करें" : "Save Image"}</span>
            </button>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE / EMPTY STATE */}
      {!imageElement ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4 ring-1 ring-emerald-500/20">
              <ImageIcon className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-black text-white">
              {isHi ? "Image Studio में संपादन शुरू करें" : "Open Photo in Studio Workspace"}
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              {isHi
                ? "सीधे ड्रैग करके टेक्स्ट लगाएं, स्टैम्प व मुहर चिपकाएं, पासपोर्ट साइज क्रॉप करें, फिल्टर्स व एडजस्टमेंट लगाएं—पूरी तरह सुरक्षित व ऑफलाइन।"
                : "Full visual workspace: Drag-and-drop movable text, official verified stamps, passport crops, filters, and brush drawing without uploading anywhere."}
            </p>

            <div className="mt-6">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="image-full-studio-upload"
                className="hidden"
              />
              <label
                htmlFor="image-full-studio-upload"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-black text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>{isHi ? "गैलरी / डिवाइस से फोटो चुनें" : "Select Photo from Device"}</span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* TOOLBAR TABS (CANVA / PHOTOSHOP STYLE) */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-[#162032] px-3">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
              <button
                type="button"
                onClick={() => { setActiveTab("adjust"); setIsBrushActive(false); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "adjust" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{isHi ? "एडजस्ट व फिल्टर्स" : "Adjust"}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("crop"); setIsBrushActive(false); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "crop" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Crop className="h-3.5 w-3.5" />
                <span>{isHi ? "क्रॉप व रोटेट" : "Crop & Rotate"}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("text"); setIsBrushActive(false); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "text" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>{isHi ? "टेक्स्ट जोड़ें" : "Add Text"}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("stamps"); setIsBrushActive(false); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "stamps" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Stamp className="h-3.5 w-3.5" />
                <span>{isHi ? "मुहर व स्टैम्प" : "Stamps"}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("brush"); setIsBrushActive(true); }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "brush" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Brush className="h-3.5 w-3.5" />
                <span>{isHi ? "ब्रश ड्रॉइंग" : "Brush"}</span>
              </button>
            </div>

            {/* Quick Zoom & Reset */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 rounded-xl px-2 py-1 text-xs font-bold text-slate-200">
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.max(0.5, Number((z - 0.2).toFixed(1))))}
                  title="Zoom Out"
                  className="hover:text-emerald-400 p-0.5"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] w-9 text-center">{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomScale(z => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                  title="Zoom In"
                  className="hover:text-emerald-400 p-0.5"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBrightness(100);
                  setContrast(100);
                  setSaturation(100);
                  setBlur(0);
                  setFilterPreset("none");
                  setRotation(0);
                  setFlipH(false);
                  setFlipV(false);
                  setTextBoxes([]);
                  setStamps([]);
                  setDrawingStrokes([]);
                  setZoomScale(1);
                  toast.success(isHi ? "रिसेट हो गया" : "Reset to original");
                }}
                title="Reset All"
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                <Undo2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE TOOL SUB-CONTROLS PANEL */}
          <div className="shrink-0 border-b border-slate-800 bg-[#121927] px-4 py-2.5 text-xs">
            {activeTab === "adjust" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">{isHi ? "ब्राइटनेस:" : "Brightness:"}</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300 w-8">{brightness}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-14">{isHi ? "कंट्रास्ट:" : "Contrast:"}</span>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300 w-8">{contrast}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 w-16">{isHi ? "सैचुरेशन:" : "Saturation:"}</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300 w-8">{saturation}%</span>
                </div>

                {/* Preset filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-slate-400 mr-1">{isHi ? "फिल्टर:" : "Presets:"}</span>
                  {[
                    { id: "none", label: "Normal" },
                    { id: "grayscale", label: "B&W" },
                    { id: "sepia", label: "Sepia" },
                    { id: "vintage", label: "Vintage" },
                    { id: "invert", label: "Invert" },
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFilterPreset(f.id)}
                      className={`rounded-lg px-2.5 py-1 font-bold text-[11px] transition ${
                        filterPreset === f.id
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "crop" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-slate-200 hover:bg-slate-700"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>90° Rot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipH(f => !f)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 ${
                      flipH ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <FlipHorizontal className="h-3.5 w-3.5" />
                    <span>Flip H</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipV(f => !f)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 ${
                      flipV ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    }`}
                  >
                    <FlipVertical className="h-3.5 w-3.5" />
                    <span>Flip V</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
                  <span className="text-slate-400">{isHi ? "क्रॉप अनुपात:" : "Aspect Crop:"}</span>
                  {[
                    { label: "1:1 (Square)", ratio: 1 },
                    { label: "4:3 (Photo)", ratio: 4 / 3 },
                    { label: "16:9 (Wide)", ratio: 16 / 9 },
                    { label: "3:4 (Passport/ID)", ratio: 3 / 4 },
                  ].map(c => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => applyAspectCrop(c.ratio)}
                      className="rounded-lg bg-slate-800 px-2.5 py-1 font-bold text-[11px] text-emerald-400 hover:bg-slate-700"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "text" && (
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder={isHi ? "टेक्स्ट यहाँ टाइप करें..." : "Type text here..."}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addTextBox(); }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
                />

                <div className="flex items-center gap-1">
                  <span className="text-slate-400">{isHi ? "साइज़:" : "Size:"}</span>
                  <input
                    type="number"
                    min="12"
                    max="72"
                    value={activeFontSize}
                    onChange={(e) => setActiveFontSize(Number(e.target.value))}
                    className="w-14 rounded-lg bg-slate-800 px-2 py-1 text-center font-bold text-white border border-slate-700"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">{isHi ? "रंग:" : "Color:"}</span>
                  <input
                    type="color"
                    value={activeTextColor}
                    onChange={(e) => setActiveTextColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border border-slate-700"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-slate-400">{isHi ? "पृष्ठभूमि:" : "Bg:"}</span>
                  {(["none", "dark", "light", "red"] as const).map(bg => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setActiveTextBg(bg)}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        activeTextBg === bg ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addTextBox}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-500 transition active:scale-95 ml-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isHi ? "टेक्स्ट जोड़ें" : "Add Text"}</span>
                </button>
              </div>
            )}

            {activeTab === "stamps" && (
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
                <span className="text-slate-400 mr-1">{isHi ? "रेडीमेड मुहर/स्टैम्प चिपकाएं:" : "Add Stamp:"}</span>
                <button
                  type="button"
                  onClick={() => addStamp("APPROVED", "#10B981", "RPF VERIFIED")}
                  className="rounded-lg border-2 border-emerald-500 bg-emerald-500/10 px-3 py-1 font-black text-emerald-400 hover:bg-emerald-500/20"
                >
                  ✓ APPROVED / स्वीकृत
                </button>
                <button
                  type="button"
                  onClick={() => addStamp("PAID", "#3B82F6", "OFFLINE RECEIPT")}
                  className="rounded-lg border-2 border-blue-500 bg-blue-500/10 px-3 py-1 font-black text-blue-400 hover:bg-blue-500/20"
                >
                  ₹ PAID / भुगतान संपन्न
                </button>
                <button
                  type="button"
                  onClick={() => addStamp("CONFIDENTIAL", "#EF4444", "DO NOT SHARE")}
                  className="rounded-lg border-2 border-rose-500 bg-rose-500/10 px-3 py-1 font-black text-rose-400 hover:bg-rose-500/20"
                >
                  🔒 CONFIDENTIAL / गोपनीय
                </button>
                <button
                  type="button"
                  onClick={() => addStamp("VERIFIED", "#14B8A6", new Date().toLocaleDateString())}
                  className="rounded-lg border-2 border-teal-500 bg-teal-500/10 px-3 py-1 font-black text-teal-400 hover:bg-teal-500/20"
                >
                  ★ VERIFIED DATE
                </button>
              </div>
            )}

            {activeTab === "brush" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{isHi ? "ब्रश रंग:" : "Color:"}</span>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="h-7 w-7 rounded cursor-pointer border border-slate-700"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{isHi ? "मोटाई:" : "Width:"}</span>
                  <input
                    type="range"
                    min="2"
                    max="25"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="text-[11px] text-slate-300">{brushSize}px</span>
                </div>

                <button
                  type="button"
                  onClick={() => setDrawingStrokes([])}
                  className="flex items-center gap-1 rounded-lg bg-red-900/40 px-2.5 py-1 text-red-400 hover:bg-red-900/60"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isHi ? "ड्राइंग मिटाएं" : "Clear Strokes"}</span>
                </button>

                <span className="text-emerald-400 text-[11px] font-bold ml-auto">
                  {isHi ? "👉 इमेज पर सीधे माउस/उंगली से बनाएं" : "👉 Draw directly on the image"}
                </span>
              </div>
            )}
          </div>

          {/* 3. VISUAL INTERACTIVE WORKSPACE (CANVAS + DRAGGABLE OVERLAYS) */}
          <div className="flex flex-1 justify-center items-center overflow-auto p-4 sm:p-8 bg-[#090D16]">
            <div
              ref={workspaceRef}
              className="relative shadow-2xl bg-black border border-slate-800 rounded-sm transition-transform max-w-full max-h-full"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: "center center",
              }}
            >
              {/* Background Rendered Canvas */}
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className={`block max-w-[85vw] max-h-[70vh] object-contain ${
                  isBrushActive ? "cursor-crosshair" : "cursor-default"
                }`}
              />

              {/* Draggable Stamps */}
              {stamps.map(s => {
                const isSelected = selectedStampId === s.id;
                return (
                  <div
                    key={s.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handlePointerDown(s.id, "stamp", e.clientX, e.clientY, s.xPercent, s.yPercent);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handlePointerDown(s.id, "stamp", e.touches[0].clientX, e.touches[0].clientY, s.xPercent, s.yPercent);
                    }}
                    style={{
                      left: `${s.xPercent}%`,
                      top: `${s.yPercent}%`,
                      borderColor: s.color,
                      color: s.color,
                    }}
                    className={`absolute cursor-move select-none rounded-xl border-2 bg-white/95 px-3 py-1.5 shadow-xl transition-all -rotate-3 ${
                      isSelected ? "ring-2 ring-emerald-400 scale-105" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <p className="text-xs font-black tracking-wider uppercase leading-tight">{s.label}</p>
                        {s.subLabel && <p className="text-[9px] font-bold text-slate-500 uppercase">{s.subLabel}</p>}
                      </div>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setStamps(prev => prev.filter(item => item.id !== s.id));
                            setSelectedStampId(null);
                          }}
                          className="rounded-full bg-red-100 p-0.5 text-red-600 hover:bg-red-200"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Draggable & Editable Text Boxes */}
              {textBoxes.map(tb => {
                const isSelected = selectedTextId === tb.id;
                return (
                  <div
                    key={tb.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handlePointerDown(tb.id, "text", e.clientX, e.clientY, tb.xPercent, tb.yPercent);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handlePointerDown(tb.id, "text", e.touches[0].clientX, e.touches[0].clientY, tb.xPercent, tb.yPercent);
                    }}
                    style={{
                      left: `${tb.xPercent}%`,
                      top: `${tb.yPercent}%`,
                      fontSize: `${tb.fontSize}px`,
                      color: tb.color,
                    }}
                    className={`absolute rounded px-2 py-0.5 cursor-move whitespace-pre font-bold select-none ${
                      tb.bgColor === "dark"
                        ? "bg-slate-900/90"
                        : tb.bgColor === "light"
                        ? "bg-white/95"
                        : tb.bgColor === "red"
                        ? "bg-red-600/90"
                        : "bg-transparent"
                    } ${
                      isSelected
                        ? "border-2 border-emerald-500 shadow-2xl ring-2 ring-emerald-400"
                        : "border border-transparent hover:border-slate-500"
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
                          className="bg-transparent border-b border-emerald-500 font-bold focus:outline-none"
                          style={{ color: tb.color }}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setTextBoxes(prev => prev.filter(t => t.id !== tb.id));
                            setSelectedTextId(null);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
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
