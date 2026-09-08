import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import { PageHeader } from '@/components/layout/PageHeader';
import { BeritaFormDialog } from '@/features/berita/components/BeritaFormDialog';
import { FotoBerita } from '@/features/berita/components/BeritaCard';
import {
  useBeritaList,
  useHapusBerita,
} from '@/features/berita/hooks/use-berita';
import type { Berita } from '@/features/berita/types';
import { formatTanggal } from '@/features/berita/utils';
import { pesanError } from '@/lib/utils';
import { paths } from '@/routes/paths';

export default function KelolaBeritaPage() {
  const { data, isLoading, isError } = useBeritaList();
  const hapus = useHapusBerita();
  const [target, setTarget] = useState<Berita | 'baru' | null>(null);

  const onHapus = (berita: Berita) => {
    if (
      window.confirm(
        `Hapus berita "${berita.judul}"? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      hapus.mutate(berita.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Berita"
        description="Tulis dan sunting kabar kegiatan padukuhan."
        action={<Button onClick={() => setTarget('baru')}>Tulis Berita</Button>}
      />

      {hapus.isError && (
        <Alert tone="error">
          {pesanError(hapus.error, 'Berita gagal dihapus.')}
        </Alert>
      )}

      <Card>
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={data}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Memuat berita"
          errorMessage="Daftar berita belum bisa ditampilkan."
          emptyTitle="Belum ada berita"
          emptyDescription="Mulai dengan menekan Tulis Berita."
        >
          {(daftar) => (
            <Table className="min-w-[540px]">
              <thead>
                <tr>
                  <Th>Berita</Th>
                  <Th>Tanggal Kejadian</Th>
                  <Th>Penulis</Th>
                  <Th className="text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((berita) => (
                  <tr key={berita.id}>
                    <Td className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <FotoBerita
                          berita={berita}
                          className="h-12 w-16 shrink-0 rounded-md"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {berita.judul}
                          </p>
                          <Link
                            to={paths.beritaDetail(berita.slug)}
                            className="text-xs text-brand-700 hover:underline"
                          >
                            /berita/{berita.slug}
                          </Link>
                        </div>
                      </div>
                    </Td>
                    <Td>{formatTanggal(berita.tanggalTerbit)}</Td>
                    <Td>{berita.penulis}</Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTarget(berita)}
                          className="inline-flex items-center justify-center rounded-lg border-1 border-slate-300 bg-white hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 text-slate-700 p-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                          title="Sunting berita"
                          aria-label={`Sunting ${berita.judul}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onHapus(berita)}
                          disabled={
                            hapus.isPending && hapus.variables === berita.id
                          }
                          className="inline-flex items-center justify-center rounded-lg border-1 border-slate-300 bg-white hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 text-rose-600 p-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
                          title="Hapus berita"
                          aria-label={`Hapus ${berita.judul}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </QueryBoundary>
      </Card>

      <BeritaFormDialog target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
