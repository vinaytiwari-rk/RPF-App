import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronLeft, ChevronRight, Download, FileImage, FileText, ImagePlus, RotateCw, ScanLine, Trash2, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { saveBlobToDownloads } from "../utils/nativeFileDownload";

type FilterMode = "original" | "grayscale" | "magic";
type ScanPage = { id: string; image: string; name: string };
type SavedScan = { id: string; name: string; pages: ScanPage[]; createdAt: string };
const STORAGE_KEY = "rpf_document_scans_v2";
const MAX_SAVED_DOCUMENTS = 8;
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const makeId = () => typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image could not be opened."));
    img.src = src;
  });
}
async function applyFilter(source: string, mode: FilterMode): Promise<string> {
  const img = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Image processing is not available on this device.");
  ctx.drawImage(img, 0, 0);
  if (mode !== "original") {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < frame.data.length; i += 4) {
      const gray = frame.data[i] * .299 + frame.data[i + 1] * .587 + frame.data[i + 2] * .114;
      const value = mode === "grayscale" ? gray : Math.max(0, Math.min(255, (gray - 128) * 1.8 + 128));
      frame.data[i] = frame.data[i + 1] = frame.data[i + 2] = value;
    }
    ctx.putImageData(frame, 0, 0);
  }
  return canvas.toDataURL("image/jpeg", .9);
}

const DocScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [filterMode, setFilterMode] = useState<FilterMode>("magic");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [savedScans, setSavedScans] = useState<SavedScan[]>([]);
  const [documentName, setDocumentName] = useState("Scanned document");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const value: unknown = JSON.parse(raw);
        if (Array.isArray(value)) setSavedScans(value.filter((x): x is SavedScan => !!x && typeof x.id === "string" && Array.isArray(x.pages)));
      }
    } catch { setError("Saved scans could not be loaded. You can still scan and export documents."); }
  }, []);

  const stopCamera = useCallback(() => {
    setStream(current => { current?.getTracks().forEach(track => track.stop()); return null; });
  }, []);
  useEffect(() => () => { stream?.getTracks().forEach(track => track.stop()); }, [stream]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream; video.muted = true; video.playsInline = true;
    void video.play().catch(() => setError("Camera preview could not start. Close other camera apps and retry."));
    return () => { if (video.srcObject === stream) video.srcObject = null; };
  }, [stream]);

  const startCamera = async () => {
    setError(""); setNotice("");
    if (!navigator.mediaDevices?.getUserMedia) { setError("Camera is unavailable in this WebView. Choose an image from your device instead."); return; }
    try {
      stopCamera();
      const next = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
      setStream(next);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setError(name === "NotAllowedError" ? "Camera permission denied. Allow camera access in Android Settings and retry."
        : name === "NotFoundError" ? "No camera was found on this device."
        : name === "NotReadableError" ? "Camera is busy. Close apps using the camera and retry."
        : "Could not open camera. Check permission or import a photo instead.");
    }
  };
  const addPages = (newPages: ScanPage[]) => {
    setPages(current => { const next = [...current, ...newPages]; setActivePage(next.length - 1); return next; });
    setError(""); setNotice(`${newPages.length} page(s) added to this document.`);
  };
  const capturePage = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) { setError("Camera is still starting. Wait for the preview and try again."); return; }
    setBusy(true);
    try {
      const canvas = document.createElement("canvas"); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not capture camera frame.");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      addPages([{ id: makeId(), name: `Page ${pages.length + 1}`, image: await applyFilter(canvas.toDataURL("image/jpeg", .94), filterMode) }]);
      stopCamera();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not capture this page."); }
    finally { setBusy(false); }
  };
  const importImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const incoming = Array.from(files).filter(file => file.type.startsWith("image/"));
      if (!incoming.length) throw new Error("Choose JPG, PNG, or another supported image.");
      if (incoming.some(file => file.size > MAX_IMAGE_BYTES)) throw new Error("Each image must be 25 MB or smaller.");
      const imported: ScanPage[] = [];
      for (const file of incoming) {
        const source = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read image."));
          reader.onerror = () => reject(new Error("Could not read selected image."));
          reader.readAsDataURL(file);
        });
        imported.push({ id: makeId(), name: file.name, image: await applyFilter(source, filterMode) });
      }
      addPages(imported); stopCamera();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to import these images."); }
    finally { setBusy(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };
  const changeFilter = async (mode: FilterMode) => {
    setFilterMode(mode); if (!pages.length) return; setBusy(true);
    try {
      const next = await Promise.all(pages.map(async page => ({ ...page, image: await applyFilter(page.image, mode) })));
      setPages(next); setNotice("Filter applied to all pages.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not apply filter."); }
    finally { setBusy(false); }
  };
  const rotatePage = async () => {
    const page = pages[activePage]; if (!page) return; setBusy(true);
    try {
      const img = await loadImage(page.image); const canvas = document.createElement("canvas");
      canvas.width = img.naturalHeight; canvas.height = img.naturalWidth;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Could not rotate this page.");
      ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const image = canvas.toDataURL("image/jpeg", .9);
      setPages(current => current.map((p, i) => i === activePage ? { ...p, image } : p)); setNotice("Page rotated.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not rotate page."); }
    finally { setBusy(false); }
  };
  const deletePage = () => {
    setPages(current => { const next = current.filter((_, i) => i !== activePage); setActivePage(Math.max(0, Math.min(activePage, next.length - 1))); return next; });
    setNotice("Page removed.");
  };
  const exportImage = async () => {
    const page = pages[activePage]; if (!page) return; setBusy(true); setError("");
    try {
      const img = await loadImage(page.image); const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Image export is unavailable.");
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Image export failed.")), "image/jpeg", .92));
      await saveBlobToDownloads(blob, `SAMAHIT_Scan_Page_${activePage + 1}.jpg`, "image/jpeg");
      setNotice("Image saved to Downloads.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save image."); }
    finally { setBusy(false); }
  };
  const exportPdf = async () => {
    if (!pages.length) return; setBusy(true); setError("");
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      for (let i = 0; i < pages.length; i++) {
        const img = await loadImage(pages[i].image); const margin = 7;
        const scale = Math.min((210 - margin * 2) / img.naturalWidth, (297 - margin * 2) / img.naturalHeight);
        const width = img.naturalWidth * scale; const height = img.naturalHeight * scale;
        if (i) pdf.addPage("a4", "portrait");
        pdf.addImage(pages[i].image, "JPEG", (210 - width) / 2, (297 - height) / 2, width, height, undefined, "FAST");
      }
      const filename = `${documentName.trim().replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "_") || "SAMAHIT_Scan"}.pdf`;
      await saveBlobToDownloads(pdf.output("blob"), filename, "application/pdf");
      setNotice(`PDF saved successfully (${pages.length} page${pages.length === 1 ? "" : "s"}).`);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create PDF."); }
    finally { setBusy(false); }
  };
  const saveToLibrary = () => {
    if (!pages.length) return;
    const next: SavedScan[] = [{ id: makeId(), name: documentName.trim() || `Document ${new Date().toLocaleDateString()}`, pages: pages.map(p => ({ ...p })), createdAt: new Date().toISOString() }, ...savedScans].slice(0, MAX_SAVED_DOCUMENTS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setSavedScans(next); setNotice("Saved locally on this device; not uploaded to the server."); setError(""); }
    catch { setError("Device storage is full. Export the PDF and delete older saved documents before retrying."); }
  };
  const openSaved = (scan: SavedScan) => { setPages(scan.pages.map(p => ({ ...p }))); setActivePage(0); setDocumentName(scan.name); setNotice("Saved document opened."); setError(""); stopCamera(); };
  const deleteSaved = (id: string) => {
    const next = savedScans.filter(s => s.id !== id);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setSavedScans(next); }
    catch { setError("Could not update saved documents."); }
  };
  const active = pages[activePage];

  return <main className="mx-auto max-w-5xl space-y-5 p-4 pb-24 text-slate-800 sm:p-6">
    <header className="rounded-3xl bg-[#F3FAF6] p-5 sm:p-7">
      <div className="flex items-center gap-3"><div className="rounded-2xl bg-white p-3 text-[#245D45] shadow-sm"><ScanLine className="h-7 w-7" /></div><div><h1 className="text-2xl font-bold text-[#245D45]">Document Scanner</h1><p className="mt-1 text-sm text-slate-600">दस्तावेज़ स्कैन करें, कई पेज जोड़ें और PDF अपने डिवाइस में सेव करें।</p></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button onClick={() => void startCamera()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl bg-[#245D45] px-4 py-3 font-semibold text-white disabled:opacity-50"><Camera className="h-5 w-5" /> Camera Scan</button>
        <button onClick={() => fileInputRef.current?.click()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-[#8FB6A8] bg-white px-4 py-3 font-semibold text-[#245D45] disabled:opacity-50"><ImagePlus className="h-5 w-5" /> Import Photos</button>
        <button onClick={() => { setPages([]); setActivePage(0); setDocumentName("Scanned document"); setNotice(""); setError(""); stopCamera(); }} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold disabled:opacity-50"><X className="h-5 w-5" /> New Document</button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => void importImages(e.target.files)} />
      </div>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
    {busy && <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Processing… please wait.</div>}
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950 sm:min-h-[480px]">
          {stream && !active && <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-contain" />}
          {stream && !active && <div className="pointer-events-none absolute inset-5 rounded-lg border-2 border-dashed border-emerald-300/90"><span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white">Keep the full page inside the frame</span></div>}
          {active && <img src={active.image} alt={active.name} className="max-h-[70vh] w-full object-contain" />}
          {!stream && !active && <div className="px-6 text-center text-white"><FileText className="mx-auto mb-3 h-12 w-12 text-emerald-300" /><p className="font-semibold">Your scan will appear here</p><p className="mt-1 text-sm text-slate-300">Start camera scan or import existing photos.</p></div>}
        </div>
        {active && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-sm font-semibold">Page {activePage + 1} of {pages.length}</span><div className="flex gap-2">
          <button onClick={() => setActivePage(i => Math.max(0, i - 1))} disabled={activePage === 0 || busy} aria-label="Previous page" className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => setActivePage(i => Math.min(pages.length - 1, i + 1))} disabled={activePage >= pages.length - 1 || busy} aria-label="Next page" className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight className="h-5 w-5" /></button>
          <button onClick={() => void rotatePage()} disabled={busy} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"><RotateCw className="h-4 w-4" /> Rotate</button>
          <button onClick={deletePage} disabled={busy} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"><Trash2 className="h-4 w-4" /> Remove</button>
        </div></div>}
        {stream && !active && <div className="mt-4 flex justify-center"><button onClick={() => void capturePage()} disabled={busy} className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-200 bg-[#245D45] text-white shadow-lg disabled:opacity-50" aria-label="Capture page"><Camera className="h-7 w-7" /></button></div>}
        {active && <div className="mt-4 flex flex-wrap gap-2">{(["original", "grayscale", "magic"] as FilterMode[]).map(mode => <button key={mode} onClick={() => void changeFilter(mode)} disabled={busy} className={`rounded-full px-4 py-2 text-sm font-semibold ${filterMode === mode ? "bg-[#245D45] text-white" : "bg-slate-100 text-slate-700"} disabled:opacity-50`}>{mode === "magic" ? "B&W Document" : mode === "grayscale" ? "Grayscale" : "Original"}</button>)}<button onClick={() => void exportImage()} disabled={busy} className="ml-auto flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50"><FileImage className="h-4 w-4" /> Save JPG</button></div>}
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold">Document pages</h2><p className="mt-1 text-sm text-slate-500">{pages.length} page(s) ready for PDF</p>
          <div className="mt-3 max-h-64 space-y-2 overflow-auto">{pages.map((page, index) => <button key={page.id} onClick={() => setActivePage(index)} className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${index === activePage ? "border-[#245D45] bg-[#F3FAF6]" : "border-slate-100"}`}><img src={page.image} alt="" className="h-14 w-11 rounded-md bg-slate-100 object-cover" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold">Page {index + 1}</span><span className="block truncate text-xs text-slate-500">{page.name}</span></span>{index === activePage && <Check className="h-4 w-4 text-[#245D45]" />}</button>)}{!pages.length && <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">No pages yet.</p>}</div>
          {stream && pages.length > 0 && <button onClick={() => void capturePage()} disabled={busy} className="mt-3 w-full rounded-xl border border-[#8FB6A8] px-3 py-2.5 text-sm font-bold text-[#245D45] disabled:opacity-50">Capture another page</button>}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"><label className="block text-sm font-semibold" htmlFor="scan-name">PDF file name</label><input id="scan-name" value={documentName} onChange={e => setDocumentName(e.target.value)} maxLength={80} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Scanned document" />
          <button onClick={() => void exportPdf()} disabled={!pages.length || busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#245D45] px-4 py-3 font-bold text-white disabled:opacity-40"><Download className="h-5 w-5" /> Export all pages to PDF</button>
          <button onClick={saveToLibrary} disabled={!pages.length || busy} className="w-full rounded-xl border border-[#8FB6A8] px-4 py-3 font-bold text-[#245D45] disabled:opacity-40">Save in local library</button>
          <p className="text-xs leading-5 text-slate-500">Scans are processed on-device. Supported Android builds save exports to Downloads. Local-library storage depends on free device/browser storage.</p>
        </div>
      </aside>
    </section>
    {savedScans.length > 0 && <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5"><h2 className="text-lg font-bold">Saved on this device</h2><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{savedScans.map(scan => <div key={scan.id} className="flex items-center gap-3 rounded-xl border p-3"><img src={scan.pages[0]?.image} alt="" className="h-16 w-12 rounded-lg bg-slate-100 object-cover" /><button onClick={() => openSaved(scan)} className="min-w-0 flex-1 text-left"><span className="block truncate text-sm font-bold">{scan.name}</span><span className="text-xs text-slate-500">{scan.pages.length} page(s) · {new Date(scan.createdAt).toLocaleDateString()}</span></button><button onClick={() => deleteSaved(scan.id)} aria-label={`Delete ${scan.name}`} className="rounded-lg p-2 text-red-600"><Trash2 className="h-4 w-4" /></button></div>)}</div></section>}
  </main>;
};
export default DocScanner;
