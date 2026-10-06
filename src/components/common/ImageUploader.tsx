"use client";

import React, { useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Loader2,
  Copy,
  Check
} from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: "logo" | "masyayikh" | "sarana" | "artikel" | "berita" | "galeri" | "skripsi-cover" | "umum" | string;
  label?: string;
  helperText?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  showManualUrl?: boolean;
}

export default function ImageUploader({
  value,
  onChange,
  folder = "umum",
  label = "Upload Gambar / Berkas",
  helperText,
  accept = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif",
  maxSizeMB = 5,
  className = "",
  showManualUrl = true,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const processUpload = async (file: File) => {
    setErrorMessage(null);

    // 1. Validasi Ukuran
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`Ukuran file melebihi batas maksimal ${maxSizeMB} MB.`);
      return;
    }

    // 2. Validasi Tipe
    const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const isAccepted = acceptedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(`${baseType}/`);
      }
      return file.type.toLowerCase() === type;
    });

    if (!isAccepted && accept !== "*") {
      setErrorMessage(`Format file "${file.type || "tidak dikenal"}" tidak didukung.`);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(20);

      // Generate Clean Filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const cleanBase = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase()
        .slice(0, 30);
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const fileName = `${cleanBase}-${uniqueSuffix}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      setUploadProgress(50);

      // Upload ke Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      setUploadProgress(80);

      // Ambil Public URL
      const { data: publicUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Catat ke tabel public.media (Media Library)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("media").insert({
          filename: file.name,
          url: publicUrl,
          mime_type: file.type || `image/${fileExt}`,
          size_kb: Math.round(file.size / 1024),
          uploaded_by: user?.email || "admin",
        });
      } catch (dbErr) {
        // Non-fatal if media table record insertion fails
        console.warn("Gagal mencatat media ke database log:", dbErr);
      }

      setUploadProgress(100);
      onChange(publicUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Gagal mengupload file ke Supabase Storage.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header / Mode Switcher */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
            {label}
          </label>
        )}
        {showManualUrl && (
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === "upload"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mode === "url"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Input URL
            </button>
          </div>
        )}
      </div>

      {/* Mode Input URL Manual */}
      {mode === "url" ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://domain.com/path/gambar.jpg"
              className="w-full text-xs pl-8 pr-8 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
            <LinkIcon className="w-4 h-4 text-stone-400 absolute left-2.5 top-3" />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-rose-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Mode Upload File */
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {!value && !isUploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-stone-200 hover:border-emerald-400 hover:bg-stone-50/60"
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-stone-800">
                Klik untuk upload atau drag & drop file
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                PNG, JPG, WebP, SVG (Maks. {maxSizeMB} MB) • Folder: /{folder}
              </p>
            </div>
          )}

          {/* Uploading State with Progress Bar */}
          {isUploading && (
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  Mengunggah ke Supabase Storage...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Image Preview & Details Card */}
      {value && (
        <div className="relative flex items-center gap-3 p-2.5 bg-stone-50 border border-stone-200 rounded-xl group">
          {/* Thumbnail Preview */}
          <div className="w-14 h-14 rounded-lg bg-stone-200 border border-stone-300 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] bg-white/90 text-stone-800 px-1.5 py-0.5 rounded shadow"
              >
                Lihat
              </a>
            </div>
          </div>

          {/* Info & URL */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>File Tersimpan</span>
            </div>
            <p className="text-xs text-stone-600 font-mono truncate mt-0.5">
              {value}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              title="Salin URL"
              className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-emerald-600 hover:border-emerald-300 transition-all text-xs"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ganti File"
              className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-300 text-[11px] font-medium transition-all"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              title="Hapus"
              className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-300 transition-all text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-stone-400 italic">{helperText}</p>
      )}
    </div>
  );
}
