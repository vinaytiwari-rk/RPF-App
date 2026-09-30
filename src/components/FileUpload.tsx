import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Upload, X, Loader2, ImageOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { resolveMediaUrl, fileToDataUrl, API_BASE_ORIGIN } from "../utils/media";

interface FileUploadProps {
  label: string;
  onUploadSuccess: (url: string) => void;
  defaultUrl?: string;
  accept?: string;
}

export default function FileUpload({ label, onUploadSuccess, defaultUrl, accept = "image/*" }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const [imgError, setImgError] = useState(false);
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize when defaultUrl prop changes (e.g. user selects different item)
  useEffect(() => {
    setPreview(defaultUrl || null);
    setImgError(false);
  }, [defaultUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant local preview from client memory (0ms lag, cannot break)
    const localBlobUrl = URL.createObjectURL(file);
    setPreview(localBlobUrl);
    setImgError(false);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("file", file);

    const authToken = token || localStorage.getItem("@rpf_token");
    const headers = {
      "Content-Type": "multipart/form-data",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    };

    try {
      // 2. Upload to backend (handles relative or absolute URLs)
      let uploadedUrl = "";
      try {
        const res = await axios.post("/api/admin/upload", formData, { headers });
        if (res.data?.url) {
          uploadedUrl = res.data.url;
        }
      } catch {
        // Fallback to /api/upload/image if admin upload endpoint is different
        const res2 = await axios.post("/api/upload/image", formData, { headers });
        if (res2.data?.url) {
          uploadedUrl = res2.data.url;
        }
      }

      if (uploadedUrl) {
        const resolved = resolveMediaUrl(uploadedUrl);
        setPreview(resolved);
        onUploadSuccess(resolved);
      } else {
        throw new Error("No URL returned from upload server");
      }
    } catch (err) {
      console.warn("Server upload failed, converting to optimized inline data URL fallback:", err);
      try {
        // 3. Fail-safe client compression: Image still works 100% even if server rejects file or has network issue
        const fallbackDataUrl = await fileToDataUrl(file);
        setPreview(fallbackDataUrl);
        onUploadSuccess(fallbackDataUrl);
      } catch (dataErr) {
        console.error("Client fallback error:", dataErr);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setImgError(false);
    onUploadSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resolvedSrc = resolveMediaUrl(preview);

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 block">{label}</label>

      {preview ? (
        <div className="relative inline-block border-2 border-dashed border-emerald-200 rounded-xl p-2 bg-emerald-50/50 max-w-full">
          {!imgError ? (
            <img
              src={resolvedSrc}
              alt="Preview"
              className="h-32 w-auto max-w-full object-cover rounded-lg shadow-2xs"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="h-32 w-48 flex flex-col items-center justify-center bg-slate-100 rounded-lg text-slate-400 p-2 text-center">
              <ImageOff className="w-6 h-6 mb-1 text-slate-400" />
              <span className="text-[10px] font-bold">Image preview unavailable</span>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-xl flex items-center justify-center text-white text-xs font-bold gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              <span>Optimizing...</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 hover:border-[#FF9933] transition cursor-pointer text-slate-500"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#FF9933]" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400" />
          )}
          <span className="text-xs font-bold">{isUploading ? "Uploading..." : "Click to select image from device"}</span>
          <span className="text-[10px] text-slate-400 font-medium">Supports JPG, PNG, WEBP from phone or desktop</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
    </div>
  );
}
