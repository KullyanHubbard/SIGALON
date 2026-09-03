import { apiClient } from '@/lib/api-client';
import type { Padukuhan } from '@/lib/padukuhan';

/**
 * Klien keterangan padukuhan. Di `lib`, bukan di dalam salah satu fitur:
 * pemakainya kerangka publik, halaman profil, peta, dan halaman Admin
 * sekaligus — pola yang sama dengan `warga-api.ts` (CLAUDE.md §4).
 */
export interface PadukuhanApi {
  /** `null` = Admin belum pernah menyimpan; pemanggil memakai nilai bawaan. */
  ambil(): Promise<Padukuhan | null>;
  ubah(isi: Padukuhan): Promise<Padukuhan>;
}

export const padukuhanApi: PadukuhanApi = {
  async ambil() {
    const { data } = await apiClient.get<Padukuhan | null>('/publik/padukuhan');
    return data;
  },

  async ubah(isi) {
    const { data } = await apiClient.patch<Padukuhan>('/padukuhan', isi);
    return data;
  },
};
