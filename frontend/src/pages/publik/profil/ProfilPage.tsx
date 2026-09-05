import { WADAH } from '@/components/layout/wadah';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { usePadukuhan } from '@/hooks/use-padukuhan';
import { batasWilayah, paragrafSejarah } from '@/lib/padukuhan';
import { formatAngka } from '@/lib/utils';
import { BaganOrganisasi } from './components/BaganOrganisasi';
import { BarisKeterangan } from './components/BarisKeterangan';

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
          <div className="lg:col-span-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Sejarah & Gambaran Umum
            </h2>
            <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-700">
              {paragrafSejarah(padukuhan.sejarah).map((paragraf) => (
                <p key={paragraf.slice(0, 24)}>{paragraf}</p>
              ))}
            </div>
          </div>

          <Card className="h-fit">
            <CardHeader title="Data Wilayah" />
            <CardContent>
              <dl>
                <BarisKeterangan
                  label="Luas wilayah"
                  nilai={padukuhan.luasWilayah}
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
                        label="Total populasi"
                        nilai={`${formatAngka(data.totalPenduduk)} jiwa`}
                      />
                      <BarisKeterangan
                        label="Jumlah RW"
                        nilai={`${data.perRw.length} RW`}
                      />
                      <BarisKeterangan
                        label="Jumlah RT"
                        nilai={`${data.perRw.reduce((n, rw) => n + rw.perRt.length, 0)} RT`}
                      />
                    </>
                  )}
                </QueryBoundary>
                <BarisKeterangan label="Kalurahan" nilai={padukuhan.desa} />
                <BarisKeterangan
                  label="Kapanewon"
                  nilai={padukuhan.kapanewon}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-surface py-8 sm:py-12 lg:py-14">
        <div className={WADAH}>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Struktur Organisasi Padukuhan
          </h2>
          <div className="mt-5 sm:mt-8">
            <BaganOrganisasi />
          </div>
        </div>
      </section>

      <section className={`${WADAH} py-8 sm:py-12 lg:py-14`}>
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-slate-900">
          Peta & Letak Wilayah
        </h2>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PetaPadukuhan className="w-full aspect-[16/9] sm:aspect-[21/9] lg:aspect-auto lg:h-full min-h-[11rem] sm:min-h-[14rem] lg:min-h-full" />
          </div>

          <Card className="h-fit">
            <CardHeader
              title="Batas Wilayah"
              description="Wilayah yang berbatasan langsung"
            />
            <CardContent>
              <dl>
                {batasWilayah(padukuhan).map((b) => (
                  <BarisKeterangan
                    key={b.arah}
                    label={`Sebelah ${b.arah}`}
                    nilai={b.wilayah}
                  />
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
