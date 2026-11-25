"use client";

import { useState, type FormEvent } from "react";

export interface PilihanSaran {
  slug: string;
  judul: string;
}

type PanelSaranProps =
  | {
      pilihan: PilihanSaran[];
      slugAktif: string;
      terkunci?: never;
    }
  | {
      terkunci: PilihanSaran;
      pilihan?: never;
      slugAktif?: never;
    };

// Panel kirim saran. Saran dikirim ke route /api/saran-hari-guru yang
// menyimpannya ke tabel hari_guru_saran dan meneruskannya sebagai
// email ke admin, jadi panel ini tidak pernah menampilkan saran
// orang lain.
//
// Dua modus:
// - pilihan: ada select berisi daftar tulisan; pilihannya mengikuti
//   slugAktif selama pengunjung belum memilih judul lain secara
//   manual. Begitu slugAktif berganti, pilihan manual dibuang dan
//   select kembali mengikuti slugAktif.
// - terkunci: tanpa select; tulisan yang diberi saran sudah pasti,
//   ditampilkan sebagai satu baris "Tulisan: {judul}".
export function PanelSaran(props: PanelSaranProps) {
  const terkunci = props.terkunci ?? null;
  const pilihan = props.pilihan ?? [];
  const slugAktif = props.slugAktif ?? "";

  const [nama, setNama] = useState("");
  const [saran, setSaran] = useState("");
  const [galat, setGalat] = useState("");
  const [gagalKirim, setGagalKirim] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const [terkirim, setTerkirim] = useState(false);
  const [slugManual, setSlugManual] = useState<string | null>(null);
  const [slugAktifSebelumnya, setSlugAktifSebelumnya] = useState(slugAktif);

  // slugAktif berganti (mis. pengunjung mengganti pil penulis di
  // laman Hari Guru): buang pilihan manual agar select kembali
  // mengikuti tulisan yang sedang tampil.
  if (!terkunci && slugAktif !== slugAktifSebelumnya) {
    setSlugAktifSebelumnya(slugAktif);
    setSlugManual(null);
  }

  const slugDipilih = terkunci
    ? terkunci.slug
    : slugManual ?? slugAktif;

  const kirim = async (e: FormEvent) => {
    e.preventDefault();
    setGagalKirim(false);
    const namaBersih = nama.trim();
    const saranBersih = saran.trim();
    if (!namaBersih) {
      setGalat("Nama wajib diisi.");
      return;
    }
    if (saranBersih.length < 5) {
      setGalat("Saran terlalu pendek. Tulis minimal 5 karakter.");
      return;
    }
    const target = terkunci ?? pilihan.find((p) => p.slug === slugDipilih);
    if (!target) {
      setGalat("Pilih dulu tulisan yang ingin diberi saran.");
      return;
    }
    setGalat("");
    setMengirim(true);
    let berhasil = false;
    try {
      const respons = await fetch("/api/saran-hari-guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: namaBersih,
          slug_tulisan: target.slug,
          judul_tulisan: target.judul,
          saran: saranBersih
        })
      });
      if (respons.ok) {
        const data = await respons.json().catch(() => null);
        berhasil = Boolean(data && data.success === true);
      }
    } catch {
      berhasil = false;
    }
    setMengirim(false);
    if (!berhasil) {
      // Gagal tersimpan di basis data: jangan tampilkan keadaan berhasil.
      setGagalKirim(true);
      return;
    }
    setTerkirim(true);
  };

  const kirimLain = () => {
    setNama("");
    setSaran("");
    setGalat("");
    setGagalKirim(false);
    setTerkirim(false);
  };

  return (
    <aside className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:self-start">
      <h2 className="font-serif font-bold text-xl text-mahad-green-dark">
        Kirim Saran
      </h2>
      {terkirim ? (
        <>
          <p className="text-emerald-700 font-semibold text-sm mt-4">
            Terima kasih, saranmu sudah terkirim.
          </p>
          <button
            type="button"
            onClick={kirimLain}
            className="mt-4 w-full px-5 py-2.5 bg-white text-mahad-green-dark font-bold text-sm rounded-full border border-mahad-green-dark/30 hover:border-mahad-green-dark hover:bg-emerald-50 transition"
          >
            Kirim saran lain
          </button>
        </>
      ) : (
        <>
          <p className="text-slate-500 text-sm mt-2">
            Saranmu akan dibaca oleh penulis dan pembimbing. Saran tidak
            ditampilkan ke publik.
          </p>
          <form onSubmit={kirim} noValidate className="mt-5 space-y-4">
            {terkunci ? (
              <div>
                <p className="text-sm text-slate-800">
                  <span className="font-semibold text-slate-700">
                    Tulisan:
                  </span>{" "}
                  {terkunci.judul}
                </p>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="saran-tulisan"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Tulisan
                </label>
                <select
                  id="saran-tulisan"
                  value={slugDipilih}
                  onChange={(e) => setSlugManual(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-mahad-gold/60 focus:border-mahad-gold"
                >
                  {pilihan.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.judul}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label
                htmlFor="saran-nama"
                className="block text-sm font-semibold text-slate-700"
              >
                Nama
              </label>
              <input
                id="saran-nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama kamu"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mahad-gold/60 focus:border-mahad-gold"
              />
            </div>
            <div>
              <label
                htmlFor="saran-isi"
                className="block text-sm font-semibold text-slate-700"
              >
                Saran
              </label>
              <textarea
                id="saran-isi"
                value={saran}
                onChange={(e) => setSaran(e.target.value)}
                rows={5}
                placeholder="Tulis saranmu di sini"
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mahad-gold/60 focus:border-mahad-gold"
              />
            </div>
            {galat && (
              <p role="alert" className="text-sm text-red-700">
                {galat}
              </p>
            )}
            {gagalKirim && (
              <p role="alert" className="text-sm text-red-700">
                Maaf, saran gagal terkirim. Coba lagi sebentar.
              </p>
            )}
            <button
              type="submit"
              disabled={mengirim}
              className="w-full px-5 py-2.5 bg-mahad-green-dark text-white font-bold text-sm rounded-full shadow hover:opacity-90 transition disabled:opacity-60"
            >
              {mengirim ? "Mengirim..." : "Kirim Saran"}
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
