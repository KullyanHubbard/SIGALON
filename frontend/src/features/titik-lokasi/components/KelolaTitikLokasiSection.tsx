import { useState } from 'react';
import {
  ExternalLink,
  Home,
  Landmark,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { KategoriTitik, TitikLokasi } from '../types';
import { dapatkanTemaTitik } from '../warna';
import {
  useHapusTitikLokasi,
  useTitikLokasiAdminList,
} from '../hooks/use-titik-lokasi';
import { DialogUbahTitikLokasi } from './DialogUbahTitikLokasi';

function IkonBadge({ item }: { item: TitikLokasi }) {
  const tema = dapatkanTemaTitik(item);
  const iconClass = cn('h-6 w-6 shrink-0 mt-0.5', tema.textIkon);

  switch (item.ikon) {
    case 'balai':
      return <Landmark className={iconClass} />;
    case 'ibadah':
      return <Home className={iconClass} />;
    case 'poskamling':
      return <Shield className={iconClass} />;
    case 'posyandu':
      return <Sparkles className={iconClass} />;
    case 'perangkat':
    default:
      return <UserCheck className={iconClass} />;
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
    <Card className="overflow-hidden">
      {/* Toolbar: Tab Kategori di kiri & Tombol Tambah di kanan */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b-1 border-black px-4 py-3 sm:px-6 sm:py-3.5 bg-white">
        {/* Tab Navigasi Kategori */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTabAktif('semua')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              tabAktif === 'semua'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'border-1 border-black bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            Semua Titik
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                tabAktif === 'semua'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-900',
              )}
            >
              {daftarTitik.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabAktif('fasilitas')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              tabAktif === 'fasilitas'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'border-1 border-black bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            Fasilitas Umum
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                tabAktif === 'fasilitas'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-900',
              )}
            >
              {jumlahFasilitas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabAktif('perangkat')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
              tabAktif === 'perangkat'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'border-1 border-black bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            Perangkat Desa
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                tabAktif === 'perangkat'
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200 text-slate-900',
              )}
            >
              {jumlahPerangkat}
            </span>
          </button>
        </div>

        {/* Tombol Tambah Titik Baru */}
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white px-3.5 py-2 text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Titik Baru</span>
        </button>
      </div>

      {isError && (
        <div className="p-4 sm:p-6 pb-0">
          <Alert tone="error">
            Gagal memuat daftar titik lokasi. Pastikan sambungan ke backend aktif.
          </Alert>
        </div>
      )}

      {/* Konten Daftar Titik Lokasi Langsung di Dalam Container (Tanpa Box Tambahan) */}
      {isLoading ? (
        <div className="py-16 text-center text-xs sm:text-sm text-slate-500">
          Memuat daftar titik lokasi…
        </div>
      ) : titikTerfilter.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <p className="text-sm font-medium text-slate-500">
            {tabAktif === 'fasilitas'
              ? 'Belum ada fasilitas umum'
              : tabAktif === 'perangkat'
                ? 'Belum ada perangkat desa'
                : 'Belum ada titik lokasi'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-black">
          {titikTerfilter.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-4.5 transition-colors hover:bg-slate-50/70"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <IkonBadge item={item} />
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.nama}
                    </span>
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-2xs',
                        dapatkanTemaTitik(item).bgBadge,
                      )}
                    >
                      {item.kategoriLabel}
                    </span>
                    {item.peran && (
                      <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider text-white">
                        {item.peran}
                      </span>
                    )}
                  </div>
                  {item.deskripsi && (
                    <p className="text-xs sm:text-sm font-medium text-slate-700 line-clamp-2 max-w-xl">
                      {item.deskripsi}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-600">
                    <span>
                      Koordinat:{' '}
                      <strong className="font-mono font-bold text-slate-900">
                        X {item.x}% / Y {item.y}%
                      </strong>
                    </span>
                    {item.googleMapsUrl && (
                      <a
                        href={item.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-brand-700 hover:text-brand-900 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Aksi Tombol Edit & Hapus yang Selaras & Seimbang */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => bukaUbah(item)}
                  className="inline-flex items-center justify-center rounded-lg border-1 border-black bg-white hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 text-slate-700 p-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Edit titik lokasi"
                  aria-label={`Edit ${item.nama}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => konfirmasiHapus(item.id, item.nama)}
                  disabled={hapusId === item.id}
                  className="inline-flex items-center justify-center rounded-lg border-1 border-black bg-white hover:bg-rose-50 hover:border-black hover:text-rose-600 text-rose-600 p-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
                  title="Hapus titik lokasi"
                  aria-label={`Hapus ${item.nama}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogUbahTitikLokasi
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        titik={titikDipilih}
      />
    </Card>
  );
}
