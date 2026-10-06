import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-mahad-green-dark text-emerald-100/80 pt-16 pb-8 border-t-4 border-mahad-gold mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-emerald-900">
          
          {/* Kolom 1: Profil Singkat */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 relative shrink-0 drop-shadow">
                <Image
                  src="/image_067524.png"
                  alt="Logo Ma'had Aly"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-serif font-bold text-lg text-white">Ma&apos;had Aly</p>
                <p className="text-xs text-mahad-gold font-semibold uppercase tracking-wider">DDI Mangkoso</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              Pendidikan Tinggi Kader Ulama jenjang Marhalah Ula (M.1). Berkhidmat melahirkan generasi mutafaqqih fiddin berwawasan wasathiyyah dan berakhlak mulia.
            </p>
            <p className="text-xs text-emerald-300/80 flex items-start gap-2">
              <svg className="w-4 h-4 text-mahad-gold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Kompleks Ponpes DDI Mangkoso, Kec. Soppeng Riaja, Kab. Barru, Sulsel 90752</span>
            </p>
          </div>

          {/* Kolom 2: Tautan Navigasi */}
          <div>
            <p className="font-serif font-bold text-base text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mahad-gold"></span>
              <span>Navigasi Portal</span>
            </p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-mahad-gold transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-mahad-gold transition-colors">
                  Profil &amp; Sejarah
                </Link>
              </li>
              <li>
                <Link href="/#mimbar-kajian" className="hover:text-mahad-gold transition-colors">
                  Mimbar Kajian
                </Link>
              </li>
              <li>
                <Link href="/kategori/karya-anregurutta" className="hover:text-mahad-gold transition-colors">
                  Karya Anregurutta
                </Link>
              </li>
              <li>
                <Link href="/kirim-tulisan" className="hover:text-mahad-gold transition-colors">
                  Kirim Karya Tulisan
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Fokus Keilmuan */}
          <div>
            <p className="font-serif font-bold text-base text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mahad-gold"></span>
              <span>Fokus Keilmuan</span>
            </p>
            <ul className="space-y-2.5 text-sm text-emerald-200/90">
              <li>
                <Link href="/kategori/usul-fikih" className="hover:text-mahad-gold transition-colors">
                  Usul Fikih &amp; Qawa&apos;id Fiqhiyyah
                </Link>
              </li>
              <li>
                <Link href="/kategori/usul-fikih" className="hover:text-mahad-gold transition-colors">
                  Fiqh Muqaran (Perbandingan Madzhab)
                </Link>
              </li>
              <li>
                <Link href="/kategori/tafsir-hadis" className="hover:text-mahad-gold transition-colors">
                  &apos;Ulumul Qur&apos;an &amp; Tafsir Turats
                </Link>
              </li>
              <li>
                <Link href="/kategori/tafsir-hadis" className="hover:text-mahad-gold transition-colors">
                  Dirasah Hadits wa Rijaluha
                </Link>
              </li>
              <li>
                <Link href="/kategori/karya-anregurutta" className="hover:text-mahad-gold transition-colors">
                  Manuskrip Gurutta Ambo Dalle
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Media & Kontak */}
          <div>
            <p className="font-serif font-bold text-base text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mahad-gold"></span>
              <span>Kanal Informasi</span>
            </p>
            <p className="text-xs text-emerald-200/90 mb-4 leading-relaxed">
              Ikuti kabar pengajian, kajian halaqah, dan penerbitan jurnal resmi Ma&apos;had Aly DDI Mangkoso:
            </p>
            <div className="space-y-2 text-xs text-emerald-200">
              <p>Email: <span className="text-white font-medium">mahadaly@ddimangkoso.ac.id</span></p>
              <p>WhatsApp: <span className="text-white font-medium">+62 812-3456-7890</span></p>
            </div>
            
            {/* Tautan Khusus Admin */}
            <div className="pt-4 mt-4 border-t border-emerald-900">
              <Link
                href="/admin"
                className="text-[11px] text-mahad-gold hover:underline flex items-center gap-1 opacity-75 hover:opacity-100 transition"
              >
                <span>🔒 Masuk Panel Redaksi (Admin)</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-4 text-center sm:text-left">
          <p>&copy; 2026 Ma&apos;had Aly DDI Mangkoso. Hak Cipta Dilindungi.</p>
          <p className="text-mahad-gold-light">
            Mewarisi Khazanah Turats &bull; Menjaga Sanad Ulama Nusantara
          </p>
        </div>
      </div>
    </footer>
  );
}