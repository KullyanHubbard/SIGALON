import {
  agamaLabel,
  pendidikanLabel,
  relabel,
  statusPerkawinanLabel,
} from '@/features/penduduk/labels';
import type { InfografisData } from '@/features/infografis/types';
import type { PanelDistribusi } from '@/types/statistik';

export function toPanelInfografis(data: InfografisData): PanelDistribusi[] {
  return [
    {
      id: 'agama',
      judul: 'Komposisi Agama',
      deskripsi: 'Jumlah penduduk per agama',
      jenis: 'pie',
      data: relabel(data.perAgama, agamaLabel),
    },
    {
      id: 'umur',
      judul: 'Kelompok Umur',
      deskripsi: 'Sebaran penduduk berdasarkan usia',
      jenis: 'bar',
      data: data.perKelompokUmur,
    },
    {
      id: 'pendidikan',
      judul: 'Tingkat Pendidikan',
      deskripsi: 'Pendidikan terakhir penduduk',
      jenis: 'bar',
      data: relabel(data.perPendidikan, pendidikanLabel),
    },
    {
      id: 'perkawinan',
      judul: 'Status Perkawinan',
      deskripsi: 'Komposisi status perkawinan',
      jenis: 'pie',
      data: relabel(data.perStatusPerkawinan, statusPerkawinanLabel),
    },
    {
      id: 'dusun',
      judul: 'Sebaran per RW',
      deskripsi: 'Jumlah penduduk per Rukun Warga',
      jenis: 'bar',
      data: data.perDusun,
      lebarPenuh: true,
    },
  ];
}
