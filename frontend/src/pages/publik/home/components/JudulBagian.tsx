import type { ReactNode } from 'react';

export function JudulBagian({
  judul,
  deskripsi,
  aksi,
  className,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
}) {
  return (
    <div className="mb-4 sm:mb-8 flex flex-wrap items-end justify-between gap-3 sm:gap-4">
      <div>
        <h2
          className={`text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 ${className ?? ''}`}
        >
          {judul}
        </h2>
        {deskripsi && (
          <p className="mt-1 sm:mt-2 max-w-2xl text-xs sm:text-sm text-slate-600">{deskripsi}</p>
        )}
      </div>
      {aksi}
    </div>
  );
}
