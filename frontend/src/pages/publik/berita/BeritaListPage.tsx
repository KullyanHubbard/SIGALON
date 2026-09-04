import { useState } from 'react';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { BeritaCard } from '@/features/berita/components/BeritaCard';
import { useBeritaList } from '@/features/berita/hooks/use-berita';
import { WADAH } from '@/components/layout/wadah';

const PER_HALAMAN = 6;

export default function BeritaListPage() {
  const { data, isLoading, isError } = useBeritaList();
  const [halaman, setHalaman] = useState(1);

  return (
    <div className="flex flex-col">
      <section className="bg-brand-950 py-14 text-white">
        <div className={WADAH}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            Berita
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Kabar & Kegiatan Warga
          </h1>
        </div>
      </section>

      <section className={`${WADAH} py-12`}>
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={data}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Memuat berita"
          errorMessage="Berita belum bisa ditampilkan."
          emptyTitle="Belum ada berita"
          emptyDescription="Kabar kegiatan padukuhan akan muncul di sini."
        >
          {(daftar) => {
            const totalHalaman = Math.ceil(daftar.length / PER_HALAMAN);
            const halamanAktif = Math.min(halaman, Math.max(1, totalHalaman));
            const awal = (halamanAktif - 1) * PER_HALAMAN;
            const daftarTampil = daftar.slice(awal, awal + PER_HALAMAN);

            return (
              <div className="flex flex-col gap-8">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {daftarTampil.map((b) => (
                    <BeritaCard key={b.id} berita={b} />
                  ))}
                </div>

                {totalHalaman > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-6">
                    <p className="text-sm text-slate-600">
                      Menampilkan{' '}
                      <span className="font-semibold text-slate-900">
                        {awal + 1}
                      </span>{' '}
                      –{' '}
                      <span className="font-semibold text-slate-900">
                        {Math.min(awal + PER_HALAMAN, daftar.length)}
                      </span>{' '}
                      dari{' '}
                      <span className="font-semibold text-slate-900">
                        {daftar.length}
                      </span>{' '}
                      berita
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setHalaman((h) => Math.max(1, h - 1))}
                        disabled={halamanAktif === 1}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>

                      <div className="flex items-center gap-1 px-2 text-sm font-semibold text-slate-800">
                        Halaman {halamanAktif} dari {totalHalaman}
                      </div>

                      <button
                        type="button"
                        onClick={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
                        disabled={halamanAktif === totalHalaman}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }}
        </QueryBoundary>
      </section>
    </div>
  );
}
