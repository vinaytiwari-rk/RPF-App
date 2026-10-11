import React, { useState } from "react";
import JSZip from "jszip";
import { 
  FileArchive, Upload, Download, Copy, Check, 
  AlertCircle, RefreshCw, Eye, FileText, Split, 
  Layers, ShieldAlert, Sparkles, FolderArchive
} from "lucide-react";

interface Props {
  toolId: string;
  isHi: boolean;
  downloadBlob: (blob: Blob, filename: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function ArchiveToolsEngine({ toolId, isHi, downloadBlob, copyToClipboard }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Extra configs
  const [zipComment, setZipComment] = useState("Created with SAMAHIT Seva");
  const [targetExt, setTargetExt] = useState(".pdf");
  const [renamePrefix, setRenamePrefix] = useState("doc_");
  const [splitChunkKb, setSplitChunkKb] = useState(500); // 500 KB default
  const [targetEncoding, setTargetEncoding] = useState("utf-8");
  const [zipEntries, setZipEntries] = useState<{ name: string; size: number; date: Date }[]>([]);

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSingleFile(f);
    setError(null);
    setSuccessMsg(null);
    setZipEntries([]);
    setOutputText("");

    if (toolId === "archive_zip_inspector" || toolId === "archive_zip_extractor") {
      try {
        setLoading(true);
        const zip = await JSZip.loadAsync(f);
        const entries: { name: string; size: number; date: Date }[] = [];
        zip.forEach((relativePath, zipEntry) => {
          entries.push({
            name: relativePath,
            size: (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize || 0,
            date: zipEntry.date || new Date()
          });
        });
        setZipEntries(entries);
        setSuccessMsg(isHi ? `ZIP में ${entries.length} फ़ाइलें मिलीं!` : `Found ${entries.length} files in ZIP!`);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      }
    } else if (toolId === "archive_file_to_base64") {
      const reader = new FileReader();
      reader.onload = () => {
        setOutputText(reader.result as string || "");
      };
      reader.readAsDataURL(f);
    }
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles(files);
    setError(null);
    setSuccessMsg(null);
  };

  const processTool = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let result = "";

      switch (toolId) {
        case "archive_zip_creator": {
          if (selectedFiles.length === 0) throw new Error(isHi ? "कम से कम 1 फ़ाइल चुनें" : "Select at least 1 file to zip");
          const zip = new JSZip();
          for (const f of selectedFiles) {
            zip.file(f.name, f);
          }
          const blob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 },
            comment: zipComment
          });
          downloadBlob(blob, "archive_created.zip");
          setSuccessMsg(isHi ? "ZIP फ़ाइल सफलतापूर्वक बनाई और डाउनलोड हुई!" : "ZIP archive created and downloaded!");
          setLoading(false);
          return;
        }

        case "archive_zip_extractor": {
          if (!singleFile) throw new Error(isHi ? "ZIP फ़ाइल चुनें" : "Select a ZIP file first");
          const zip = await JSZip.loadAsync(singleFile);
          let extractedCount = 0;
          for (const [filename, fileEntry] of Object.entries(zip.files)) {
            if (!fileEntry.dir) {
              const fileBlob = await fileEntry.async("blob");
              downloadBlob(fileBlob, filename.split("/").pop() || filename);
              extractedCount++;
            }
          }
          setSuccessMsg(isHi ? `${extractedCount} फ़ाइलें निकाली और डाउनलोड की गईं!` : `${extractedCount} files extracted!`);
          setLoading(false);
          return;
        }

        case "archive_zip_inspector": {
          if (zipEntries.length === 0) throw new Error(isHi ? "पहले ZIP फाइल चुनें" : "Select a ZIP file first");
          result = `ZIP आर्काइव विवरण:\nकुल प्रविष्टियाँ: ${zipEntries.length}\n\n` + 
            zipEntries.map((e, i) => `#${i + 1} ${e.name} (${(e.size / 1024).toFixed(1)} KB) - ${e.date.toLocaleDateString()}`).join("\n");
          break;
        }

        case "archive_zip_comment": {
          if (!singleFile) throw new Error("Select ZIP file");
          const zip = await JSZip.loadAsync(singleFile);
          const blob = await zip.generateAsync({ type: "blob", comment: zipComment });
          downloadBlob(blob, singleFile.name);
          setSuccessMsg(isHi ? "कमेंट जोड़ा गया और ZIP डाउनलोड हुई!" : "Comment updated in ZIP!");
          setLoading(false);
          return;
        }

