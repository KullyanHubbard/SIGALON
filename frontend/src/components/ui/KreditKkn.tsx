import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KreditKknProps {
  className?: string;

  kiri?: ReactNode;

  kanan?: ReactNode;
}

export function KreditKkn({ className, kiri, kanan }: KreditKknProps) {
  return (
    <footer
      className={cn(
        'sticky bottom-0 z-30 flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-surface px-4 py-3 text-xs font-medium text-slate-600 sm:flex-row sm:gap-3 sm:py-3',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
        {kiri}
        <div className="flex items-center gap-2 sm:hidden">{kanan}</div>
      </div>
      <p className="text-center text-xs text-slate-500 sm:flex-1">
        Dikembangkan oleh <span className="font-bold">Tim KKNM-29228 UNY</span>{' '}
        · {new Date().getFullYear()}
      </p>
      <div className="hidden sm:flex sm:items-center sm:gap-3">{kanan}</div>
    </footer>
  );
}
