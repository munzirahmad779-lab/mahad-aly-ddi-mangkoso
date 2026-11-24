// Rentang halaman artikel (mis. "1-18") adalah urutan angka yang
// dibaca kiri ke kanan. Di dalam wadah RTL, urutan angka dan tanda
// hubung yang dirender sebagai teks biasa terbalik secara visual
// menjadi "18-1". Komponen ini mengisolasi arah rentang dengan
// elemen bdi berarah ltr, sehingga rentang selalu terbaca "1-18"
// pada ketiga bahasa tampilan tanpa mengubah data halaman.
export function RentangHalaman({ halaman }: { halaman: string }) {
  return (
    <bdi dir="ltr" className="whitespace-nowrap">
      {halaman}
    </bdi>
  );
}