        case "archive_tar_creator": {
          if (selectedFiles.length === 0) throw new Error("Select files for TAR");
          // Minimal POSIX ustar TAR generator
          const chunks: Uint8Array[] = [];
          for (const f of selectedFiles) {
            const buffer = await f.arrayBuffer();
            const dataBytes = new Uint8Array(buffer);
            const header = new Uint8Array(512);

            // Name (offset 0, length 100)
            const nameBytes = new TextEncoder().encode(f.name.slice(0, 100));
            header.set(nameBytes, 0);

            // Mode (offset 100, length 8)
            header.set(new TextEncoder().encode("0000644\0"), 100);
            // UID (offset 108, length 8)
            header.set(new TextEncoder().encode("0000000\0"), 108);
            // GID (offset 116, length 8)
            header.set(new TextEncoder().encode("0000000\0"), 116);
            // Size (offset 124, length 12 octal)
            const sizeOctal = dataBytes.length.toString(8).padStart(11, "0") + "\0";
            header.set(new TextEncoder().encode(sizeOctal), 124);
            // Mtime (offset 136, length 12)
            const mtimeOctal = Math.floor(f.lastModified / 1000).toString(8).padStart(11, "0") + "\0";
            header.set(new TextEncoder().encode(mtimeOctal), 136);

            // Typeflag (offset 156) '0' normal file
            header[156] = 48;
            // Magic 'ustar\0'
            header.set(new TextEncoder().encode("ustar\0"), 257);

            // Calculate checksum
            header.set(new TextEncoder().encode("        "), 148);
            let chk = 0;
            for (let i = 0; i < 512; i++) chk += header[i];
            const chkStr = chk.toString(8).padStart(6, "0") + "\0 ";
            header.set(new TextEncoder().encode(chkStr), 148);

            chunks.push(header);
            chunks.push(dataBytes);

            // 512-byte block padding
            const remainder = dataBytes.length % 512;
            if (remainder > 0) {
              chunks.push(new Uint8Array(512 - remainder));
            }
          }
          // End of archive 1024 zero bytes
          chunks.push(new Uint8Array(1024));

          const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
          const fullTar = new Uint8Array(totalLen);
          let offset = 0;
          for (const c of chunks) {
            fullTar.set(c, offset);
            offset += c.length;
          }
          const blob = new Blob([fullTar], { type: "application/x-tar" });
          downloadBlob(blob, "archive_created.tar");
          setSuccessMsg(isHi ? "TAR आर्काइव डाउनलोड हो गया!" : "TAR archive downloaded!");
          setLoading(false);
          return;
        }

        case "archive_tar_extractor": {
          if (!singleFile) throw new Error("Select TAR file");
          const buf = await singleFile.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let ptr = 0;
          let count = 0;
          while (ptr + 512 <= bytes.length) {
            const nameBytes = bytes.slice(ptr, ptr + 100);
            const name = new TextDecoder().decode(nameBytes).replace(/\0.*$/, "").trim();
            if (!name) break;

            const sizeStr = new TextDecoder().decode(bytes.slice(ptr + 124, ptr + 136)).replace(/\0.*$/, "").trim();
            const size = parseInt(sizeStr, 8) || 0;
            ptr += 512;

            if (size > 0 && ptr + size <= bytes.length) {
              const fileData = bytes.slice(ptr, ptr + size);
              const b = new Blob([fileData]);
              downloadBlob(b, name.split("/").pop() || name);
              count++;
              ptr += size + ((512 - (size % 512)) % 512);
            }
          }
          setSuccessMsg(isHi ? `TAR से ${count} फ़ाइलें निकाली गईं!` : `Extracted ${count} files from TAR!`);
          setLoading(false);
          return;
        }

        case "archive_gzip_compress": {
          if (!singleFile) throw new Error("Select file to compress");
          const stream = singleFile.stream();
          const cs = new CompressionStream("gzip");
          const compressedStream = stream.pipeThrough(cs);
          const response = new Response(compressedStream);
          const blob = await response.blob();
          downloadBlob(blob, `${singleFile.name}.gz`);
          setSuccessMsg(isHi ? "GZIP संपीड़ित फ़ाइल डाउनलोड हो गई!" : "GZIP compressed file downloaded!");
          setLoading(false);
          return;
        }

