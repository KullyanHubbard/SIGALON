import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { labelWilayah } from '@/features/auth/wilayah';
import { RiwayatView } from '@/features/audit/components/RiwayatView';
import { useRiwayat } from '@/features/audit/hooks/use-audit';
import { toBarisRiwayat } from '@/features/audit/view-model';

export default function RiwayatPage() {
  const { user, isAdmin } = useAuth();
  const { data, isLoading, isError } = useRiwayat();

  const baris = useMemo(() => data?.map(toBarisRiwayat), [data]);

  return (
    <div>
      <PageHeader
        title="Riwayat Perubahan"
        description={
          isAdmin
            ? 'Catatan kelola akun dan perubahan isi portal.'
            : `Catatan perubahan data warga ${labelWilayah(user)}, ditambah kelola akun dan perubahan isi portal oleh Admin.`
        }
      />
      <RiwayatView
        isLoading={isLoading}
        isError={isError}
        baris={baris}
        kosongJudul="Belum ada perubahan tercatat"
        kosongKeterangan={
          isAdmin
            ? 'Pembuatan akun, reset password, dan perubahan isi portal akan muncul di sini.'
            : 'Setiap perubahan data warga dan setiap tindakan Admin akan muncul di sini, lengkap dengan siapa yang melakukannya.'
        }
      />
    </div>
  );
}
