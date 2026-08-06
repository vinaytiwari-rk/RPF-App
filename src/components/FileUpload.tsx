import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface FileUploadProps {
  label: string;
  onUploadSuccess: (url: string) => void;
  defaultUrl?: string;
}

export default function FileUpload({ label, onUploadSuccess, defaultUrl }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultUrl || null);
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("/api/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setPreview(res.data.url);
        onUploadSuccess(res.data.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-700 block">{label}</label>
      
      {preview ? (
        <div className="relative inline-block border-2 border-dashed border-emerald-200 rounded-xl p-2 bg-emerald-50/50">
          <img src={preview} alt="Preview" className="h-32 w-auto object-cover rounded-lg" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onUploadSuccess("");
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition"
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
          <span className="text-xs font-bold">{isUploading ? "Uploading..." : "Click to select image"}</span>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
