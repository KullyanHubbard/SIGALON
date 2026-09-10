import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function BarisKeterangan({
  label,
  nilai,
  icon,
  className,
  badgeClass,
}: {
  label: string;
  nilai: string;
  icon?: ReactNode;
  borderClass?: string;
  nilaiClass?: string;
  className?: string;
  badgeClass?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2.5 sm:gap-3 rounded-lg border-1 border-black bg-white px-3 py-2 sm:px-3 sm:py-2.5',
        className,
      )}
    >
      <dt className="flex items-center gap-2.5 min-w-0 pr-1">
        {icon}
        <span className="truncate text-xs sm:text-sm font-semibold text-slate-900" title={label}>
          {label}
        </span>
      </dt>
      <dd className="shrink-0 max-w-[55%]">
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-md border-1 border-black bg-transparent px-2 sm:px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-900 tabular-nums text-right max-w-full',
            badgeClass,
          )}
          title={nilai}
        >
          <span className="truncate">{nilai}</span>
        </span>
      </dd>
    </div>
  );
}

