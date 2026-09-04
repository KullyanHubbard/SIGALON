import { PanelDistribusiCard } from '@/components/ui/PanelDistribusiCard';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { STAT_WARGA } from '@/lib/stat-warga';
import { toRincianRw } from './view-model';

export function RincianRwPanel({
  rw,
  rt,
  periode,
}: {
  rw: string;

  rt: string | null;

  periode: string;
}) {
  const { data, isLoading, isError } = useStatistikPublik(periode);
  const indukRw = data?.perRw.find((r) => r.label === rw);
  const rincian =
    rt === null ? indukRw : indukRw?.perRt.find((r) => r.label === rt);

  return (
    <div className="w-full">
      <QueryBoundary
        isLoading={isLoading}
        isError={isError}

        data={data ? (rincian ? toRincianRw(rincian) : null) : undefined}
        loadingLabel="Memuat statistik"
        errorMessage="Statistik belum bisa ditampilkan. Anda tetap bisa masuk."
        emptyTitle={`${rt ?? rw} tidak ditemukan`}
        emptyDescription="Kembali ke daftar semua RW."
      >
        {(vm) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {vm.stat.map((stat) => (
                <StatCard
                  key={stat.id}
                  value={stat.value}
                  {...STAT_WARGA[stat.id]}
                />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {vm.panels.map((panel) => (
                <PanelDistribusiCard key={panel.id} panel={panel} />
              ))}
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
