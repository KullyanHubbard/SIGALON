import { PageHeader } from '@/components/layout/PageHeader';
import { KelolaTitikLokasiSection } from '@/features/titik-lokasi';

export default function LokasiWilayahPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lokasi Fasilitas dan Perangkat Desa"
        description="Kelola titik koordinat hotspot interaktif untuk fasilitas umum (Masjid, Balai, Pos Ronda, Posyandu) dan kediaman perangkat desa (Dukuh, RW, RT) pada peta padukuhan."
      />

      <KelolaTitikLokasiSection />
    </div>
  );
}
