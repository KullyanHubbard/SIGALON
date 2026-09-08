import { useState } from 'react';
import {
  Building2,
  ExternalLink,
  Home,
  Landmark,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { KategoriTitik, TitikLokasi } from '../types';
import {
  useHapusTitikLokasi,
  useTitikLokasiAdminList,
} from '../hooks/use-titik-lokasi';
import { DialogUbahTitikLokasi } from './DialogUbahTitikLokasi';

function IkonBadge({ jenis }: { jenis: string }) {
  switch (jenis) {
    case 'balai':
      return <Landmark className="h-4 w-4 text-amber-600" />;
    case 'ibadah':
      return <Home className="h-4 w-4 text-emerald-600" />;
    case 'poskamling':
      return <Shield className="h-4 w-4 text-blue-600" />;
    case 'posyandu':
      return <Sparkles className="h-4 w-4 text-rose-600" />;
    case 'perangkat':
    default:
      return <UserCheck className="h-4 w-4 text-purple-600" />;
  }
}

export function KelolaTitikLokasiSection() {
  const { data: daftarTitik = [], isLoading, isError } = useTitikLokasiAdminList();
  const hapusMutasi = useHapusTitikLokasi();

  const [tabAktif, setTabAktif] = useState<'semua' | KategoriTitik>('semua');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [titikDipilih, setTitikDipilih] = useState<TitikLokasi | null>(null);
  const [hapusId, setHapusId] = useState<string | null>(null);

  const titikTerfilter = daftarTitik.filter((t) => {
    if (tabAktif === 'semua') return true;
    return t.kategori === tabAktif;
  });

  const jumlahFasilitas = daftarTitik.filter((t) => t.kategori === 'fasilitas').length;
  const jumlahPerangkat = daftarTitik.filter((t) => t.kategori === 'perangkat').length;

  const bukaTambah = () => {
    setTitikDipilih(null);
    setDialogOpen(true);
  };

  const bukaUbah = (titik: TitikLokasi) => {
    setTitikDipilih(titik);
    setDialogOpen(true);
  };

  const konfirmasiHapus = async (id: string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus titik lokasi "${nama}"?`)) {
      setHapusId(id);
      try {
        await hapusMutasi.mutateAsync(id);
      } finally {
        setHapusId(null);
      }
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader
        title="Daftar Titik Koordinat Peta"
        description="Daftar hotspot fasilitas umum dan kediaman perangkat desa yang tampil pada peta interaktif."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={bukaTambah}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Titik Baru</span>
          </Button>
        }
      />

      <CardContent className="space-y-4">
        {isError && (
          <Alert tone="error">
            Gagal memuat daftar titik lokasi. Pastikan sambungan ke backend aktif.
          </Alert>
        )}

        {/* Tab Navigasi Kategori */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setTabAktif('semua')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              tabAktif === 'semua'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
            )}
          >
            Semua Titik
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 py-0.2 text-[10px]',
                tabAktif === 'semua'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700',
              )}
            >
              {daftarTitik.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabAktif('fasilitas')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              tabAktif === 'fasilitas'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
            )}
          >
            <Building2 className="h-3.5 w-3.5" />
            Fasilitas Umum
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 py-0.2 text-[10px]',
                tabAktif === 'fasilitas'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700',
              )}
            >
              {jumlahFasilitas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabAktif('perangkat')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              tabAktif === 'perangkat'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900',
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Perangkat Desa (Dukuh, RW, RT)
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 py-0.2 text-[10px]',
                tabAktif === 'perangkat'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700',
              )}
            >
              {jumlahPerangkat}
            </span>
          </button>
        </div>

        {/* Tabel / Daftar Titik Lokasi */}
        {isLoading ? (
          <p className="py-6 text-center text-xs sm:text-sm text-slate-500">
            Memuat daftar titik lokasi…
          </p>
        ) : titikTerfilter.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 px-4 text-center">
            <MapPin className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {tabAktif === 'perangkat'
                ? 'Belum ada kediaman perangkat desa (Dukuh, RW, RT) yang ditambahkan.'
                : 'Belum ada data titik lokasi untuk kategori ini.'}
            </p>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              {tabAktif === 'perangkat'
                ? 'Data perangkat desa tidak di-hardcode. Gunakan tombol "Tambah Titik Baru" jika pamong/perangkat desa sudah menjabat untuk memplot titik kediamannya di peta.'
                : 'Gunakan tombol di bawah untuk menambahkan titik lokasi baru pada peta.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={bukaTambah}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Titik Sekarang</span>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
            {titikTerfilter.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/60 shadow-xs">
                    <IkonBadge jenis={item.ikon} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-sm">
                        {item.nama}
                      </span>
                      <span
                        className={cn(
                          'rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          item.kategori === 'perangkat'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200',
                        )}
                      >
                        {item.kategoriLabel}
                      </span>
                      {item.peran && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-600 border border-slate-200">
                          {item.peran}
                        </span>
                      )}
                    </div>
                    {item.deskripsi && (
                      <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                        {item.deskripsi}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/60">
                        Peta: X {item.x}% / Y {item.y}%
                      </span>
                      {item.googleMapsUrl && (
                        <a
                          href={item.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-brand-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bukaUbah(item)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <MapPin className="h-3.5 w-3.5 text-brand-600" />
                    <span>Atur Koordinat & Info</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => konfirmasiHapus(item.id, item.nama)}
                    disabled={hapusId === item.id}
                    className="p-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                    title="Hapus titik"
                    aria-label={`Hapus ${item.nama}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <DialogUbahTitikLokasi
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        titik={titikDipilih}
      />
    </Card>
  );
}
