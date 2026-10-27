// Urutkan daftar konten mengikuti daftar prioritas admin (panel Prioritas
// Beranda di admin): item yang ID-nya tercantum tampil lebih dulu sesuai
// urutan daftar prioritas; sisanya mengikuti urutan asal (terbaru dulu).
// Daftar prioritas kosong/tidak ada -> urutan dikembalikan apa adanya.
export function urutkanPrioritas<T extends { id: string }>(
  items: T[],
  priorityIds: string[] | undefined
): T[] {
  if (!priorityIds || priorityIds.length === 0) return items;
  const byId = new Map(items.map((it) => [it.id, it]));
  const pinned: T[] = [];
  for (const id of priorityIds) {
    const it = byId.get(id);
    if (it) {
      pinned.push(it);
      byId.delete(id);
    }
  }
  if (pinned.length === 0) return items;
  return [...pinned, ...items.filter((it) => byId.has(it.id))];
}
