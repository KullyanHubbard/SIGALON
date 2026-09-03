import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { usePadukuhanQuery, useUbahPadukuhan } from '@/hooks/use-padukuhan';
import { PADUKUHAN_BAWAAN, type Padukuhan } from '@/lib/padukuhan';
import { pesanError } from '@/lib/utils';

/** Kolom wajib isi. Batasnya kembar dengan `backend/app/schemas/padukuhan.py`. */
const wajib = (maks: number) =>
  z.string().trim().min(1, 'Wajib diisi').max(maks, `Maksimal ${maks} huruf`);

const skema = z.object({
  nama: wajib(100),
  namaLengkap: wajib(150),
  desa: wajib(100),
  kapanewon: wajib(100),
  kabupaten: wajib(100),
  provinsi: wajib(100),
  luasWilayah: wajib(50),
  telepon: wajib(30),
  email: wajib(150).refine(
    (v) => v.split('@').length === 2 && !v.startsWith('@') && !v.endsWith('@'),
    'Belum berbentuk alamat surel',
  ),
  sejarah: z.string().trim().min(20, 'Sejarah minimal 20 huruf').max(8000),
  batasUtara: wajib(150),
  batasTimur: wajib(150),
  batasSelatan: wajib(150),
  batasBarat: wajib(150),
});

/**
 * Keterangan tetap padukuhan yang tampil di portal publik: nama wilayah, luas,
 * kontak, sejarah, batas.
 *
 * ADMIN saja. Isinya bukan data warga maupun akun — sama seperti berita, ini
 * isi portal, dan yang mengurus isi portal Admin. Sebelum halaman ini ada,
 * mengganti nomor telepon balai padukuhan berarti mengubah kode dan deploy
 * ulang.
 *
 * Koordinat & radius peta TIDAK ada di sini, sengaja: itu setelan tampilan
 * peta, bukan data yang dirawat perangkat desa (lihat `PETA` di
 * `lib/padukuhan.ts`).
 */
export default function ProfilPadukuhanPage() {
  // Query mentah, bukan `usePadukuhan()`: di sini bedanya penting antara
  // "server bilang belum pernah diisi" (`null` — wajar, tinggal isi) dan
  // "server tidak menjawab" (galat — jangan simpan apa pun).
  const { data, isPending, isError } = usePadukuhanQuery();
  const padukuhan = data ?? PADUKUHAN_BAWAAN;
  const simpan = useUbahPadukuhan();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Padukuhan>({
    resolver: zodResolver(skema),
    defaultValues: padukuhan,
  });

  // `usePadukuhan` mula-mula menjawab nilai bawaan, lalu berganti begitu
  // jawaban server tiba — form harus ikut. Isian yang sedang diketik TIDAK
  // ditimpa: tanpa penjagaan `isDirty`, jawaban yang datang terlambat
  // menghapus ketikan orang di tengah jalan.
  useEffect(() => {
    if (data !== undefined && !isDirty) reset(data ?? PADUKUHAN_BAWAAN);
  }, [data, isDirty, reset]);

  // Sesudah semua hook, supaya urutan hook tetap sama di tiap render.
  if (isPending || isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profil Padukuhan"
          description="Keterangan yang tampil di beranda, halaman profil, dan kaki setiap halaman publik."
        />
        {isError ? (
          <Alert tone="error">
            Keterangan padukuhan belum bisa dimuat, jadi formulirnya ditahan:
            menyimpan sekarang akan menimpa keterangan yang tersimpan dengan
            nilai bawaan. Muat ulang halaman setelah sambungan pulih.
          </Alert>
        ) : (
          <p className="text-sm text-slate-500">Memuat keterangan padukuhan…</p>
        )}
      </div>
    );
  }

  const onSubmit = handleSubmit(async (nilai) => {
    // `reset` dengan nilai yang benar-benar tersimpan: itu yang memadamkan
    // `isDirty`, jadi perubahan berikutnya dari server boleh masuk lagi.
    reset(await simpan.mutateAsync(nilai));
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PageHeader
        title="Profil Padukuhan"
        description="Keterangan yang tampil di beranda, halaman profil, dan kaki setiap halaman publik."
        action={
          <Button
            type="submit"
            isLoading={simpan.isPending}
            disabled={!isDirty}
          >
            Simpan Perubahan
          </Button>
        }
      />

      {simpan.isError && (
        <Alert tone="error">
          {pesanError(simpan.error, 'Perubahan gagal disimpan.')}
        </Alert>
      )}
      {simpan.isSuccess && !isDirty && (
        <Alert tone="success">
          Tersimpan. Halaman publik langsung memakai keterangan yang baru.
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Identitas Wilayah"
          description="Dipakai di judul beranda, halaman profil, dan kaki halaman."
        />
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nama Padukuhan"
            hint="Tanpa kata “Padukuhan”, mis. Gading Kulon"
            error={errors.nama?.message}
            {...register('nama')}
          />
          <Input
            label="Nama Lengkap"
            hint="Yang tampil sebagai judul, mis. Padukuhan Gading Kulon"
            error={errors.namaLengkap?.message}
            {...register('namaLengkap')}
          />
          <Input
            label="Kalurahan"
            error={errors.desa?.message}
            {...register('desa')}
          />
          <Input
            label="Kapanewon"
            error={errors.kapanewon?.message}
            {...register('kapanewon')}
          />
          <Input
            label="Kabupaten"
            error={errors.kabupaten?.message}
            {...register('kabupaten')}
          />
          <Input
            label="Provinsi"
            error={errors.provinsi?.message}
            {...register('provinsi')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Luas & Kontak"
          description="Nomor dan surel ini jadi tujuan tombol Hubungi Kami serta Pengaduan."
        />
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Luas Wilayah"
            hint="Tulis dengan satuannya, mis. 162,4 ha"
            error={errors.luasWilayah?.message}
            {...register('luasWilayah')}
          />
          <Input
            label="Telepon"
            type="tel"
            error={errors.telepon?.message}
            {...register('telepon')}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Sejarah & Gambaran Umum"
          description="Tampil di halaman Profil."
        />
        <CardContent>
          <Textarea
            label="Sejarah"
            rows={9}
            hint="Pisahkan paragraf dengan satu baris kosong."
            error={errors.sejarah?.message}
            {...register('sejarah')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          title="Batas Wilayah"
          description="Wilayah yang berbatasan langsung, tampil di halaman Profil."
        />
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Sebelah Utara"
            error={errors.batasUtara?.message}
            {...register('batasUtara')}
          />
          <Input
            label="Sebelah Timur"
            error={errors.batasTimur?.message}
            {...register('batasTimur')}
          />
          <Input
            label="Sebelah Selatan"
            error={errors.batasSelatan?.message}
            {...register('batasSelatan')}
          />
          <Input
            label="Sebelah Barat"
            error={errors.batasBarat?.message}
            {...register('batasBarat')}
          />
        </CardContent>
      </Card>
    </form>
  );
}
