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

type KeteranganTone = 'amber' | 'slate' | null;

const KETERANGAN_TONE: Record<StatusKependudukan, KeteranganTone> = {
  AKTIF: null,
  PINDAH: 'amber',
  MENINGGAL: 'slate',
};

export interface PendudukRow {
  id: string;
  nama: string;
  jenisKelamin: string;
  umur: string;
  agama: string;

  rtRw: string;

  keterangan: string;

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

export interface DetailField {
  label: string;
  value: string;
}

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
