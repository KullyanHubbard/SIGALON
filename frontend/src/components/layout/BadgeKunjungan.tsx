import { Users } from 'lucide-react';
import { useKunjunganHariIni } from '@/features/kunjungan/hooks/use-kunjungan';
import { formatAngka } from '@/lib/utils';

export function BadgeKunjungan() {
  const jumlah = useKunjunganHariIni();
  if (jumlah === undefined) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-surface py-1 pl-2.5 pr-3 text-xs shadow-sm"
      aria-label={`${formatAngka(jumlah)} kunjungan hari ini`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
        <Users className="h-3.5 w-3.5" />
      </span>
      {}
      <span className="whitespace-nowrap">
        <span className="font-bold text-slate-900">{formatAngka(jumlah)}</span>
        <span className="ml-1 hidden text-slate-500 sm:inline">
          Kunjungan Hari Ini
        </span>
      </span>
    </div>
  );
}
