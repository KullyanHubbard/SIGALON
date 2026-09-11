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
        'flex items-center justify-between gap-2.5 rounded-lg border-1 border-black bg-white px-3 py-2 sm:gap-3 sm:px-3 sm:py-2.5',
        className,
      )}
    >
      <dt className="flex min-w-0 items-center gap-2.5 pr-1">
        {icon}
        <span
          className="truncate text-xs font-semibold text-slate-900 sm:text-sm"
          title={label}
        >
          {label}
        </span>
      </dt>
      <dd className="max-w-[55%] shrink-0">
        <span
          className={cn(
            'inline-flex max-w-full items-center justify-center rounded-md border-1 border-black bg-transparent px-2 py-1 text-right text-xs font-bold tabular-nums text-slate-900 sm:px-2.5 sm:text-sm',
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
