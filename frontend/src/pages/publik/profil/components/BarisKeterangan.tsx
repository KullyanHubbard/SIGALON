import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function BarisKeterangan({
  label,
  nilai,
  icon,
  borderClass = 'border-slate-100',
  nilaiClass = 'text-slate-900',
}: {
  label: string;
  nilai: string;
  icon?: ReactNode;
  borderClass?: string;
  nilaiClass?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 sm:gap-4 border-b py-2.5 sm:py-3 last:border-b-0',
        borderClass,
      )}
    >
      <dt className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 min-w-0">
        {icon}
        <span className="truncate">{label}</span>
      </dt>
      <dd
        className={cn(
          'text-right text-xs sm:text-sm font-semibold shrink-0',
          nilaiClass,
        )}
      >
        {nilai}
      </dd>
    </div>
  );
}
