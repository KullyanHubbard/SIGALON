import { PageHeader } from '@/components/layout/PageHeader';
import { DaftarPenduduk } from '@/features/penduduk/components/DaftarPenduduk';

export default function PendudukPage() {
  return (
    <div>
      <PageHeader title="Data Penduduk" />
      <DaftarPenduduk />
    </div>
  );
}
