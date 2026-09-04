export interface Padukuhan {
  nama: string;
  namaLengkap: string;
  desa: string;
  kapanewon: string;
  kabupaten: string;
  provinsi: string;
  luasWilayah: string;

  telepon: string;
  email: string;

  sejarah: string;
  batasUtara: string;
  batasTimur: string;
  batasSelatan: string;
  batasBarat: string;
}

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

export const PETA = {
  koordinat: { lat: -7.656826, lon: 110.363111 },

  radiusPeta: 0.012,
} as const;

export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${PETA.koordinat.lat},${PETA.koordinat.lon}`;

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

export function batasWilayah(p: Padukuhan): BatasWilayah[] {
  return [
    { arah: 'Utara', wilayah: p.batasUtara },
    { arah: 'Timur', wilayah: p.batasTimur },
    { arah: 'Selatan', wilayah: p.batasSelatan },
    { arah: 'Barat', wilayah: p.batasBarat },
  ];
}
