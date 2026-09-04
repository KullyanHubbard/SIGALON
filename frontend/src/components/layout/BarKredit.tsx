import { KreditKkn } from '@/components/ui/KreditKkn';
import { AksesibilitasWidget } from './AksesibilitasWidget';
import { BadgeKunjungan } from './BadgeKunjungan';
import { TombolPengaduan } from './TombolPengaduan';
import { TombolTema } from './TombolTema';

export function BarKredit({ className }: { className?: string }) {
  return (
    <KreditKkn
      className={className}
      kiri={<BadgeKunjungan />}
      kanan={
        <div className="flex items-center gap-3">
          <TombolPengaduan />
          <AksesibilitasWidget />
          <TombolTema />
        </div>
      }
    />
  );
}
