// Generator XML deposit Crossref (Tahap Penutup Celah).
//
// Menghasilkan satu berkas XML deposit per terbitan sesuai rancangan
// audit lanjutan 24 Nov 2026: deposit Crossref sah tanpa plugin OJS,
// baik lewat formulir web Crossref maupun servlet deposit langsung.
// Berkas ini hanya dibuatkan oleh rute staf; pengirimannya sendiri
// terjadi di luar sistem dan hasilnya dicatat lewat status deposit.
//
// Nama jurnal dan e-ISSN dibaca dari env (JURNAL_NAMA, JURNAL_EISSN)
// karena keduanya baru final sesudah keputusan pimpinan dan penerbitan
// e-ISSN. Generator tidak mengarang keduanya: tanpa e-ISSN elemen
// <issn> tidak ditulis dan XML diberi komentar penanda.

import { JURNAL_NAMA_PLACEHOLDER } from "./konten";
import type { JurnalArtikelPublik, JurnalTerbitanPublik } from "./alur";

export function xmlEscapeCrossref(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pecahNama(nama: string): { given: string; surname: string } {
  const bersih = nama.trim().replace(/\s+/g, " ");
  const idx = bersih.lastIndexOf(" ");
  if (idx <= 0) return { given: "", surname: bersih };
  return {
    given: bersih.slice(0, idx),
    surname: bersih.slice(idx + 1)
  };
}

function tanggalXml(iso: string): { y: string; m: string; d: string } | null {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return null;
  return {
    y: String(t.getUTCFullYear()),
    m: String(t.getUTCMonth() + 1).padStart(2, "0"),
    d: String(t.getUTCDate()).padStart(2, "0")
  };
}

export interface HasilXmlCrossref {
  xml: string;
  jumlahArtikel: number;
  terlewatTanpaDoi: number;
}

export function bangunXmlDepositCrossref(input: {
  terbitan: JurnalTerbitanPublik;
  basisUrl: string;
  namaJurnal?: string;
  eissn?: string | null;
  sekarang?: Date;
}): HasilXmlCrossref {
  const { terbitan, basisUrl } = input;
  const nama =
    input.namaJurnal?.trim() ||
    process.env.JURNAL_NAMA?.trim() ||
    JURNAL_NAMA_PLACEHOLDER;
  const eissn = (input.eissn ?? process.env.JURNAL_EISSN ?? "").trim();
  const kini = input.sekarang ?? new Date();
  const capWaktu =
    kini.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14) || "0";
  const batchId = `mahadaly-${terbitan.slug}-${capWaktu}`;

  const artikelBerd = terbitan.artikel.filter((a) => a.doi);
  const terlewat = terbitan.artikel.length - artikelBerd.length;

  const tanggalTerbitan = tanggalXml(terbitan.tanggalTerbit ?? "") ?? {
    y: String(terbitan.tahun),
    m: "01",
    d: "01"
  };

  const baris: string[] = [];
  baris.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  if (!eissn) {
    baris.push(
      `<!-- PERINGATAN: e-ISSN belum terisi (env JURNAL_EISSN). Deposit Crossref untuk artikel jurnal memerlukan ISSN; isi sesudah e-ISSN terbit. -->`
    );
  }
  baris.push(
    `<doi_batch xmlns="http://www.crossref.org/schema/5.3.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ai="http://www.crossref.org/AccessIndicators.xsd" version="5.3.0" xsi:schemaLocation="http://www.crossref.org/schema/5.3.0 http://data.crossref.org/schemas/crossref5.3.0.xsd">`
  );
  baris.push(`  <head>`);
  baris.push(`    <doi_batch_id>${xmlEscapeCrossref(batchId)}</doi_batch_id>`);
  baris.push(`    <timestamp>${capWaktu}</timestamp>`);
  baris.push(`    <depositor>`);
  baris.push(
    `      <depositor_name>Lembaga Jurnal Ma'had Aly DDI Mangkoso</depositor_name>`
  );
  baris.push(
    `      <email_address>redaksi@mahadaly-ddimangkoso.ac.id</email_address>`
  );
  baris.push(`    </depositor>`);
  baris.push(
    `    <registrant>Lembaga Jurnal Ma'had Aly DDI Mangkoso</registrant>`
  );
  baris.push(`  </head>`);
  baris.push(`  <body>`);
  baris.push(`    <journal>`);
  baris.push(`      <journal_metadata language="id">`);
  baris.push(`        <full_title>${xmlEscapeCrossref(nama)}</full_title>`);
  if (eissn) {
    baris.push(`        <issn media_type="electronic">${xmlEscapeCrossref(eissn)}</issn>`);
  }
  baris.push(`      </journal_metadata>`);
  baris.push(`      <journal_issue>`);
  baris.push(`        <publication_date media_type="online">`);
  baris.push(`          <month>${tanggalTerbitan.m}</month>`);
  baris.push(`          <day>${tanggalTerbitan.d}</day>`);
  baris.push(`          <year>${tanggalTerbitan.y}</year>`);
  baris.push(`        </publication_date>`);
  if (terbitan.volume != null) {
    baris.push(`        <journal_volume>`);
    baris.push(`          <volume>${terbitan.volume}</volume>`);
    baris.push(`        </journal_volume>`);
  }
  if (terbitan.nomor != null) {
    baris.push(`        <issue>${terbitan.nomor}</issue>`);
  }
  baris.push(`      </journal_issue>`);

  for (const a of artikelBerd) {
    const tgl = tanggalXml(a.tanggalTerbit) ?? tanggalTerbitan;
    baris.push(`      <journal_article language="${xmlEscapeCrossref(a.bahasa || "id")}" publication_type="full_text">`);
    baris.push(`        <titles>`);
    baris.push(`          <title>${xmlEscapeCrossref(a.judul)}</title>`);
    baris.push(`        </titles>`);
    baris.push(`        <contributors>`);
    a.penulis.forEach((p, i) => {
      const { given, surname } = pecahNama(p.nama);
      baris.push(
        `          <person_name sequence="${i === 0 ? "first" : "additional"}" contributor_role="author">`
      );
      if (given) {
        baris.push(`            <given_name>${xmlEscapeCrossref(given)}</given_name>`);
      }
      baris.push(`            <surname>${xmlEscapeCrossref(surname)}</surname>`);
      if (p.afiliasi) {
        baris.push(`            <affiliations>`);
        baris.push(`              <institution>`);
        baris.push(`                <institution_name>${xmlEscapeCrossref(p.afiliasi)}</institution_name>`);
        baris.push(`              </institution>`);
        baris.push(`            </affiliations>`);
      }
      if (p.orcid) {
        baris.push(`            <ORCID>https://orcid.org/${xmlEscapeCrossref(p.orcid.replace(/^https?:\/\/orcid\.org\//, ""))}</ORCID>`);
      }
      baris.push(`          </person_name>`);
    });
    baris.push(`        </contributors>`);
    baris.push(`        <publication_date media_type="online">`);
    baris.push(`          <month>${tgl.m}</month>`);
    baris.push(`          <day>${tgl.d}</day>`);
    baris.push(`          <year>${tgl.y}</year>`);
    baris.push(`        </publication_date>`);
    if (a.halamanMulai != null && a.halamanSelesai != null) {
      baris.push(`        <pages>`);
      baris.push(`          <first_page>${a.halamanMulai}</first_page>`);
      baris.push(`          <last_page>${a.halamanSelesai}</last_page>`);
      baris.push(`        </pages>`);
    }
    baris.push(`        <ai:program name="AccessIndicators">`);
    baris.push(
      `          <ai:license_ref applies_to="vor">https://creativecommons.org/licenses/by/4.0/</ai:license_ref>`
    );
    baris.push(`        </ai:program>`);
    baris.push(`        <doi_data>`);
    baris.push(`          <doi>${xmlEscapeCrossref(a.doi as string)}</doi>`);
    baris.push(
      `          <resource>${xmlEscapeCrossref(`${basisUrl}/jurnal/artikel/${a.slug}`)}</resource>`
    );
    baris.push(`        </doi_data>`);
    baris.push(`      </journal_article>`);
  }

  baris.push(`    </journal>`);
  baris.push(`  </body>`);
  baris.push(`</doi_batch>`);
  return {
    xml: baris.join("\n"),
    jumlahArtikel: artikelBerd.length,
    terlewatTanpaDoi: terlewat
  };
}
