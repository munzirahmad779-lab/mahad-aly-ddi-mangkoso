// Benih daftar pengguna admin untuk keperluan server (referensi awal
// panel). Data pengguna yang hidup berasal dari tabel `users` Supabase
// dan diambil panel admin sendiri sesudah sesi admin terverifikasi;
// modul ini TIDAK boleh diimpor komponen klien mana pun agar nama dan
// email akun admin tidak ikut terkirim dalam bundel JS publik.
import { AdminUser } from "../types";

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-1",
    name: "Ahmad Yusuf Mubarak",
    email: "munzirahmad779@gmail.com",
    role: "Super Admin",
    status: "Aktif",
    lastLogin: "Belum pernah masuk"
  },
  {
    id: "usr-2",
    name: "Redaksi Bahtsul Masail",
    email: "bahtsulmasail@ddimangkoso.ac.id",
    role: "Editor",
    status: "Aktif",
    lastLogin: "Belum pernah masuk"
  },
  {
    id: "usr-3",
    name: "Biro Akademik & Mahasantri",
    email: "akademik@ddimangkoso.ac.id",
    role: "Penulis",
    status: "Aktif",
    lastLogin: "Belum pernah masuk"
  }
];
