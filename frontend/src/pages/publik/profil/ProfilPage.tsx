import { ExternalLink } from 'lucide-react';
import { WADAH } from '@/components/layout/wadah';
import { PetaOpenStreetMap } from '@/components/ui/PetaOpenStreetMap';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { usePadukuhan } from '@/hooks/use-padukuhan';
import { batasWilayah, paragrafSejarah } from '@/lib/padukuhan';
import { formatAngka } from '@/lib/utils';
import { BaganOrganisasi } from './components/BaganOrganisasi';
import { BarisKeterangan } from './components/BarisKeterangan';

function IkonLuasSolid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.362 7.587a15.828 15.828 0 003.031 2.198l.018.008.006.003.002.001.001.001zM10 12a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function IkonPopulasiSolid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.813.813 0 01-.63 1.052H14.5z" />
    </svg>
  );
}

function IkonRwSolid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V5zm1 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H8zm3-4a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V5zm1 4a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1h-1z" clipRule="evenodd" />
    </svg>
  );
}

function IkonRtSolid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
  );
}

function IkonKalurahanSolid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M10 1.5L1.5 6h17L10 1.5zM3 7.5h2v8H3v-8zm5 0h2v8H8v-8zm5 0h2v8h-2v-8zM1.5 17h17v2h-17v-2z" />
    </svg>
  );
}

function IkonKapanewonSolid({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.5 2.75a.75.75 0 00-1.5 0v14.5a.75.75 0 001.5 0v-4.392l1.657-.331c1.594-.319 3.04.148 4.417.588 1.408.45 2.89.924 4.676.57l.6-.12A.75.75 0 0015 13V4.25a.75.75 0 00-.594-.735l-.6-.12c-1.594-.319-3.04.148-4.417.588-1.408.45-2.89.924-4.676.57l-.713-.143V2.75z" />
    </svg>
  );
}

export default function ProfilPage() {
  const statistik = useStatistikPublik();
  const padukuhan = usePadukuhan();

  return (
    <div className="flex flex-col">
      <section className="bg-brand-950 py-8 sm:py-12 lg:py-14 text-white">
        <div className={WADAH}>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            Profil
          </p>
          <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold">
            {padukuhan.namaLengkap}
          </h1>
        </div>
      </section>

      <section className={`${WADAH} py-8 sm:py-12 lg:py-14`}>
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          <div data-apple-fade className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Sejarah & Gambaran Umum
            </h2>
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-700">
              {paragrafSejarah(padukuhan.sejarah).map((paragraf) => (
                <p key={paragraf.slice(0, 24)}>{paragraf}</p>
              ))}
            </div>
          </div>

          <div data-apple-fade data-apple-delay="1">
            <div className="h-fit overflow-hidden rounded-xl border-1 border-black bg-white shadow-sm">
              <div className="bg-[#7C3AED] px-4 py-3.5 sm:px-6 sm:py-4">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Data Wilayah
                </h3>
              </div>
              <div className="px-4 py-3 sm:px-5 sm:py-4">
                <dl>
                  <BarisKeterangan
                    icon={<IkonLuasSolid className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                    label="Luas wilayah"
                    nilai={padukuhan.luasWilayah}
                    borderClass="border-[#F3E8FF]"
                    nilaiClass="text-[#4C1D95]"
                  />
                  <QueryBoundary
                    isLoading={statistik.isLoading}
                    isError={statistik.isError}
                    data={statistik.data}
                    loadingLabel="Memuat"
                    errorMessage="Jumlah penduduk belum bisa ditampilkan."
                  >
                    {(data) => (
                      <>
                        <BarisKeterangan
                          icon={<IkonPopulasiSolid className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                          label="Total populasi"
                          nilai={`${formatAngka(data.totalPenduduk)} jiwa`}
                          borderClass="border-[#F3E8FF]"
                          nilaiClass="text-[#4C1D95]"
                        />
                        <BarisKeterangan
                          icon={<IkonRwSolid className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                          label="Jumlah RW"
                          nilai={`${data.perRw.length} RW`}
                          borderClass="border-[#F3E8FF]"
                          nilaiClass="text-[#4C1D95]"
                        />
                        <BarisKeterangan
                          icon={<IkonRtSolid className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                          label="Jumlah RT"
                          nilai={`${data.perRw.reduce((n, rw) => n + rw.perRt.length, 0)} RT`}
                          borderClass="border-[#F3E8FF]"
                          nilaiClass="text-[#4C1D95]"
                        />
                      </>
                    )}
                  </QueryBoundary>
                  <BarisKeterangan
                    icon={<IkonKalurahanSolid className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                    label="Kalurahan"
                    nilai={padukuhan.desa}
                    borderClass="border-[#F3E8FF]"
                    nilaiClass="text-[#4C1D95]"
                  />
                  <BarisKeterangan
                    icon={<IkonKapanewonSolid className="h-4 w-4 shrink-0 text-[#7C3AED]" />}
                    label="Kapanewon"
                    nilai={padukuhan.kapanewon}
                    borderClass="border-[#F3E8FF]"
                    nilaiClass="text-[#4C1D95]"
                  />
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-surface py-8 sm:py-12 lg:py-14">
        <div className={WADAH}>
          <div data-apple-fade>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Struktur Organisasi Padukuhan
            </h2>
          </div>
          <div data-apple-fade className="mt-5 sm:mt-8">
            <BaganOrganisasi />
          </div>
        </div>
      </section>

      <section className={`${WADAH} py-8 sm:py-12 lg:py-14`}>
        <div data-apple-fade>
          <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-slate-900">
            Peta & Letak Wilayah
          </h2>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          <div data-apple-fade className="lg:col-span-2">
            <PetaOpenStreetMap className="w-full h-full min-h-[440px]" />
          </div>

            <div data-apple-fade data-apple-delay="1">
              <div className="h-fit overflow-hidden rounded-xl border-1 border-black bg-white shadow-sm">
                <div className="bg-[#7C3AED] px-4 py-3.5 sm:px-6 sm:py-4">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Batas Wilayah
                  </h3>
                </div>
                <div className="px-4 py-3 sm:px-5 sm:py-4">
                  <dl>
                    {batasWilayah(padukuhan).map((b) => (
                      <BarisKeterangan
                        key={b.arah}
                        label={`Sebelah ${b.arah}`}
                        nilai={b.wilayah}
                        borderClass="border-[#F3E8FF]"
                        nilaiClass="text-[#4C1D95]"
                      />
                    ))}
                  </dl>
                  <div className="mt-4 pt-3.5 border-t border-[#F3E8FF]">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=-7.656826,110.363111"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#FACC15] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#4C1D95] shadow-sm transition-all hover:bg-yellow-400 hover:shadow-md active:scale-[0.98]"
                    >
                      <span>Buka di Google Maps</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
