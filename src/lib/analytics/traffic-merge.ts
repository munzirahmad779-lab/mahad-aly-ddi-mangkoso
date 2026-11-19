// Penggabungan statistik trafik dua era (Gerbang 0 Butir 5b).
//
// Era blob: blob JSON `global_traffic_stats` di site_content, ditulis
// route track lama dengan pola baca-ubah-tulis. Sesudah migrasi 003 dan
// kode baru deploy, blob TIDAK ditulis lagi dan membeku sebagai arsip.
//
// Era tabel: traffic_daily + traffic_visitor_days + traffic_recent_visits
// (supabase/migrations/003_traffic_daily.sql), ditulis atomik lewat
// rpc record_traffic_visit.
//
// Satu kunjungan dicatat ke tepat satu era, tidak pernah keduanya, jadi
// angka gabungan adalah PENJUMLAHAN dua era:
//   totalViews / uniqueVisitors : blob + tabel
//   pages                       : per pathname, blob + tabel
//   daily                       : per tanggal, views dan unique dijumlah
//   recentVisits                : digabung, urut terbaru, 20 teratas
//   lastVisit                   : yang paling baru dari dua era
//
// Fungsi di berkas ini murni (tanpa akses basis data) agar semantik
// penggabungannya bisa diuji tersendiri.

export interface TrafficDailyEntry {
  views: number;
  unique: number;
}

export interface TrafficVisit {
  path: string;
  device: string;
  referrer: string;
  timestamp: string;
}

export interface TrafficStats {
  totalViews: number;
  uniqueVisitors: number;
  pages: Record<string, number>;
  daily: Record<string, TrafficDailyEntry>;
  recentVisits: TrafficVisit[];
  lastVisit: string;
}

// Bentuk keluaran rpc get_traffic_aggregates (migrasi 003): sejajar
// dengan TrafficStats, kecuali lastVisit boleh null (tabel masih kosong).
export interface TrafficAggregates {
  totalViews: number;
  uniqueVisitors: number;
  pages: Record<string, number>;
  daily: Record<string, TrafficDailyEntry>;
  recentVisits: TrafficVisit[];
  lastVisit: string | null;
}

export const EMPTY_TRAFFIC_AGGREGATES: TrafficAggregates = {
  totalViews: 0,
  uniqueVisitors: 0,
  pages: {},
  daily: {},
  recentVisits: [],
  lastVisit: null
};

function toCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function normalizePages(raw: unknown): Record<string, number> {
  const pages: Record<string, number> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      pages[key] = toCount(value);
    }
  }
  return pages;
}

function normalizeDaily(raw: unknown): Record<string, TrafficDailyEntry> {
  const daily: Record<string, TrafficDailyEntry> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw as Record<string, any>)) {
      daily[key] = {
        views: toCount(value?.views),
        unique: toCount(value?.unique)
      };
    }
  }
  return daily;
}

function normalizeVisits(raw: unknown): TrafficVisit[] {
  if (!Array.isArray(raw)) return [];
  const visits: TrafficVisit[] = [];
  for (const item of raw as Array<Record<string, any>>) {
    if (!item || typeof item !== "object") continue;
    visits.push({
      path: typeof item.path === "string" ? item.path : "",
      device: typeof item.device === "string" ? item.device : "",
      referrer: typeof item.referrer === "string" ? item.referrer : "",
      timestamp: typeof item.timestamp === "string" ? item.timestamp : ""
    });
  }
  return visits;
}

// Rapikan keluaran mentah rpc get_traffic_aggregates (jsonb bebas) ke
// bentuk TrafficAggregates yang aman dijumlahkan.
export function normalizeTrafficAggregates(raw: unknown): TrafficAggregates {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...EMPTY_TRAFFIC_AGGREGATES };
  }
  const agg = raw as Record<string, any>;
  return {
    totalViews: toCount(agg.totalViews),
    uniqueVisitors: toCount(agg.uniqueVisitors),
    pages: normalizePages(agg.pages),
    daily: normalizeDaily(agg.daily),
    recentVisits: normalizeVisits(agg.recentVisits),
    lastVisit: typeof agg.lastVisit === "string" && agg.lastVisit ? agg.lastVisit : null
  };
}

// Gabungkan blob lama (boleh kosong/null, boleh memuat visitorHashes
// yang memang tidak pernah diteruskan) dengan agregat era tabel.
export function mergeTrafficStats(
  blob: Partial<TrafficStats> | null | undefined,
  agg: TrafficAggregates
): TrafficStats {
  const legacy: Partial<TrafficStats> = blob && typeof blob === "object" ? blob : {};

  const pages = normalizePages(legacy.pages);
  for (const [pathname, views] of Object.entries(agg.pages)) {
    pages[pathname] = (pages[pathname] || 0) + views;
  }

  const daily = normalizeDaily(legacy.daily);
  for (const [day, entry] of Object.entries(agg.daily)) {
    const existing = daily[day] || { views: 0, unique: 0 };
    daily[day] = {
      views: existing.views + entry.views,
      unique: existing.unique + entry.unique
    };
  }

  const recentVisits = [...normalizeVisits(legacy.recentVisits), ...agg.recentVisits]
    .sort((a, b) => {
      const ta = Date.parse(a.timestamp) || 0;
      const tb = Date.parse(b.timestamp) || 0;
      return tb - ta;
    })
    .slice(0, 20);

  const legacyLast = typeof legacy.lastVisit === "string" ? legacy.lastVisit : "";
  let lastVisit = legacyLast;
  if (agg.lastVisit && (Date.parse(agg.lastVisit) || 0) >= (Date.parse(legacyLast) || 0)) {
    lastVisit = agg.lastVisit;
  }
  if (!lastVisit && recentVisits.length > 0) {
    lastVisit = recentVisits[0].timestamp;
  }

  return {
    totalViews: toCount(legacy.totalViews) + agg.totalViews,
    uniqueVisitors: toCount(legacy.uniqueVisitors) + agg.uniqueVisitors,
    pages,
    daily,
    recentVisits,
    lastVisit
  };
}
