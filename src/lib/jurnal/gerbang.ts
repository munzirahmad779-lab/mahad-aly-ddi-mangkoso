// ─────────────────────────────────────────────────────────────────────────────
// Gerbang peran bersama untuk route review jurnal — SERVER ONLY (Tahap 3).
//
// Menjawab sesi dan peran pemanggil pada kedua mode data lewat
// sesi-server.ts, dan mencatat penolakan sebagai peristiwa keamanan
// review_ditolak (kriteria KEAMANAN-OJS-VERSI-KITA.md bagian 5 butir 4).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/rate-limit";
import {
  sesiJurnalDariRequest,
  sesiPunyaPeran,
  type SesiJurnalServer
} from "./sesi-server";
import { catatPeristiwaKeamanan } from "./keamanan";
import { JURNAL_STAFF_ROLES, type JurnalRole } from "./status";

export type HasilGerbang =
  | { ok: true; sesi: SesiJurnalServer }
  | { ok: false; response: NextResponse };

export async function tuntutPeranJurnal(
  req: Request,
  cakupan: string,
  allowed: JurnalRole[]
): Promise<HasilGerbang> {
  const sesi = await sesiJurnalDariRequest(req);
  if (!sesi) {
    await catatPeristiwaKeamanan("review_ditolak", {
      ip: getClientIp(req),
      rincian: `${cakupan}:tanpa-sesi`
    });
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Sesi jurnal tidak ditemukan. Silakan masuk ulang." },
        { status: 401 }
      )
    };
  }
  if (!sesiPunyaPeran(sesi, allowed)) {
    await catatPeristiwaKeamanan("review_ditolak", {
      ip: getClientIp(req),
      email: sesi.email,
      rincian: `${cakupan}:peran-${sesi.roles.join("|") || "tanpa-peran"}`
    });
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: `Aksi ini memerlukan peran jurnal ${allowed.join(" atau ")}.`
        },
        { status: 403 }
      )
    };
  }
  return { ok: true, sesi };
}

export function tuntutStafJurnal(
  req: Request,
  cakupan: string
): Promise<HasilGerbang> {
  return tuntutPeranJurnal(req, cakupan, JURNAL_STAFF_ROLES);
}

export function tuntutReviewerJurnal(
  req: Request,
  cakupan: string
): Promise<HasilGerbang> {
  return tuntutPeranJurnal(req, cakupan, ["reviewer"]);
}
