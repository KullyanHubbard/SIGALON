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
    const update = () => {
      const sekarang = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(new Date());
      setJam((prev) => (prev !== sekarang ? sekarang : prev));
    };

    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-brand-600 bg-brand-700 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm transition-colors sm:text-xs',
        className,
      )}
      aria-label={`Status: Portal Resmi Aktif pada ${jam} WIB`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
      </span>
      <span className="whitespace-nowrap font-bold text-white">
        Portal Resmi Aktif
      </span>
      <span className="text-brand-300">|</span>
      <span className="whitespace-nowrap font-semibold tabular-nums text-white">
        {jam} WIB
      </span>
    </div>
  );
}
