/**
 * Konstanta admin bersama — SATU sumber kebenaran untuk email pemilik/
 * super admin bootstrap. Sebelumnya alamat ini tersalin mentah di belasan
 * titik (panel admin, admin-guard, layanan email, route API) sehingga rawan
 * tidak konsisten saat berganti. Nilai perilakunya TIDAK berubah: tetap
 * alamat yang sama; route server boleh menimpanya dengan env
 * SUPER_ADMIN_EMAIL / ADMIN_NOTIFICATION_EMAIL.
 */
export const SUPER_ADMIN_EMAIL = "munzirahmad779@gmail.com";
