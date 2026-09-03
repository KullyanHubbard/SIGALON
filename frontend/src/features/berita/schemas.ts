import { z } from 'zod';
import { keRingkasan } from './utils';

/**
 * Batas ukuran isi artikel, kembar dengan `MAKS_ISI` di
 * `backend/app/schemas/berita.py`. Foto sisipan tinggal di dalam `isi` sebagai
 * data URL, jadi inilah yang benar-benar membatasi berapa foto boleh masuk satu
 * berita — kira-kira lima. Dijaga di sini juga supaya penulisnya tahu SEBELUM
 * menekan Simpan, bukan lewat penolakan server atas tulisan yang sudah jadi.
 */
export const MAKS_ISI = 4_000_000;

/**
 * Form berita.
 *
 * `tanggalTerbit` di sini BOLEH `<input type="date">`, berbeda dari tanggal
 * lahir warga (CLAUDE.md §6): yang mengisinya pengurus di depan komputer balai
 * desa, bukan warga yang mengetik lepas, dan salah baca dd/mm langsung
 * kelihatan di daftar berita yang ada di layar yang sama.
 */
export const beritaSchema = z.object({
  judul: z.string().trim().min(4, 'Judul minimal 4 huruf'),
  penulis: z.string().trim().min(2, 'Nama penulis wajib diisi'),
  tanggalTerbit: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pilih tanggal terbit'),
  // Panjangnya diukur dari teksnya, bukan dari HTML-nya: satu foto sisipan
  // berukuran ratusan ribu karakter akan meloloskan berita tanpa satu kata pun.
  // Batas yang sama dijaga ulang di server.
  isi: z
    .string()
    .refine(
      (html) => keRingkasan(html).length >= 20,
      'Isi berita minimal 20 huruf',
    )
    .refine(
      (html) => html.length <= MAKS_ISI,
      'Isi berita terlalu besar. Kurangi jumlah foto, atau perkecil ukurannya sebelum diunggah.',
    ),
  /** Data URL foto sampul; kosong berarti berita tanpa foto. */
  foto: z.string(),
});

export type BeritaFormValues = z.infer<typeof beritaSchema>;
