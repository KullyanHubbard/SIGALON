/**
 * Menyiapkan berkas foto jadi data URL — dipakai foto sampul
 * (`FotoBeritaField`) maupun foto yang disisipkan di tengah tulisan
 * (`EditorIsiBerita`). Satu tempat, karena aturannya harus sama persis.
 *
 * **Fotonya digambar ulang lewat `<canvas>`, tidak pernah disimpan mentah.**
 * Dua alasan, dan yang pertama yang penting:
 *
 * 1. **Metadata ikut terbuang.** Foto ponsel membawa EXIF: titik koordinat
 *    tempat ia dipotret, model perangkat, jam pemotretan. Berita padukuhan
 *    terbit untuk umum, jadi menyimpannya mentah berarti satu foto rumah warga
 *    ikut menerbitkan alamat persisnya. `canvas` cuma menyalin pikselnya.
 * 2. Ukurannya turun drastis, dan foto langsung dari kamera nyaris tidak
 *    pernah lagi ditolak karena kebesaran.
 */

/** Sisi terpanjang setelah diperkecil. Cukup untuk lebar artikel di layar mana pun. */
const MAKS_SISI = 1600;

/**
 * Batas ukuran HASIL (sesudah diperkecil), bukan berkas aslinya.
 *
 * Hasilnya tersimpan sebagai data URL di dalam baris beritanya, dan dikirim
 * ulang tiap kali halaman berita dibuka siapa pun.
 */
export const MAKS_FOTO_BYTE = 600_000;

export const MAKS_FOTO_KB = Math.round(MAKS_FOTO_BYTE / 1000);

/** Berkas sumber yang lebih besar dari ini ditolak tanpa dibuka — memecahkannya
 *  di peramban ponsel bisa menghabiskan memori sebelum sempat diperkecil. */
const MAKS_SUMBER_BYTE = 12_000_000;

/** Data URL foto, atau pesan siap tampil kalau berkasnya tidak bisa dipakai. */
export type HasilFoto = { dataUrl: string } | { galat: string };

export async function bacaFoto(berkas: File): Promise<HasilFoto> {
  if (!berkas.type.startsWith('image/')) {
    return { galat: 'Berkas itu bukan gambar. Pilih foto JPG atau PNG.' };
  }
  if (berkas.size > MAKS_SUMBER_BYTE) {
    return {
      galat: `Foto terlalu besar (maksimal ${Math.round(MAKS_SUMBER_BYTE / 1_000_000)} MB). Perkecil dulu sebelum diunggah.`,
    };
  }

  try {
    const gambar = await muatGambar(berkas);
    // Mutu diturunkan bertahap, bukan sekali tebak: foto padat detail bisa
    // tetap besar pada 0,82 sementara menurunkan semuanya ke 0,6 sejak awal
    // membuat foto biasa terlihat kasar tanpa perlu.
    for (const mutu of [0.82, 0.6, 0.45]) {
      const hasil = keDataUrl(gambar, mutu);
      if (hasil.length <= MAKS_FOTO_BYTE) return { dataUrl: hasil };
    }
    return {
      galat: `Foto masih lebih dari ${MAKS_FOTO_KB} KB setelah diperkecil. Coba foto lain.`,
    };
  } catch {
    return { galat: 'Foto gagal dibaca. Coba berkas lain.' };
  }
}

function muatGambar(berkas: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const alamat = URL.createObjectURL(berkas);
    const gambar = new Image();
    // Alamat sementara dilepas begitu gambarnya terbaca, berhasil maupun tidak
    // — kalau tidak, tiap foto yang dicoba menyandera memorinya sampai tab
    // ditutup.
    gambar.onload = () => {
      URL.revokeObjectURL(alamat);
      resolve(gambar);
    };
    gambar.onerror = () => {
      URL.revokeObjectURL(alamat);
      reject(new Error('Gambar gagal dimuat.'));
    };
    gambar.src = alamat;
  });
}

function keDataUrl(gambar: HTMLImageElement, mutu: number): string {
  const skala = Math.min(1, MAKS_SISI / Math.max(gambar.width, gambar.height));
  const kanvas = document.createElement('canvas');
  kanvas.width = Math.round(gambar.width * skala);
  kanvas.height = Math.round(gambar.height * skala);

  const konteks = kanvas.getContext('2d');
  if (!konteks) throw new Error('Canvas tidak tersedia.');

  // Latar putih dulu: hasilnya JPEG yang tidak punya transparansi, dan tanpa
  // ini bagian tembus pandang sebuah PNG berubah jadi hitam pekat.
  konteks.fillStyle = '#ffffff';
  konteks.fillRect(0, 0, kanvas.width, kanvas.height);
  konteks.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);

  return kanvas.toDataURL('image/jpeg', mutu);
}
