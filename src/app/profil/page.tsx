"use client";

import { useState, useEffect, useMemo } from "react";
import { useArticles } from "@/context/ArticleContext";
import EntityPhoto from "@/components/common/EntityPhoto";
import { CustomProfileSection } from "@/lib/types";

/** Kerangka kartu katalog selama data server dimuat — mencegah kedipan data contoh/mock. */
function CatalogSkeleton({ variant, count = 3 }: { variant: "masyayikh" | "sarana"; count?: number }) {
  const placeholders = Array.from({ length: count });

  if (variant === "sarana") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {placeholders.map((_, index) => (
          <div key={index} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-pulse">
            <div className="w-full h-36 rounded-xl bg-slate-200" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-full bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {placeholders.map((_, index) => (
        <div key={index} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-slate-200" />
          <div className="h-4 w-2/3 bg-slate-200 rounded" />
          <div className="h-3 w-1/2 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function ProfilPage() {
  const { settings, lecturers, facilities, accreditations, pageTexts, isCatalogReady, navbarSettings } = useArticles();
  const [activeTab, setActiveTab] = useState<string>("sejarah");

  const safeLecturers = Array.isArray(lecturers) ? lecturers : [];
  const safeFacilities = Array.isArray(facilities) ? facilities : [];
  const safeAccreditations = Array.isArray(accreditations) ? accreditations : [];
  const safeMisi = Array.isArray(settings?.misi) ? settings.misi : [];

  // Extract profil dropdown sub-menus from navbar settings
  const profilNavLink = (navbarSettings?.navLinks || []).find(
    (l: any) => l.url === "/profil" || l.id === "nav-2" || l.label?.toLowerCase() === "profil"
  );
  const profilChildren = profilNavLink?.children || [];

  // Identify custom sub-menus (excluding core 6 anchors)
  const customSections = useMemo(() => {
    const list: {
      slug: string;
      label: string;
      section?: CustomProfileSection;
    }[] = [];

    // 1. From live navbar dropdown (e.g. Program Lembaga -> /profil#progran)
    profilChildren.forEach((child: any) => {
      const url = (child.url || "").toLowerCase();
      const isStd = url.includes("#sejarah") ||
        url.includes("#visi") ||
        url.includes("#masyayikh") ||
        url.includes("#dosen") ||
        url.includes("#struktur") ||
        url.includes("#sarana") ||
        url.includes("#akreditasi");
      if (!isStd) {
        const slug = (child.url || "").replace(/^.*#/, "").toLowerCase().trim() || child.id;
        const matched = (settings?.customProfileSections || []).find(
          (s) => s.slug?.toLowerCase() === slug.toLowerCase() || s.id === child.id
        );
        if (!list.some((item) => item.slug === slug)) {
          list.push({
            slug,
            label: child.label,
            section: matched
          });
        }
      }
    });

    // 2. From settings.customProfileSections (if added directly)
    (settings?.customProfileSections || []).forEach((sec) => {
      if (!list.some((item) => item.slug.toLowerCase() === sec.slug?.toLowerCase())) {
        list.push({
          slug: sec.slug,
          label: sec.title,
          section: sec
        });
      }
    });

    return list;
  }, [profilChildren, settings?.customProfileSections]);

  // Listen to URL hash to activate matching tab (e.g., #masyayikh, #sejarah, #progran, #program)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        const rawHash = window.location.hash.replace("#", "").toLowerCase().trim();
        if (!rawHash) return;
        if (rawHash === "masyayikh" || rawHash === "dosen") {
          setActiveTab("masyayikh");
        } else if (rawHash === "sejarah") {
          setActiveTab("sejarah");
        } else if (rawHash === "visi-misi" || rawHash === "visi") {
          setActiveTab("visi-misi");
        } else if (rawHash === "struktur") {
          setActiveTab("struktur");
        } else if (rawHash === "sarana") {
          setActiveTab("sarana");
        } else if (rawHash === "akreditasi") {
          setActiveTab("akreditasi");
        } else {
          // Check if it matches a custom slug directly or aliases (e.g. progran / program)
          const matched = customSections.find(
            (cs) => cs.slug === rawHash ||
              (rawHash === "program" && cs.slug === "progran") ||
              (rawHash === "progran" && cs.slug === "program")
          );
          if (matched) {
            setActiveTab(matched.slug);
          } else {
            setActiveTab(rawHash);
          }
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [customSections]);

  return (
    <main className="pt-32 md:pt-36 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            {pageTexts?.profilBadge || "Identitas & Sejarah Lembaga"}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            {pageTexts?.profilTitle || "Profil Ma'had Aly DDI Mangkoso"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            {pageTexts?.profilDesc ||
              "Pusat Pendidikan Tinggi Kader Ulama Takhassus Fiqh wa Usuluhu Berfokus pada Fiqh Mu'asarah."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Tab Selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 bg-white p-3 rounded-2xl shadow-sm">
          {[
            { id: "sejarah", label: "Sejarah Lembaga" },
            { id: "visi-misi", label: "Visi & Misi" },
            { id: "masyayikh", label: `Masyayikh & Dosen (${safeLecturers.filter((l) => l.isActive).length})` },
            { id: "struktur", label: "Struktur Organisasi" },
            { id: "sarana", label: `Sarana & Prasarana (${safeFacilities.length})` },
            { id: "akreditasi", label: `Sertifikat Akreditasi (${safeAccreditations.length})` },
            ...customSections.map((cs) => ({
              id: cs.slug,
              label: cs.label
            }))
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (typeof window !== "undefined") {
                  window.history.replaceState(null, "", `#${tab.id}`);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow-md"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SEJARAH */}
        {activeTab === "sejarah" && (
          <div id="sejarah" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950">
                {pageTexts?.profilSejarahTitle || "Sejarah Pendirian Ma'had Aly DDI Mangkoso"}
              </h2>
            </div>

            {/* Tarikh pendirian ditampilkan permanen agar tidak hilang saat uraian sejarah diisi. */}
            {settings?.establishedDate && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                  Tarikh Pendirian
                </span>
                <span className="text-xs sm:text-sm font-semibold text-amber-950">
                  {settings.establishedDate}
                </span>
              </div>
            )}

            {settings?.historyArabic && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-right font-serif text-lg text-emerald-900 leading-loose" dir="rtl">
                {settings.historyArabic}
              </div>
            )}
            
            <div className="text-slate-700 space-y-4 text-sm sm:text-base leading-relaxed">
              {settings?.historyContent ? (
                <div className="space-y-4 whitespace-pre-line leading-relaxed">
                  {settings.historyContent}
                </div>
              ) : (
                <>
                  <p>
                    Ma&apos;had Aly DDI Mangkoso didirikan di Kompleks Kampus Pondok Pesantren DDI Mangkoso, Kabupaten Barru, Sulawesi Selatan{settings?.establishedDate ? ` (${settings.establishedDate})` : ""}.
                  </p>
                  <p>
                    Gagasan luhur ini diinisiasi oleh {settings?.mudirName || "AGH. Prof. Dr. M. Faried Wadjedy, MA"} bersama dewan masyaikh dan pimpinan Pondok Pesantren DDI Mangkoso. Kelahiran lembaga ini didorong oleh keprihatinan yang mendalam atas semakin langkanya ulama fukaha (mutafaqqih fiddin) yang menguasai khazanah turats klasik secara mendalam sekaligus memiliki kelenturan nalar dalam menjawab problematika umat di era modern (Fiqh Mu&apos;asarah).
                  </p>
                  <p>
                    Melanjutkan wasiat perjuangan pendiri utama Darud Da&apos;wah wal Irsyad (DDI), <strong>AGH. Abdurrahman Ambo Dalle</strong>, Ma&apos;had Aly DDI Mangkoso berkomitmen penuh mencetak kader-kader mujtahid kontemporer melalui masa pengkaderan intensif 4 tahun dengan beasiswa penuh 100% via program Orang Tua Asuh.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: VISI & MISI */}
        {activeTab === "visi-misi" && (
          <div id="visi-misi" className="space-y-6">
            <div className="bg-emerald-900 text-white rounded-2xl p-8 border border-emerald-800 shadow-md">
              <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold">
                {pageTexts?.profilVisiTitle || "Visi Kelembagaan"}
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-white mt-2 leading-relaxed">
                &ldquo;{settings?.visi || "Mencetak Ulama Pewaris Para Nabi yang Menguasai Sanad Turats dan Fiqh Kontemporer."}&rdquo;
              </h3>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-xl text-emerald-950">Misi Utama Lembaga</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {safeMisi.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-mahad-gold text-mahad-green-dark font-bold flex items-center justify-center shrink-0 text-xs">
                      {idx + 1}
                    </span>
                    <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MASYAYIKH / DEWAN DOSEN */}
        {activeTab === "masyayikh" && (
          <div id="masyayikh" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
              <h2 className="font-serif font-bold text-2xl text-emerald-950">
                {pageTexts?.profilMasyaikhTitle || "Masyayikh & Dewan Dosen Pengampu"}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {pageTexts?.profilMasyaikhDesc || "Pendidik & Ulama Otoritatif Turats & Fiqh Mu'asarah"}
              </span>
            </div>

            {!isCatalogReady ? (
              <CatalogSkeleton variant="masyayikh" count={3} />
            ) : safeLecturers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border text-sm">
                Belum ada data masyayikh yang aktif. Admin dapat menambahkannya via Panel Admin.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeLecturers
                  .filter((l) => l.isActive)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((m) => {
                    const toList = (value: unknown): string[] => {
                      const raw = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
                      return raw
                        .flatMap((entry) => String(entry).split(/\s*[•·|]\s*/))
                        .map((entry) => entry.trim())
                        .filter(Boolean);
                    };

                    const educations = toList(m.education);
                    const publications = toList(m.publications);
                    const expertiseItems = (m.expertise || "")
                      .split(/\s*[,;•·|]\s*/)
                      .map((entry) => entry.trim())
                      .filter(Boolean)
                      .slice(0, 6);

                    return (
                      <article
                        key={m.id}
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:p-6"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-mahad-gold bg-emerald-100 text-xl font-bold text-emerald-800">
                            <EntityPhoto
                              src={m.photoUrl}
                              alt={m.name}
                              name={m.name}
                              width={64}
                              height={64}
                              fallbackEmoji="👳"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif text-lg font-bold leading-snug text-slate-900">
                              {m.name}
                            </h4>
                            {m.title && (
                              <p className="mt-1 text-[13px] font-semibold leading-snug text-emerald-800">
                                {m.title}
                              </p>
                            )}
                            {m.role && m.role !== m.title && (
                              <p className="mt-0.5 text-xs leading-snug text-slate-500">{m.role}</p>
                            )}
                          </div>
                        </div>

                        {expertiseItems.length > 0 && (
                          <ul className="flex flex-wrap gap-1.5">
                            {expertiseItems.map((item, index) => (
                              <li
                                key={`${item}-${index}`}
                                className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}

                        {(educations.length > 0 || publications.length > 0) && (
                          <dl className="space-y-3 border-t border-slate-100 pt-4 text-[13px] leading-relaxed">
                            {educations.length > 0 && (
                              <div>
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Riwayat Pendidikan
                                </dt>
                                <dd className="mt-1.5 space-y-1 text-slate-700">
                                  {educations.map((item, index) => (
                                    <p key={`edu-${index}`} className="flex gap-2">
                                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                                      <span className="min-w-0">{item}</span>
                                    </p>
                                  ))}
                                </dd>
                              </div>
                            )}

                            {publications.length > 0 && (
                              <div>
                                <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                  Karya &amp; Publikasi
                                </dt>
                                <dd className="mt-1.5 space-y-1 text-slate-700">
                                  {publications.map((item, index) => (
                                    <p key={`pub-${index}`} className="flex gap-2">
                                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-mahad-gold" />
                                      <span className="min-w-0">{item}</span>
                                    </p>
                                  ))}
                                </dd>
                              </div>
                            )}
                          </dl>
                        )}
                      </article>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STRUKTUR ORGANISASI */}
        {activeTab === "struktur" && (
          <div id="struktur" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
                <h2 className="font-serif font-bold text-2xl text-emerald-950">
                  Struktur Organisasi &amp; Kepengurusan Ma&apos;had Aly
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Pimpinan &amp; Pengelola Sivitas Akademika
              </span>
            </div>

            {(() => {
              const members = (settings?.organizationStructure && settings.organizationStructure.length > 0)
                ? settings.organizationStructure
                : [
                    {
                      id: "org-1",
                      role: "Mudir Ma'had Aly",
                      name: settings?.mudirName || "AGH. Prof. Dr. M. Faried Wadjedy, MA",
                      description: "Pimpinan Tertinggi & Pengasuh Halaqah Turats",
                      category: "Pimpinan",
                      order: 1
                    },
                    {
                      id: "org-2",
                      role: "Wakil Mudir I (Bidang Akademik & Kurikulum)",
                      name: "Ust. M. Idrus, M.Ag.",
                      description: "Pengarah Kurikulum Turats 8 Semester & Mutaba'ah Ta'lim",
                      category: "Wakil Mudir",
                      order: 2
                    },
                    {
                      id: "org-3",
                      role: "Wakil Mudir II (Keuangan & Beasiswa OTA)",
                      name: "Biro Administrasi & Orang Tua Asuh",
                      description: "Pengelolaan Operasional, Infaq Lembaga & Beasiswa Mahasantri",
                      category: "Wakil Mudir",
                      order: 3
                    },
                    {
                      id: "org-4",
                      role: "Lembaga Bahtsul Masail (LBM)",
                      name: "Dewan Masyaikh & Peneliti Muda Fiqh Mu'asarah",
                      description: "Pengkajian Masail Fiqhiyyah Kontemporer & Perumusan Fatwa",
                      category: "Lembaga & Unit",
                      order: 4
                    },
                    {
                      id: "org-5",
                      role: "LP2M (Pusat Riset & Pengabdian)",
                      name: "Redaksi Jurnal & Mimbar Kajian Ilmiah",
                      description: "Pengembangan Riset Turats, Publikasi Ilmiah & Pengabdian Santri",
                      category: "Lembaga & Unit",
                      order: 5
                    }
                  ];

              const leader = members.find((m) => m.category === "Pimpinan" || m.role.toLowerCase().includes("mudir") || m.order === 1) || members[0];
              const otherMembers = members.filter((m) => m.id !== leader?.id);

              return (
                <div className="space-y-6">
                  {/* Pimpinan Utama */}
                  {leader && (
                    <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-slate-50 rounded-2xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                      {leader.photoUrl && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-emerald-600 shadow-md shrink-0">
                          <img src={leader.photoUrl} alt={leader.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="text-center sm:text-left flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-3 py-1 rounded-full border border-emerald-300">
                          {leader.role}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-2">
                          {leader.name}
                        </h3>
                        {leader.description && (
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                            {leader.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Jajaran Struktur Lainnya */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherMembers.map((m) => (
                      <div
                        key={m.id}
                        className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition space-y-2.5 flex items-start gap-4"
                      >
                        {m.photoUrl && (
                          <div className="w-14 h-14 rounded-full overflow-hidden border border-emerald-200 shadow shrink-0 mt-0.5">
                            <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {m.category && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              {m.category}
                            </span>
                          )}
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{m.role}</h4>
                          <p className="text-emerald-900 font-semibold text-xs mt-0.5">{m.name}</p>
                          {m.description && (
                            <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{m.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bagan Visual (Jika Ada) */}
                  {settings?.organizationChartUrl && (
                    <div className="mt-8 p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                        Bagan &amp; Struktur Hirarki Kepemimpinan
                      </span>
                      <img
                        src={settings.organizationChartUrl}
                        alt="Bagan Struktur Organisasi Ma'had Aly DDI Mangkoso"
                        className="max-h-[550px] w-auto mx-auto rounded-xl border shadow-sm object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 5: SARANA & PRASARANA */}
        {activeTab === "sarana" && (
          <div id="sarana" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">
              {pageTexts?.profilSaranaTitle || "Sarana & Prasarana Pembelajaran"}
            </h2>
            {!isCatalogReady ? (
              <CatalogSkeleton variant="sarana" count={3} />
            ) : safeFacilities.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border text-sm">
                Belum ada data sarana &amp; prasarana. Admin dapat menambahkannya via Panel Admin.
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm">
              {safeFacilities.map((fac) => (
                <div key={fac.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-200 relative">
                    <EntityPhoto
                      src={fac.photoUrl}
                      alt={fac.name}
                      name={fac.name}
                      width={400}
                      height={200}
                      fallbackEmoji="🏛️"
                      fallbackClassName="w-full h-full flex items-center justify-center text-3xl"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {fac.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base mt-1">{fac.name}</h4>
                    <p className="text-slate-600 mt-1 text-xs leading-relaxed">{fac.description}</p>
                    {fac.capacity && (
                      <p className="text-[11px] text-emerald-800 font-semibold mt-1">Kapasitas: {fac.capacity}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* TAB 6: AKREDITASI */}
        {activeTab === "akreditasi" && (
          <div id="akreditasi" className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-emerald-950">
              {pageTexts?.profilAkreditasiTitle || "Status & Sertifikat Akreditasi"}
            </h2>
            <div className="space-y-4">
              {safeAccreditations.map((acc) => (
                <div key={acc.id} className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-800 bg-emerald-200 px-3 py-1 rounded-full">
                      {acc.status}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{acc.validDate}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-emerald-950">{acc.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-700">Penerbit: <strong>{acc.issuer}</strong></p>
                  {acc.pdfUrl && (
                    <a
                      href={acc.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      <span>📄 Unduh / Lihat Sertifikat Resmi PDF</span>
                      {acc.fileSize && <span>({acc.fileSize})</span>}
                      <span>&rarr;</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB KUSTOM DINAMIS (Misal: Program Lembaga / #progran / #program) */}
        {(() => {
          const currentCustom = customSections.find((cs) => cs.slug === activeTab);
          if (!currentCustom) return null;

          return (
            <div id={currentCustom.slug} className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    Program &amp; Layanan Kelembagaan
                  </span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-emerald-950 mt-1">
                    {currentCustom.section?.title || currentCustom.label}
                  </h2>
                </div>
              </div>

              {currentCustom.section?.subtitle && (
                <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed border-l-4 border-emerald-700/40 pl-4 py-1 italic bg-emerald-50/50 rounded-r-xl">
                  {currentCustom.section.subtitle}
                </p>
              )}

              {currentCustom.section?.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center">
                  <img
                    src={currentCustom.section.imageUrl}
                    alt={currentCustom.section.title || currentCustom.label}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                </div>
              )}

              {currentCustom.section?.content ? (
                <div className="text-slate-700 leading-relaxed space-y-4 text-sm sm:text-base whitespace-pre-line">
                  {currentCustom.section.content}
                </div>
              ) : !currentCustom.section?.items || currentCustom.section.items.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border text-sm">
                  <p className="font-semibold text-slate-700">Konten Program Sedang Disiapkan</p>
                  <p className="text-xs text-slate-500 mt-1">Uraian rincian program lembaga ini dapat dilengkapi melalui Panel Admin.</p>
                </div>
              ) : null}

              {currentCustom.section?.items && currentCustom.section.items.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                    <span>📋</span>
                    <span>Rincian Program &amp; Agenda</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {currentCustom.section.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-3 hover:bg-emerald-50 transition"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Elemen Tambahan Kustom CMS Halaman Profil */}
        {(() => {
          const customProfilElements = (pageTexts?.customElements || []).filter(
            (el) => el.page === "profil"
          );
          if (customProfilElements.length === 0) return null;

          return (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
                <h2 className="font-serif font-bold text-2xl text-slate-900">
                  Informasi &amp; Layanan Kelembagaan Tambahan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customProfilElements.map((el) => (
                  <div
                    key={el.id}
                    className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      {el.icon && <span className="text-2xl">{el.icon}</span>}
                      {el.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                          {el.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">{el.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{el.desc}</p>
                    {el.link && (
                      <div className="pt-2">
                        <a
                          href={el.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          <span>Pelajari Selengkapnya</span>
                          <span>&rarr;</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    </main>
  );
}
