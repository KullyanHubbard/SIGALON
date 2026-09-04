import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ikonKembali from '@/assets/back-navigasi.svg';
import { BarKredit } from '@/components/layout/BarKredit';
import { Logo } from '@/components/ui/Logo';
import { paths } from '@/routes/paths';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-surface px-4 py-4 sm:px-6">
        <Logo className="h-6" />
      </header>

      <div className="flex flex-1 flex-col px-4 py-8 sm:px-6">
        <div className="my-auto w-full max-w-lg self-center">
          {}
          <div className="rounded-2xl border-1 border-slate-200 bg-surface p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] sm:p-10">
            <Link
              to={paths.landing}
              className="focus-ring -ml-3 mb-2 inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-brand-700"
            >
              {}
              <span
                aria-hidden
                className="h-4 w-4 shrink-0 bg-current"
                style={{
                  mask: `url("${ikonKembali}") center / contain no-repeat`,
                  WebkitMask: `url("${ikonKembali}") center / contain no-repeat`,
                }}
              />
              Kembali
            </Link>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
              {description && (
                <p className="mt-1.5 text-sm text-slate-500">{description}</p>
              )}
            </div>

            {children}
          </div>
        </div>
      </div>

      {}
      <BarKredit className="min-h-20 shrink-0 px-4 py-2 sm:px-6" />
    </div>
  );
}
