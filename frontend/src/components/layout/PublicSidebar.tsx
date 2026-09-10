import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import { paths } from '@/routes/paths';
import ikonBack from '@/assets/back-navigasi.svg';
import ikonClose from '@/assets/icons/nav/x-close.svg';

interface PublicSidebarProps {
  nav: ReactNode;

  open: boolean;
  onClose: () => void;
}

export function PublicSidebar({ nav, open, onClose }: PublicSidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full max-h-dvh min-h-0 w-72 sm:w-80 max-w-[85vw] flex-col border-r-1 border-black bg-surface transition-transform lg:static lg:z-auto lg:col-start-1 lg:row-start-1 lg:h-full lg:max-h-full lg:w-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {}
        <div className="flex h-20 shrink-0 flex-col justify-center border-b-1 border-black px-5">
          <div className="flex items-center justify-between">
            <Logo className="h-8" />
            <button
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
              onClick={onClose}
              aria-label="Tutup menu"
            >
              <span
                aria-hidden
                className="block h-5 w-5 bg-current"
                style={{
                  mask: `url("${ikonClose}") center / contain no-repeat`,
                  WebkitMask: `url("${ikonClose}") center / contain no-repeat`,
                }}
              />
            </button>
          </div>
        </div>

        {}
        <Link
          to={paths.landing}
          onClick={onClose}
          className="mx-3 mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-slate-900 transition-all duration-150 ease-out hover:bg-slate-100 hover:translate-x-1 motion-reduce:hover:translate-x-0"
        >
          <span
            aria-hidden
            className="block h-5 w-5 shrink-0 bg-current"
            style={{
              mask: `url("${ikonBack}") center / contain no-repeat`,
              WebkitMask: `url("${ikonBack}") center / contain no-repeat`,
            }}
          />
          Kembali ke Beranda
        </Link>

        {}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [webkit-overflow-scrolling:touch]"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button, a')) {
              onClose();
            }
          }}
        >
          {nav}
        </div>

        {}
        <p className="flex h-14 min-h-14 shrink-0 items-center border-t-1 border-black px-4 text-xs sm:text-sm text-slate-400 truncate">
          Portal Data Kependudukan Padukuhan
        </p>
      </aside>
    </>
  );
}
