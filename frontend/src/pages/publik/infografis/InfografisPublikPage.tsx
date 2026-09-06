import { PanelDistribusiCard } from '@/components/ui/PanelDistribusiCard';
import ikonKeluarga from '@/assets/icons/keluarga.png';
import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { usePadukuhan } from '@/hooks/use-padukuhan';
import { formatAngka } from '@/lib/utils';
import { toPanelDemografi } from './view-model';
import { WADAH } from '@/components/layout/wadah';

export default function InfografisPublikPage() {
  const padukuhan = usePadukuhan();
  const { data, isLoading, isError } = useStatistikPublik();

  return (
    <div className="flex flex-col">
      <section className="bg-brand-950 py-14 text-white">
        <div className={WADAH}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            Infografis
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Data {padukuhan.namaLengkap}
          </h1>
        </div>
      </section>

      <section className={`${WADAH} py-10`}>
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={data}
          loadingLabel="Memuat infografis"
          errorMessage="Infografis belum bisa ditampilkan."
        >
          {(statistik) => (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Penduduk"
                  value={formatAngka(statistik.totalPenduduk)}
                  icon={ikonPenduduk}
                />
                <StatCard
                  label="Jumlah Kartu Keluarga"
                  value={formatAngka(statistik.totalKepalaKeluarga)}
                  icon={ikonKeluarga}
                />
                <StatCard
                  label="Laki-laki"
                  value={formatAngka(statistik.totalLakiLaki)}
                  icon={ikonLakiLaki}
                />
                <StatCard
                  label="Perempuan"
                  value={formatAngka(statistik.totalPerempuan)}
                  icon={ikonPerempuan}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {toPanelDemografi(statistik).map((panel) => (
                  <PanelDistribusiCard key={panel.id} panel={panel} />
                ))}
              </div>
            </div>
          )}
        </QueryBoundary>
      </section>
    </div>
  );
}
