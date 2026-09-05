import { KreditKkn } from '@/components/ui/KreditKkn';
import { AksesibilitasWidget } from './AksesibilitasWidget';
import { BadgeKunjungan } from './BadgeKunjungan';
import { TombolPengaduan } from './TombolPengaduan';

export function BarKredit({ className }: { className?: string }) {
  return (
    <KreditKkn
      className={className}
      kiri={<BadgeKunjungan />}
      kanan={
        <div className="flex items-center gap-2 sm:gap-2.5">
          <TombolPengaduan />
          <AksesibilitasWidget />
        </div>
      }
    />
  );
}
