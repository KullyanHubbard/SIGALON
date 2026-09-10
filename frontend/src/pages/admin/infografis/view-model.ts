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
      jenis: 'pie',
      data: relabel(data.perAgama, agamaLabel),
    },
    {
      id: 'umur',
      judul: 'Kelompok Umur',
      jenis: 'bar',
      data: data.perKelompokUmur,
    },
    {
      id: 'pendidikan',
      judul: 'Tingkat Pendidikan',
      jenis: 'bar',
      data: relabel(data.perPendidikan, pendidikanLabel),
    },
    {
      id: 'perkawinan',
      judul: 'Status Perkawinan',
      jenis: 'pie',
      data: relabel(data.perStatusPerkawinan, statusPerkawinanLabel),
    },
    {
      id: 'dusun',
      judul: 'Sebaran per RW',
      jenis: 'bar',
      data: data.perDusun,
      lebarPenuh: true,
    },
  ];
}