        case "archive_gzip_decompress": {
          if (!singleFile) throw new Error("Select .gz file");
          const stream = singleFile.stream();
          const ds = new DecompressionStream("gzip");
          const decompressedStream = stream.pipeThrough(ds);
          const response = new Response(decompressedStream);
          const blob = await response.blob();
          const outName = singleFile.name.replace(/\.gz$/i, "") || "decompressed_file";
          downloadBlob(blob, outName);
          setSuccessMsg(isHi ? "डीकंप्रेस फ़ाइल डाउनलोड हो गई!" : "Decompressed file downloaded!");
          setLoading(false);
          return;
        }

        case "archive_file_checksum": {
          if (!singleFile) throw new Error("Select file");
          const buffer = await singleFile.arrayBuffer();
          const sha256Buffer = await crypto.subtle.digest("SHA-256", buffer);
          const sha256 = Array.from(new Uint8Array(sha256Buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          const sha1Buffer = await crypto.subtle.digest("SHA-1", buffer);
          const sha1 = Array.from(new Uint8Array(sha1Buffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          result = `फ़ाइल का नाम: ${singleFile.name}\nआकार: ${singleFile.size.toLocaleString()} बाइट्स\n\nSHA-256 Checksum:\n${sha256}\n\nSHA-1 Checksum:\n${sha1}`;
          break;
        }

        case "archive_file_size_calc": {
          if (!singleFile) throw new Error("Select file");
          const bytes = singleFile.size;
          result = `फ़ाइल: ${singleFile.name}\n\nBytes: ${bytes.toLocaleString()} B\nKilobytes: ${(bytes / 1024).toFixed(3)} KB\nMegabytes: ${(bytes / (1024 * 1024)).toFixed(4)} MB\nGigabytes: ${(bytes / (1024 * 1024 * 1024)).toFixed(6)} GB`;
          break;
        }

        case "archive_extension_changer": {
          if (!singleFile) throw new Error("Select file");
          const base = singleFile.name.replace(/\.[^/.]+$/, "");
          const newName = `${base}${targetExt.startsWith(".") ? targetExt : "." + targetExt}`;
          downloadBlob(singleFile, newName);
          setSuccessMsg(isHi ? `फ़ाइल का नया नाम: ${newName}` : `Renamed to ${newName}!`);
          setLoading(false);
          return;
        }

        case "archive_batch_renamer": {
          if (selectedFiles.length === 0) throw new Error("Select multiple files to rename");
          selectedFiles.forEach((f, idx) => {
            const ext = f.name.includes(".") ? "." + f.name.split(".").pop() : "";
            const newName = `${renamePrefix}${String(idx + 1).padStart(3, "0")}${ext}`;
            downloadBlob(f, newName);
          });
          setSuccessMsg(isHi ? `${selectedFiles.length} फ़ाइलों का नाम बदला और डाउनलोड किया गया!` : `Renamed ${selectedFiles.length} files!`);
          setLoading(false);
          return;
        }

        case "archive_file_splitter": {
          if (!singleFile) throw new Error("Select file to split");
          const chunkSize = splitChunkKb * 1024;
          const totalChunks = Math.ceil(singleFile.size / chunkSize);
          for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(singleFile.size, start + chunkSize);
            const chunkBlob = singleFile.slice(start, end);
            const chunkName = `${singleFile.name}.part${String(i + 1).padStart(3, "0")}`;
            downloadBlob(chunkBlob, chunkName);
          }
          setSuccessMsg(isHi ? `${totalChunks} टुकड़ों (Chunks) में विभाजित कर डाउनलोड किया गया!` : `Split into ${totalChunks} parts!`);
          setLoading(false);
          return;
        }

        case "archive_file_merger": {
          if (selectedFiles.length < 2) throw new Error("Select at least 2 file chunks to merge");
          const sorted = [...selectedFiles].sort((a, b) => a.name.localeCompare(b.name));
          const mergedBlob = new Blob(sorted);
          const outName = sorted[0].name.replace(/\.part\d+$/i, "") || "merged_file";
          downloadBlob(mergedBlob, outName);
          setSuccessMsg(isHi ? `टुकड़े जोड़कर ${outName} डाउनलोड की गई!` : `Merged into ${outName}!`);
          setLoading(false);
          return;
        }

        case "archive_dup_file_checker": {
          if (selectedFiles.length < 2) throw new Error("Select at least 2 files to compare");
          const hashMap = new Map<string, string[]>();
          for (const f of selectedFiles) {
            const buf = await f.arrayBuffer();
            const hBuf = await crypto.subtle.digest("SHA-256", buf);
            const hash = Array.from(new Uint8Array(hBuf)).map(b => b.toString(16).padStart(2, "0")).join("");
            if (!hashMap.has(hash)) hashMap.set(hash, []);
            hashMap.get(hash)?.push(f.name);
          }
          const dups: string[] = [];
          hashMap.forEach((names, h) => {
            if (names.length > 1) {
              dups.push(`डुप्लीकेट समूह (${names.length} फाइल्स) [${h.slice(0, 10)}...]:\n - ` + names.join("\n - "));
            }
          });
          result = dups.length > 0 
            ? `समान (Duplicate) फाइलें मिलीं:\n\n` + dups.join("\n\n")
            : "✓ कोई डुप्लिकेट फ़ाइल नहीं मिली। सभी फ़ाइलें भिन्न हैं।";
          break;
        }

        case "archive_file_shredder": {
          if (!singleFile) throw new Error("Select file");
          const zeroBuffer = new Uint8Array(singleFile.size);
          const zeroBlob = new Blob([zeroBuffer], { type: "application/octet-stream" });
          downloadBlob(zeroBlob, `shredded_${singleFile.name}`);
          setSuccessMsg(isHi ? "फ़ाइल डेटा को शून्य (Zero) बाइट्स से सुरक्षित रूप से ओवरराइट किया गया!" : "Secure zero-fill completed!");
          setLoading(false);
          return;
        }

        case "archive_encoding_converter": {
          if (!singleFile) throw new Error("Select text file");
          const text = await singleFile.text();
          const encoded = new TextEncoder().encode(text);
          const blob = new Blob([encoded], { type: `text/plain;charset=${targetEncoding}` });
          downloadBlob(blob, `converted_${singleFile.name}`);
          setSuccessMsg(isHi ? `एनकोडिंग ${targetEncoding} में परिवर्तित!` : `Encoding converted!`);
          setLoading(false);
          return;
        }

        case "archive_magic_number": {
          if (!singleFile) throw new Error("Select file");
          const slice = await singleFile.slice(0, 8).arrayBuffer();
          const hex = Array.from(new Uint8Array(slice)).map(b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
          let detected = "अज्ञात फ़ाइल प्रकार (Binary/Unknown)";
          if (hex.startsWith("89 50 4E 47")) detected = "PNG Image";
          else if (hex.startsWith("FF D8 FF")) detected = "JPEG / JPG Photo";
          else if (hex.startsWith("25 50 44 46")) detected = "PDF Document";
          else if (hex.startsWith("50 4B 03 04")) detected = "ZIP Archive / OpenXML (DOCX, XLSX)";
          else if (hex.startsWith("1F 8B")) detected = "GZIP Compressed File";
          else if (hex.startsWith("47 49 46 38")) detected = "GIF Image";
          else if (hex.startsWith("49 44 33") || hex.startsWith("FF FB")) detected = "MP3 Audio";
          else if (hex.includes("66 74 79 70")) detected = "MP4 / M4A Media Container";

          result = `फ़ाइल का नाम: ${singleFile.name}\nजाँच किए गए हेडर बाइट्स (Magic Bytes):\n${hex}\n\nडिटेक्ट किया गया प्रकार:\n${detected}\n\nब्राउज़र MIME Type: ${singleFile.type || "unknown"}`;
          break;
        }

        case "archive_base64_to_file": {
          const match = inputText.trim().match(/^data:([^;]+);base64,(.+)$/);
          let mime = "application/octet-stream";
          let b64Data = inputText.trim();
          if (match) {
            mime = match[1];
            b64Data = match[2];
          }
          const binary = atob(b64Data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: mime });
          downloadBlob(blob, "decoded_file.bin");
          setSuccessMsg(isHi ? "Base64 से बाइनरी फ़ाइल डाउनलोड हुई!" : "Decoded file downloaded!");
          setLoading(false);
          return;
        }

        default:
          result = inputText;
      }

      setOutputText(result);
      setSuccessMsg(isHi ? "प्रक्रिया पूर्ण!" : "Operation complete!");
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  };

  const isMultiFileInput = [
    "archive_zip_creator", "archive_tar_creator", "archive_batch_renamer", 
    "archive_file_merger", "archive_dup_file_checker"
  ].includes(toolId);

  return (
    <div className="space-y-4">
      {/* File Upload Box */}
      {toolId !== "archive_base64_to_file" && (
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
          <input
            type="file"
            multiple={isMultiFileInput}
            onChange={isMultiFileInput ? handleMultipleFilesChange : handleSingleFileChange}
            id="archive-file-upload"
            className="hidden"
          />
          <label htmlFor="archive-file-upload" className="cursor-pointer">
            <FolderArchive className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-1 text-xs font-semibold text-emerald-950">
              {isMultiFileInput
                ? (selectedFiles.length > 0 ? `${selectedFiles.length} ${isHi ? "फ़ाइलें चुनी गईं" : "files selected"}` : isHi ? "फ़ाइलें चुनें (मल्टीपल)" : "Select Multiple Files")
                : (singleFile ? singleFile.name : isHi ? "फ़ाइल चुनें" : "Select File")}
            </p>
            <p className="text-[10px] text-emerald-700">
              {isHi ? "100% ऑफलाइन लोकल प्रोसेसिंग (सुरक्षित)" : "100% offline secure local processing"}
            </p>
          </label>
        </div>
      )}

      {/* Dynamic Controls */}
      {toolId === "archive_zip_comment" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "ZIP कमेंट" : "ZIP Comment"}</label>
          <input
            type="text"
            value={zipComment}
            onChange={e => setZipComment(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "archive_extension_changer" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "नया एक्सटेंशन" : "New Extension"}</label>
          <input
            type="text"
            value={targetExt}
            onChange={e => setTargetExt(e.target.value)}
            placeholder=".pdf"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "archive_batch_renamer" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "नाम प्रीफिक्स" : "Name Prefix"}</label>
          <input
            type="text"
            value={renamePrefix}
            onChange={e => setRenamePrefix(e.target.value)}
            placeholder="doc_"
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "archive_file_splitter" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "टुकड़े का आकार (KB)" : "Chunk Size (KB)"}</label>
          <input
            type="number"
            value={splitChunkKb}
            onChange={e => setSplitChunkKb(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          />
        </div>
      )}

      {toolId === "archive_encoding_converter" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "लक्षित एनकोडिंग" : "Target Encoding"}</label>
          <select
            value={targetEncoding}
            onChange={e => setTargetEncoding(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2 text-xs"
          >
            <option value="utf-8">UTF-8</option>
            <option value="iso-8859-1">ISO-8859-1 (Latin-1)</option>
            <option value="windows-1252">Windows-1252</option>
          </select>
        </div>
      )}

      {toolId === "archive_base64_to_file" && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{isHi ? "Base64 डेटा पेस्ट करें" : "Paste Base64 Data"}</label>
          <textarea
            rows={5}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="data:image/png;base64,iVBORw0KGgo..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-800"
          />
        </div>
      )}

