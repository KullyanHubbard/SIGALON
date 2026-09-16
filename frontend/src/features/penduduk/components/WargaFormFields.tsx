import type { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NAMA_BULAN } from '@/lib/tanggal';
import {
  agamaLabel,
  golonganDarahLabel,
  jenisKelaminLabel,
  pendidikanLabel,
  statusHubunganLabel,
  statusKependudukanLabel,
  statusPerkawinanLabel,
  statusDomisiliLabel,
} from '../labels';
import type { Role } from '@/features/auth/types';
import type { WargaFormValues } from '../schemas';

interface WargaFormFieldsProps {
  register: UseFormRegister<WargaFormValues>;
  watch?: UseFormWatch<WargaFormValues>;
  errors: FieldErrors<WargaFormValues>;
  menambah: boolean;
  bolehPindahWilayah: boolean;
  userRole?: Role;
  userRw?: string | null;
  userRt?: string | null;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="sm:col-span-2 border-b border-slate-200 pb-1 pt-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </h3>
    </div>
  );
}

function TanggalLahir({
  register,
  errors,
}: Pick<WargaFormFieldsProps, 'register' | 'errors'>) {
  const galat =
    errors.tanggal?.message ?? errors.bulan?.message ?? errors.tahun?.message;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Tanggal Lahir
      </label>
      <div className="flex gap-2">
        <Input placeholder="Tgl" className="w-16" {...register('tanggal')} />
        <Select className="flex-1 px-2" {...register('bulan')}>
          <option value="">Bulan</option>
          {NAMA_BULAN.map((nama, i) => (
            <option key={nama} value={String(i + 1).padStart(2, '0')}>
              {nama}
            </option>
          ))}
        </Select>
        <Input placeholder="Tahun" className="w-20" {...register('tahun')} />
      </div>
      {galat && <p className="mt-1 text-xs text-red-600">{galat}</p>}
    </div>
  );
}

