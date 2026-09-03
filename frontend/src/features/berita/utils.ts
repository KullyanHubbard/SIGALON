const ENTITAS: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

/**
 * Isi artikel (HTML) -> teks polos untuk kutipan pembuka di kartu berita.
 *
 * Regex, bukan parser: yang dibaca di sini sudah disaring daftar putih di
 * server (`backend/app/schemas/berita.py`), jadi ini urusan tampilan, bukan
 * penjagaan keamanan. Tag diganti spasi, bukan dibuang, supaya
 * `<p>Satu</p><p>Dua</p>` tidak terbaca "SatuDua".
 */
export function keRingkasan(isi: string): string {
  return isi
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/g, (e) => ENTITAS[e])
    .replace(/\s+/g, ' ')
    .trim();
}

const formatterTanggal = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** `'2026-08-31'` -> `'31 Agustus 2026'`. ISO tak sah dikembalikan apa adanya. */
export function formatTanggal(iso: string): string {
  const tanggal = new Date(`${iso}T00:00:00`);
  return Number.isNaN(tanggal.getTime())
    ? iso
    : formatterTanggal.format(tanggal);
}
