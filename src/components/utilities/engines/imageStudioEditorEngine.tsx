import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Image as ImageIcon, Download, RotateCw, RefreshCw, Crop, 
  Sliders, Wand2, Type, PenTool, Layers, Check, AlertCircle, 
  Trash2, ZoomIn, ZoomOut, Maximize2, Undo, Redo, Sparkles
} from "lucide-react";

interface Props {
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

type StudioTab = "adjust" | "crop" | "filter" | "text" | "draw";

interface ImageTextOverlay {
  id: string;
  text: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  fontSize: number;
  color: string;
  bgColor?: string;
  isBold?: boolean;
}

export default function ImageStudioEditorEngine({ isHi, downloadBlob, copyToClipboard }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active Top Tab
  const [activeTab, setActiveTab] = useState<StudioTab>("adjust");

  // Adjustments (Photoshop style sliders)
  const [brightness, setBrightness] = useState<number>(100); // 0 to 200
  const [contrast, setContrast] = useState<number>(100); // 0 to 200
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [blur, setBlur] = useState<number>(0); // 0 to 20px
  const [sepia, setSepia] = useState<number>(0); // 0 to 100%
  const [grayscale, setGrayscale] = useState<number>(0); // 0 to 100%
  const [invert, setInvert] = useState<number>(0); // 0 to 100%
  const [hueRotate, setHueRotate] = useState<number>(0); // 0 to 360 deg

  // Transforms
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Presets & Filters
  const [activeFilterPreset, setActiveFilterPreset] = useState<string>("normal");

  // Crop controls
  const [cropRatio, setCropRatio] = useState<string>("free"); // free, 1:1, 4:3, 16:9, passport
  const [cropStartX, setCropStartX] = useState<number>(0);
  const [cropStartY, setCropStartY] = useState<number>(0);
  const [cropWidth, setCropWidth] = useState<number>(100);
  const [cropHeight, setCropHeight] = useState<number>(100);

  // Text Overlays
  const [textOverlays, setTextOverlays] = useState<ImageTextOverlay[]>([]);
  const [inputText, setInputText] = useState("Your Heading");
  const [inputFontSize, setInputFontSize] = useState(24);
  const [inputTextColor, setInputTextColor] = useState("#FFFFFF");
  const [inputTextBgColor, setInputTextBgColor] = useState("rgba(0,0,0,0.4)");
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Freehand Brush Drawing
  const [brushColor, setBrushColor] = useState("#EF4444");
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Load Image File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        // Reset settings
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setBlur(0);
        setSepia(0);
        setGrayscale(0);
        setInvert(0);
        setHueRotate(0);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        setTextOverlays([]);
        setActiveFilterPreset("normal");
        setSuccessMsg(isHi ? `फोटो लोड हुई: ${img.width} x ${img.height}px` : `Image loaded: ${img.width} x ${img.height}px`);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(f);
  };

