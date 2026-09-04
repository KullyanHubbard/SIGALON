import type { Distribusi } from '@/types/statistik';

export function LegendaDonut({
  data,
  warna,
}: {
  data: Distribusi[];
  warna: readonly string[];
}) {
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <ul className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {data.map((d, i) => (
        <li
          key={d.label}

          className="flex items-center gap-3 border-t border-slate-100 py-2 text-sm first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
        >
          {}
          <span
            className="h-3 w-3 shrink-0 rounded-full border-[3px]"
            style={{ borderColor: warna[i % warna.length] }}
            aria-hidden
          />
          {}
          <span className="truncate text-slate-600">{d.label}</span>
          <span className="ml-auto min-w-[2.5rem] text-right font-semibold tabular-nums text-slate-900">
            {d.value}
          </span>
          <span className="w-9 text-right text-xs tabular-nums text-slate-400">
            {total === 0 ? '—' : `${Math.round((d.value / total) * 100)}%`}
          </span>
        </li>
      ))}
    </ul>
  );
}
