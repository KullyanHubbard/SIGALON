import { cn } from '@/lib/utils';
import type { PanelDistribusi } from '@/types/statistik';
import { Card, CardContent, CardHeader } from './Card';
import { DistribusiBarChart } from './DistribusiBarChart';
import { DistribusiPieChart } from './DistribusiPieChart';

export function PanelDistribusiCard({
  panel,
  className,
}: {
  panel: PanelDistribusi;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        panel.lebarPenuh && 'lg:col-span-2',
        className,
      )}
    >
      <CardHeader title={panel.judul} description={panel.deskripsi} />
      <CardContent className="flex flex-1 flex-col justify-center">
        {panel.jenis === 'pie' ? (
          <DistribusiPieChart data={panel.data} />
        ) : (
          <DistribusiBarChart data={panel.data} />
        )}
      </CardContent>
    </Card>
  );
}
