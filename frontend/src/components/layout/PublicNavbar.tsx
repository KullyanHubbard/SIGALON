import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { AccountButton } from './AccountButton';

const TAUTAN = [
  { label: 'Beranda', to: paths.landing, end: true },
  { label: 'Profil Desa', to: paths.profil, end: true },
  { label: 'Infografis', to: paths.infografis, end: true },
  { label: 'Berita', to: paths.berita, end: false },
  { label: 'Statistik', to: paths.statistik, end: true },
];

const tautanClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3.5 py-2 text-sm transition-all duration-150 ease-out active:scale-95 motion-reduce:transition-none',
    isActive
      ? 'font-bold text-brand-700'
      : 'font-bold text-black hover:bg-slate-100 hover:text-brand-700',
  );

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to={paths.landing} aria-label="Beranda" className="shrink-0">
          <Logo className="h-8" />
        </NavLink>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {TAUTAN.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={tautanClass}>
              {t.label}
            </NavLink>
          ))}
        </nav>

        <AccountButton className="ml-auto hidden lg:ml-4 lg:flex" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md p-2 text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 lg:hidden"
          onClick={() => setOpen(false)}
        >
          {TAUTAN.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={tautanClass}>
              {t.label}
            </NavLink>
          ))}
          <AccountButton className="mt-2 justify-center" />
        </nav>
      )}
    </header>
  );
}
