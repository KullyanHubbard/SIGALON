import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border-1 border-black bg-surface shadow-sm',
          className,
        )}
        {...props}
      />
    );
  },
);


export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 border-b-1 border-black px-4 py-3.5 sm:px-6 sm:py-5">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate sm:whitespace-normal">{title}</h3>
        {description && (
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-4 py-3 sm:px-5 sm:py-4', className)} {...props} />;
}
