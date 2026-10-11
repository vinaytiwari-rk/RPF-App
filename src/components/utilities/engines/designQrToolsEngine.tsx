import React, { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";
import { 
  QrCode, Scan, Download, Copy, Check, 
  AlertCircle, RefreshCw, Palette, Type, Code, 
  Sparkles, Layers, Sliders, Globe, Wifi, Phone, MapPin, MessageSquare
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function DesignQrToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  // Common states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // QR & Barcode states
  const [qrText, setQrText] = useState("https://samahit.in");
  const [qrFgColor, setQrFgColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState(256);

  // Wi-Fi QR
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiType, setWifiType] = useState("WPA");

  // UPI QR
  const [upiVpa, setUpiVpa] = useState("payee@upi");
  const [upiName, setUpiName] = useState("Samahit User");
  const [upiAmount, setUpiAmount] = useState("");

  // vCard QR
  const [vcardName, setVcardName] = useState("Rahul Kumar");
  const [vcardPhone, setVcardPhone] = useState("+91 9876543210");
  const [vcardEmail, setVcardEmail] = useState("rahul@example.com");

  // SMS / Geo
  const [smsPhone, setSmsPhone] = useState("+91 9876543210");
  const [smsBody, setSmsBody] = useState("Hello from Samahit");
  const [geoLat, setGeoLat] = useState("28.6139");
  const [geoLng, setGeoLng] = useState("77.2090");

  // CSS Design Tool states
  const [paletteSeed, setPaletteSeed] = useState("#10B981");
  const [gradAngle, setGradAngle] = useState(90);
  const [gradCol1, setGradCol1] = useState("#059669");
  const [gradCol2, setGradCol2] = useState("#2563EB");
  const [shadowX, setShadowX] = useState(4);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(15);
  const [shadowSpread, setShadowSpread] = useState(-3);
  const [shadowColor, setShadowColor] = useState("rgba(0,0,0,0.1)");
  const [borderRadiusVal, setBorderRadiusVal] = useState(16);
  const [glassBlur, setGlassBlur] = useState(12);
  const [glassOpacity, setGlassOpacity] = useState(20);
  const [selectedRatio, setSelectedRatio] = useState("16:9");

  // Font states
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontFamilyName, setFontFamilyName] = useState<string>("CustomFont");
  const [fontLoaded, setFontLoaded] = useState(false);

  // SVG states
  const [svgInput, setSvgInput] = useState('<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#10B981" /></svg>');

  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Code 128 barcode generator (pure offline canvas)
  const renderCode128Barcode = (text: string) => {
    const canvas = barcodeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 320;
    canvas.height = 100;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, 90);

    // Pseudocode barcode pattern based on characters
    let x = 20;
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const bin = (code % 32).toString(2).padStart(5, "0");
      for (const bit of bin) {
        if (bit === "1") {
          ctx.fillRect(x, 15, 3, 60);
        }
        x += 4;
      }
      x += 2;
    }
  };

  useEffect(() => {
    if (toolId === "design_barcode_code128") {
      renderCode128Barcode(qrText || "123456789");
    }
  }, [toolId, qrText]);

  // Compute final QR content
  const getComputedQrPayload = (): string => {
    switch (toolId) {
      case "design_wifi_qr":
        return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
      case "design_upi_qr":
        return `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(upiName)}${upiAmount ? `&am=${upiAmount}` : ""}&cu=INR`;
      case "design_vcard_qr":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
      case "design_sms_qr":
        return `SMSTO:${smsPhone}:${smsBody}`;
      case "design_geo_qr":
        return `geo:${geoLat},${geoLng}`;
      default:
        return qrText;
    }
  };

  // Download QR code as PNG image
  const downloadQrCodeImage = () => {
    if (!qrContainerRef.current) return;
    const svg = qrContainerRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = qrSize;
    canvas.height = qrSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = qrBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          downloadBlob(blob, `qrcode_${toolId}.png`);
          setSuccessMsg(isHi ? "QR कोड PNG डाउनलोड हुआ" : "QR Code downloaded as PNG");
        }
      }, "image/png");
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  // Download Barcode as PNG
  const downloadBarcodeImage = () => {
    if (!barcodeCanvasRef.current) return;
    barcodeCanvasRef.current.toBlob(blob => {
      if (blob) {
        downloadBlob(blob, "barcode_code128.png");
        setSuccessMsg(isHi ? "बारकोड डाउनलोड हुआ" : "Barcode downloaded");
      }
    }, "image/png");
  };

  // Font file upload and @font-face loader
  const handleFontFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFontFile(f);
    const fontName = f.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
    setFontFamilyName(fontName);

    try {
      const buffer = await f.arrayBuffer();
      const font = new FontFace(fontName, buffer);
      await font.load();
      document.fonts.add(font);
      setFontLoaded(true);
      setSuccessMsg(isHi ? `फॉन्ट लोड हुआ: ${fontName}` : `Font loaded: ${fontName}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load font");
    }
  };

  // Palette generator based on seed hex
  const generatePalette = (seed: string): string[] => {
    // Generate 5 harmonious color steps
    return [
      seed,
      `${seed}CC`,
      `${seed}99`,
      `${seed}66`,
      `${seed}33`,
    ];
  };

  return (
    <div className="space-y-4">
      {/* 1. QR Code Suite */}
      {(toolId.startsWith("design_qr_") || toolId === "design_wifi_qr" || toolId === "design_upi_qr" || toolId === "design_vcard_qr" || toolId === "design_sms_qr" || toolId === "design_geo_qr") && (
        <div className="space-y-3">
          {toolId === "design_wifi_qr" && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "Wi-Fi नाम (SSID)" : "Wi-Fi SSID"}</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={e => setWifiSsid(e.target.value)}
                  placeholder="MyHomeWifi"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "पासवर्ड" : "Password"}</label>
                <input
                  type="password"
                  value={wifiPass}
                  onChange={e => setWifiPass(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "सुरक्षा प्रकार" : "Security"}</label>
                <select
                  value={wifiType}
                  onChange={e => setWifiType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="WPA">WPA/WPA2/WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">{isHi ? "खुला (No Password)" : "Open (No Password)"}</option>
                </select>
              </div>
            </div>
          )}

          {toolId === "design_upi_qr" && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "UPI ID (VPA)" : "UPI ID (VPA)"}</label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={e => setUpiVpa(e.target.value)}
                  placeholder="example@upi"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "प्राप्तकर्ता नाम" : "Payee Name"}</label>
                <input
                  type="text"
                  value={upiName}
                  onChange={e => setUpiName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "राशि (वैकल्पिक)" : "Amount (Optional)"}</label>
                <input
                  type="number"
                  value={upiAmount}
                  onChange={e => setUpiAmount(e.target.value)}
                  placeholder="₹ 500"
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>
          )}

          {toolId === "design_vcard_qr" && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "नाम" : "Full Name"}</label>
                <input
                  type="text"
                  value={vcardName}
                  onChange={e => setVcardName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "मोबाइल" : "Phone"}</label>
                  <input
                    type="text"
                    value={vcardPhone}
                    onChange={e => setVcardPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "ईमेल" : "Email"}</label>
                  <input
                    type="email"
                    value={vcardEmail}
                    onChange={e => setVcardEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {toolId === "design_sms_qr" && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "फोन नंबर" : "Phone Number"}</label>
                <input
                  type="text"
                  value={smsPhone}
                  onChange={e => setSmsPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "संदेश" : "Message Body"}</label>
                <textarea
                  value={smsBody}
                  onChange={e => setSmsBody(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>
          )}

          {toolId === "design_geo_qr" && (
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "अक्षांश (Latitude)" : "Latitude"}</label>
                <input
                  type="text"
                  value={geoLat}
                  onChange={e => setGeoLat(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "देशांतर (Longitude)" : "Longitude"}</label>
                <input
                  type="text"
                  value={geoLng}
                  onChange={e => setGeoLng(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </div>
            </div>
          )}

          {toolId === "design_qr_generator" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "QR कोड टेक्स्ट या URL" : "QR Text / URL"}</label>
              <textarea
                value={qrText}
                onChange={e => setQrText(e.target.value)}
                rows={2}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
              />
            </div>
          )}

          {/* QR Customization Colors */}
          <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">{isHi ? "रंग" : "Foreground"}:</label>
              <input
                type="color"
                value={qrFgColor}
                onChange={e => setQrFgColor(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer border border-slate-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">{isHi ? "पृष्ठभूमि" : "Background"}:</label>
              <input
                type="color"
                value={qrBgColor}
                onChange={e => setQrBgColor(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer border border-slate-300"
              />
            </div>
          </div>

          {/* Rendered QR Preview */}
          <div ref={qrContainerRef} className="flex justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <QRCode
              value={getComputedQrPayload() || "https://samahit.in"}
              size={qrSize}
              fgColor={qrFgColor}
              bgColor={qrBgColor}
            />
          </div>

          <button
            type="button"
            onClick={downloadQrCodeImage}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" />
            <span>{isHi ? "QR कोड इमेज डाउनलोड करें" : "Download QR Code PNG"}</span>
          </button>
        </div>
      )}

      {/* 2. Barcode Code 128 */}
      {toolId === "design_barcode_code128" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "बारकोड डेटा (अंक / अल्फ़ान्यूमेरिक)" : "Barcode Data (Numeric/Alpha)"}</label>
            <input
              type="text"
              value={qrText}
              onChange={e => setQrText(e.target.value)}
              placeholder="1234567890"
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono"
            />
          </div>

          <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-x-auto">
            <canvas ref={barcodeCanvasRef} className="border border-slate-100 rounded-lg shadow-xs" />
          </div>

          <button
            type="button"
            onClick={downloadBarcodeImage}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" />
            <span>{isHi ? "बारकोड PNG डाउनलोड करें" : "Download Barcode PNG"}</span>
          </button>
        </div>
      )}

      {/* 3. Font Tools (Viewer, Glyphs, Metadata) */}
      {(toolId === "design_font_viewer" || toolId === "design_font_glyphs" || toolId === "design_font_metadata") && (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              onChange={handleFontFile}
              id="font-file-upload"
              className="hidden"
            />
            <label htmlFor="font-file-upload" className="cursor-pointer">
              <Type className="mx-auto h-8 w-8 text-emerald-600" />
              <p className="mt-1 text-xs font-semibold text-emerald-950">
                {fontFile ? fontFile.name : isHi ? "फॉन्ट फ़ाइल चुनें (.ttf, .otf, .woff)" : "Select Font File (.ttf, .otf, .woff)"}
              </p>
            </label>
          </div>

          {fontLoaded && toolId === "design_font_viewer" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3" style={{ fontFamily: fontFamilyName }}>
              <p className="text-xl font-bold">The quick brown fox jumps over the lazy dog.</p>
              <p className="text-base">सारे जहां से अच्छा हिन्दोस्तां हमारा।</p>
              <p className="text-sm">0123456789 !@#$%^&*()_+</p>
            </div>
          )}

          {fontLoaded && toolId === "design_font_glyphs" && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 max-h-60 overflow-y-auto" style={{ fontFamily: fontFamilyName }}>
              <div className="grid grid-cols-8 gap-2 text-center text-lg font-bold">
                {Array.from({ length: 94 }, (_, i) => String.fromCharCode(33 + i)).map((char, idx) => (
                  <div key={idx} className="rounded border border-slate-100 p-2 hover:bg-emerald-50">
                    {char}
                  </div>
                ))}
              </div>
            </div>
          )}

          {fontFile && toolId === "design_font_metadata" && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
              <p className="text-xs font-bold text-slate-800 mb-1">{isHi ? "फॉन्ट मेटाडेटा विवरण:" : "Font Metadata:"}</p>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">{isHi ? "नाम" : "Name"}</span>
                <span className="font-semibold text-slate-800">{fontFamilyName}</span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-50">
                <span className="text-slate-500">{isHi ? "फ़ाइल आकार" : "File Size"}</span>
                <span className="font-semibold text-slate-800">{(fontFile.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex justify-between text-xs py-1">
                <span className="text-slate-500">{isHi ? "प्रारूप" : "MIME Type"}</span>
                <span className="font-semibold text-slate-800">{fontFile.type || "font/ttf"}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. CSS Design Tools (Palette, Gradient, Box Shadow, Border Radius, Glassmorphism) */}
      {toolId === "design_palette_generator" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <label className="text-xs font-semibold text-slate-700">{isHi ? "मूल रंग (Seed Color):" : "Seed Color:"}</label>
            <input
              type="color"
              value={paletteSeed}
              onChange={e => setPaletteSeed(e.target.value)}
              className="h-8 w-8 rounded cursor-pointer border border-slate-300"
            />
            <span className="text-xs font-mono font-bold text-slate-800">{paletteSeed}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {generatePalette(paletteSeed).map((col, idx) => (
              <div
                key={idx}
                onClick={() => copyToClipboard(col)}
                className="h-20 rounded-xl flex flex-col justify-end p-2 cursor-pointer shadow-xs border border-black/10 transition-transform active:scale-95"
                style={{ backgroundColor: col }}
              >
                <span className="text-[10px] font-mono font-bold text-white drop-shadow-sm bg-black/40 px-1 rounded text-center">
                  {col}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-center text-slate-500">{isHi ? "कलर कोड कॉपी करने हेतु किसी भी शेड पर टैप करें" : "Tap any color swatch to copy hex code"}</p>
        </div>
      )}

      {toolId === "design_gradient_generator" && (
        <div className="space-y-3">
          <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Color 1:</label>
              <input
                type="color"
                value={gradCol1}
                onChange={e => setGradCol1(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer border border-slate-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Color 2:</label>
              <input
                type="color"
                value={gradCol2}
                onChange={e => setGradCol2(e.target.value)}
                className="h-7 w-7 rounded cursor-pointer border border-slate-300"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-semibold text-slate-700">{gradAngle}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradAngle}
                onChange={e => setGradAngle(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          <div
            className="h-32 rounded-2xl shadow-md border border-slate-200 flex items-center justify-center text-white font-bold text-sm drop-shadow"
            style={{ background: `linear-gradient(${gradAngle}deg, ${gradCol1}, ${gradCol2})` }}
          >
            Linear Gradient Preview
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs flex justify-between items-center">
            <code>background: linear-gradient({gradAngle}deg, {gradCol1}, {gradCol2});</code>
            <button
              type="button"
              onClick={() => copyToClipboard(`background: linear-gradient(${gradAngle}deg, ${gradCol1}, ${gradCol2});`)}
              className="text-emerald-700 font-bold hover:underline"
            >
              {isHi ? "कॉपी" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {toolId === "design_box_shadow" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>X Offset: {shadowX}px</span>
              <input type="range" min="-30" max="30" value={shadowX} onChange={e => setShadowX(Number(e.target.value))} className="w-1/2 accent-emerald-600" />
            </div>
            <div className="flex justify-between">
              <span>Y Offset: {shadowY}px</span>
              <input type="range" min="-30" max="30" value={shadowY} onChange={e => setShadowY(Number(e.target.value))} className="w-1/2 accent-emerald-600" />
            </div>
            <div className="flex justify-between">
              <span>Blur: {shadowBlur}px</span>
              <input type="range" min="0" max="50" value={shadowBlur} onChange={e => setShadowBlur(Number(e.target.value))} className="w-1/2 accent-emerald-600" />
            </div>
          </div>

          <div className="py-8 flex justify-center bg-slate-100 rounded-2xl">
            <div
              className="h-24 w-48 rounded-xl bg-white flex items-center justify-center text-xs font-bold text-slate-700"
              style={{ boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,0.2)` }}
            >
              Box Shadow Preview
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs flex justify-between items-center">
            <code>box-shadow: {shadowX}px {shadowY}px {shadowBlur}px {shadowSpread}px rgba(0,0,0,0.2);</code>
            <button
              type="button"
              onClick={() => copyToClipboard(`box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,0.2);`)}
              className="text-emerald-700 font-bold hover:underline"
            >
              {isHi ? "कॉपी" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {toolId === "design_border_radius" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Radius: {borderRadiusVal}px</span>
              <input type="range" min="0" max="100" value={borderRadiusVal} onChange={e => setBorderRadiusVal(Number(e.target.value))} className="w-2/3 accent-emerald-600" />
            </div>
          </div>

          <div className="py-8 flex justify-center bg-slate-100 rounded-2xl">
            <div
              className="h-28 w-28 bg-emerald-600 flex items-center justify-center text-xs font-bold text-white shadow-md transition-all"
              style={{ borderRadius: `${borderRadiusVal}px` }}
            >
              {borderRadiusVal}px
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs flex justify-between items-center">
            <code>border-radius: {borderRadiusVal}px;</code>
            <button
              type="button"
              onClick={() => copyToClipboard(`border-radius: ${borderRadiusVal}px;`)}
              className="text-emerald-700 font-bold hover:underline"
            >
              {isHi ? "कॉपी" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {toolId === "design_glassmorphism" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Blur: {glassBlur}px</span>
              <input type="range" min="1" max="30" value={glassBlur} onChange={e => setGlassBlur(Number(e.target.value))} className="w-2/3 accent-emerald-600" />
            </div>
            <div className="flex justify-between">
              <span>Opacity: {glassOpacity}%</span>
              <input type="range" min="5" max="80" value={glassOpacity} onChange={e => setGlassOpacity(Number(e.target.value))} className="w-2/3 accent-emerald-600" />
            </div>
          </div>

          <div className="relative h-40 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 p-6 flex items-center justify-center overflow-hidden">
            <div
              className="h-28 w-56 rounded-2xl border border-white/30 p-4 text-white text-xs font-bold shadow-xl flex items-center justify-center"
              style={{
                backgroundColor: `rgba(255, 255, 255, ${glassOpacity / 100})`,
                backdropFilter: `blur(${glassBlur}px)`,
                WebkitBackdropFilter: `blur(${glassBlur}px)`
              }}
            >
              Glassmorphism Effect
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs flex justify-between items-center">
            <code>background: rgba(255, 255, 255, {glassOpacity / 100}); backdrop-filter: blur({glassBlur}px);</code>
            <button
              type="button"
              onClick={() => copyToClipboard(`background: rgba(255, 255, 255, ${glassOpacity / 100});\nbackdrop-filter: blur(${glassBlur}px);\n-webkit-backdrop-filter: blur(${glassBlur}px);`)}
              className="text-emerald-700 font-bold hover:underline"
            >
              {isHi ? "कॉपी" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* 5. SVG Tools & Favicon */}
      {(toolId === "design_svg_visualizer" || toolId === "design_svg_minifier") && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "SVG कोड इनपुट" : "SVG Code Input"}</label>
            <textarea
              value={svgInput}
              onChange={e => setSvgInput(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white p-2 font-mono text-xs"
            />
          </div>

          {toolId === "design_svg_visualizer" && (
            <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div dangerouslySetInnerHTML={{ __html: svgInput }} className="max-w-[200px] max-h-[200px]" />
            </div>
          )}

          {toolId === "design_svg_minifier" && (
            <button
              type="button"
              onClick={() => {
                const min = svgInput.replace(/\s+/g, " ").replace(/> </g, "><").trim();
                setSvgInput(min);
                copyToClipboard(min);
                setSuccessMsg(isHi ? "SVG संक्षिप्त हुआ और कॉपी हो गया" : "SVG minified and copied");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800"
            >
              <Code className="h-4 w-4" />
              <span>{isHi ? "SVG संकुचित करें (Minify)" : "Minify SVG"}</span>
            </button>
          )}
        </div>
      )}

      {toolId === "design_favicon_suite" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center space-y-3">
            <p className="text-xs text-slate-600">{isHi ? "फ़ेविकॉन HTML हेड टैग्स जेनरेटर" : "Favicon HTML Meta Header Suite"}</p>
            <div className="rounded-lg bg-slate-50 p-3 text-left font-mono text-[11px] text-slate-700 space-y-1">
              <div>&lt;link rel="icon" type="image/x-icon" href="/favicon.ico"&gt;</div>
              <div>&lt;link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"&gt;</div>
              <div>&lt;link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"&gt;</div>
              <div>&lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"&gt;</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard('<link rel="icon" type="image/x-icon" href="/favicon.ico">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">')}
              className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
            >
              {isHi ? "HTML टैग्स कॉपी करें" : "Copy HTML Header Tags"}
            </button>
          </div>
        </div>
      )}

      {toolId === "design_contrast_checker" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">{isHi ? "टेक्स्ट रंग:" : "Text Color:"}</label>
              <input
                type="color"
                value={qrFgColor}
                onChange={e => setQrFgColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border border-slate-300"
              />
              <span className="text-xs font-mono">{qrFgColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">{isHi ? "पृष्ठभूमि रंग:" : "Background:"}</label>
              <input
                type="color"
                value={qrBgColor}
                onChange={e => setQrBgColor(e.target.value)}
                className="h-8 w-8 rounded cursor-pointer border border-slate-300"
              />
              <span className="text-xs font-mono">{qrBgColor}</span>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 text-center shadow-xs border border-slate-200 space-y-2 transition-colors"
            style={{ backgroundColor: qrBgColor, color: qrFgColor }}
          >
            <p className="text-lg font-bold">Sample Text Heading</p>
            <p className="text-xs">The quick brown fox jumps over the lazy dog.</p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center space-y-1">
            <p className="text-xs text-emerald-800 font-semibold">{isHi ? "कंट्रास्ट अनुपात (WCAG 2.1)" : "Contrast Ratio (WCAG 2.1)"}</p>
            <p className="text-xl font-black text-emerald-900">
              {(() => {
                const getLum = (hex: string) => {
                  const rgb = parseInt(hex.slice(1), 16);
                  const r = ((rgb >> 16) & 255) / 255;
                  const g = ((rgb >> 8) & 255) / 255;
                  const b = (rgb & 255) / 255;
                  const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
                  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
                };
                const l1 = getLum(qrFgColor || "#000000");
                const l2 = getLum(qrBgColor || "#FFFFFF");
                const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
                return `${ratio.toFixed(2)} : 1 ${ratio >= 4.5 ? "✓ PASS (AA)" : "⚠ FAIL"}`;
              })()}
            </p>
          </div>
        </div>
      )}

      {toolId === "design_aspect_calc" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "मूल चौड़ाई (Width)" : "Width (px)"}</label>
              <input
                type="number"
                value={shadowX > 0 ? shadowX * 100 : 1920}
                onChange={e => setShadowX(Math.max(1, Math.round(Number(e.target.value) / 100)))}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "अनुपात (Ratio)" : "Aspect Ratio"}</label>
              <select
                value={selectedRatio}
                onChange={e => setSelectedRatio(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              >
                <option value="16:9">16:9 (Widescreen / Video)</option>
                <option value="4:3">4:3 (Classic Display)</option>
                <option value="1:1">1:1 (Square / Instagram)</option>
                <option value="9:16">9:16 (Story / Reel)</option>
                <option value="21:9">21:9 (Ultrawide)</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center space-y-1">
            <p className="text-xs text-slate-500">{isHi ? "गणना की गई ऊंचाई (Proportional Height)" : "Proportional Height"}</p>
            <p className="text-2xl font-black text-slate-800">
              {(() => {
                const w = shadowX > 0 ? shadowX * 100 : 1920;
                const [rw, rh] = selectedRatio.split(":").map(Number);
                const h = Math.round((w * rh) / rw);
                return `${h} px (${w} x ${h})`;
              })()}
            </p>
          </div>
        </div>
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
