import type { CSSProperties } from 'react';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStrukturOrganisasi } from '@/features/struktur-organisasi/hooks/use-struktur-organisasi';
import type { RwPublik } from '@/features/struktur-organisasi/types';
import { cn } from '@/lib/utils';

const GARIS = 'bg-slate-900';

const PANAH =
  'h-1.5 w-2.5 bg-slate-900 [clip-path:polygon(50%_100%,0_0,100%_0)]';

type TingkatKotak = 'dukuh' | 'lpm' | 'rw' | 'rt';

function Kotak({
  label,
  nama,
  tingkat = 'rt',
}: {
  label: string;
  nama: string | null;
  tingkat?: TingkatKotak;
}) {
  const kosong = !nama || nama.trim() === '';

  const gayaTingkat = {
    dukuh: {
      kartu: 'rounded-xl border-1 border-brand-900 shadow-sm',
      header: 'bg-brand-900 text-white py-1.5 sm:py-2 px-3 text-[0.7rem] sm:text-xs tracking-wider',
      nama: 'text-xs sm:text-sm font-bold text-slate-900',
    },
    lpm: {
      kartu: 'rounded-xl border-1 border-brand-900 shadow-sm',
      header: 'bg-brand-900 text-white py-1.5 px-3 text-[0.68rem] sm:text-xs tracking-wider',
      nama: 'text-xs sm:text-sm font-bold text-slate-900',
    },
    rw: {
      kartu: 'rounded-xl border-1 border-brand-900 shadow-sm',
      header: 'bg-brand-900 text-white py-1.5 px-2.5 sm:px-3 text-[0.68rem] sm:text-[0.72rem] tracking-wider',
      nama: 'text-xs sm:text-sm font-bold text-slate-900',
    },
    rt: {
      kartu: 'rounded-lg border-1 border-brand-900 shadow-sm',
      header: 'bg-brand-900 text-white py-1 px-1.5 sm:px-2 text-[0.62rem] sm:text-[0.68rem] tracking-wider',
      nama: 'text-[0.7rem] sm:text-xs font-semibold text-slate-900',
    },
  }[tingkat];

  return (
    <div
      className={cn(
        'flex min-h-16 sm:min-h-20 w-full flex-col overflow-hidden bg-surface transition-shadow',
        gayaTingkat.kartu,
      )}
    >
      <div className={cn('text-center font-bold uppercase', gayaTingkat.header)}>
        {label}
      </div>
      <div className="flex flex-1 items-center justify-center p-2 sm:p-2.5 text-center">
        <p
          className={cn(
            'uppercase leading-snug break-words',
            kosong
              ? 'text-[0.68rem] sm:text-xs italic text-slate-400 font-normal'
              : gayaTingkat.nama,
          )}
        >
          {kosong ? 'Belum diisi' : nama}
        </p>
      </div>
    </div>
  );
}

function Tiang({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('block h-6 w-px', GARIS, className)} />
  );
}

function TiangPanah({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('flex flex-col items-center', className)}>
      <span className={cn('block h-6 w-px', GARIS)} />
      <span className={PANAH} />
    </span>
  );
}

function PalangKeAnak({ jumlah }: { jumlah: number }) {
  return (
    <div
      aria-hidden
      className="grid w-full gap-x-2 sm:gap-x-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
      style={{ '--n': jumlah } as CSSProperties}
    >
      {Array.from({ length: jumlah }, (_, i) => (
        <div key={i} className="relative h-8">
          <span
            className={cn(
              'absolute top-0 h-px',
              GARIS,
              i === 0 ? 'left-1/2' : '-left-2',
              i === jumlah - 1 ? 'right-1/2' : '-right-2',
            )}
          />
          <span
            className={cn(
              'absolute left-1/2 top-0 h-[calc(100%-0.375rem)] w-px',
              GARIS,
            )}
          />
          <span
            className={cn('absolute bottom-0 left-1/2 -translate-x-1/2', PANAH)}
          />
        </div>
      ))}
    </div>
  );
}

function GrupRw({ wilayah }: { wilayah: RwPublik }) {
  return (
    <div className="flex w-full flex-col items-center">
      <Kotak label={`RW ${wilayah.nomor}`} nama={wilayah.nama} tingkat="rw" />
      <Tiang />
      <PalangKeAnak jumlah={wilayah.rt.length} />
      <div
        className="grid w-full gap-x-2 sm:gap-x-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        style={{ '--n': wilayah.rt.length } as CSSProperties}
      >
        {wilayah.rt.map((rt) => (
          <Kotak key={rt.nomor} label={`RT ${rt.nomor}`} nama={rt.nama} tingkat="rt" />
        ))}
      </div>
    </div>
  );
}

export function BaganOrganisasi() {
  const { data, isLoading, isError } = useStrukturOrganisasi();

  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      data={data}
      loadingLabel="Memuat struktur organisasi"
      errorMessage="Struktur organisasi belum bisa ditampilkan."
    >
      {(struktur) => (
        <figure className="m-0 overflow-x-auto pb-2">
          <div className="mx-auto flex min-w-[280px] max-w-5xl flex-col items-center">
            <div className="w-48 sm:w-64">
              <Kotak label="Dukuh" nama={struktur.dukuh} tingkat="dukuh" />
            </div>

            {}
            <Tiang />
            <div className="relative flex w-full flex-col items-center md:flex-row md:justify-center">
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block',
                  GARIS,
                )}
              />
              <span
                aria-hidden
                className={cn('block h-5 w-px md:hidden', GARIS)}
              />
              <div className="hidden flex-1 md:block" />
              <div className="flex w-full items-center md:w-1/2">
                <span
                  aria-hidden
                  className={cn('hidden flex-1 h-px md:block', GARIS)}
                />
                <div className="w-44 sm:w-56">
                  <Kotak label="Ketua LPM" nama={struktur.lpm} tingkat="lpm" />
                </div>
                <span aria-hidden className="hidden flex-1 md:block" />
              </div>
            </div>
            {struktur.rw.length === 0 ? (
              <>
                <Tiang />
                <p className="max-w-xs text-center text-xs text-slate-400">
                  Data RW/RT belum diimpor.
                </p>
              </>
            ) : (
              <>
                <Tiang />

                <div className="hidden w-full md:block">
                  <PalangKeAnak jumlah={struktur.rw.length} />
                </div>

                <div
                  className="grid w-full grid-cols-1 gap-x-3 sm:gap-x-4 gap-y-3 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
                  style={{ '--n': struktur.rw.length } as CSSProperties}
                >
                  {struktur.rw.map((w) => (
                    <div key={w.nomor} className="flex flex-col items-center">
                      <TiangPanah className="md:hidden" />
                      <GrupRw wilayah={w} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </figure>
      )}
    </QueryBoundary>
  );
}
