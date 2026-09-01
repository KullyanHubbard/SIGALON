import type {
  Agama,
  FilterPenduduk,
  GolonganDarah,
  StatusKependudukan,
  JenisKelamin,
  KelompokUmur,
  Pendidikan,
  StatusHubunganKeluarga,
  StatusPerkawinan,
} from './types';
import type { Distribusi } from '@/types/statistik';

/** Peta enum -> label yang enak dibaca untuk ditampilkan di UI. */

export const jenisKelaminLabel: Record<JenisKelamin, string> = {
  LAKI_LAKI: 'Laki-laki',
  PEREMPUAN: 'Perempuan',
};

export const agamaLabel: Record<Agama, string> = {
  ISLAM: 'Islam',
  KRISTEN: 'Kristen',
  KATOLIK: 'Katolik',
  HINDU: 'Hindu',
  BUDDHA: 'Buddha',
  KONGHUCU: 'Konghucu',
  LAINNYA: 'Lainnya',
};

export const statusPerkawinanLabel: Record<StatusPerkawinan, string> = {
  BELUM_KAWIN: 'Belum Kawin',
  KAWIN: 'Kawin',
  CERAI_HIDUP: 'Cerai Hidup',
  CERAI_MATI: 'Cerai Mati',
};

export const pendidikanLabel: Record<Pendidikan, string> = {
  TIDAK_SEKOLAH: 'Tidak Sekolah',
  SD: 'SD',
  SMP: 'SMP',
  SMA: 'SMA/SMK',
  D3: 'Diploma (D3)',
  S1: 'Sarjana (S1)',
  S2: 'Magister (S2)',
  S3: 'Doktor (S3)',
};

export const golonganDarahLabel: Record<GolonganDarah, string> = {
  A: 'A',
  B: 'B',
  AB: 'AB',
  O: 'O',
  TIDAK_TAHU: 'Tidak Tahu',
};

/** Nomor KK tidak didata lagi, tapi peran tiap orang di keluarganya tetap. */
export const statusHubunganLabel: Record<StatusHubunganKeluarga, string> = {
  KEPALA_KELUARGA: 'Kepala Keluarga',
  ISTRI: 'Istri',
  ANAK: 'Anak',
  FAMILI_LAIN: 'Famili Lain',
  LAINNYA: 'Lainnya',
};

/**
 * `AKTIF` dibaca orang sebagai "Menetap" — lawan katanya Pindah & Meninggal,
 * dan "aktif/tidak aktif" itu bahasa sistem, bukan bahasa kependudukan.
 * Nilai yang disimpan tetap `AKTIF`: tabel `mutasi` riwayat permanen yang
 * kolom `dari`/`ke`-nya sudah berisi string itu.
 */
export const statusKependudukanLabel: Record<StatusKependudukan, string> = {
  AKTIF: 'Menetap',
  PINDAH: 'Pindah',
  MENINGGAL: 'Meninggal',
};

/** Urutan tampil kelompok umur — sama dengan `KELOMPOK_UMUR` di backend. */
export const kelompokUmurOpsi: readonly KelompokUmur[] = [
  '0-5',
  '6-12',
  '13-17',
  '18-25',
  '26-40',
  '41-60',
  '60+',
];

/**
 * Nama tiap filter yang dibaca orang — dipakai label di panel filter DAN teks
 * chip filter aktif, jadi keduanya tidak bisa menyebut hal yang sama dengan dua
 * nama berbeda.
 *
 * Urutan deklarasi = urutan chip tampil. Kalau chip diurutkan mengikuti isi
 * objek filter, urutannya jadi urutan klik: satu filter dihapus lalu dipasang
 * lagi memindahkan chip ke ujung, dan barisnya melompat di depan mata.
 */
export const filterLabel: Record<keyof FilterPenduduk, string> = {
  rw: 'RW',
  rt: 'RT',
  jenisKelamin: 'Jenis Kelamin',
  kelompokUmur: 'Kelompok Umur',
  agama: 'Agama',
  pendidikan: 'Pendidikan',
  statusPerkawinan: 'Status Perkawinan',
  statusHubunganKeluarga: 'Status dalam Keluarga',
  golonganDarah: 'Gol. Darah',
  pekerjaan: 'Pekerjaan',
};

/** Filter yang nilainya enum; sisanya (RT/RW/pekerjaan) sudah teks apa adanya. */
const nilaiFilterLabel: Partial<
  Record<keyof FilterPenduduk, Record<string, string>>
> = {
  jenisKelamin: jenisKelaminLabel,
  agama: agamaLabel,
  golonganDarah: golonganDarahLabel,
  pendidikan: pendidikanLabel,
  statusPerkawinan: statusPerkawinanLabel,
  statusHubunganKeluarga: statusHubunganLabel,
};

/** Satu filter aktif dalam bentuk siap dicetak jadi chip. */
export interface FilterChip {
  field: keyof FilterPenduduk;
  label: string;
  nilai: string;
}

/**
 * Filter aktif -> daftar chip. Yang bernilai kosong dilewati: `''` tidak pernah
 * disimpan (lihat `ToolbarPenduduk`), tapi chip untuk filter kosong akan jadi
 * tombol hapus yang tidak menghapus apa pun.
 */
export function toFilterChips(filter: FilterPenduduk): FilterChip[] {
  const urutan = Object.keys(filterLabel) as (keyof FilterPenduduk)[];
  return urutan.flatMap((field) => {
    const nilai = filter[field];
    if (!nilai) return [];
    return [
      {
        field,
        label: filterLabel[field],
        nilai:
          nilaiFilterLabel[field]?.[nilai] ??
          (field === 'kelompokUmur' ? `${nilai} th` : nilai),
      },
    ];
  });
}

/**
 * Terjemahkan label enum mentah pada distribusi menjadi label manusiawi.
 *
 * Backend mengirim `'ISLAM'`, chart menampilkan `'Islam'`. Tinggal di sini
 * bersama petanya karena dua halaman memakainya — infografis admin dan rincian
 * RW di halaman depan.
 */
export function relabel<T extends string>(
  data: Distribusi[],
  map: Record<T, string>,
): Distribusi[] {
  return data.map((d) => ({ ...d, label: map[d.label as T] ?? d.label }));
}
