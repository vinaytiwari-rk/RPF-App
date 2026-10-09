import React, { useEffect, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { PDFDocument } from "pdf-lib";
import { jsPDF } from "jspdf";
import { FileImage, UploadCloud, X } from "lucide-react";
import Shell from "./UtilityPageShell";

interface NativeDownloadsPlugin {
  saveToDownloads(options: { filename: string; mimeType: string; data: string }): Promise<{ uri: string; filename: string }>;
}

const NativeDownloads = registerPlugin<NativeDownloadsPlugin>("NativeDownloads");

const save = async (blob: Blob, name: string): Promise<void> => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    // Android WebView anchor downloads are unreliable. Save through the native
    // MediaStore plugin, which writes to Downloads/SAMAHIT and rejects on failure.
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
    }
    const extension = name.toLowerCase().split(".").pop();
    const fallbackMime = extension === "pdf" ? "application/pdf"
      : extension === "jpg" || extension === "jpeg" ? "image/jpeg"
      : extension === "png" ? "image/png"
      : extension === "webp" ? "image/webp"
      : extension === "zip" ? "application/zip"
      : "application/octet-stream";
    const saved = await NativeDownloads.saveToDownloads({
      filename: name,
      mimeType: blob.type || fallbackMime,
      data: btoa(binary),
    });
    if (!saved?.uri || !saved.filename) {
      throw new Error("Android did not confirm that the file was saved");
    }
    return;
  }

  // Browser fallback. A browser may show its own download UI.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
};
const read = (key: string) => { try { return localStorage.getItem(key)||""; } catch { return ""; } };
const store = (key:string,value:string) => { try { localStorage.setItem(key,value); return true; } catch { return false; } };
const UploadPicker = ({ multiple=false, accept, count=0, fileName="", onChange, label, hint }: { multiple?: boolean; accept: string; count?: number; fileName?: string; onChange: (files: File[]) => void; label: string; hint: string }) => (
  <div className="rounded-2xl border-2 border-dashed border-[#8FB6A8] bg-[#F3FAF6] p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-[#D8E9E1] text-[#245D45]"><UploadCloud className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#243B32]">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
        {(count > 0 || fileName) && <p className="mt-1 truncate text-xs font-semibold text-[#245D45]">{count > 0 ? `${count} file${count === 1 ? "" : "s"} selected` : fileName}</p>}
      </div>
      <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-[#245D45] px-3.5 py-2.5 text-xs font-bold text-white shadow-sm">
        <UploadCloud className="h-4 w-4" /> Select file{multiple ? "s" : ""}
        <input type="file" multiple={multiple} accept={accept} className="sr-only" onChange={e=>onChange(Array.from(e.target.files||[]))} />
      </label>
    </div>
  </div>
);
export default function EverydayToolPage() {
 const {tool} = useParams<{tool:string}>(); const nav=useNavigate();
 const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 const [value,setValue]=useState(""); const [notes,setNotes]=useState(()=>read("samahit-utility-notes-v1"));
 const [tasks,setTasks]=useState<{text:string;done:boolean}[]>(()=>{try{return JSON.parse(read("samahit-utility-tasks-v1")||"[]");}catch{return [];}});
 const [task,setTask]=useState(""); const [password,setPassword]=useState("");
 const [days,setDays]=useState(""); const [date,setDate]=useState("");
 const [images,setImages]=useState<File[]>([]); const [pdfs,setPdfs]=useState<File[]>([]);
 const [width,setWidth]=useState(1200); const [quality,setQuality]=useState(0.8);
 const [file,setFile]=useState<File|null>(null);
 const [reminderText,setReminderText]=useState(""); const [reminderDate,setReminderDate]=useState("");
 const [reminders,setReminders]=useState<{id:string;text:string;when:string}[]>(()=>{try{const x=JSON.parse(read("samahit-reminders-v1")||"[]");return Array.isArray(x)?x:[];}catch{return [];}});
 const [unitFrom,setUnitFrom]=useState("km"); const [unitTo,setUnitTo]=useState("mi"); const [unitAmount,setUnitAmount]=useState("1");

 useEffect(()=>{setError("");setBusy(false);setImages([]);setPdfs([]);setFile(null);},[tool]);
 const run=async(fn:()=>Promise<void>)=>{setError("");setBusy(true);try{await fn();}catch(e){setError(e instanceof Error?e.message:"Unable to process this file");}finally{setBusy(false);}};
 const title:Record<string,string>={notes:"Notes & Checklist",password:"Password Generator",qr:"QR Code Generator",date:"Date Calculator",image:"Image Resize & Convert", "image-pdf":"Images to PDF","pdf-merge":"Merge PDF","pdf-split":"Split PDF","pdf-compress":"Compress PDF","reminders":"Reminders","converter":"Unit Converter"};
 const input="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm";
 const button="rounded-xl bg-[#245D45] px-4 py-3 text-sm font-bold text-white disabled:opacity-50";
 const makePassword=()=>{const chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";const bytes=new Uint32Array(24);crypto.getRandomValues(bytes);setPassword(Array.from(bytes,n=>chars[n%chars.length]).join(""));};
 const processImage=async()=>{if(!file)throw Error("Choose an image");const bmp=await createImageBitmap(file);try{const ratio=Math.min(1,Math.max(100,width)/bmp.width);const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bmp.width*ratio));canvas.height=Math.max(1,Math.round(bmp.height*ratio));const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas unavailable");ctx.drawImage(bmp,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("Conversion failed")),"image/jpeg",quality));await save(blob,"samahit-image.jpg");}finally{bmp.close();}};
 const makePdf=async()=>{if(!images.length)throw Error("Choose images");const pdf=new jsPDF({unit:"mm",format:"a4"});for(let i=0;i<images.length;i++){const f=images[i];if(f.size>20_000_000)throw Error("Image exceeds 20 MB");const bmp=await createImageBitmap(f);try{const c=document.createElement("canvas");const scale=Math.min(1,1800/Math.max(bmp.width,bmp.height));c.width=Math.max(1,Math.round(bmp.width*scale));c.height=Math.max(1,Math.round(bmp.height*scale));c.getContext("2d")?.drawImage(bmp,0,0,c.width,c.height);const data=c.toDataURL("image/jpeg",0.8);const ratio=Math.min(190/c.width,277/c.height);if(i)pdf.addPage();pdf.addImage(data,"JPEG",(210-c.width*ratio)/2,(297-c.height*ratio)/2,c.width*ratio,c.height*ratio);}finally{bmp.close();}}await save(pdf.output("blob"),"samahit-images.pdf");};
 const merge=async()=>{if(pdfs.length<2)throw Error("Select at least two PDFs");const out=await PDFDocument.create();for(const f of pdfs){if(f.size>30_000_000)throw Error("PDF exceeds 30 MB");const src=await PDFDocument.load(await f.arrayBuffer());const pages=await out.copyPages(src,src.getPageIndices());pages.forEach(p=>out.addPage(p));}await save(new Blob([new Uint8Array(await out.save()) as BlobPart],{type:"application/pdf"}),"samahit-merged.pdf");};
 const compress=async()=>{if(!file)throw Error("Choose a PDF");if(file.size>30_000_000)throw Error("PDF exceeds 30 MB");const doc=await PDFDocument.load(await file.arrayBuffer());const bytes=await doc.save({useObjectStreams:true,objectsPerTick:25});const blob=new Blob([new Uint8Array(bytes) as BlobPart],{type:"application/pdf"});await save(blob,"samahit-optimized.pdf");if(blob.size>=file.size)setError("This PDF is already compressed; output may not be smaller. Scanned images need image recompression.");};
 const split=async()=>{if(!file)throw Error("Choose a PDF");const src=await PDFDocument.load(await file.arrayBuffer());const n=src.getPageCount();if(n>100)throw Error("For device safety, split files up to 100 pages");for(let i=0;i<n;i++){const out=await PDFDocument.create();const [p]=await out.copyPages(src,[i]);out.addPage(p);await save(new Blob([new Uint8Array(await out.save()) as BlobPart],{type:"application/pdf"}),`samahit-page-${i+1}.pdf`);}};
 const downloadQr=async()=>{const svg=document.querySelector<SVGSVGElement>("#samahit-qr-svg");if(!svg)throw Error("Generate a QR code first");const source=new XMLSerializer().serializeToString(svg);const svgBlob=new Blob([source],{type:"image/svg+xml;charset=utf-8"});const url=URL.createObjectURL(svgBlob);try{const image=new Image();image.src=url;await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=()=>reject(Error("Could not render QR code"));});const canvas=document.createElement("canvas");canvas.width=800;canvas.height=800;const context=canvas.getContext("2d");if(!context)throw Error("Canvas unavailable");context.fillStyle="#ffffff";context.fillRect(0,0,800,800);context.drawImage(image,0,0,800,800);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(result=>result?resolve(result):reject(Error("Could not export QR image")),"image/png"));await save(blob,"samahit-qr.png");}finally{URL.revokeObjectURL(url);}};
 return <Shell title={title[tool||""]||"Utility"} onBack={()=>nav("/utilities")}>
 <div className="space-y-4 text-[#243B32]">
 {tool==="notes"&&<><textarea className={input+" min-h-40"} aria-label="Notes" placeholder="Write notes here..." value={notes} onChange={e=>{setNotes(e.target.value);if(!store("samahit-utility-notes-v1",e.target.value))setError("Device storage is full or disabled");}}/><p className="text-xs text-slate-500">Saved locally on this device. Clearing app data deletes notes.</p><div className="flex gap-2"><input className={input} value={task} onChange={e=>setTask(e.target.value)} placeholder="Add checklist item"/><button className={button} onClick={()=>{if(!task.trim())return;const next=[...tasks,{text:task.trim(),done:false}];if(store("samahit-utility-tasks-v1",JSON.stringify(next))){setTasks(next);setTask("");}else setError("Unable to save checklist");}}>Add</button></div>{tasks.map((t,i)=><div key={i} className="flex items-center gap-2"><input type="checkbox" checked={t.done} onChange={()=>{const next=tasks.map((x,j)=>j===i?{...x,done:!x.done}:x);if(store("samahit-utility-tasks-v1",JSON.stringify(next)))setTasks(next);else setError("Unable to save checklist");}}/><span className={"flex-1 "+(t.done?"line-through":"")}>{t.text}</span><button aria-label="Remove task" onClick={()=>{const next=tasks.filter((_,j)=>j!==i);if(store("samahit-utility-tasks-v1",JSON.stringify(next)))setTasks(next);else setError("Unable to save checklist");}}>✕</button></div>)}</>}
 {tool==="password"&&<><button className={button} onClick={makePassword}>Generate strong password</button><input className={input} readOnly value={password} aria-label="Generated password"/>{password&&<button className={button} onClick={()=>void navigator.clipboard.writeText(password).catch(()=>setError("Clipboard unavailable"))}>Copy password</button>}<p className="text-xs">Generated securely on your device. Not saved.</p></>}
 {tool==="qr"&&<><input className={input} placeholder="Enter text or website URL" value={value} maxLength={2048} onChange={e=>setValue(e.target.value)}/>{value.trim()&&<><div className="inline-block rounded-xl border bg-white p-4"><QRCode id="samahit-qr-svg" value={value} size={200}/></div><button className={button} disabled={busy} onClick={()=>void run(downloadQr)}>Download QR as PNG</button></>}<p className="text-xs">QR is generated and exported locally on this device.</p></>}
 {tool==="date"&&<><label className="block text-sm">Start date<input type="date" className={input} value={date} onChange={e=>setDate(e.target.value)}/></label><label className="block text-sm">End date<input type="date" className={input} value={days} onChange={e=>setDays(e.target.value)}/></label>{date&&days&&<p className="rounded-xl bg-emerald-50 p-4 font-bold">{Math.round((Date.parse(days+"T12:00:00Z")-Date.parse(date+"T12:00:00Z"))/86400000)} days</p>}</>}
 {tool==="image"&&<><UploadPicker accept="image/png,image/jpeg,image/webp" fileName={file?.name||""} label="Select an image" hint="Choose JPG, PNG or WebP from your device." onChange={files=>setFile(files[0]||null)}/><label className="block">Maximum width (px)<input className={input} type="number" min="100" max="4000" value={width} onChange={e=>setWidth(Math.min(4000,Math.max(100,Number(e.target.value)||100)))}/></label><label className="block">JPEG quality: {Math.round(quality*100)}%<input className="w-full" type="range" min=".3" max="1" step=".05" value={quality} onChange={e=>setQuality(Number(e.target.value))}/></label><button className={button} disabled={!file||busy} onClick={()=>void run(processImage)}>Resize & Download JPG</button></>}
 {tool==="image-pdf"&&<>
  <div className="space-y-3">
    <div className="rounded-2xl border-2 border-dashed border-[#8FB6A8] bg-[#F3FAF6] p-5 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#D8E9E1] text-[#245D45]">
        <FileImage className="h-6 w-6" />
      </div>
      <h2 className="text-base font-bold text-[#243B32]">Upload images to create a PDF</h2>
      <p className="mt-1 text-xs text-slate-500">Select up to 30 JPG, PNG or WebP images from your device.</p>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#245D45] px-5 py-3 text-sm font-bold text-white shadow-sm">
        <UploadCloud className="h-4 w-4" />
        {images.length ? "Add / Change Images" : "Select Images"}
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          onChange={e=>setImages(Array.from(e.target.files||[]).slice(0,30))}
        />
      </label>
      <p className="mt-3 text-xs font-semibold text-[#245D45]">{images.length} / 30 images selected</p>
    </div>
    {images.length>0&&<div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-[#243B32]">Selected images</span>
        <button type="button" className="text-xs font-semibold text-slate-500" onClick={()=>setImages([])}>Clear all</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.slice(0,8).map((img,i)=><div key={i} className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 aspect-square">
          <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
          {i===7&&images.length>8&&<div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">+{images.length-8}</div>}
        </div>)}
      </div>
    </div>}
    <button className={button+" w-full"} disabled={!images.length||busy} onClick={()=>void run(makePdf)}>
      {busy ? "Creating PDF…" : "Create PDF"}
    </button>
  </div>
</>}
 {tool==="pdf-merge"&&<><UploadPicker multiple accept="application/pdf,.pdf" count={pdfs.length} label="Select PDFs to merge" hint="Choose up to 15 PDF files." onChange={files=>setPdfs(files.slice(0,15))}/><p>{pdfs.length} PDF(s) selected in merge order; maximum 15</p><button className={button} disabled={pdfs.length<2||busy} onClick={()=>void run(merge)}>Merge & Download</button></>}
 {tool==="pdf-split"&&<><UploadPicker accept="application/pdf,.pdf" fileName={file?.name||""} label="Select a PDF to split" hint="Choose the PDF you want to split into pages." onChange={files=>setFile(files[0]||null)}/><p className="text-xs">Downloads individual pages. Up to 100 pages; allow multiple downloads if prompted.</p><button className={button} disabled={!file||busy} onClick={()=>void run(split)}>Split into pages</button></>}
 {tool==="pdf-compress"&&<><p className="text-sm">Lossless PDF structure optimization. Image-heavy scanned PDFs may not shrink.</p><UploadPicker accept="application/pdf,.pdf" fileName={file?.name||""} label="Select a PDF to compress" hint="Choose the PDF you want to optimize on this device." onChange={files=>setFile(files[0]||null)}/><button className={button} disabled={!file||busy} onClick={()=>void run(compress)}>Optimize & Download PDF</button></>}
 {tool==="reminders"&&<><p className="text-xs">Offline reminders appear when you open this page. Background alarms require native notification permissions and are not enabled.</p><input className={input} placeholder="Reminder" maxLength={150} value={reminderText} onChange={e=>setReminderText(e.target.value)}/><input className={input} type="datetime-local" value={reminderDate} onChange={e=>setReminderDate(e.target.value)}/><button className={button} onClick={()=>{if(!reminderText.trim()||!reminderDate||Date.parse(reminderDate)<=Date.now()){setError("Enter a reminder and a future time");return;}const next=[...reminders,{id:crypto.randomUUID(),text:reminderText.trim(),when:reminderDate}];if(store("samahit-reminders-v1",JSON.stringify(next))){setReminders(next);setReminderText("");setReminderDate("");setError("");}else setError("Unable to save reminder");}}>Save Reminder</button>{[...reminders].sort((a,b)=>a.when.localeCompare(b.when)).map(item=><div key={item.id} className="flex items-center gap-2 rounded-xl border p-3"><span className="flex-1"><b>{item.text}</b><br/><small>{new Date(item.when).toLocaleString()} {Date.parse(item.when)<=Date.now()?"• Due":""}</small></span><button onClick={()=>{const next=reminders.filter(x=>x.id!==item.id);if(store("samahit-reminders-v1",JSON.stringify(next)))setReminders(next);else setError("Unable to save reminder");}}>Remove</button></div>)}</>}
 {tool==="converter"&&<><input type="number" className={input} value={unitAmount} onChange={e=>setUnitAmount(e.target.value)}/><div className="grid grid-cols-2 gap-2">{[unitFrom,unitTo].map((v,i)=><select key={i} className={input} value={v} onChange={e=>i?setUnitTo(e.target.value):setUnitFrom(e.target.value)}>{[["km","Kilometres"],["mi","Miles"],["m","Metres"],["ft","Feet"],["kg","Kilograms"],["lb","Pounds"],["cm","Centimetres"],["in","Inches"]].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select>)}</div><p className="rounded-xl bg-emerald-50 p-4 font-bold">{(()=>{const factors:Record<string,number>={km:1000,mi:1609.344,m:1,ft:0.3048,kg:1,lb:0.45359237,cm:0.01,in:0.0254};const family=(x:string)=>x==="kg"||x==="lb"?"mass":"length";if(family(unitFrom)!==family(unitTo))return "Select compatible units";const n=Number(unitAmount);return Number.isFinite(n)?(n*factors[unitFrom]/factors[unitTo]).toLocaleString(undefined,{maximumFractionDigits:6})+" "+unitTo:"Enter a valid number";})()}</p></>}
 {busy&&<p role="status">Processing locally…</p>}{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
 <p className="text-xs text-slate-500">Files are processed on this device; no file upload to Samahit servers. Password-protected or damaged PDFs may not be supported.</p>
 </div></Shell>;
}
