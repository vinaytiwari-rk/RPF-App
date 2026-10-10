import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Download, Copy, RefreshCw, Check, Scissors, RotateCw, ZoomIn, Sliders, Palette } from "lucide-react";
import toast from "react-hot-toast";

interface ImageEngineProps {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, name: string) => Promise<void> | void;
  copyToClipboard: (text: string) => void;
}

export default function ImageToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: ImageEngineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [base64Input, setBase64Input] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [keepAspect, setKeepAspect] = useState<boolean>(true);
  const [origAspect, setOrigAspect] = useState<number>(1);
  const [quality, setQuality] = useState<number>(80);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [flipDirection, setFlipDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [borderColor, setBorderColor] = useState<string>("#FFFFFF");
  const [borderWidth, setBorderWidth] = useState<number>(20);
  const [cornerRadius, setCornerRadius] = useState<number>(30);
  const [cropPercent, setCropPercent] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setStatusMsg("");
      setResultText("");
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setOrigAspect(img.width / img.height);
      };
      img.src = url;
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (keepAspect && origAspect) {
      setHeight(Math.round(newWidth / origAspect));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (keepAspect && origAspect) {
      setWidth(Math.round(newHeight * origAspect));
    }
  };

  const executeTool = async () => {
    setLoading(true);
    setStatusMsg("");
    try {
      // Base64 to Image doesn't require a file upload
      if (toolId === "img_base64_to_img") {
        if (!base64Input.trim()) throw new Error(isHi ? "Base64 स्ट्रिंग दर्ज करें।" : "Enter Base64 data string.");
        const cleanData = base64Input.trim().startsWith("data:") ? base64Input.trim() : `data:image/png;base64,${base64Input.trim()}`;
        const res = await fetch(cleanData);
        const blob = await res.blob();
        await downloadBlob(blob, `Decoded_Image_${Date.now()}.png`);
        setStatusMsg(isHi ? "इमेज डाउनलोड हो गई!" : "Image decoded and downloaded!");
        return;
      }

      if (!file) throw new Error(isHi ? "कृपया एक इमेज चुनें।" : "Please select an image file.");

      // Image to Base64
      if (toolId === "img_to_base64") {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = reader.result as string;
          setResultText(b64);
          setStatusMsg(isHi ? "Base64 कोड तैयार!" : "Base64 string generated!");
        };
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load image"));
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not initialize canvas context");

      let mimeType = "image/png";
      let ext = "png";

      switch (toolId) {
        // 1. JPG to PNG
        case "img_jpg_to_png": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 2. PNG to JPG
        case "img_png_to_jpg": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          mimeType = "image/jpeg";
          ext = "jpg";
          break;
        }

        // 3. JPG to WebP
        case "img_jpg_to_webp": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/webp";
          ext = "webp";
          break;
        }

        // 4. WebP to JPG
        case "img_webp_to_jpg": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          mimeType = "image/jpeg";
          ext = "jpg";
          break;
        }

        // 5. PNG to WebP
        case "img_png_to_webp": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/webp";
          ext = "webp";
          break;
        }

        // 6. WebP to PNG
        case "img_webp_to_png": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 7. JPG to BMP
        case "img_jpg_to_bmp": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/bmp";
          ext = "bmp";
          break;
        }

        // 8. BMP to PNG
        case "img_bmp_to_png": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 9. TIFF to JPG
        case "img_tiff_to_jpg": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          mimeType = "image/jpeg";
          ext = "jpg";
          break;
        }

        // 10. ICO to PNG
        case "img_ico_to_png": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 11. PNG to ICO
        case "img_png_to_ico": {
          canvas.width = 64;
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
          mimeType = "image/x-icon";
          ext = "ico";
          break;
        }

        // 14. Image Compressor
        case "img_compressor": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          mimeType = "image/jpeg";
          ext = "jpg";
          break;
        }

        // 15. Image Resizer
        case "img_resizer": {
          canvas.width = Math.max(10, width);
          canvas.height = Math.max(10, height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          mimeType = file.type || "image/png";
          ext = file.name.split(".").pop() || "png";
          break;
        }

        // 16. Image Cropper
        case "img_cropper": {
          const trimX = (img.width * cropPercent) / 200;
          const trimY = (img.height * cropPercent) / 200;
          canvas.width = Math.max(10, img.width - trimX * 2);
          canvas.height = Math.max(10, img.height - trimY * 2);
          ctx.drawImage(img, trimX, trimY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 17. Image Rotator
        case "img_rotator": {
          const rad = (rotationAngle * Math.PI) / 180;
          if (rotationAngle === 90 || rotationAngle === 270) {
            canvas.width = img.height;
            canvas.height = img.width;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rad);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 18. Image Flipper
        case "img_flipper": {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.save();
          if (flipDirection === "horizontal") {
            ctx.scale(-1, 1);
            ctx.drawImage(img, -img.width, 0);
          } else {
            ctx.scale(1, -1);
            ctx.drawImage(img, 0, -img.height);
          }
          ctx.restore();
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 19. Image Border Adder
        case "img_border_adder": {
          canvas.width = img.width + borderWidth * 2;
          canvas.height = img.height + borderWidth * 2;
          ctx.fillStyle = borderColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, borderWidth, borderWidth);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        // 20. Image Rounded-Corner Maker
        case "img_rounded_corners": {
          canvas.width = img.width;
          canvas.height = img.height;
          const r = Math.min(cornerRadius, img.width / 2, img.height / 2);
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(canvas.width - r, 0);
          ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
          ctx.lineTo(canvas.width, canvas.height - r);
          ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
          ctx.lineTo(r, canvas.height);
          ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, 0, 0);
          mimeType = "image/png";
          ext = "png";
          break;
        }

        default:
          throw new Error("Unknown Image tool");
      }

      // Convert canvas to blob and save
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error("Canvas rendering failed");
        const filename = `${toolId}_${Date.now()}.${ext}`;
        await downloadBlob(blob, filename);
        const oldKb = (file.size / 1024).toFixed(1);
        const newKb = (blob.size / 1024).toFixed(1);
        setStatusMsg(isHi ? `सफलतापूर्वक प्रोसेस हुआ (${oldKb}KB → ${newKb}KB)!` : `Processed successfully (${oldKb}KB → ${newKb}KB)!`);
      }, mimeType, quality / 100);

    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Image processing error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Privacy Notice Banner */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
          <ImageIcon className="h-4 w-4" />
          <span>{isHi ? "100% ऑफलाइन इमेज प्रोसेसिंग" : "100% Offline Image Processing"}</span>
        </div>
        <p className="text-xs text-slate-600">
          {isHi
            ? "आपकी फोटो डिवाइस के लोकल कैनवस में प्रोसेस होती है। कोई भी डेटा ऑनलाइन अपलोड नहीं होता।"
            : "Photos are processed entirely inside local device Canvas. Zero data leaves your device."}
        </p>
      </div>

      {/* Base64 Input for base64_to_img */}
      {toolId === "img_base64_to_img" ? (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            {isHi ? "Base64 इमेज डेटा पेस्ट करें" : "Paste Base64 Image Data"}
          </label>
          <textarea
            rows={6}
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800"
          />
        </div>
      ) : (
        /* File Upload */
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            {isHi ? "इमेज चुनें (JPG, PNG, WebP, BMP)" : "Select Image File (JPG, PNG, WebP, BMP)"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
          />
          {file && (
            <div className="mt-2 flex items-center gap-3">
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
              )}
              <div className="text-xs text-slate-600">
                <p className="font-bold">{file.name}</p>
                <p>{width} × {height} px • {(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool-specific controls */}
      {toolId === "img_resizer" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHi ? "चौड़ाई (Width px)" : "Width (px)"}
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {isHi ? "ऊंचाई (Height px)" : "Height (px)"}
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 10)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={keepAspect}
              onChange={(e) => setKeepAspect(e.target.checked)}
              className="rounded text-amber-600"
            />
            <span>{isHi ? "पहलू अनुपात बनाए रखें (Lock Aspect Ratio)" : "Lock Aspect Ratio"}</span>
          </label>
        </div>
      )}

      {toolId === "img_compressor" && (
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{isHi ? "इमेज क्वालिटी (Quality %)" : "Quality (%)"}</span>
            <span>{quality}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={95}
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value, 10))}
            className="w-full accent-amber-600"
          />
        </div>
      )}

      {toolId === "img_cropper" && (
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{isHi ? "किनारे ट्रिम करें (% Margin Crop)" : "Trim Border (% Crop)"}</span>
            <span>{cropPercent}%</span>
          </div>
          <input
            type="range"
            min={2}
            max={40}
            value={cropPercent}
            onChange={(e) => setCropPercent(parseInt(e.target.value, 10))}
            className="w-full accent-amber-600"
          />
        </div>
      )}

      {toolId === "img_rotator" && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            {isHi ? "घुमाने का कोण" : "Rotation Angle"}
          </label>
          <select
            value={rotationAngle}
            onChange={(e) => setRotationAngle(parseInt(e.target.value, 10))}
            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          >
            <option value={90}>90° Clockwise</option>
            <option value={180}>180° Upside Down</option>
            <option value={270}>270° Counter-Clockwise</option>
          </select>
        </div>
      )}

      {toolId === "img_flipper" && (
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            {isHi ? "फ्लिप दिशा (Direction)" : "Flip Direction"}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFlipDirection("horizontal")}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition ${
                flipDirection === "horizontal" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {isHi ? "क्षैतिज (Horizontal - Mirror)" : "Horizontal (Mirror)"}
            </button>
            <button
              type="button"
              onClick={() => setFlipDirection("vertical")}
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition ${
                flipDirection === "vertical" ? "bg-amber-600 text-white border-amber-600" : "bg-white text-slate-700 border-slate-300"
              }`}
            >
              {isHi ? "लंबवत (Vertical - Flip)" : "Vertical (Flip)"}
            </button>
          </div>
        </div>
      )}

      {toolId === "img_border_adder" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isHi ? "बॉर्डर चौड़ाई (px)" : "Border Width (px)"}
            </label>
            <input
              type="number"
              min={2}
              max={150}
              value={borderWidth}
              onChange={(e) => setBorderWidth(parseInt(e.target.value, 10) || 10)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              {isHi ? "बॉर्डर रंग (Color)" : "Border Color"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="h-9 w-12 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-slate-700">{borderColor}</span>
            </div>
          </div>
        </div>
      )}

      {toolId === "img_rounded_corners" && (
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{isHi ? "कोनों की गोलाई (Corner Radius px)" : "Corner Radius (px)"}</span>
            <span>{cornerRadius}px</span>
          </div>
          <input
            type="range"
            min={5}
            max={150}
            value={cornerRadius}
            onChange={(e) => setCornerRadius(parseInt(e.target.value, 10))}
            className="w-full accent-amber-600"
          />
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={executeTool}
          disabled={loading || (!file && toolId !== "img_base64_to_img")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{isHi ? "प्रोसेस हो रहा है..." : "Processing Image..."}</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>{isHi ? "प्रोसेस व डाउनलोड करें" : "Process & Download"}</span>
            </>
          )}
        </button>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Base64 Output Box */}
      {resultText && (
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-500">
              {isHi ? "Base64 डेटा स्ट्रिंग" : "Base64 Data String"}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(resultText)}
              className="text-xs text-amber-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              <Copy className="h-3 w-3" /> {isHi ? "कॉपी" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            rows={6}
            value={resultText}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800"
          />
        </div>
      )}
    </div>
  );
}
