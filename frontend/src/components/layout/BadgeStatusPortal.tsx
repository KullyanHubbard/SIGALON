import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function BadgeStatusPortal({ className }: { className?: string }) {
  const [jam, setJam] = useState(() => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(new Date());
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setJam(
        new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        }).format(new Date()),
      );
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-brand-700 border border-brand-600 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white shadow-sm transition-colors',
        className,
      )}
      aria-label={`Status: Portal Resmi Aktif pada ${jam} WIB`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      <span className="font-bold text-white whitespace-nowrap">
        Portal Resmi Aktif
      </span>
      <span className="text-brand-300">|</span>
      <span className="tabular-nums font-semibold text-white whitespace-nowrap">
        {jam} WIB
      </span>
    </div>
  );
}
