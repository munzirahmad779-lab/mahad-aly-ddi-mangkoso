import type { ReactNode } from "react";
import { SidebarJurnal } from "./sidebar-jurnal";

// Kerangka dua kolom halaman publik jurnal: konten utama di atas
// panel putih dan sidebar di sisi akhir baris, di atas latar halaman
// bermotif titik sangat halus mengikuti pola situs jurnal pada
// umumnya. Pada tata letak RTL grid mengikuti arah tulis, sehingga
// sidebar berpindah sisi secara wajar mengikuti pola situs jurnal
// berbahasa Arab. Halaman panel, masuk, dan alur naskah tidak
// memakai kerangka ini.

export function KerangkaPublik({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full"
      style={{
        backgroundImage:
          "radial-gradient(rgba(20, 123, 59, 0.05) 1px, transparent 1.4px)",
        backgroundSize: "22px 22px"
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            {children}
          </div>
          <SidebarJurnal />
        </div>
      </div>
    </div>
  );
}