  // Render Image with Adjustments onto Preview Canvas
  const renderCanvas = useCallback(() => {
    if (!imageObj || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply rotation dimensions
    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? imageObj.height : imageObj.width;
    canvas.height = isRotated ? imageObj.width : imageObj.height;

    ctx.save();
    // Build CSS Filter string
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) invert(${invert}%) hue-rotate(${hueRotate}deg)`;

    // Move to center for rotation & flips
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2);

    ctx.restore();
  }, [imageObj, brightness, contrast, saturation, blur, sepia, grayscale, invert, hueRotate, rotation, flipH, flipV]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Apply Filter Presets
  const applyPreset = (preset: string) => {
    setActiveFilterPreset(preset);
    switch (preset) {
      case "normal":
        setBrightness(100); setContrast(100); setSaturation(100); setSepia(0); setGrayscale(0); setHueRotate(0); break;
      case "vintage":
        setBrightness(105); setContrast(90); setSaturation(85); setSepia(45); setGrayscale(0); setHueRotate(0); break;
      case "blackwhite":
        setBrightness(105); setContrast(120); setSaturation(0); setSepia(0); setGrayscale(100); setHueRotate(0); break;
      case "vivid":
        setBrightness(110); setContrast(125); setSaturation(150); setSepia(0); setGrayscale(0); setHueRotate(0); break;
      case "warm":
        setBrightness(105); setContrast(100); setSaturation(120); setSepia(25); setGrayscale(0); setHueRotate(15); break;
      case "cool":
        setBrightness(100); setContrast(110); setSaturation(110); setSepia(0); setGrayscale(0); setHueRotate(190); break;
    }
  };

  // Add Text Overlay
  const addTextOverlay = () => {
    if (!inputText.trim()) return;
    const newText: ImageTextOverlay = {
      id: "text_" + Date.now(),
      text: inputText,
      x: 35,
      y: 45,
      fontSize: inputFontSize,
      color: inputTextColor,
      bgColor: inputTextBgColor,
      isBold: true,
    };
    setTextOverlays(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
  };

  const deleteTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(t => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // Freehand Drawing Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTab !== "draw") return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Final High-Res Export (Combines adjustments, drawings, and texts)
  const exportEditedImage = () => {
    if (!previewCanvasRef.current || !imageObj) return;
    setLoading(true);

    try {
      const baseCanvas = previewCanvasRef.current;
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = baseCanvas.width;
      finalCanvas.height = baseCanvas.height;
      const ctx = finalCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // 1. Draw Adjusted Base Image
      ctx.drawImage(baseCanvas, 0, 0);

      // 2. Draw Freehand Layer
      if (drawCanvasRef.current) {
        ctx.drawImage(drawCanvasRef.current, 0, 0, finalCanvas.width, finalCanvas.height);
      }

      // 3. Draw Text Overlays
      for (const t of textOverlays) {
        ctx.save();
        const textX = (t.x / 100) * finalCanvas.width;
        const textY = (t.y / 100) * finalCanvas.height;
        ctx.font = `${t.isBold ? "bold " : ""}${t.fontSize}px sans-serif`;

        // Background box if present
        if (t.bgColor) {
          const metrics = ctx.measureText(t.text);
          ctx.fillStyle = t.bgColor;
          ctx.fillRect(textX - 8, textY - t.fontSize - 4, metrics.width + 16, t.fontSize + 12);
        }

        ctx.fillStyle = t.color;
        ctx.fillText(t.text, textX, textY);
        ctx.restore();
      }

      finalCanvas.toBlob(blob => {
        if (!blob) throw new Error("Failed to generate image blob");
        const outName = `${file ? file.name.replace(/\.[^/.]+$/, "") : "image"}_studio_edited.png`;
        downloadBlob(blob, outName);
        setSuccessMsg(isHi ? `संपादित फोटो डाउनलोड हुई: ${outName}` : `Edited image exported: ${outName}`);
        setLoading(false);
      }, "image/png");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to export image");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* 1. Header File Uploader */}
      {!file && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/40 p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="image-studio-file-upload"
            className="hidden"
          />
          <label htmlFor="image-studio-file-upload" className="cursor-pointer">
            <ImageIcon className="mx-auto h-10 w-10 text-amber-600 animate-pulse" />
            <p className="mt-2 text-sm font-black text-amber-950">
              {isHi ? "Image Studio Editor में फोटो खोलें" : "Open Photo in Image Studio Editor"}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              {isHi ? "ब्राइटनेस, कंट्रास्ट, क्रॉप, फिल्टर, टेक्स्ट व ब्रश ड्रॉइंग—100% ऑफलाइन" : "Brightness, contrast, crop, filters, text & brush drawing—100% offline"}
            </p>
          </label>
        </div>
      )}

      {file && (
        <>
          {/* 2. Top Adobe/Canva Style Tool Tabs */}
          <div className="rounded-2xl border border-slate-300 bg-white p-2 shadow-sm flex flex-wrap items-center justify-between gap-1">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab("adjust")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "adjust" ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>{isHi ? "लाइट व कलर" : "Adjust"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("filter")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "filter" ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>{isHi ? "फिल्टर्स" : "Filters"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("crop")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "crop" ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Crop className="h-3.5 w-3.5" />
                <span>{isHi ? "क्रॉप व रोटेट" : "Crop & Rotate"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "text" ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Type className="h-3.5 w-3.5" />
                <span>{isHi ? "टेक्स्ट जोड़ें" : "Add Text"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("draw")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === "draw" ? "bg-amber-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>{isHi ? "ब्रश ड्रॉइंग" : "Brush Draw"}</span>
              </button>
            </div>

            {/* Quick Rotate & Reset */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setRotation(r => (r + 90) % 360)}
                title="Rotate 90°"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyPreset("normal")}
                title="Reset Adjustments"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Sub-Tool Controls Panel */}
          {activeTab === "adjust" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{isHi ? "ब्राइटनेस" : "Brightness"}:</span>
                  <span className="font-bold text-amber-900">{brightness}%</span>
                </div>
                <input type="range" min="20" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full accent-amber-600" />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{isHi ? "कंट्रास्ट" : "Contrast"}:</span>
                  <span className="font-bold text-amber-900">{contrast}%</span>
                </div>
                <input type="range" min="20" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full accent-amber-600" />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{isHi ? "सैचुरेशन" : "Saturation"}:</span>
                  <span className="font-bold text-amber-900">{saturation}%</span>
                </div>
                <input type="range" min="0" max="250" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full accent-amber-600" />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{isHi ? "ब्लर (धुंधला)" : "Blur"}:</span>
                  <span className="font-bold text-amber-900">{blur}px</span>
                </div>
                <input type="range" min="0" max="15" value={blur} onChange={e => setBlur(Number(e.target.value))} className="w-full accent-amber-600" />
              </div>
            </div>
          )}

          {activeTab === "filter" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 flex gap-2 overflow-x-auto text-xs">
              {[
                { id: "normal", labelEn: "Original", labelHi: "मूल" },
                { id: "vivid", labelEn: "Vivid / Sharp", labelHi: "विविड" },
                { id: "warm", labelEn: "Warm Golden", labelHi: "वार्म" },
                { id: "cool", labelEn: "Cool Blue", labelHi: "कूल" },
                { id: "vintage", labelEn: "Vintage Retro", labelHi: "विंटेज" },
                { id: "blackwhite", labelEn: "B&W Film", labelHi: "ब्लैक & व्हाइट" },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => applyPreset(f.id)}
                  className={`shrink-0 rounded-xl px-3 py-2 font-bold border transition ${
                    activeFilterPreset === f.id ? "bg-amber-600 text-white border-amber-600 shadow-sm" : "bg-white text-slate-700 border-slate-200 hover:bg-amber-100"
                  }`}
                >
                  {isHi ? f.labelHi : f.labelEn}
                </button>
              ))}
            </div>
          )}

          {activeTab === "crop" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2 text-xs">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "free", label: "Free Ratio" },
                  { id: "1:1", label: "1:1 Square" },
                  { id: "4:3", label: "4:3 Standard" },
                  { id: "16:9", label: "16:9 Cinema" },
                  { id: "passport", label: "Passport (3.5x4.5cm)" },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setCropRatio(r.id)}
                    className={`rounded-lg px-2.5 py-1.5 font-bold border ${cropRatio === r.id ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-200"}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setFlipH(f => !f)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isHi ? "क्षैतिज पलटें (Flip H)" : "Flip Horizontal"}
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(f => !f)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {isHi ? "लंबवत पलटें (Flip V)" : "Flip Vertical"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 space-y-2 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder="Enter text overlay..."
                  className="rounded-lg border border-slate-200 bg-white p-2 font-bold flex-1"
                />
                <input
                  type="color"
                  value={inputTextColor}
                  onChange={e => setInputTextColor(e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer border border-slate-300"
                />
                <button
                  type="button"
                  onClick={addTextOverlay}
                  className="rounded-lg bg-amber-600 px-4 py-2 font-black text-white shadow-xs hover:bg-amber-700"
                >
                  {isHi ? "टेक्स्ट जोड़ें" : "Add Text"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "draw" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{isHi ? "ब्रश रंग:" : "Brush Color:"}</span>
                <input
                  type="color"
                  value={brushColor}
                  onChange={e => setBrushColor(e.target.value)}
                  className="h-7 w-7 rounded cursor-pointer border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{isHi ? "मोटाई:" : "Size:"} {brushSize}px</span>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={brushSize}
                  onChange={e => setBrushSize(Number(e.target.value))}
                  className="w-24 accent-amber-600"
                />
              </div>

              <button
                type="button"
                onClick={clearDrawing}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 font-semibold hover:bg-slate-50"
              >
                {isHi ? "ड्राइंग साफ़ करें" : "Clear Brush"}
              </button>
            </div>
          )}

          {/* 4. Interactive Live Image Canvas Workspace */}
          <div className="relative flex justify-center overflow-auto rounded-2xl border border-slate-300 bg-slate-200/90 p-4 max-h-[580px] shadow-inner select-none">
            <div
              ref={containerRef}
              className="relative shadow-2xl bg-white border border-slate-300 max-w-full"
            >
              {/* Base Adjusted Image Canvas */}
              <canvas ref={previewCanvasRef} className="block max-w-full h-auto" />

              {/* Freehand Brush Drawing Overlay Canvas */}
              <canvas
                ref={drawCanvasRef}
                width={previewCanvasRef.current?.width || 600}
                height={previewCanvasRef.current?.height || 400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="absolute inset-0 max-w-full h-auto cursor-crosshair"
                style={{
                  pointerEvents: activeTab === "draw" ? "auto" : "none",
                }}
              />

              {/* Text Overlays Display */}
              {textOverlays.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTextId(t.id)}
                  style={{
                    left: `${t.x}%`,
                    top: `${t.y}%`,
                    color: t.color,
                    fontSize: `${t.fontSize}px`,
                    backgroundColor: t.bgColor,
                  }}
                  className="absolute px-2 py-1 rounded cursor-move font-bold whitespace-nowrap shadow-md border border-white/40"
                >
                  <span>{t.text}</span>
                  {selectedTextId === t.id && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteTextOverlay(t.id); }}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Bottom Save & Download Bar */}
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 shadow-xs">
            <div className="text-xs text-emerald-900 font-semibold">
              <span>{isHi ? "स्थिति: 100% ऑफलाइन कैनवास प्रोसेसिंग" : "Status: 100% offline client-side rendering"}</span>
            </div>

            <button
              type="button"
              onClick={exportEditedImage}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-800 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{isHi ? "एक्सपोर्ट हो रहा है..." : "Exporting..."}</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>{isHi ? "संपादित HD फोटो डाउनलोड करें" : "Save & Download HD Image"}</span>
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
