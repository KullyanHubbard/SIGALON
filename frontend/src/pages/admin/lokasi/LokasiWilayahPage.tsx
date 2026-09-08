import { PageHeader } from '@/components/layout/PageHeader';
import { KelolaTitikLokasiSection } from '@/features/titik-lokasi';

export default function LokasiWilayahPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Lokasi Fasilitas dan Perangkat Desa" />

      <KelolaTitikLokasiSection />
    </div>
  );
}
