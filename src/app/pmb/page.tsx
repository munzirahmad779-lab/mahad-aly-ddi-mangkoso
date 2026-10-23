"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useArticles } from "@/context/ArticleContext";
import { 
  GraduationCap, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Award, 
  Download, 
  ExternalLink, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  QrCode,
  MapPin,
  MessageCircle,
  FileCheck
} from "lucide-react";

export default function PmbPage() {
  const { pmbSettings, pmbWaves, pmbFAQs } = useArticles();

  const [activeWaveId, setActiveWaveId] = useState<string>(pmbWaves?.[0]?.id || "");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const selectedWave = pmbWaves?.find((w) => w.id === activeWaveId) || pmbWaves?.[0];

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const pmb = pmbSettings;

  return (
    <main className="pt-32 md:pt-36 pb-20 bg-slate-50 min-h-screen">
      {/* Hero Section Brosur PMB */}
      <section className="bg-mahad-green-dark text-white py-16 bg-islamic-pattern relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-mahad-gold/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{pmb.academicYear || "Penerimaan Mahasantri Baru"}</span>
            </span>
            {pmb.accreditationBadge && (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/40">
                ⭐ {pmb.accreditationBadge}
              </span>
            )}
          </div>

          {pmb.headerArabicText && (
            <div className="font-serif text-lg sm:text-2xl text-mahad-gold/90 mb-2 tracking-wide font-medium">
              {pmb.headerArabicText}
            </div>
          )}

          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-1 leading-tight">
            {pmb.title || "Brosur Pendaftaran Imtihan Qabul"}
          </h1>
          
          <p className="text-mahad-gold font-serif font-medium text-lg sm:text-xl mt-2">
            {pmb.subtitle || "Ma'had Aly Pontren DDI Mangkoso"} &bull; Takhassus {pmb.programTakhassus || "Fiqh dan Ushul Fiqh"}
          </p>

          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-3 leading-relaxed">
            {pmb.heroDescription || "Membina kader ulama mutafaqqih fiddin berwawasan wasathiyyah dan berakhlak mulia dengan sanad keilmuan muttashil."}
          </p>

          {/* Badges Kuota & Periode */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            {pmb.scholarshipBadge && (
              <div className="bg-amber-400/20 text-amber-200 border border-amber-400/40 px-3.5 py-1.5 rounded-xl font-bold">
                🎁 {pmb.scholarshipBadge}
              </div>
            )}
            {pmb.quotaTotal && (
              <div className="bg-emerald-800/80 text-emerald-100 border border-emerald-600/50 px-3.5 py-1.5 rounded-xl font-medium">
                👥 Kuota: <strong>{pmb.quotaTotal}</strong>
              </div>
            )}
            {pmb.registrationPeriod && (
              <div className="bg-white/10 text-emerald-100 border border-white/20 px-3.5 py-1.5 rounded-xl font-medium">
                🗓️ Periode: <strong>{pmb.registrationPeriod}</strong>
              </div>
            )}
          </div>

          {/* Tombol Aksi Utama */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {pmb.registrationLink ? (
              <a
                href={pmb.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-mahad-gold text-mahad-green-dark hover:bg-yellow-400 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Daftar Online Sekarang</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : selectedWave?.registrationLink ? (
              <a
                href={selectedWave.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-mahad-gold text-mahad-green-dark hover:bg-yellow-400 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Daftar Online Sekarang</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <Link
                href="/kontak"
                className="px-6 py-3 bg-mahad-gold text-mahad-green-dark hover:bg-yellow-400 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>Hubungi Panitia Seleksi</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}

            {pmb.brochurePdfUrl && (
              <a
                href={pmb.brochurePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Brosur Lengkap (PDF)</span>
              </a>
            )}

            {pmb.brochureImageUrl && !pmb.brochurePdfUrl && (
              <a
                href={pmb.brochureImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Lihat Desain Brosur PMB</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Info Rincian Kuota & Beasiswa */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
              🎓
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Jalur Beasiswa Penuh</h4>
              <p className="text-[11px] text-slate-500">{pmb.quotaScholarship || "25 Mahasantri Penerima Beasiswa"}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl shrink-0">
              👥
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Jalur Mandiri</h4>
              <p className="text-[11px] text-slate-500">{pmb.quotaMandiri || "5 Mahasantri Jalur Mandiri"}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xl shrink-0">
              📜
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{pmb.cardStudyProgramTitle || "Jenjang Marhalah Ula (M.1)"}</h4>
              <p className="text-[11px] text-slate-500">{pmb.cardStudyProgramSubtitle || "Ijazah Terakreditasi Mumtaz & Sanad Kitab"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Persyaratan & Materi Imtihan Qabul (Dari Brosur Resmi) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Kolom Kiri: Persyaratan Pendaftaran */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">
                  Persyaratan Pendaftaran Imtihan Qabul
                </h3>
                <p className="text-xs text-slate-500">
                  Kualifikasi calon mahasantri baru Ma&apos;had Aly DDI Mangkoso
                </p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {(pmb.requirements || []).map((req, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom Kanan: Materi Imtihan Qabul & Brosur / QR Code */}
          <div className="lg:col-span-5 space-y-6">
            {/* Materi Imtihan Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <BookOpen className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Materi Imtihan Qabul
                  </h3>
                  <p className="text-xs text-slate-500">Materi seleksi masuk mahasantri baru</p>
                </div>
              </div>

              <div className="space-y-3">
                {(pmb.examSubjects || []).map((subject, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-mahad-gold/20 text-amber-900 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">
                      {subject}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code / Brosur Image Card */}
            {(pmb.qrCodeUrl || pmb.brochureImageUrl) && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center">
                <h4 className="font-serif font-bold text-sm text-slate-900 flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-800" />
                  <span>Scan QR Pendaftaran / Brosur PMB</span>
                </h4>
                
                {pmb.qrCodeUrl && (
                  <div className="w-40 h-40 mx-auto bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center justify-center">
                    <img
                      src={pmb.qrCodeUrl}
                      alt="QR Code Pendaftaran PMB"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {pmb.brochureImageUrl && !pmb.qrCodeUrl && (
                  <div className="max-h-56 overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={pmb.brochureImageUrl}
                      alt="Brosur PMB"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {pmb.registrationLink && (
                  <p className="text-[11px] text-slate-500">
                    Atau akses langsung via tautan:{" "}
                    <a
                      href={pmb.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-800 font-bold underline"
                    >
                      {pmb.registrationLink}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Jadwal Tahapan Seleksi (Schedules) */}
        {pmb.schedules && pmb.schedules.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Jadwal &amp; Agenda Seleksi
              </span>
              <h3 className="font-serif font-bold text-2xl text-slate-900 mt-2">
                Tahapan Imtihan Qabul &amp; Pengumuman
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ikuti seluruh tahapan seleksi sesuai tanggal dan waktu yang telah ditentukan oleh panitia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pmb.schedules.map((sch, idx) => (
                <div
                  key={sch.id || idx}
                  className="p-5 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Tahap {idx + 1}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      {sch.stageName}
                    </h4>
                    <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{sch.date}</span>
                    </p>
                    {sch.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                        {sch.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gelombang Pendaftaran & Rincian (Jika Ada Banyak Gelombang) */}
        {pmbWaves && pmbWaves.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="font-serif font-bold text-2xl text-slate-900">
                  Pilihan Gelombang Pendaftaran
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih jalur seleksi yang sesuai dengan kualifikasi Anda
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {pmbWaves.map((wave) => (
                <button
                  key={wave.id}
                  type="button"
                  onClick={() => setActiveWaveId(wave.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                    (selectedWave?.id === wave.id)
                      ? "bg-emerald-800 text-white shadow-md"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>{wave.name}</span>
                </button>
              ))}
            </div>

            {/* Rincian Gelombang Terpilih */}
            {selectedWave && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      Jalur Aktif
                    </span>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-2">
                      {selectedWave.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Periode: <strong>{selectedWave.startDate}</strong> s/d <strong>{selectedWave.endDate}</strong></span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Kuota Penerimaan:</span>
                      <span className="text-base font-bold text-emerald-950">{selectedWave.quota}</span>
                    </div>
                  </div>
                </div>

                {selectedWave.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-100">
                    <img
                      src={selectedWave.imageUrl}
                      alt={selectedWave.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Skema Pembiayaan:</span>
                  </span>
                  <p className="text-xs sm:text-sm text-amber-950 font-medium">
                    {selectedWave.scholarshipInfo}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                      <span>Persyaratan Pendaftaran</span>
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedWave.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-800" />
                      <span>Tahapan &amp; Alur Seleksi</span>
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedWave.procedure.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kontak Panitia & Sekretariat PMB */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Narahubung Resmi
              </span>
              <h3 className="font-serif font-bold text-2xl text-slate-900 mt-2">
                Kontak Panitia &amp; Sekretariat Seleksi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Hubungi panitia jika membutuhkan bimbingan teknis pendaftaran online atau konfirmasi berkas.
              </p>
            </div>
            {pmb.address && (
              <div className="text-xs text-slate-500 max-w-xs flex items-start gap-2">
                <MapPin className="w-4 h-4 text-mahad-gold shrink-0 mt-0.5" />
                <span>{pmb.address}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(pmb.contacts || []).map((contact) => {
              const cleanPhone = contact.phone.replace(/[^0-9]/g, "");
              const waUrl = `https://wa.me/${cleanPhone}`;

              return (
                <div
                  key={contact.id}
                  className="p-5 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between gap-4 hover:border-emerald-300 transition"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {contact.role || "Panitia PMB"}
                    </span>
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      {contact.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-mono">
                      {contact.phone}
                    </p>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              );
            })}
          </div>

          {pmb.notes && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              <strong>Catatan Panitia:</strong> {pmb.notes}
            </div>
          )}
        </div>

        {/* Elemen / Bagian Tambahan Brosur PMB (Dinamis Tiap Tahun) */}
        {pmb.customSections && pmb.customSections.filter((s) => s.isActive).length > 0 && (
          <div className="space-y-6">
            {pmb.customSections
              .filter((s) => s.isActive)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((sec) => (
                <div key={sec.id} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{sec.icon || "📌"}</span>
                      <div>
                        <h3 className="font-serif font-bold text-xl text-slate-900">{sec.title}</h3>
                        {sec.subtitle && <p className="text-xs text-slate-500 mt-0.5">{sec.subtitle}</p>}
                      </div>
                    </div>
                    {sec.badge && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  {sec.content && (
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </div>
                  )}
                  {sec.items && sec.items.length > 0 && (
                    <ul className="space-y-2.5 pt-1">
                      {sec.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            ✓
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Galeri Dokumentasi Brosur & Kegiatan Mahasantri */}
        {pmb.documentationImages && pmb.documentationImages.length > 0 && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-lg">📸</span>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Dokumentasi &amp; Kegiatan Ma&apos;had Aly</h3>
                <p className="text-xs text-slate-500">Galeri foto kegiatan mahasantri dan seleksi imtihan qabul</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {pmb.documentationImages.map((img) => (
                <div key={img.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-sm">
                  <img src={img.url} alt={img.caption || "Dokumentasi PMB"} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1.5 text-center truncate">
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tanya Jawab Sering Ditanyakan (FAQ PMB) */}
        {pmbFAQs && pmbFAQs.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                FAQ PMB
              </span>
              <h2 className="font-serif font-bold text-2xl text-slate-900 mt-2">
                Pertanyaan Seputar Pendaftaran
              </h2>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {pmbFAQs.map((faq) => {
                const isOpen = openFaqId === faq.id;

                return (
                  <div
                    key={faq.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-800 shrink-0" />
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 bg-slate-50/40 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Kotak Bantuan Panitia */}
        <div className="p-8 bg-emerald-950 text-white rounded-3xl text-center space-y-4">
          <PhoneCall className="w-8 h-8 text-mahad-gold mx-auto" />
          <h3 className="font-serif font-bold text-xl text-white">
            Butuh Panduan Pendaftaran Lebih Lanjut?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-200 max-w-md mx-auto">
            Sekretariat PMB Ma&apos;had Aly DDI Mangkoso siap melayani konsultasi pendaftaran, verifikasi berkas, dan info ujian seleksi.
          </p>
          <div className="pt-2">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-mahad-gold text-mahad-green-dark font-bold text-xs rounded-xl shadow-md hover:bg-yellow-400 transition"
            >
              <span>Hubungi Kontak Sekretariat &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
