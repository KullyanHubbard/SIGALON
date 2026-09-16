import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BarisKeteranganProps {
  label: string;
  nilai: string;
  icon?: ReactNode;
  borderClass?: string;
  nilaiClass?: string;
  className?: string;
  badgeClass?: string;
  iconWrapperClass?: string;
  variant?: 'card' | 'list';
}

export function BarisKeterangan({
  label,
  nilai,
  icon,
  className,
  badgeClass,
  nilaiClass,
  iconWrapperClass,
  variant = 'card',
}: BarisKeteranganProps) {
  if (variant === 'list') {
    return (
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5',
          className,
        )}
      >
        <dt className="flex min-w-0 items-center gap-3 pr-2">
          {icon && (
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-2',
                iconWrapperClass,
              )}
            >
              {icon}
            </div>
          )}
          <span
            className="truncate text-xs font-medium text-slate-700 sm:text-sm"
            title={label}
          >
            {label}
          </span>
        </dt>
        <dd className="shrink-0 text-right">
          <span
            className={cn(
              'text-xs font-bold tabular-nums text-slate-900 sm:text-sm',
              nilaiClass,
            )}
            title={nilai}
          >
            {nilai}
          </span>
        </dd>
      </div>
    );
  }

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
