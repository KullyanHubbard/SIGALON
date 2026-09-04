import type { CSSProperties } from 'react';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStrukturOrganisasi } from '@/features/struktur-organisasi/hooks/use-struktur-organisasi';
import type { RwPublik } from '@/features/struktur-organisasi/types';
import { cn } from '@/lib/utils';

const GARIS = 'bg-slate-400';

const PANAH =
  'h-1.5 w-2.5 bg-slate-400 [clip-path:polygon(50%_100%,0_0,100%_0)]';

function Kotak({
  label,
  nama,
  utama = false,
  putus = false,
}: {
  label: string;

  nama: string | null;

  utama?: boolean;

  putus?: boolean;
}) {
  const kosong = !nama || nama.trim() === '';

  return (
    <div
      className={cn(
        'flex min-h-24 w-full flex-col bg-surface p-1',
        'border-1',
        putus && 'border-dashed',
        utama ? 'border-slate-900' : 'border-slate-400',
      )}
    >
      <div
        className={cn(
          'flex flex-1 flex-col justify-center border-1 px-3 py-2.5 text-center',
          putus && 'border-dashed',
          utama ? 'border-slate-900' : 'border-slate-300',
        )}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-700">
          {label}
        </p>
        {}
        <p
          className={cn(
            'mt-0.5 text-sm font-bold uppercase leading-snug',
            kosong ? 'italic text-slate-400' : 'text-slate-900',
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
      className="grid w-full gap-x-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
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
      <Kotak label={`RW ${wilayah.nomor}`} nama={wilayah.nama} />
      <Tiang />
      <PalangKeAnak jumlah={wilayah.rt.length} />
      <div
        className="grid w-full gap-x-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        style={{ '--n': wilayah.rt.length } as CSSProperties}
      >
        {wilayah.rt.map((rt) => (
          <Kotak key={rt.nomor} label={`RT ${rt.nomor}`} nama={rt.nama} />
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
        <figure className="m-0">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            <div className="w-64">
              <Kotak label="Dukuh" nama={struktur.dukuh} utama />
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
                className="block h-5 border-l-1 border-dashed border-slate-400 md:hidden"
              />
              <div className="hidden flex-1 md:block" />
              <div className="flex w-full items-center md:w-1/2">
                <span
                  aria-hidden
                  className="hidden flex-1 border-t-1 border-dashed border-slate-400 md:block"
                />
                <div className="w-56">
                  <Kotak label="Ketua LPM" nama={struktur.lpm} putus />
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
                  className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
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
