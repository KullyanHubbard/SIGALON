export function BarisKeterangan({
  label,
  nilai,
}: {
  label: string;
  nilai: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 sm:gap-4 border-b border-slate-100 py-2.5 sm:py-3 last:border-b-0">
      <dt className="text-xs sm:text-sm font-medium text-slate-600">{label}</dt>
      <dd className="text-right text-xs sm:text-sm font-semibold text-slate-900">
        {nilai}
      </dd>
    </div>
  );
}
