"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface EntityPhotoProps {
  /** URL foto (idealnya sudah CDN lh3.googleusercontent.com) */
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  /** Kelas untuk elemen <img> / <Image> */
  className?: string;
  /** Kelas untuk wadah pengganti saat foto gagal dimuat */
  fallbackClassName?: string;
  /** Nama orang/fasilitas — dipakai untuk inisial fallback */
  name?: string;
  /** Emoji cadangan bila inisial tidak bisa dibentuk */
  fallbackEmoji?: string;
}

/**
 * Foto entitas dengan fallback otomatis.
 *
 * Bila link Google Drive privat/rusak, `lh3.googleusercontent.com` akan gagal
 * dimuat. Komponen ini menangkap kegagalan tersebut (onError) lalu menampilkan
 * inisial nama dalam bingkai rapi — bukan ikon gambar rusak.
 */
export default function EntityPhoto({
  src,
  alt,
  width,
  height,
  className = "w-full h-full object-cover",
  fallbackClassName = "w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-800 font-bold",
  name,
  fallbackEmoji = "🖼️"
}: EntityPhotoProps) {
  const [broken, setBroken] = useState(false);

  const initials = useMemo(() => {
    const source = (name || alt || "").trim();
    if (!source) return "";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [name, alt]);

  const normalizedSrc = typeof src === "string" ? src.trim() : "";

  if (!normalizedSrc || broken) {
    return (
      <div className={fallbackClassName} aria-label={alt}>
        <span className="text-lg">{initials || fallbackEmoji}</span>
      </div>
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
