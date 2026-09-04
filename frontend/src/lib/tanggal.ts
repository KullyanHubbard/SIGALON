import { differenceInYears, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export function hitungUmur(tanggalLahirIso: string): number {
  return differenceInYears(new Date(), parseISO(tanggalLahirIso));
}

export function formatTanggal(iso: string): string {
  return format(parseISO(iso), 'd MMMM yyyy', { locale: localeId });
}

export function periodeBulanIni(): string {
  return format(new Date(), 'yyyy-MM');
}

export function labelPeriode(periode: string): string {
  return format(parseISO(`${periode}-01`), 'MMMM yyyy', { locale: localeId });
}

export function daftarPeriode(terawal: string, sampai: string): string[] {
  const hasil: string[] = [];
  let kursor = parseISO(`${sampai}-01`);
  const batas = parseISO(`${terawal}-01`);
  while (kursor >= batas) {
    hasil.push(format(kursor, 'yyyy-MM'));
    kursor = new Date(kursor.getFullYear(), kursor.getMonth() - 1, 1);
  }
  return hasil;
}

export function tanggalHariIni(): string {
  return format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });
}

export const NAMA_BULAN: string[] = (() => {
  const format = new Intl.DateTimeFormat('id-ID', { month: 'long' });
  return Array.from({ length: 12 }, (_, i) =>
    format.format(new Date(2000, i, 1)),
  );
})();

export interface TanggalTerpisah {
  tanggal: string;
  bulan: string;
  tahun: string;
}

export function keTanggalLahirIso(v: TanggalTerpisah): string | null {
  const t = Number(v.tanggal);
  const b = Number(v.bulan);
  const th = Number(v.tahun);
  if (!t || !b || !th) return null;
  const d = new Date(th, b - 1, t);

  if (d.getFullYear() !== th || d.getMonth() !== b - 1 || d.getDate() !== t) {
    return null;
  }
  if (d > new Date()) return null;
  return `${th}-${String(b).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
}

export function dariTanggalLahirIso(iso: string): TanggalTerpisah {
  const [tahun = '', bulan = '', tanggal = ''] = iso.split('-');
  return { tanggal: String(Number(tanggal) || ''), bulan, tahun };
}
