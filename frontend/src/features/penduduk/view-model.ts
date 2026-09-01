import { formatTanggal, hitungUmur } from '@/lib/tanggal';
import type { Penduduk, StatusKependudukan } from './types';
import {
  agamaLabel,
  golonganDarahLabel,
  statusKependudukanLabel,
  jenisKelaminLabel,
  pendidikanLabel,
  statusHubunganLabel,
  statusPerkawinanLabel,
} from './labels';

/**
 * Terjemahan model domain -> bentuk siap tampil.
 *
 * Semua penerjemahan enum, perhitungan umur, dan perangkaian alamat berhenti
 * di file ini. Komponen tampilan cukup mencetak string yang sudah jadi, jadi
 * aturan seperti "yang pindah/meninggal ditandai" hanya ada di satu tempat.
 */

type KeteranganTone = 'amber' | 'slate' | null;

/**
 * Warna Keterangan menjawab "masih ada urusan atau tidak", bukan sekadar
 * "bukan menetap".
 *
 * Pindah amber: warganya masih hidup dan datanya kemungkinan masih perlu
 * diurus. Meninggal abu: keadaan final, tidak ada tindak lanjut — sekaligus
 * karena mengecat kematian warga dengan warna peringatan itu nada yang salah.
 * Satu warna untuk keduanya membuat warnanya tidak menjelaskan apa pun; yang
 * membedakan cuma teksnya.
 */
const KETERANGAN_TONE: Record<StatusKependudukan, KeteranganTone> = {
  AKTIF: null,
  PINDAH: 'amber',
  MENINGGAL: 'slate',
};

/** Satu baris pada tabel daftar penduduk / anggota keluarga. */
export interface PendudukRow {
  id: string;
  nama: string;
  jenisKelamin: string;
  umur: string;
  agama: string;
  /** "004/019" — RT dulu, karena itu yang dipakai pengurus tiap hari. */
  rtRw: string;
  /** Kolom Keterangan: "Menetap", "Pindah", atau "Meninggal". */
  keterangan: string;
  /**
   * Nada badge kolom Keterangan; `null` untuk yang menetap.
   *
   * Yang sudah pindah/meninggal diberi badge, yang menetap cukup teksnya saja.
   * Warna teks tidak ikut berubah — semua kolom sewarna, latar badge yang
   * membedakan. Mereka masih tampil di daftar supaya penandaan yang keliru bisa
   * dibatalkan, tapi TIDAK ikut dihitung di statistik — tanpa penanda ini, dua
   * baris yang kelihatan sama menghasilkan angka yang berbeda dan tidak ada
   * yang tahu kenapa. Kalau semua baris diberi badge, yang menonjol justru
   * mayoritas yang biasa saja.
   */
  keteranganTone: KeteranganTone;
}

export function toPendudukRow(p: Penduduk): PendudukRow {
  return {
    id: p.id,
    nama: p.nama,
    jenisKelamin: jenisKelaminLabel[p.jenisKelamin],
    umur: `${hitungUmur(p.tanggalLahir)} th`,
    agama: agamaLabel[p.agama],
    rtRw: `${p.alamat.rt}/${p.alamat.rw}`,
    keterangan: statusKependudukanLabel[p.statusKependudukan],
    keteranganTone: KETERANGAN_TONE[p.statusKependudukan],
  };
}

/** Satu pasangan label–nilai pada kartu detail. */
export interface DetailField {
  label: string;
  value: string;
}

/** Kartu detail satu penduduk, sudah dalam bentuk teks. */
export interface PendudukDetailView {
  nama: string;
  hubungan: string;
  fields: DetailField[];
  alamat: string;
}

export function toPendudukDetail(p: Penduduk): PendudukDetailView {
  const { alamat } = p;
  return {
    nama: p.nama,
    hubungan: statusHubunganLabel[p.statusHubunganKeluarga],
    fields: [
      { label: 'Jenis Kelamin', value: jenisKelaminLabel[p.jenisKelamin] },
      {
        label: 'Tempat, Tgl Lahir',
        value: `${p.tempatLahir}, ${formatTanggal(p.tanggalLahir)}`,
      },
      { label: 'Umur', value: `${hitungUmur(p.tanggalLahir)} tahun` },
      { label: 'Agama', value: agamaLabel[p.agama] },
      {
        label: 'Status Perkawinan',
        value: statusPerkawinanLabel[p.statusPerkawinan],
      },
      { label: 'Pendidikan', value: pendidikanLabel[p.pendidikan] },
      { label: 'Pekerjaan', value: p.pekerjaan },
      { label: 'Gol. Darah', value: golonganDarahLabel[p.golonganDarah] },
      { label: 'Kewarganegaraan', value: p.kewarganegaraan },
    ],
    alamat:
      `${alamat.jalan}, RT ${alamat.rt}/RW ${alamat.rw}, Desa ${alamat.desa}, ` +
      `Kec. ${alamat.kecamatan}, ${alamat.kabupaten}, ${alamat.provinsi} ${alamat.kodePos}`,
  };
}
