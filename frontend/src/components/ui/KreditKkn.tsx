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
        'sticky bottom-0 z-30 flex w-full flex-col items-center justify-between gap-2 border-t-1 border-black bg-surface px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-slate-600 sm:flex-row sm:gap-3 sm:py-2 sm:pb-2 [transform:translate3d(0,0,0)]',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
        {kiri}
        <div className="flex items-center gap-2 sm:hidden">{kanan}</div>
      </div>
      <p className="text-center text-[13px] sm:text-[15px] font-medium text-slate-600 sm:flex-1">
        Dikembangkan oleh{' '}
        <span className="font-bold text-slate-900">
          Tim KKNM-29228 UNY
        </span>{' '}
        · {new Date().getFullYear()}
      </p>
      <div className="hidden sm:flex sm:items-center sm:gap-2.5">{kanan}</div>
    </footer>
  );
}


