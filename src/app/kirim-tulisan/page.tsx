"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useArticles } from "@/context/ArticleContext";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Info,
  Clock,
  ArrowRight,
  Search,
  Key,
  BookOpen,
  Edit3,
  X
} from "lucide-react";

export default function KirimTulisanPage() {
  const { categories, settings, pageTexts } = useArticles();

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    hp: "",
    afiliasi: "",
    tipeNaskah: "Artikel Ilmiah (Fiqh Mu'asarah)",
    kategori: categories[0]?.name || "Fiqh Mu'asarah",
    judul: "",
    abstrak: "",
    keyword: "",
    originalitas: false,
    // Field Khusus Skripsi
    nim: "",
    angkatan: "",
    year: new Date().getFullYear().toString(),
    advisor1: "",
    advisor2: "",
    driveUrl: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deteksi URL query parameter ?type=skripsi atau ?type=opini
  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("type");
      if (t === "skripsi") {
        setFormData((prev) => ({
          ...prev,
          tipeNaskah: "Skripsi / Risalah Kelulusan (Alumni & Mahasantri)"
        }));
      } else if (t === "opini") {
        setFormData((prev) => ({
          ...prev,
          tipeNaskah: "Opini & Refleksi Santri"
        }));
      }
    }
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [trackingCodeResult, setTrackingCodeResult] = useState<string | null>(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<{
    adminEmailSent?: boolean;
    adminEmailError?: string | null;
    authorEmailSent?: boolean;
    authorEmailError?: string | null;
  }>({});
  const [copied, setCopied] = useState(false);

  // Filter kategori berdasarkan tipe naskah
  const isOpiniType = formData.tipeNaskah.includes("Opini");
  const isSkripsiType = formData.tipeNaskah.includes("Skripsi");
  const availableCategories = categories.filter((c) => {
    if (isOpiniType) {
      return c.type === "opini";
    }
    return c.type !== "opini";
  });

  // Helper untuk menghitung jumlah kata & karakter
  const abstractCharCount = formData.abstrak.length;
  const abstractWordCount = formData.abstrak.trim() ? formData.abstrak.trim().split(/\s+/).length : 0;

  const handleFileSelection = (file: File) => {
    setFileError(null);
    const fileName = file.name.toLowerCase();

    // Validasi ekstensi Word (.doc / .docx) atau PDF (.pdf)
    const isDoc = fileName.endsWith(".doc") || fileName.endsWith(".docx");
    const isPdf = fileName.endsWith(".pdf");
    if (!isDoc && !isPdf) {
      setFileError("Format berkas tidak didukung! Naskah/skripsi wajib berekstensi Microsoft Word (.doc, .docx) atau dokumen PDF (.pdf).");
      setSelectedFile(null);
      return;
    }

    // Validasi ukuran maks 10 MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError(`Ukuran berkas (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal 10 MB!`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleCopyCode = () => {
    if (!trackingCodeResult) return;
    navigator.clipboard.writeText(trackingCodeResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // 1. Validasi Kolom Wajib
    if (!formData.nama.trim()) {
      setStatus("error");
      setErrorMessage("Nama lengkap penulis wajib diisi.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatus("error");
      setErrorMessage("Format alamat email tidak valid. Masukkan email aktif Anda.");
      return;
    }

    if (!formData.judul.trim()) {
      setStatus("error");
      setErrorMessage("Judul naskah wajib diisi.");
      return;
    }
    if (formData.judul.length > 200) {
      setStatus("error");
      setErrorMessage(`Judul naskah maksimal 200 karakter (saat ini ${formData.judul.length} karakter).`);
      return;
    }

    if (abstractCharCount < 200) {
      setStatus("error");
      setErrorMessage(`Abstrak naskah minimal 200 karakter (sekitar 200-300 kata). Saat ini baru ${abstractCharCount} karakter.`);
      return;
    }
    if (abstractCharCount > 2000) {
      setStatus("error");
      setErrorMessage(`Abstrak naskah maksimal 2000 karakter. Saat ini ${abstractCharCount} karakter.`);
      return;
    }

    // Keyword: 3 - 5 kata dipisah koma
    const kwList = formData.keyword.split(",").map((k) => k.trim()).filter(Boolean);
    if (kwList.length < 3 || kwList.length > 5) {
      setStatus("error");
      setErrorMessage(`Kata kunci harus berjumlah 3 hingga 5 kata/frasa dipisahkan koma. Saat ini: ${kwList.length}.`);
      return;
    }

    if (!selectedFile) {
      setStatus("error");
      setErrorMessage(
        isSkripsiType
          ? "Berkas naskah risalah skripsi (.pdf, .doc, atau .docx) wajib diunggah."
          : "Berkas naskah (.doc, .docx, atau .pdf) wajib diunggah."
      );
      return;
    }

    if (!formData.originalitas) {
      setStatus("error");
      setErrorMessage("Anda wajib mencentang surat pernyataan integritas & orisinalitas naskah.");
      return;
    }

    try {
      setStatus("submitting");

      const formPayload = new FormData();
      formPayload.append("nama", formData.nama.trim());
      formPayload.append("email", formData.email.trim());
      formPayload.append("hp", formData.hp.trim());
      formPayload.append("afiliasi", formData.afiliasi.trim());
      formPayload.append("tipeNaskah", formData.tipeNaskah);
      formPayload.append("kategori", formData.kategori);
      formPayload.append("judul", formData.judul.trim());
      formPayload.append("abstrak", formData.abstrak.trim());
      formPayload.append("keyword", kwList.join(", "));
      formPayload.append("originalitas", "true");
      if (formData.nim) formPayload.append("nim", formData.nim.trim());
      if (formData.angkatan) formPayload.append("angkatan", formData.angkatan.trim());
      if (formData.year) formPayload.append("year", formData.year.trim());
      if (formData.advisor1) formPayload.append("advisor1", formData.advisor1.trim());
      if (formData.advisor2) formPayload.append("advisor2", formData.advisor2.trim());
      if (formData.driveUrl) formPayload.append("driveUrl", formData.driveUrl.trim());
      formPayload.append("file", selectedFile);

      const res = await fetch("/api/submission/submit", {
        method: "POST",
        body: formPayload,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengirimkan naskah ke dewan redaksi.");
      }

      setTrackingCodeResult(data.trackingCode);
      setEmailDeliveryStatus({
        adminEmailSent: data.adminEmailSent,
        adminEmailError: data.adminEmailError,
        authorEmailSent: data.authorEmailSent,
        authorEmailError: data.authorEmailError
      });
      setStatus("success");

    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Terjadi kendala saat memproses naskah.");
    }
  };

  const resetForm = () => {
    const defaultCats = categories.filter((c) => c.type !== "opini");
    setFormData({
      nama: "",
      email: "",
      hp: "",
      afiliasi: "",
      tipeNaskah: "Artikel Ilmiah",
      kategori: defaultCats[0]?.name || "Fiqh Mu'asarah",
      judul: "",
      abstrak: "",
      keyword: "",
      originalitas: false,
      nim: "",
      angkatan: "",
      year: "",
      advisor1: "",
      advisor2: "",
      driveUrl: ""
    });
    setSelectedFile(null);
    setTrackingCodeResult(null);
    setEmailDeliveryStatus({});
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <main className="pt-28 pb-20 bg-slate-50 min-h-screen">
      {/* Header Halaman */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-mahad-gold-light hover:text-mahad-gold mb-1"
          >
            <span>&larr;</span>
            <span>Kembali ke Beranda</span>
          </Link>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
            {pageTexts?.kirimTitle || "Kirim Naskah Kajian Ilmiah"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            {pageTexts?.kirimDesc ||
              "Salurkan karya ilmiah, risalah fatwa, opini fikih, atau kajian Fiqh Mu'asarah Anda langsung ke Dewan Redaksi Ma'had Aly DDI Mangkoso."}
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-800 px-3.5 py-1.5 rounded-full text-xs text-mahad-gold font-mono">
            <span>📧 Berkas langsung terlampir ke email admin</span>
            <span>&bull;</span>
            <Link href="/submission/track" className="underline hover:text-white">Lacak Naskah Anda &rarr;</Link>
          </div>
        </div>
      </section>

      {/* SECTION B2: TUTORIAL CARA SUBMIT & KETENTUAN PENGIRIMAN NASKAH */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        <div className="space-y-6">
          {/* Judul & Intro Alur */}
          <div className="text-center space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-mahad-green-dark bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-full font-bold">
              Pedoman &amp; Prosedur Redaksi
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900">
              {pageTexts?.kirimPanduanTitle || "Tutorial Alur Pengiriman & Ketentuan Naskah"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
              {pageTexts?.kirimPanduanDesc ||
                "Ma'had Aly DDI Mangkoso menerapkan sistem penerbitan 2-Tahap terstruktur guna memastikan mutu ilmiah, orisinalitas riset, dan ketepatan metodologi Fiqh Mu'asarah."}
            </p>
          </div>

          {/* 4 Step Visual Workflow Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-mahad-green-dark text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    Tahap 1 (Publik)
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900">Kirim Abstrak &amp; Naskah Word</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Isi data diri, pilih kategori, tulis abstrak (200-300 kata), dan lampirkan naskah format Word (.doc/.docx maks 10 MB) di formulir bawah ini.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-medium">
                Dapatkan: <strong>Kode Tracking (MAD-YYYY-XXXX)</strong>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    Penelaahan
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900">Telaah Dewan Redaksi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dewan Masyayikh &amp; Redaksi menelaah kelayakan topik, kebaruan isu, dan konsistensi istinbath hukum. Pantau status naskah kapan saja.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/submission/track"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>🔍 Lacak Naskah Anda</span>
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-mahad-gold text-emerald-950 font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase">
                    Tahap 2 (ACC)
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900">Input Full Paper</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika abstrak disetujui (ACC), Anda menerima <strong>Kode Akses (MAD2-YYYY-XXXX)</strong> via email untuk mengisi naskah lengkap bab demi bab.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <Link
                  href="/submission/full-paper"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-mahad-gold hover:bg-amber-500 text-emerald-950 text-xs font-bold rounded-xl transition shadow-xs"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>🔑 Masuk Full Paper</span>
                </Link>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-full bg-emerald-900 text-white font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                    Publikasi
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900">Penerbitan Resmi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Naskah yang disetujui diterbitkan resmi di portal Mimbar Kajian atau Opini Santri dengan tata letak ilmiah standar keilmuan DDI &amp; tradisi pesantren.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-1.5">
                <Link
                  href="/artikel"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold rounded-xl transition shadow-xs text-center"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>📖 Mimbar Fiqh</span>
                </Link>
                <Link
                  href="/opini"
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-2 bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold rounded-xl transition shadow-xs text-center"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>✍️ Opini Santri</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Ketentuan Ringkas Box */}
          <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-7 shadow-md">
            <h3 className="font-serif font-bold text-lg text-mahad-gold flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5" />
              <span>Ketentuan Pokok Pengiriman Naskah:</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-emerald-100 leading-relaxed">
              <div className="space-y-2">
                <p>
                  <strong>1. Format &amp; Ukuran:</strong> Berkas naskah wajib berformat Microsoft Word (.doc atau .docx) dengan batas ukuran maksimal 10 MB.
                </p>
                <p>
                  <strong>2. Orisinalitas:</strong> Naskah merupakan karya asli penulis, bebas plagiarisme, dan belum pernah diterbitkan di media cetak/online atau jurnal lain.
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>3. Metodologi Kajian:</strong> Untuk Artikel Ilmiah, argumen fikih mengacu pada rujukan muktabar turats dan kaidah ushuliyyah yang mu&apos;tamad.
                </p>
                <p>
                  <strong>4. Batasan Pengiriman:</strong> Demi menjaga kualitas telaah, sistem membatasi maksimal 3 pengajuan naskah per alamat email dalam 24 jam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          
          {/* TAMPILAN SUKSES DENGAN KODE TRACKING */}
          {status === "success" && trackingCodeResult ? (
            <div className="text-center py-8 space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center text-3xl shadow-sm">
                ✓
              </div>
              <div className="space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                  emailDeliveryStatus.adminEmailSent
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-amber-700 bg-amber-50 border-amber-200"
                }`}>
                  {emailDeliveryStatus.adminEmailSent ? "Naskah & Email Berhasil Terkirim" : "Naskah Tersimpan di Database"}
                </span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-slate-900 mt-2">
                  Alhamdulillah, Naskah Diterima Sistem!
                </h2>
                <div className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto space-y-2">
                  {emailDeliveryStatus.adminEmailSent ? (
                    <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      ✅ Berkas dokumen Word naskah Anda telah berhasil dikirimkan ke email Dewan Redaksi Ma&apos;had Aly DDI Mangkoso.
                    </p>
                  ) : (
                    <div className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 text-left text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <span>⚠️ Status Notifikasi Email:</span>
                      </p>
                      <p className="text-[11px] text-amber-900 font-mono">
                        {emailDeliveryStatus.adminEmailError || "RESEND_API_KEY belum dikonfigurasi di server."}
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Naskah Anda tetap aman tersimpan di database dan dapat ditinjau langsung oleh Dewan Redaksi melalui Panel Admin.
                      </p>
                    </div>
                  )}
                  {emailDeliveryStatus.authorEmailError && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200 text-left">
                      ℹ️ Info email ke penulis: {emailDeliveryStatus.authorEmailError}
                    </p>
                  )}
                </div>
              </div>

              {/* Kotak Kode Tracking */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-3">
                <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                  KODE PELACAKAN RESMI NASKAH ANDA:
                </span>
                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-300 shadow-inner">
                  <span className="font-mono font-bold text-xl sm:text-2xl text-emerald-900 tracking-wider">
                    {trackingCodeResult}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition text-xs font-bold flex items-center gap-1"
                    title="Salin Kode"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-emerald-700" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  Simpan kode ini untuk memantau tahapan telaah, catatan revisi, dan keputusan penerbitan naskah Anda.
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/submission/track?kode=${trackingCodeResult}`}
                  className="w-full sm:w-auto px-6 py-3 bg-mahad-green-dark hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
                >
                  <span>Pantau Status di Halaman Tracking</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm"
                >
                  Kirim Naskah Lainnya
                </button>
              </div>
            </div>
          ) : (
            /* FORMULIR PENGIRIMAN */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Petunjuk Singkat */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 flex items-start gap-3">
                <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Ketentuan Pengiriman Naskah:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-emerald-900">
                    <li>Format berkas <strong>HANYA Microsoft Word (.doc atau .docx)</strong> dengan ukuran maksimal <strong>10 MB</strong>.</li>
                    <li>File tidak disimpan di cloud storage publik, melainkan dikirim langsung sebagai lampiran email aman ke dewan redaksi.</li>
                    <li>Abstrak berkisar 200–300 kata (minimal 200 karakter) dan kata kunci berjumlah 3–5 frasa.</li>
                  </ul>
                </div>
              </div>

              {/* Data Diri Penulis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nama Lengkap Penulis <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: Ahmad Yusuf Mubarak, S.Ag."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Alamat Email Aktif <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@email.com"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    No. Handphone / WhatsApp (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.hp}
                    onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                    placeholder="081234567890"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Afiliasi / Institusi / Asal Pesantren
                  </label>
                  <input
                    type="text"
                    value={formData.afiliasi}
                    onChange={(e) => setFormData({ ...formData, afiliasi: e.target.value })}
                    placeholder="Contoh: Mahasantri Ma'had Aly DDI Mangkoso"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Klasifikasi Naskah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tipe Naskah <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.tipeNaskah}
                    onChange={(e) => {
                      const nextTipe = e.target.value;
                      const isOpini = nextTipe === "Opini & Refleksi";
                      const nextCats = categories.filter((c) =>
                        isOpini ? c.type === "opini" : c.type !== "opini"
                      );
                      setFormData({
                        ...formData,
                        tipeNaskah: nextTipe,
                        kategori: nextCats[0]?.name || (isOpini ? "Opini Santri" : "Fiqh Mu'asarah")
                      });
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="Artikel Ilmiah (Fiqh Mu'asarah)">📄 Artikel Ilmiah (Fiqh Mu&apos;asarah)</option>
                    <option value="Opini & Refleksi Santri">✍️ Opini &amp; Refleksi Santri</option>
                    <option value="Skripsi / Risalah Kelulusan (Alumni & Mahasantri)">🎓 Skripsi / Risalah Kelulusan (Alumni &amp; Mahasantri)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {formData.tipeNaskah.includes("Skripsi")
                      ? "Khusus alumni & mahasantri tingkat akhir untuk diterbitkan ke Repositori Skripsi Ma'had Aly."
                      : formData.tipeNaskah.includes("Opini")
                      ? "Esai populer, refleksi santri, pemikiran kemasyarakatan."
                      : "Kajian hukum Islam kontemporer, Fiqh Mu'asarah, turats, atau ushul fikih."}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {formData.tipeNaskah === "Opini & Refleksi" ? "Kategori Opini & Refleksi" : "Kategori Kajian Fikih"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    {availableCategories.length > 0 ? (
                      availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    ) : (
                      <option value={formData.tipeNaskah === "Opini/Refleksi" ? "Opini Santri" : "Fiqh Mu'asarah"}>
                        {formData.tipeNaskah === "Opini/Refleksi" ? "Opini Santri" : "Fiqh Mu'asarah"}
                      </option>
                    )}
                  </select>
                  <p className="text-[10px] text-emerald-700 mt-1 font-medium">
                    {formData.tipeNaskah === "Opini/Refleksi"
                      ? "✓ Kategori dinamis khusus naskah opini & refleksi"
                      : "✓ Kategori kajian ilmiah & fikih kontemporer"}
                  </p>
                </div>
              </div>

              {/* Form Khusus Skripsi Alumni / Mahasantri */}
              {isSkripsiType && (
                <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎓</span>
                    <h4 className="text-xs font-bold uppercase text-amber-950 tracking-wider">
                      Informasi Akademik Risalah Skripsi Mahasantri
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        NIM (Nomor Induk Mahasantri) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={isSkripsiType}
                        value={formData.nim}
                        onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                        placeholder="Contoh: 2020.01.042"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Angkatan Mahasantri
                      </label>
                      <input
                        type="text"
                        value={formData.angkatan}
                        onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
                        placeholder="Contoh: Angkatan IV (Takhassus)"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Tahun Kelulusan Munaqasyah
                      </label>
                      <input
                        type="text"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        placeholder="Contoh: 2024"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Dosen Pembimbing I
                      </label>
                      <input
                        type="text"
                        value={formData.advisor1}
                        onChange={(e) => setFormData({ ...formData, advisor1: e.target.value })}
                        placeholder="Nama Pembimbing 1"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Dosen Pembimbing II
                      </label>
                      <input
                        type="text"
                        value={formData.advisor2}
                        onChange={(e) => setFormData({ ...formData, advisor2: e.target.value })}
                        placeholder="Nama Pembimbing 2"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Link Google Drive Naskah Lengkap PDF (Opsional)
                    </label>
                    <input
                      type="url"
                      value={formData.driveUrl}
                      onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/... (Pastikan akses diset 'Siapa saja yang memiliki link')"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Sertakan link Google Drive jika ukuran file PDF Anda melebihi kapasitas lampiran langsung.
                    </p>
                  </div>
                </div>
              )}

              {/* Judul Naskah */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Judul Naskah Riset / Artikel <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${formData.judul.length > 200 ? "text-rose-600 font-bold" : "text-slate-400"}`}>
                    {formData.judul.length}/200
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Rekonstruksi Nalar Ushul Fikih dalam Transaksi Cryptocurrency Menurut Mazhab Syafi'i"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {/* Abstrak */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Abstrak Naskah (200–300 Kata) <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono ${
                    abstractCharCount < 200 ? "text-amber-600 font-semibold" : abstractCharCount > 2000 ? "text-rose-600 font-bold" : "text-emerald-700 font-semibold"
                  }`}>
                    {abstractCharCount} karakter • {abstractWordCount} kata (Min. 200)
                  </span>
                </div>
                <textarea
                  required
                  rows={6}
                  value={formData.abstrak}
                  onChange={(e) => setFormData({ ...formData, abstrak: e.target.value })}
                  placeholder="Uraikan latar belakang masalah, metodologi istinbath hukum, dalil turats rujukan, dan kesimpulan fatwa naskah secara komprehensif..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {/* Keyword */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Kata Kunci / Keyword (3–5 kata, dipisah koma) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="Contoh: Fiqh Mu'asarah, Cryptocurrency, Maqashid Syariah, Mazhab Syafi'i"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                />
              </div>

              {/* Berkas Naskah (.doc / .docx, Maks 10 MB) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lampirkan Berkas Naskah (Word .doc / .docx saja) <span className="text-rose-500">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelection(f);
                  }}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileSelection(f);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                      isDragging
                        ? "border-emerald-600 bg-emerald-50/70"
                        : "border-slate-300 bg-slate-50 hover:border-emerald-600 hover:bg-emerald-50/30"
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Klik di sini atau geser (drag &amp; drop) berkas Word naskah Anda
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Hanya format .doc / .docx &bull; Ukuran maksimal 10 MB
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
                        DOC
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950 truncate max-w-xs sm:max-w-md">
                          {selectedFile.name}
                        </p>
                        <span className="text-[11px] text-emerald-700">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Siap dilampirkan ke email redaksi
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Hapus berkas"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </p>
                )}
              </div>

              {/* Checkbox Integritas & Originalitas */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.originalitas}
                    onChange={(e) => setFormData({ ...formData, originalitas: e.target.checked })}
                    className="mt-1 rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    Saya menyatakan dengan sungguh-sungguh bahwa naskah ini adalah karya asli (orisinal), belum pernah dipublikasikan di media atau jurnal lain, serta bebas dari segala bentuk plagiarisme ilmiah. <span className="text-rose-500">*</span>
                  </span>
                </label>
              </div>

              {/* Pesan Error */}
              {status === "error" && errorMessage && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tombol Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full py-3.5 bg-mahad-green-dark hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {status === "submitting" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Mengirim Naskah ke Email Redaksi...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Naskah ke Dewan Redaksi</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </main>
  );
}