import { apiClient } from '@/lib/api-client';
import { ApiError } from '@/types/api';
import type { Berita, BeritaBaru } from '../types';

/**
 * Kontrak berita. Membaca lewat `/publik/berita` (tanpa sesi, sama seperti
 * pengunjung biasa), menulis lewat `/berita` yang cuma dibuka untuk ADMIN.
 *
 * Sampai 3 September 2026 isinya `localStorage`, jadi tulisan pengurus tidak
 * pernah sampai ke pengunjung mana pun. Yang berpindah cuma berkas ini —
 * komponen dan hook-nya tidak berubah satu baris, dan itu memang gunanya
 * kontrak ini dibuat lebih dulu.
 */
export interface BeritaApi {
  list(): Promise<Berita[]>;
  getBySlug(slug: string): Promise<Berita | null>;
  simpan(input: BeritaBaru, id?: string): Promise<Berita>;
  hapus(id: string): Promise<void>;
}

export const beritaApi: BeritaApi = {
  async list() {
    const { data } = await apiClient.get<Berita[]>('/publik/berita');
    return data;
  },

  async getBySlug(slug) {
    try {
      const { data } = await apiClient.get<Berita>(
        `/publik/berita/${encodeURIComponent(slug)}`,
      );
      return data;
    } catch (galat) {
      // 404 di sini keadaan biasa, bukan kegagalan: tautan lama tersebar lalu
      // judulnya disunting. Halaman detail menampilkannya sebagai "Berita
      // tidak ditemukan", sedangkan galat lain tetap dilempar supaya gangguan
      // jaringan tidak menyamar jadi berita yang hilang.
      if (galat instanceof ApiError && galat.status === 404) return null;
      throw galat;
    }
  },

  async simpan(input, id) {
    const { data } =
      id === undefined
        ? await apiClient.post<Berita>('/berita', input)
        : await apiClient.patch<Berita>(
            `/berita/${encodeURIComponent(id)}`,
            input,
          );
    return data;
  },

  async hapus(id) {
    await apiClient.delete(`/berita/${encodeURIComponent(id)}`);
  },
};