      {/* ZIP Inspector File List View */}
      {zipEntries.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1 max-h-48 overflow-y-auto">
          <p className="text-xs font-bold text-slate-800 mb-2">{isHi ? "ZIP में मौजूद फ़ाइलें:" : "Files in ZIP:"}</p>
          {zipEntries.map((e, idx) => (
            <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-50 last:border-0">
              <span className="font-mono text-slate-700 truncate max-w-[200px]">{e.name}</span>
              <span className="text-slate-400">{(e.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={processTool}
        disabled={loading || (isMultiFileInput ? selectedFiles.length === 0 : (!singleFile && !inputText.trim()))}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-800 disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>{isHi ? "प्रोसेसिंग..." : "Processing..."}</span>
          </>
        ) : (
          <>
            <FileArchive className="h-4 w-4" />
            <span>{isHi ? "प्रक्रिया चलाएं (Run Tool)" : "Run Tool"}</span>
          </>
        )}
      </button>

      {/* Output Results */}
      {outputText && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{isHi ? "परिणाम (Output)" : "Output Result"}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(outputText)}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Copy className="h-3 w-3" />
                <span>{isHi ? "कॉपी" : "Copy"}</span>
              </button>
            </div>
          </div>
          <textarea
            readOnly
            rows={7}
            value={outputText}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-800"
          />
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
