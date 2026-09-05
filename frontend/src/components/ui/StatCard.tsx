import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: string | number;
  icon: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'flex items-center gap-3 p-3 sm:gap-4 sm:p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 motion-reduce:hover:translate-y-0',
        className,
      )}
    >
      <img
        src={icon}
        alt=""
        width={144}
        height={144}
        loading="lazy"
        decoding="async"
        className="h-9 w-9 shrink-0 sm:h-12 sm:w-12"
      />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-semibold text-slate-700 sm:whitespace-normal sm:text-sm sm:font-bold"
          title={label}
        >
          {label}
        </p>
        <p className="text-lg font-bold text-slate-900 sm:text-2xl">{value}</p>
      </div>
    </Card>
  );
}
