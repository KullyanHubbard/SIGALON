import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useCountUp } from '@/hooks/use-count-up';
import { cn, formatAngka } from '@/lib/utils';

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
  const { numValue, suffix } = useMemo(() => {
    if (typeof value === 'number') {
      return { numValue: value, suffix: '' };
    }
    const clean = String(value).trim();
    const digitsOnly = clean.replace(/[^\d]/g, '');
    if (!digitsOnly) {
      return { numValue: null, suffix: clean };
    }
    // Ekstrak suffix teks bila ada (misal "jiwa", "%")
    const matchSuffix = clean.match(/[^\d.,\s].*$/);
    return {
      numValue: parseInt(digitsOnly, 10),
      suffix: matchSuffix ? ` ${matchSuffix[0]}` : '',
    };
  }, [value]);

  const { textRef } = useCountUp(numValue ?? 0, { suffix });

  return (
    <Card
      className={cn(
        'flex h-full items-center gap-3 p-3 sm:gap-4 sm:p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-black motion-reduce:hover:translate-y-0',
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
        className="h-9 w-9 shrink-0 sm:h-12 sm:w-12 transition-transform duration-200 group-hover:scale-105"
      />
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-semibold text-slate-700 sm:whitespace-normal sm:text-sm sm:font-bold"
          title={label}
        >
          {label}
        </p>
        <p className="text-lg font-bold text-slate-900 sm:text-2xl tabular-nums tracking-tight">
          {numValue !== null ? (
            <span ref={textRef}>
              {formatAngka(numValue)}{suffix}
            </span>
          ) : (
            value
          )}
        </p>
      </div>
    </Card>
  );
}

