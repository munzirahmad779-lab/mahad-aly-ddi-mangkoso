"use client";

import { useArticles } from "@/context/ArticleContext";

export default function KontakPage() {
  const { settings, pageTexts } = useArticles();

  return (
    <main className="pt-32 md:pt-36 pb-20 bg-slate-50 min-h-screen">
      <section className="bg-mahad-green-dark text-white py-14 bg-islamic-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold bg-white/10 px-3.5 py-1 rounded-full">
            {pageTexts?.kontakBadge || "Sekretariat & Layanan Informasi"}
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-white mt-3">
            {pageTexts?.kontakTitle || "Hubungi Ma'had Aly DDI Mangkoso"}
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto mt-2">
            {pageTexts?.kontakDesc || "Kami siap melayani pertanyaan seputar perkuliahan, beasiswa orang tua asuh, dan pengiriman naskah kajian."}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Info Kontak Detail */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-2xl text-slate-900 border-b border-slate-100 pb-3">
              {pageTexts?.kontakSekretariatTitle || "Informasi Sekretariat"}
            </h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <strong className="block text-slate-900">Alamat Kampus:</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <strong className="block text-slate-900">Email Redaksi &amp; Naskah:</strong>
                  <p className="text-xs text-slate-600 font-mono">{settings.emailSubmission}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <strong className="block text-slate-900">Telepon &amp; WhatsApp:</strong>
                  <p className="text-xs text-slate-600">{settings.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jam Pelayanan */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between border border-mahad-gold/30">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-mahad-gold">Pelayanan Akademik</span>
              <h3 className="font-serif font-bold text-2xl text-white">Jam Operasional Halaqah</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Pelayanan kantor biro akademik dibuka setiap hari kerja. Pengajian halaqah kitab kuning santri berlangsung ba&apos;da Subuh, ba&apos;da Ashar, dan ba&apos;da Maghrib.
              </p>
              <div className="p-4 bg-white/10 rounded-xl text-xs space-y-1">
                <p><strong>Senin - Kamis:</strong> 08.00 - 15.30 WITA</p>
                <p><strong>Jumat:</strong> 08.00 - 11.30 WITA</p>
                <p><strong>Sabtu - Ahad:</strong> Agenda Halaqah &amp; Bahtsul Masail</p>
              </div>
            </div>
          </div>

        </div>

        {/* Elemen Tambahan Kustom CMS Halaman Kontak */}
        {(() => {
          const customKontakElements = (pageTexts?.customElements || []).filter(
            (el) => el.page === "kontak"
          );
          if (customKontakElements.length === 0) return null;

          return (
            <div className="space-y-6 pt-10">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 bg-mahad-gold rounded-full inline-block"></span>
                <h2 className="font-serif font-bold text-2xl text-slate-900">
                  Layanan &amp; Saluran Bantuan Tambahan
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customKontakElements.map((el) => (
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
                          <span>Hubungi / Kunjungi</span>
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
