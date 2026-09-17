import {
  agamaLabel,
  pendidikanLabel,
  relabel,
  statusPerkawinanLabel,
} from '@/features/penduduk/labels';
import type { RincianRw } from '@/features/statistik-publik/types';
import { toStatWarga, type StatWarga } from '@/lib/stat-warga';
import type { Distribusi, PanelDistribusi } from '@/types/statistik';

export interface RincianRwViewModel {
  stat: StatWarga[];
  totalPenerimaBansos: number;
  totalBpnt: number;
  totalPkh: number;
  perBansos: Distribusi[];
  panels: PanelDistribusi[];
}

export function toRincianRw(rw: RincianRw): RincianRwViewModel {
  return {
    stat: toStatWarga(rw),
    totalPenerimaBansos: rw.totalPenerimaBansos ?? 0,
    totalBpnt: rw.totalBpnt ?? 0,
    totalPkh: rw.totalPkh ?? 0,
    perBansos: rw.perBansos ?? [],
    panels: [
      {
        id: 'umur',
        judul: 'Kelompok Umur',
        jenis: 'bar',
        data: rw.perKelompokUmur,
      },
      {
        id: 'pendidikan',
        judul: 'Tingkat Pendidikan',
        jenis: 'bar',
        data: relabel(rw.perPendidikan, pendidikanLabel),
      },
      ...(rw.perBansos && rw.perBansos.length > 0
        ? [
            {
              id: 'bansos',
              judul: 'Distribusi Program Bantuan Sosial',
              jenis: 'bar-vertical' as const,
              data: rw.perBansos,
              lebarPenuh: true,
            },
          ]
        : []),
      {
        id: 'agama',
        judul: 'Komposisi Agama',
        jenis: 'bar',
        data: relabel(rw.perAgama, agamaLabel),
      },
      {
        id: 'perkawinan',
        judul: 'Status Perkawinan',
        jenis: 'bar',
        data: relabel(rw.perStatusPerkawinan, statusPerkawinanLabel),
      },
    ],
  };
}
