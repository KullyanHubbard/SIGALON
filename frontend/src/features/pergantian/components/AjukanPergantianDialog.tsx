import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PilihWarga } from '@/components/ui/PilihWarga';
import { useCariWarga } from '@/hooks/use-cari-warga';
import { useDebounce } from '@/hooks/use-debounce';
import { pesanError } from '@/lib/utils';
import type { WargaPilihan } from '@/lib/warga-api';
import { useAjukanPergantian } from '../hooks/use-pergantian';

interface AjukanPergantianDialogProps {
  jabatan: {
    kode: string;

    label: string;
    namaPemegang: string;
  } | null;
  onClose: () => void;
}

export function AjukanPergantianDialog({
  jabatan,
  onClose,
}: AjukanPergantianDialogProps) {
  const [cari, setCari] = useState('');
  const [terpilih, setTerpilih] = useState<WargaPilihan | null>(null);
  const debounced = useDebounce(cari);
  const { data: hasil, isFetching } = useCariWarga(debounced, jabatan?.kode);
  const ajukan = useAjukanPergantian();

  function tutup() {
    setCari('');
    setTerpilih(null);
    ajukan.reset();
    onClose();
  }

  function kirim() {
    if (!jabatan || !terpilih) return;
    ajukan.mutate(
      { jabatanKode: jabatan.kode, kandidatId: terpilih.id },
      { onSuccess: tutup },
    );
  }

  function kirimKosongkan() {
    if (!jabatan) return;
    ajukan.mutate(
      { jabatanKode: jabatan.kode, kandidatId: '' },
      { onSuccess: tutup },
    );
  }

  return (
    <Modal
      open={Boolean(jabatan)}
      onClose={tutup}
      title={
        jabatan?.label
          ? `Ajukan Pergantian ${jabatan.label}`
          : 'Ajukan Pergantian'
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Pemegang saat ini: <strong>{jabatan?.namaPemegang}</strong>.
        </p>

        <PilihWarga
          label="Cari warga pengganti"
          cari={cari}
          onCariChange={setCari}
          hasil={hasil}
          sedangMencari={isFetching}
          terpilih={terpilih}
          onPilih={setTerpilih}
        />

        {jabatan?.kode === 'LPM' && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-slate-700">
            <span>Ingin mencopot Ketua LPM tanpa memilih pengganti?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={ajukan.isPending}
              onClick={kirimKosongkan}
            >
              Ajukan Pengosongan
            </Button>
          </div>
        )}

        {ajukan.error && (
          <Alert tone="error">
            {pesanError(ajukan.error, 'Gagal mengajukan pergantian.')}
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={tutup}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={!terpilih}
            isLoading={ajukan.isPending}
            onClick={kirim}
          >
            Ajukan{terpilih ? ` ${terpilih.nama}` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
