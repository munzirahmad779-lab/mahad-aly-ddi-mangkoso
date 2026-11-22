import { NextRequest } from "next/server";
import { JURNAL_NAMA_LABEL_UJI } from "@/lib/jurnal/konten";
import { JURNAL_BAGIAN } from "@/lib/jurnal/wizard";
import { listSubmissions } from "@/lib/jurnal/store";
import {
  daftarTombstoneOai,
  semuaArtikelPublik
} from "@/lib/jurnal/publik5-server";
import { POLA_KODE_LACAK } from "@/lib/jurnal/keamanan";
import type { JurnalArtikelPublik } from "@/lib/jurnal/alur";

// Endpoint OAI-PMH 2.0 lengkap cabang jurnal (Tahap 5).
// Enam verb: Identify, ListMetadataFormats, ListSets, ListIdentifiers,
// GetRecord, ListRecords (format oai_dc). Panen selektif from/until
// memakai datestamp rekod, daftar panjang dipecah dengan
// resumptionToken, dan artikel yang ditarik sesudah terbit tetap
// dipanen sebagai header bertanda deleted (deletedRecord persistent:
// tombstone adalah penanda pada baris naskah yang tidak pernah
// dihapus, lihat migrasi 008). Hanya artikel published yang menjadi
// rekod hidup. Jalur ini sengaja tanpa gerbang tantangan dan tanpa
// batas laju ketat: pemanen Garuda dan sejenisnya adalah bot yang sah
// (KEAMANAN-OJS-VERSI-KITA.md bagian 4).

export const dynamic = "force-dynamic";

const UKURAN_HALAMAN = 25;
const AWALAN_ID = "oai:uji.jurnal.mahadaly:";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function capWaktu(d: Date): string {
  return d.toISOString().replace(/\.\d+Z$/, "Z");
}

// Samakan semua datestamp ke format detik YYYY-MM-DDThh:mm:ssZ.
function normalCap(s: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00Z`;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return capWaktu(d);
}

interface RekodOai {
  identifier: string;
  kode: string;
  datestamp: string;
  setSpec: string | null;
  terhapus: boolean;
  artikel: JurnalArtikelPublik | null;
}

async function kumpulkanRekod(): Promise<RekodOai[]> {
  const [artikel, tombstone, semua] = await Promise.all([
    semuaArtikelPublik(),
    daftarTombstoneOai(),
    listSubmissions()
  ]);
  const ubahTerakhir = new Map<string, string>();
  for (const n of semua) {
    const terakhir =
      n.riwayat.length > 0
        ? n.riwayat[n.riwayat.length - 1].pada
        : n.dibuatPada;
    ubahTerakhir.set(n.kode, normalCap(terakhir));
  }
  const hidup: RekodOai[] = artikel.map((a) => {
    const dariLinimasa = ubahTerakhir.get(a.kode) ?? "";
    const dariTerbitan = a.tanggalTerbit ? normalCap(a.tanggalTerbit) : "";
    const datestamp =
      dariLinimasa > dariTerbitan ? dariLinimasa : dariTerbitan;
    return {
      identifier: `${AWALAN_ID}${a.kode}`,
      kode: a.kode,
      datestamp: datestamp || "2026-01-01T00:00:00Z",
      setSpec: a.bagianSlug || null,
      terhapus: false,
      artikel: a
    };
  });
  const kodeHidup = new Set(hidup.map((r) => r.kode));
  const terhapus: RekodOai[] = tombstone
    .filter((t) => !kodeHidup.has(t.kode))
    .map((t) => ({
      identifier: `${AWALAN_ID}${t.kode}`,
      kode: t.kode,
      datestamp: normalCap(t.ditarikPada),
      setSpec: t.bagianSlug,
      terhapus: true,
      artikel: null
    }));
  return [...hidup, ...terhapus].sort((a, b) =>
    a.datestamp === b.datestamp
      ? a.identifier.localeCompare(b.identifier)
      : a.datestamp < b.datestamp
        ? -1
        : 1
  );
}

function saringRekod(
  semua: RekodOai[],
  saring: { from?: string; until?: string; set?: string }
): RekodOai[] {
  return semua.filter((r) => {
    if (saring.set && r.setSpec !== saring.set) return false;
    if (saring.from && r.datestamp < saring.from) return false;
    if (saring.until && r.datestamp > saring.until) return false;
    return true;
  });
}

function kepalaRekod(r: RekodOai): string {
  const status = r.terhapus ? ` status="deleted"` : "";
  const set = r.setSpec
    ? `\n        <setSpec>${xmlEscape(r.setSpec)}</setSpec>`
    : "";
  return `      <header${status}>
        <identifier>${xmlEscape(r.identifier)}</identifier>
        <datestamp>${r.datestamp}</datestamp>${set}
      </header>`;
}

function metadataDc(r: RekodOai, asal: string): string {
  const a = r.artikel as JurnalArtikelPublik;
  const creators = a.penulis
    .map((p) => `        <dc:creator>${xmlEscape(p.nama)}</dc:creator>`)
    .join("\n");
  const subjects = a.kataKunci
    .map((k) => `        <dc:subject>${xmlEscape(k)}</dc:subject>`)
    .join("\n");
  const doi = a.doi
    ? `\n        <dc:identifier>https://doi.org/${xmlEscape(a.doi)}</dc:identifier>`
    : "";
  return `      <metadata>
        <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:title>${xmlEscape(a.judul)}</dc:title>
${creators}
${subjects}
        <dc:description>${xmlEscape(a.abstrak)}</dc:description>
        <dc:publisher>Ma'had Aly DDI Mangkoso (versi uji)</dc:publisher>
        <dc:date>${xmlEscape(a.tanggalTerbit.slice(0, 10))}</dc:date>
        <dc:type>Text</dc:type>
        <dc:identifier>${xmlEscape(`${asal}/jurnal/artikel/${a.slug}`)}</dc:identifier>${doi}
        <dc:language>${xmlEscape(a.bahasa)}</dc:language>
        <dc:source>${xmlEscape(JURNAL_NAMA_LABEL_UJI)}; ${xmlEscape(a.terbitanLabel)}${a.halaman ? `; ${xmlEscape(a.halaman)}` : ""}</dc:source>
        <dc:rights>${xmlEscape(a.lisensi)}</dc:rights>
        </oai_dc:dc>
      </metadata>`;
}

