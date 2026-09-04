const ENTITAS: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
};

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

export function formatTanggal(iso: string): string {
  const tanggal = new Date(`${iso}T00:00:00`);
  return Number.isNaN(tanggal.getTime())
    ? iso
    : formatterTanggal.format(tanggal);
}
