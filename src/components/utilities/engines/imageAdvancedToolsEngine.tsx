import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, Download, RefreshCw, AlertCircle, Check, 
  Palette, Eye, Sliders, Layers, Grid, Split, FileImage, 
  Copy, Image as ImageIcon, Sparkles
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function ImageAdvancedToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [multiFiles, setMultiFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUrl2, setPreviewUrl2] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tool specific configurations
  const [numericValue, setNumericValue] = useState<number>(50);
  const [textValue, setTextValue] = useState<string>("RP Foundation");
  const [colorValue, setColorValue] = useState<string>("#ffffff");
  const [selectedRatio, setSelectedRatio] = useState<string>("1:1");
  const [blendMode, setBlendMode] = useState<GlobalCompositeOperation>("source-over");
  const [splitGrid, setSplitGrid] = useState<string>("2x2");
  const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string } | null>(null);
  const [paletteColors, setPaletteColors] = useState<string[]>([]);
  const [metaInfo, setMetaInfo] = useState<Record<string, string | number> | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (previewUrl2) URL.revokeObjectURL(previewUrl2);
    };
  }, [previewUrl, previewUrl2]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    setMessage(null);
    setPickedColor(null);
    setPaletteColors([]);
    setMetaInfo(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    // Initial inspection for metadata viewer & color palette
    if (toolId === "img_metadata_viewer") {
      const img = new Image();
      img.onload = () => {
        setMetaInfo({
          [isHi ? "फाइल नाम" : "Filename"]: f.name,
          [isHi ? "फाइल प्रकार" : "MIME Type"]: f.type || "image/unknown",
          [isHi ? "साइज (KB)" : "File Size"]: (f.size / 1024).toFixed(2) + " KB",
          [isHi ? "चौड़ाई (Width)" : "Width"]: `${img.naturalWidth} px`,
          [isHi ? "ऊंचाई (Height)" : "Height"]: `${img.naturalHeight} px`,
          [isHi ? "आस्पेक्ट रेशियो" : "Aspect Ratio"]: (img.naturalWidth / img.naturalHeight).toFixed(2),
          [isHi ? "अंतिम बदलाव" : "Last Modified"]: new Date(f.lastModified).toLocaleString(),
        });
      };
      img.src = url;
    } else if (toolId === "img_palette_extractor") {
      extractPalette(url);
    }
  };

  const handleSecondFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile2(f);
    if (previewUrl2) URL.revokeObjectURL(previewUrl2);
    setPreviewUrl2(URL.createObjectURL(f));
  };

  const handleMultiFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (files.length === 0) return;
    setMultiFiles(files);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(isHi ? "फोटो लोड करने में असमर्थ" : "Failed to load image"));
      img.src = url;
    });
  };

  // Color picker on canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolId !== "img_color_picker" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase();
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    setPickedColor({ hex, rgb });
  };

  // Extract color palette
  const extractPalette = async (url: string) => {
    try {
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 100, 100);
      const data = ctx.getImageData(0, 0, 100, 100).data;
      const colorMap: Record<string, number> = {};
      for (let i = 0; i < data.length; i += 16) {
        // quantize to 32
        const r = Math.round(data[i] / 32) * 32;
        const g = Math.round(data[i + 1] / 32) * 32;
        const b = Math.round(data[i + 2] / 32) * 32;
        const key = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const sorted = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]).slice(0, 8);
      setPaletteColors(sorted);
    } catch {
      // ignore
    }
  };

  const processAndDownload = async () => {
    if (!file && multiFiles.length === 0) {
      setError(isHi ? "कृपया पहले फोटो चुनें" : "Please select an image file first");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");

      let outMime = "image/png";
      let outExt = "png";
      let baseName = file ? file.name.replace(/\.[^/.]+$/, "") : "collage";

      if (toolId === "img_collage_maker") {
        if (multiFiles.length < 2) {
          throw new Error(isHi ? "कोलाज के लिए कम से कम 2 फोटो चुनें" : "Select at least 2 images for collage");
        }
        const loadedImgs = await Promise.all(multiFiles.map(f => {
          const u = URL.createObjectURL(f);
          return loadImage(u);
        }));

        const count = loadedImgs.length;
        if (count === 2) {
          canvas.width = 1200;
          canvas.height = 600;
          ctx.drawImage(loadedImgs[0], 0, 0, 600, 600);
          ctx.drawImage(loadedImgs[1], 600, 0, 600, 600);
        } else if (count === 3) {
          canvas.width = 1200;
          canvas.height = 600;
          ctx.drawImage(loadedImgs[0], 0, 0, 600, 600);
          ctx.drawImage(loadedImgs[1], 600, 0, 600, 300);
          ctx.drawImage(loadedImgs[2], 600, 300, 600, 300);
        } else {
          // 4 images 2x2
          canvas.width = 1000;
          canvas.height = 1000;
          ctx.drawImage(loadedImgs[0], 0, 0, 500, 500);
          ctx.drawImage(loadedImgs[1], 500, 0, 500, 500);
          ctx.drawImage(loadedImgs[2], 0, 500, 500, 500);
          ctx.drawImage(loadedImgs[3], 500, 500, 500, 500);
        }
      } else {
        if (!previewUrl) return;
        const img = await loadImage(previewUrl);
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        switch (toolId) {
          case "img_transparency_maker": {
            // Apply alpha opacity (numericValue: 0 - 100)
            canvas.width = w;
            canvas.height = h;
            ctx.globalAlpha = numericValue / 100;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_watermark_adder": {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            // Draw text watermark
            const fontSize = Math.max(16, Math.floor(w * 0.04));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 4;
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            ctx.fillText(textValue || "RP Foundation", w - 20, h - 20);
            break;
          }

          case "img_exif_remover": {
            // Re-encoding onto canvas strips all EXIF metadata completely
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            outMime = "image/jpeg";
            outExt = "jpg";
            break;
          }

          case "img_dpi_changer": {
            // Re-scale canvas according to target DPI representation
            const scale = numericValue === 300 ? 1.5 : numericValue === 150 ? 1.0 : 0.75;
            canvas.width = Math.round(w * scale);
            canvas.height = Math.round(h * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            break;
          }

          case "img_aspect_ratio": {
            let targetAspect = 1;
            if (selectedRatio === "16:9") targetAspect = 16 / 9;
            else if (selectedRatio === "9:16") targetAspect = 9 / 16;
            else if (selectedRatio === "4:3") targetAspect = 4 / 3;
            else if (selectedRatio === "3:2") targetAspect = 3 / 2;

            const currentAspect = w / h;
            let nw = w, nh = h;
            let ox = 0, oy = 0;

            if (currentAspect > targetAspect) {
              nw = w;
              nh = Math.round(w / targetAspect);
              oy = Math.round((nh - h) / 2);
            } else {
              nh = h;
              nw = Math.round(h * targetAspect);
              ox = Math.round((nw - w) / 2);
            }

            canvas.width = nw;
            canvas.height = nh;
            ctx.fillStyle = colorValue || "#000000";
            ctx.fillRect(0, 0, nw, nh);
            ctx.drawImage(img, ox, oy);
            break;
          }

          case "img_grayscale_filter": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = "grayscale(100%)";
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_sepia_filter": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = `sepia(${numericValue}%)`;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_blur_tool": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = `blur(${Math.max(1, Math.round(numericValue / 5))}px)`;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_sharpen_tool": {
            // Apply convolution sharpen matrix
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h);
            const d = imgData.data;
            const w4 = w * 4;
            // Unsharp mask pass
            const amount = numericValue / 100;
            for (let i = 0; i < d.length; i += 4) {
              if (i > w4 && i < d.length - w4) {
                const prev = d[i - 4];
                const next = d[i + 4];
                const curr = d[i];
                d[i] = Math.min(255, Math.max(0, curr + (curr - (prev + next) / 2) * amount));
              }
            }
            ctx.putImageData(imgData, 0, 0);
            break;
          }

          case "img_brightness_adjust": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = `brightness(${numericValue}%)`;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_contrast_adjust": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = `contrast(${numericValue}%)`;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_saturation_adjust": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = `saturate(${numericValue}%)`;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_hue_changer": {
            canvas.width = w;
            canvas.height = h;
            ctx.filter = `hue-rotate(${numericValue}deg)`;
            ctx.drawImage(img, 0, 0);
            break;
          }

          case "img_overlay_tool": {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            if (previewUrl2) {
              const img2 = await loadImage(previewUrl2);
              ctx.globalCompositeOperation = blendMode;
              ctx.drawImage(img2, 0, 0, w, h);
            }
            break;
          }

          case "img_splitter": {
            // Split into 4 quadrants zip or return first tile
            const cols = splitGrid === "3x3" ? 3 : 2;
            const rows = splitGrid === "3x3" ? 3 : 2;
            const tileW = Math.floor(w / cols);
            const tileH = Math.floor(h / rows);

            canvas.width = tileW;
            canvas.height = tileH;
            ctx.drawImage(img, 0, 0, tileW, tileH, 0, 0, tileW, tileH);
            setMessage(isHi ? `${cols}x${rows} ग्रिड में से पहला टाइल तैयार किया गया।` : `First tile of ${cols}x${rows} grid prepared.`);
            break;
          }

          case "img_frame_extractor": {
            // Capture snapshot of loaded graphic at current resolution
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
            break;
          }

          default: {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0);
          }
        }
      }

      // Convert to blob and download
      canvas.toBlob(blob => {
        if (!blob) {
          setError(isHi ? "आउटपुट फ़ाइल बनाने में विफलता" : "Failed to create output file");
          setLoading(false);
          return;
        }
        const outName = `${baseName}_${toolId}.${outExt}`;
        downloadBlob(blob, outName);
        setMessage(isHi ? `फ़ाइल तैयार है: ${outName}` : `File ready: ${outName}`);
        setLoading(false);
      }, outMime);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      {toolId === "img_collage_maker" ? (
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultiFilesChange}
            id="multi-image-upload"
            className="hidden"
          />
          <label htmlFor="multi-image-upload" className="cursor-pointer">
            <Grid className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="mt-2 text-sm font-semibold text-emerald-950">
              {multiFiles.length > 0 
                ? `${multiFiles.length} ${isHi ? "फोटो चुनी गईं" : "images selected"}`
                : isHi ? "कोलाज के लिए 2 से 4 फोटो चुनें" : "Select 2 to 4 photos for collage"}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              {isHi ? "2x2 या साइड-बाय-साइड लेआउट" : "2x2 or side-by-side layout"}
            </p>
          </label>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="adv-image-upload"
            className="hidden"
          />
          <label htmlFor="adv-image-upload" className="cursor-pointer">
            <Upload className="mx-auto h-10 w-10 text-emerald-600" />
            <p className="mt-2 text-sm font-semibold text-emerald-950">
              {file ? file.name : isHi ? "इमेज अपलोड करें" : "Upload Image"}
            </p>
            <p className="mt-1 text-xs text-emerald-700">
              {isHi ? "JPG, PNG, WebP, BMP समर्थित" : "Supports JPG, PNG, WebP, BMP"}
            </p>
          </label>
        </div>
      )}

      {/* Second file upload for overlay */}
      {toolId === "img_overlay_tool" && (
        <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/40 p-4 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleSecondFileChange}
            id="overlay-image-upload"
            className="hidden"
          />
          <label htmlFor="overlay-image-upload" className="cursor-pointer">
            <Layers className="mx-auto h-8 w-8 text-blue-600" />
            <p className="mt-1 text-xs font-semibold text-blue-950">
              {file2 ? file2.name : isHi ? "दूसरी ओवरले इमेज चुनें" : "Select secondary overlay image"}
            </p>
          </label>
        </div>
      )}

      {/* Control Sliders & Options */}
      {previewUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          {toolId === "img_transparency_maker" && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{isHi ? "पारदर्शिता (Opacity)" : "Opacity"}</span>
                <span>{numericValue}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={numericValue}
                onChange={e => setNumericValue(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1"
              />
            </div>
          )}

          {toolId === "img_watermark_adder" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isHi ? "वाटरमार्क टेक्स्ट" : "Watermark Text"}
              </label>
              <input
                type="text"
                value={textValue}
                onChange={e => setTextValue(e.target.value)}
                placeholder="RP Foundation"
                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
              />
            </div>
          )}

          {toolId === "img_dpi_changer" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isHi ? "प्रिंट रिज़ॉल्यूशन (DPI)" : "Target Resolution (DPI)"}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[72, 150, 300].map(dpi => (
                  <button
                    key={dpi}
                    type="button"
                    onClick={() => setNumericValue(dpi)}
                    className={`rounded-lg py-2 text-xs font-semibold border ${
                      numericValue === dpi 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {dpi} DPI
                  </button>
                ))}
              </div>
            </div>
          )}

          {toolId === "img_aspect_ratio" && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {isHi ? "आस्पेक्ट रेशियो चुनें" : "Select Aspect Ratio"}
              </label>
              <div className="grid grid-cols-5 gap-1">
                {["1:1", "4:3", "16:9", "9:16", "3:2"].map(ratio => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setSelectedRatio(ratio)}
                    className={`rounded-lg py-1.5 text-xs font-semibold border ${
                      selectedRatio === ratio 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-600">{isHi ? "बैकग्राउंड रंग:" : "Padding color:"}</span>
                <input
                  type="color"
                  value={colorValue}
                  onChange={e => setColorValue(e.target.value)}
                  className="h-7 w-12 rounded border border-slate-300 cursor-pointer"
                />
              </div>
            </div>
          )}

          {(toolId === "img_sepia_filter" || toolId === "img_blur_tool" || toolId === "img_sharpen_tool") && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{isHi ? "प्रभाव तीव्रता (Intensity)" : "Effect Intensity"}</span>
                <span>{numericValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={numericValue}
                onChange={e => setNumericValue(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1"
              />
            </div>
          )}

          {toolId === "img_brightness_adjust" && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{isHi ? "चमक (Brightness)" : "Brightness"}</span>
                <span>{numericValue}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                value={numericValue}
                onChange={e => setNumericValue(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1"
              />
            </div>
          )}

          {toolId === "img_contrast_adjust" && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{isHi ? "कंट्रास्ट (Contrast)" : "Contrast"}</span>
                <span>{numericValue}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                value={numericValue}
                onChange={e => setNumericValue(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1"
              />
            </div>
          )}

          {toolId === "img_saturation_adjust" && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{isHi ? "संतृप्ति (Saturation)" : "Saturation"}</span>
                <span>{numericValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                value={numericValue}
                onChange={e => setNumericValue(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1"
              />
            </div>
          )}

          {toolId === "img_hue_changer" && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{isHi ? "रंग चक्र (Hue Rotation)" : "Hue Rotation"}</span>
                <span>{numericValue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={numericValue}
                onChange={e => setNumericValue(Number(e.target.value))}
                className="w-full accent-emerald-600 mt-1"
              />
            </div>
          )}

          {toolId === "img_overlay_tool" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isHi ? "ब्लेंड मोड (Blend Mode)" : "Blend Mode"}
              </label>
              <select
                value={blendMode}
                onChange={e => setBlendMode(e.target.value as GlobalCompositeOperation)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
              </select>
            </div>
          )}

          {toolId === "img_splitter" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isHi ? "ग्रिड विभाजन" : "Grid Split"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["2x2", "3x3"].map(grid => (
                  <button
                    key={grid}
                    type="button"
                    onClick={() => setSplitGrid(grid)}
                    className={`rounded-lg py-2 text-xs font-semibold border ${
                      splitGrid === grid 
                        ? "bg-emerald-600 text-white border-emerald-600" 
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {grid}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metadata Viewer Table */}
      {toolId === "img_metadata_viewer" && metaInfo && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            {isHi ? "इमेज मेटाडेटा विवरण" : "Image Metadata Information"}
          </h4>
          <div className="divide-y divide-slate-100 text-xs">
            {Object.entries(metaInfo).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5">
                <span className="text-slate-500 font-medium">{k}</span>
                <span className="text-slate-800 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Palette Extractor Swatches */}
      {toolId === "img_palette_extractor" && paletteColors.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            {isHi ? "प्रमुख रंग पैलेट (क्लिक करके कॉपी करें)" : "Dominant Palette (Click to copy)"}
          </h4>
          <div className="flex flex-wrap gap-2">
            {paletteColors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => copyToClipboard(c)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
              >
                <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                <span className="font-mono text-slate-700">{c}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Picker Interactive Canvas */}
      {toolId === "img_color_picker" && previewUrl && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <p className="text-xs text-slate-600 font-medium">
            {isHi ? "फोटो पर कहीं भी क्लिक करें रंग कोड प्राप्त करने के लिए:" : "Click anywhere on the image to sample color:"}
          </p>
          <div className="relative overflow-hidden rounded-lg border border-slate-200 max-h-64 flex items-center justify-center bg-slate-100">
            <img
              src={previewUrl}
              alt="sample target"
              className="max-h-64 object-contain cursor-crosshair hidden"
              onLoad={(e) => {
                const target = e.currentTarget;
                if (canvasRef.current) {
                  canvasRef.current.width = target.naturalWidth;
                  canvasRef.current.height = target.naturalHeight;
                  const ctx = canvasRef.current.getContext("2d");
                  ctx?.drawImage(target, 0, 0);
                }
              }}
            />
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-h-64 max-w-full object-contain cursor-crosshair"
            />
          </div>
          {pickedColor && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md border border-black/10" style={{ backgroundColor: pickedColor.hex }} />
                <div>
                  <p className="font-mono text-xs font-bold text-slate-800">{pickedColor.hex}</p>
                  <p className="text-[10px] text-slate-500">{pickedColor.rgb}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(pickedColor.hex)}
                className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white"
              >
                {isHi ? "कॉपी" : "Copy"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {toolId !== "img_color_picker" && toolId !== "img_palette_extractor" && toolId !== "img_metadata_viewer" && (
        <button
          type="button"
          onClick={processAndDownload}
          disabled={loading || (!file && multiFiles.length === 0)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{isHi ? "प्रोसेसिंग..." : "Processing..."}</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>{isHi ? "डाउनलोड करें" : "Process & Download"}</span>
            </>
          )}
        </button>
      )}

      {/* Status Messages */}
      {message && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
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