function rekodPenuh(r: RekodOai, asal: string): string {
  if (r.terhapus) {
    return `    <record>\n${kepalaRekod(r)}\n    </record>`;
  }
  return `    <record>\n${kepalaRekod(r)}\n${metadataDc(r, asal)}\n    </record>`;
}

interface Konteks {
  req: NextRequest;
  baseUrl: string;
  asal: string;
  verb: string | null;
}

function sampul(k: Konteks, isi: string): Response {
  const p = k.req.nextUrl.searchParams;
  const atribut: string[] = [];
  if (k.verb) atribut.push(`verb="${xmlEscape(k.verb)}"`);
  for (const nama of [
    "identifier",
    "metadataPrefix",
    "from",
    "until",
    "set",
    "resumptionToken"
  ]) {
    const nilai = p.get(nama);
    if (nilai) atribut.push(`${nama}="${xmlEscape(nilai)}"`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/ http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${capWaktu(new Date())}</responseDate>
  <request ${atribut.join(" ")}>${xmlEscape(k.baseUrl)}</request>
${isi}
</OAI-PMH>
`;
  return new Response(xml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" }
  });
}

function galat(k: Konteks, kode: string, pesan: string): Response {
  return sampul(
    k,
    `  <error code="${xmlEscape(kode)}">${xmlEscape(pesan)}</error>`
  );
}

// Nilai from/until: tanggal saja diperluas ke awal atau akhir hari.
function uraiRentang(
  mentah: string,
  ujung: "from" | "until"
): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(mentah)) {
    return ujung === "from" ? `${mentah}T00:00:00Z` : `${mentah}T23:59:59Z`;
  }
  const d = new Date(mentah);
  if (Number.isNaN(d.getTime())) return null;
  return capWaktu(d);
}

interface TokenPanen {
  o: number;
  f?: string;
  u?: string;
  s?: string;
}

function buatToken(t: TokenPanen): string {
  return Buffer.from(JSON.stringify(t), "utf8").toString("base64url");
}

function uraiToken(mentah: string): TokenPanen | null {
  try {
    const data = JSON.parse(
      Buffer.from(mentah, "base64url").toString("utf8")
    ) as TokenPanen;
    if (typeof data.o !== "number" || data.o < 0) return null;
    return data;
  } catch {
    return null;
  }
}

const VERB_SAH = [
  "Identify",
  "ListMetadataFormats",
  "ListSets",
  "ListIdentifiers",
  "GetRecord",
  "ListRecords"
];

export async function GET(req: NextRequest) {
  const baseUrl = `${req.nextUrl.origin}/jurnal/oai`;
  const k: Konteks = {
    req,
    baseUrl,
    asal: req.nextUrl.origin,
    verb: req.nextUrl.searchParams.get("verb")
  };
  const p = req.nextUrl.searchParams;
  const verb = k.verb;

  if (!verb || !VERB_SAH.includes(verb)) {
    return galat(
      k,
      "badVerb",
      verb
        ? `Verb "${verb}" tidak dikenal.`
        : "Parameter verb wajib diisi."
    );
  }

  if (verb === "Identify") {
    const semua = await kumpulkanRekod();
    const palingAwal =
      semua.length > 0 ? semua[0].datestamp : "2026-01-01T00:00:00Z";
    return sampul(
      k,
      `  <Identify>
    <repositoryName>${xmlEscape(JURNAL_NAMA_LABEL_UJI)} — Jurnal Ma'had Aly DDI Mangkoso</repositoryName>
    <baseURL>${xmlEscape(baseUrl)}</baseURL>
    <protocolVersion>2.0</protocolVersion>
    <adminEmail>redaksi@mahadaly-ddimangkoso.ac.id</adminEmail>
    <earliestDatestamp>${palingAwal}</earliestDatestamp>
    <deletedRecord>persistent</deletedRecord>
    <granularity>YYYY-MM-DDThh:mm:ssZ</granularity>
    <description>
      <oai-identifier xmlns="http://www.openarchives.org/OAI/2.0/oai-identifier" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai-identifier http://www.openarchives.org/OAI/2.0/oai-identifier.xsd">
        <scheme>oai</scheme>
        <repositoryIdentifier>uji.jurnal.mahadaly</repositoryIdentifier>
        <delimiter>:</delimiter>
        <sampleIdentifier>${AWALAN_ID}JRN-2026-0001</sampleIdentifier>
      </oai-identifier>
    </description>
  </Identify>`
    );
  }

  if (verb === "ListMetadataFormats") {
    const identifier = p.get("identifier");
    if (identifier) {
      const semua = await kumpulkanRekod();
      const ada = semua.some((r) => r.identifier === identifier);
      if (!ada) {
        return galat(
          k,
          "idDoesNotExist",
          "Identifier tidak dikenal di repositori ini."
        );
      }
    }
    return sampul(
      k,
      `  <ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>`
    );
  }

  if (verb === "ListSets") {
    const sets = JURNAL_BAGIAN.map(
      (b) => `    <set>
      <setSpec>${xmlEscape(b.slug)}</setSpec>
      <setName>${xmlEscape(b.judulId)}</setName>
    </set>`
    ).join("\n");
    return sampul(k, `  <ListSets>\n${sets}\n  </ListSets>`);
  }

  if (verb === "GetRecord") {
    const identifier = p.get("identifier");
    const metadataPrefix = p.get("metadataPrefix");
    if (!identifier || !metadataPrefix) {
      return galat(
        k,
        "badArgument",
        "GetRecord mewajibkan parameter identifier dan metadataPrefix."
      );
    }
    if (metadataPrefix !== "oai_dc") {
      return galat(
        k,
        "cannotDisseminateFormat",
        "Repositori ini hanya menyediakan metadataPrefix oai_dc."
      );
    }
    const kode = identifier.split(":").slice(-1)[0]?.toUpperCase() ?? "";
    if (!POLA_KODE_LACAK.test(kode)) {
      return galat(
        k,
        "idDoesNotExist",
        "Identifier tidak dikenal di repositori ini."
      );
    }
    const semua = await kumpulkanRekod();
    const rekod = semua.find((r) => r.kode === kode);
    if (!rekod) {
      return galat(
        k,
        "idDoesNotExist",
        "Identifier tidak dikenal di repositori ini."
      );
    }
    return sampul(
      k,
      `  <GetRecord>\n${rekodPenuh(rekod, k.asal)}\n  </GetRecord>`
    );
  }

  // ListIdentifiers dan ListRecords.
  const tokenMentah = p.get("resumptionToken");
  let saringan: { from?: string; until?: string; set?: string } = {};
  let offset = 0;
  let dariToken = false;

  if (tokenMentah) {
    const ekstra = [
      "metadataPrefix",
      "from",
      "until",
      "set",
      "identifier"
    ].filter((nama) => p.get(nama));
    if (ekstra.length > 0) {
      return galat(
        k,
        "badArgument",
        "resumptionToken harus menjadi satu-satunya argumen selain verb."
      );
    }
    const token = uraiToken(tokenMentah);
    if (!token) {
      return galat(k, "badArgument", "resumptionToken tidak sah.");
    }
    dariToken = true;
    offset = token.o;
    saringan = { from: token.f, until: token.u, set: token.s };
  } else {
    const metadataPrefix = p.get("metadataPrefix");
    if (!metadataPrefix) {
      return galat(
        k,
        "badArgument",
        `${verb} mewajibkan parameter metadataPrefix.`
      );
    }
    if (metadataPrefix !== "oai_dc") {
      return galat(
        k,
        "cannotDisseminateFormat",
        "Repositori ini hanya menyediakan metadataPrefix oai_dc."
      );
    }
    const fromMentah = p.get("from");
    const untilMentah = p.get("until");
    const from = fromMentah ? uraiRentang(fromMentah, "from") : undefined;
    const until = untilMentah ? uraiRentang(untilMentah, "until") : undefined;
    if (fromMentah && !from) {
      return galat(k, "badArgument", "Nilai from tidak sah.");
    }
    if (untilMentah && !until) {
      return galat(k, "badArgument", "Nilai until tidak sah.");
    }
    if (from && until && from > until) {
      return galat(
        k,
        "badArgument",
        "Nilai from tidak boleh sesudah until."
      );
    }
    saringan = {
      from: from ?? undefined,
      until: until ?? undefined,
      set: p.get("set") ?? undefined
    };
  }

  const semua = saringRekod(await kumpulkanRekod(), saringan);
  if (semua.length === 0) {
    return galat(
      k,
      "noRecordsMatch",
      "Tidak ada rekod yang cocok dengan saringan yang diberikan."
    );
  }
  if (offset >= semua.length) {
    return galat(k, "badArgument", "resumptionToken sudah kedaluwarsa.");
  }
  const potongan = semua.slice(offset, offset + UKURAN_HALAMAN);
  const adaLanjutan = offset + UKURAN_HALAMAN < semua.length;
  let elemenToken = "";
  if (adaLanjutan) {
    const berikut = buatToken({
      o: offset + UKURAN_HALAMAN,
      f: saringan.from,
      u: saringan.until,
      s: saringan.set
    });
    elemenToken = `\n    <resumptionToken expirationDate="${capWaktu(new Date(Date.now() + 24 * 60 * 60 * 1000))}" completeListSize="${semua.length}" cursor="${offset}">${xmlEscape(berikut)}</resumptionToken>`;
  } else if (dariToken) {
    elemenToken = `\n    <resumptionToken completeListSize="${semua.length}" cursor="${offset}"/>`;
  }

  if (verb === "ListIdentifiers") {
    const kepala = potongan.map(kepalaRekod).join("\n");
    return sampul(
      k,
      `  <ListIdentifiers>\n${kepala}${elemenToken}\n  </ListIdentifiers>`
    );
  }
  const rekod = potongan.map((r) => rekodPenuh(r, k.asal)).join("\n");
  return sampul(
    k,
    `  <ListRecords>\n${rekod}${elemenToken}\n  </ListRecords>`
  );
}