export function WargaFormFields({
  register,
  watch,
  errors,
  menambah,
  bolehPindahWilayah,
  userRole,
  userRw,
  userRt,
}: WargaFormFieldsProps) {
  const statusKependudukan = watch ? watch('statusKependudukan') : 'AKTIF';

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* 1. IDENTITAS WARGA */}
      <SectionHeader title="Identitas Warga" />

      <div className="sm:col-span-2">
        <Input
          label="Nama Lengkap"
          error={errors.nama?.message}
          {...register('nama')}
        />
      </div>

      <Select
        label="Jenis Kelamin"
        pilihan={jenisKelaminLabel}
        error={errors.jenisKelamin?.message}
        {...register('jenisKelamin')}
      />

      <Select
        label="Gol. Darah"
        pilihan={golonganDarahLabel}
        error={errors.golonganDarah?.message}
        {...register('golonganDarah')}
      />

      <Input
        label="Tempat Lahir"
        error={errors.tempatLahir?.message}
        {...register('tempatLahir')}
      />

      <TanggalLahir register={register} errors={errors} />

      <Select
        label="Agama"
        pilihan={agamaLabel}
        error={errors.agama?.message}
        {...register('agama')}
      />

      <Select
        label="Pendidikan Terakhir"
        pilihan={pendidikanLabel}
        error={errors.pendidikan?.message}
        {...register('pendidikan')}
      />

      <div className="sm:col-span-2">
        <Input
          label="Pekerjaan"
          error={errors.pekerjaan?.message}
          {...register('pekerjaan')}
        />
      </div>

      {/* 2. KELUARGA & PERKAWINAN */}
      <SectionHeader title="Keluarga & Pernikahan" />

      <Select
        label="Status dalam Keluarga"
        pilihan={statusHubunganLabel}
        error={errors.statusHubunganKeluarga?.message}
        {...register('statusHubunganKeluarga')}
      />

      <Select
        label="Status Perkawinan"
        pilihan={statusPerkawinanLabel}
        error={errors.statusPerkawinan?.message}
        {...register('statusPerkawinan')}
      />

      <div className="sm:col-span-2">
        <Input
          label="Catatan Status Perkawinan (Opsional)"
          placeholder="Misal: Cerai (Belum Update KK)"
          hint="Diisi apabila status perkawinan belum tercatat resmi di KK atau butuh catatan khusus"
          error={errors.catatanPerkawinan?.message}
          {...register('catatanPerkawinan')}
        />
      </div>

      <div className="sm:col-span-2">
        <Input
          label="Kode Kelompok Keluarga (Opsional)"
          placeholder="Misal: K0001"
          hint="Kode keluarga untuk mengelompokkan anggota satu KK"
          error={errors.kodeKeluarga?.message}
          {...register('kodeKeluarga')}
        />
      </div>

      {/* 3. STATUS KEBERADAAN / MUTASI WARGA */}
      {!menambah && (
        <>
          <SectionHeader title="Status Keberadaan Warga" />
          <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/75 p-3.5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Status Warga"
                pilihan={statusKependudukanLabel}
                error={errors.statusKependudukan?.message}
                {...register('statusKependudukan')}
              />
              {statusKependudukan === 'MENINGGAL' ? (
                <Input
                  label="Penyebab / Keterangan Meninggal"
                  placeholder="Misal: Sakit, usia lanjut, kecelakaan..."
                  hint="Meninggal karena apa atau keterangan wafat warga"
                  error={errors.catatanKematian?.message}
                  {...register('catatanKematian')}
                />
              ) : (
                <div className="hidden sm:flex sm:items-center text-xs text-slate-500 pt-6">
                  Ubah status ke &quot;Meninggal&quot; jika warga telah wafat untuk mencatat penyebab kematian.
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 4. ALAMAT & DOMISILI */}
      <SectionHeader title="Alamat & Domisili" />

      <div className="sm:col-span-2">
        <Input
          label="Alamat Jalan"
          error={errors.jalan?.message}
          {...register('jalan')}
        />
      </div>

      <Input
        label="RT"
        disabled={
          menambah
            ? userRole === 'RT'
            : !bolehPindahWilayah
        }
        hint={
          menambah
            ? userRole === 'RT'
              ? `Terkunci sesuai wilayah RT Anda (${userRt ?? ''})`
              : userRole === 'RW'
                ? 'Masukkan nomor RT warga (mis. 001)'
                : undefined
            : bolehPindahWilayah
              ? undefined
              : 'Hanya Pak Dukuh yang bisa memindahkan warga.'
        }
        error={errors.rt?.message}
        {...register('rt')}
      />

      <Input
        label="RW"
        disabled={
          menambah
            ? userRole === 'RW' || userRole === 'RT'
            : !bolehPindahWilayah
        }
        hint={
          menambah
            ? userRole === 'RW' || userRole === 'RT'
              ? `Terkunci sesuai wilayah RW Anda (${userRw ?? ''})`
              : undefined
            : bolehPindahWilayah
              ? undefined
              : 'Hanya Pak Dukuh yang bisa memindahkan warga.'
        }
        error={errors.rw?.message}
        {...register('rw')}
      />

      <Select
        label="Status Domisili"
        pilihan={statusDomisiliLabel}
        error={errors.statusDomisili?.message}
        {...register('statusDomisili')}
      />

      <Input
        label="Alamat Asal (Jika Mengontrak/Pendatang)"
        hint="Misal: Alamat KTP asal luar Gading Kulon"
        error={errors.alamatAsal?.message}
        {...register('alamatAsal')}
      />

      {/* 5. BANTUAN SOSIAL */}
      <SectionHeader title="Bantuan Sosial" />

      <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50/75 p-3.5">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Program Bantuan Sosial (Bansos)
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              {...register('bansosBpnt')}
            />
            <span>Bantuan Pangan Non-Tunai (BPNT)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              {...register('bansosPkh')}
            />
            <span>Program Keluarga Harapan (PKH)</span>
          </label>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Data bansos bersifat rahasia dan hanya dapat diakses oleh pengurus wilayah.
        </p>
      </div>
    </div>
  );
}
