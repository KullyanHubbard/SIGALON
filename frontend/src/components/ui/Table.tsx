import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Table({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-sm', className)}
        {...props}
      />
    </div>
  );
}

export function Th({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        // `border-b-1`, bukan `border-b`: `borderWidth.DEFAULT` di
        // tailwind.config di-setel 4px, dan garis 4px di tiap baris membuat
        // tabel terbaca sebagai kotak-kotak, bukan daftar.
        'whitespace-nowrap border-b-1 border-slate-200 bg-slate-50/80 px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500',
        className,
      )}
      {...props}
    />
  );
}

export function Td({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'whitespace-nowrap border-b-1 border-slate-100 px-6 py-3.5 text-sm text-slate-700',
        className,
      )}
      {...props}
    />
  );
}
