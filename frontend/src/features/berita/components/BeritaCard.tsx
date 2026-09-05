import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import type { Berita } from '../types';
import { bantuFotoUrl, formatTanggal, keRingkasan } from '../utils';

export function FotoBerita({
  berita,
  className,
}: {
  berita: Berita;
  className?: string;
}) {
  const src = bantuFotoUrl(berita.foto);
  if (src) {
    return (
      <img
        src={src}
        alt={berita.judul}
        className={cn('object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100',
        className,
      )}
      aria-hidden
    >
      <Newspaper className="h-8 w-8 text-slate-400" />
    </div>
  );
}

export function BeritaCard({ berita }: { berita: Berita }) {
  const pembuka = keRingkasan(berita.isi);

  return (
    <Link
      to={paths.beritaDetail(berita.slug)}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border-1 border-black bg-surface shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-brand-300 motion-reduce:hover:translate-y-0"
    >
      <div className="overflow-hidden">
        <FotoBerita
          berita={berita}
          className="h-36 sm:h-44 w-full transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-brand-600">
          {formatTanggal(berita.tanggalTerbit)}
        </p>
        <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-bold leading-snug text-slate-900 group-hover:text-brand-600">
          {berita.judul}
        </h3>
        {pembuka && (
          <p className="mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm text-slate-600">{pembuka}</p>
        )}
        <p className="mt-auto pt-2.5 sm:pt-4 text-[11px] sm:text-xs font-semibold text-slate-900">
          Oleh {berita.penulis}
        </p>
      </div>
    </Link>
  );
}

export function BeritaBarisRingkas({ berita }: { berita: Berita }) {
  return (
    <Link
      to={paths.beritaDetail(berita.slug)}
      className="focus-ring group flex gap-3 rounded-lg p-2 transition-all duration-150 ease-out hover:bg-slate-100/80 hover:translate-x-1 motion-reduce:hover:translate-x-0"
    >
      <div className="overflow-hidden rounded-md shrink-0">
        <FotoBerita
          berita={berita}
          className="h-16 w-20 transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
        />
      </div>
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-brand-600">
          {berita.judul}
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          {formatTanggal(berita.tanggalTerbit)}
        </p>
      </div>
    </Link>
  );
}
