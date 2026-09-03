/**
 * Keterangan tetap Padukuhan Gading Kulon.
 *
 * **Sumber kebenarannya tabel `padukuhan` di server** sejak 3 September 2026 —
 * sebelumnya konstanta di berkas ini, yang berarti mengganti nomor telepon
 * balai padukuhan menuntut deploy ulang. Yang tinggal di sini tinggal dua:
 * nilai BAWAAN untuk pemasangan yang Adminnya belum pernah menyimpan apa pun,
 * dan setelan peta.
 *
 * Bacanya lewat `usePadukuhan()` (`@/hooks/use-padukuhan`), bukan dengan
 * mengimpor `PADUKUHAN_BAWAAN` langsung — kalau tidak, halaman itu akan
 * memperlihatkan nilai bawaan selamanya meski perangkat desa sudah
 * menggantinya.
 */

export interface Padukuhan {
  nama: string;
  namaLengkap: string;
  desa: string;
  kapanewon: string;
  kabupaten: string;
  provinsi: string;
  luasWilayah: string;
  /** Kontak resmi padukuhan — dicetak di footer & jadi tujuan tombol Pengaduan. */
  telepon: string;
  email: string;
  /** Paragraf dipisah baris kosong. Pecah dengan `paragrafSejarah()`. */
  sejarah: string;
  batasUtara: string;
  batasTimur: string;
  batasSelatan: string;
  batasBarat: string;
}

/**
 * Nilai awal sebelum Admin menyimpan apa pun di `/admin/profil`.
 *
 * Nilai bawaan HANYA ada di sini, tidak dikembar di server: dua daftar nilai
 * awal dalam dua bahasa pasti berbeda diam-diam suatu saat, dan tidak ada yang
 * tahu mana yang menang. Server menyimpan baris atau tidak sama sekali.
 */
export const PADUKUHAN_BAWAAN: Padukuhan = {
  nama: 'Gading Kulon',
  namaLengkap: 'Padukuhan Gading Kulon',
  desa: 'Donokerto',
  kapanewon: 'Kapanewon Turi',
  kabupaten: 'Sleman',
  provinsi: 'Daerah Istimewa Yogyakarta',
  luasWilayah: '162,4 ha',
  telepon: '+62 812-2761-391',
  email: 'gadingkulon@gmail.com',
  sejarah: [
    'Gading Kulon adalah salah satu padukuhan di Kalurahan Donokerto, Kapanewon Turi, Sleman, Daerah Istimewa Yogyakarta.',
    'Sejak awal berdirinya, warga Gading Kulon hidup produktif berlandaskan kebersamaan, pertanian, dan potensi lokal daerah lereng Gunung Merapi.',
    'Hari ini Gading Kulon berkembang tanpa meninggalkan gotong royong yang jadi wataknya: kerja bakti rutin, ronda malam bergilir, dan kegiatan Karang Taruna yang menggerakkan warga muda. Portal ini dibuat agar data kependudukan padukuhan bisa dibaca dengan cepat, oleh pengurus maupun warga.',
  ].join('\n\n'),
  batasUtara: 'Padukuhan Gading Lor',
  batasTimur: 'Padukuhan Gading Wetan',
  batasSelatan: 'Padukuhan Ngipak',
  batasBarat: 'Kalurahan Banyusoco',
};

/**
 * Setelan tampilan peta. Sengaja TIDAK ikut pindah ke tabel: ini bukan data
 * yang dirawat perangkat desa, dan menggesernya harus dilihat hasilnya di layar
 * — bidang isian yang salah semeter pun menggeser peta ke sawah sebelah tanpa
 * ada yang tahu.
 */
export const PETA = {
  /** Titik tengah peta (Donokerto, Kapanewon Turi, Sleman). */
  koordinat: { lat: -7.6256, lon: 110.3789 },
  /** Radius kotak peta dalam derajat; ±0,012° ≈ 1,3 km. */
  radiusPeta: 0.012,
} as const;

/** Paragraf sejarah: dipisah baris kosong, yang kosong dibuang. */
export function paragrafSejarah(sejarah: string): string[] {
  return sejarah
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export interface BatasWilayah {
  arah: 'Utara' | 'Timur' | 'Selatan' | 'Barat';
  wilayah: string;
}

/** Empat batas jadi daftar siap tampil, urut mata angin seperti di formulirnya. */
export function batasWilayah(p: Padukuhan): BatasWilayah[] {
  return [
    { arah: 'Utara', wilayah: p.batasUtara },
    { arah: 'Timur', wilayah: p.batasTimur },
    { arah: 'Selatan', wilayah: p.batasSelatan },
    { arah: 'Barat', wilayah: p.batasBarat },
  ];
}
