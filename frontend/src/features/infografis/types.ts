import type { Distribusi } from '@/types/statistik';

export interface InfografisData {
  totalPenduduk: number;
  totalKepalaKeluarga: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  perAgama: Distribusi[];
  perKelompokUmur: Distribusi[];
  perPendidikan: Distribusi[];
  perStatusPerkawinan: Distribusi[];
  perDusun: Distribusi[];
}
