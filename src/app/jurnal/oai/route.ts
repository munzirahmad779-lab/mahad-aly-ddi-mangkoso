import { NextRequest } from "next/server";
import { JURNAL_NAMA_LABEL_UJI, ARTIKEL_UJI } from "@/lib/jurnal/konten";

// Endpoint OAI-PMH minimal cabang jurnal VERSI UJI.
// Menjawab verb=Identify dengan XML yang sah menurut skema OAI-PMH 2.0,
// dan verb=ListRecords sederhana berisi metadata oai_dc artikel contoh,
// supaya mesin pemanen (Garuda dan sejenisnya) kelak punya pintu yang
// bentuknya benar sejak versi uji. Verb lain dijawab galat badVerb.

export const dynamic = "force-dynamic";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sampul(
  req: NextRequest,
  baseUrl: string,
  verb: string | null,
  isi: string
): Response {
  const sekarang = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const atributVerb = verb ? ` verb="${xmlEscape(verb)}"` : "";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${sekarang}</responseDate>
  <request${atributVerb}>${xmlEscape(baseUrl)}</request>
${isi}
</OAI-PMH>
`;
  return new Response(xml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" }
  });
}

export async function GET(req: NextRequest) {
  const baseUrl = `${req.nextUrl.origin}/jurnal/oai`;
  const verb = req.nextUrl.searchParams.get("verb");

  if (!verb) {
    return sampul(
      req,
      baseUrl,
      null,
      `  <error code="badVerb">Parameter verb wajib diisi (versi uji mendukung: Identify, ListRecords).</error>`
    );
  }

  if (verb === "Identify") {
    const isi = `  <Identify>
    <repositoryName>${xmlEscape(JURNAL_NAMA_LABEL_UJI)} — Jurnal Ma'had Aly DDI Mangkoso</repositoryName>
    <baseURL>${xmlEscape(baseUrl)}</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>redaksi@mahadaly-ddimangkoso.ac.id</adminEmail>
    <earliestDatestamp>2026-06-30T00:00:00Z</earliestDatestamp>
    <deletedRecord>no</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
    <description>
      <uji xmlns="http://www.openarchives.org/OAI/2.0/">Endpoint OAI-PMH versi uji cabang jurnal kustom; nama jurnal masih placeholder usulan.</uji>
    </description>
  </Identify>`;
    return sampul(req, baseUrl, verb, isi);
  }

  if (verb === "ListRecords") {
    const metadataPrefix = req.nextUrl.searchParams.get("metadataPrefix");
    if (metadataPrefix && metadataPrefix !== "oai_dc") {
      return sampul(
        req,
        baseUrl,
        verb,
        `  <error code="cannotDisseminateFormat">Versi uji hanya menyediakan metadataPrefix oai_dc.</error>`
      );
    }
    const records = ARTIKEL_UJI.map((a) => {
      const creators = a.penulis
        .map((p) => `        <dc:creator>${xmlEscape(p)}</dc:creator>`)
        .join("\n");
      const subjects = a.kataKunci
        .map((k) => `        <dc:subject>${xmlEscape(k)}</dc:subject>`)
        .join("\n");
      return `    <record>
      <header>
        <identifier>oai:uji.jurnal.mahadaly:${xmlEscape(a.slug)}</identifier>
        <datestamp>${a.tanggalTerbit}T00:00:00Z</datestamp>
        <setSpec>${xmlEscape(a.seksi)}</setSpec>
      </header>
      <metadata>
        <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${xmlEscape(a.judul)}</dc:title>
${creators}
${subjects}
        <dc:description>${xmlEscape(a.abstrak)}</dc:description>
        <dc:publisher>Ma'had Aly DDI Mangkoso (versi uji)</dc:publisher>
        <dc:date>${a.tanggalTerbit}</dc:date>
        <dc:type>Text</dc:type>
        <dc:identifier>${xmlEscape(`${req.nextUrl.origin}/jurnal/artikel/${a.slug}`)}</dc:identifier>
        <dc:language>id</dc:language>
        <dc:source>${xmlEscape(JURNAL_NAMA_LABEL_UJI)}; Vol. 1 No. 1 (Versi Uji); ${xmlEscape(a.halaman)}</dc:source>
        </oai_dc:dc>
      </metadata>
    </record>`;
    }).join("\n");
    const isi = `  <ListRecords>
${records}
  </ListRecords>`;
    return sampul(req, baseUrl, verb, isi);
  }

  return sampul(
    req,
    baseUrl,
    verb,
    `  <error code="badVerb">Verb "${xmlEscape(verb)}" tidak didukung versi uji ini.</error>`
  );
}
