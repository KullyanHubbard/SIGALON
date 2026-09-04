import type { Distribusi } from '@/types/statistik';

export interface RincianRw {
  label: string;
  totalPenduduk: number;

  totalKepalaKeluarga: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  perKelompokUmur: Distribusi[];
  perPendidikan: Distribusi[];
  perAgama: Distribusi[];
  perStatusPerkawinan: Distribusi[];

  perRt: RincianRw[];
}

export interface StatistikPublik {
  periodeTerawal: string;
  totalPenduduk: number;
  totalLakiLaki: number;
  totalPerempuan: number;

  totalKepalaKeluarga: number;

  perPekerjaan: Distribusi[];

  perRw: RincianRw[];
}
