import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { padukuhanApi } from '@/lib/padukuhan-api';
import { PADUKUHAN_BAWAAN, type Padukuhan } from '@/lib/padukuhan';

export const padukuhanKeys = {
  all: ['padukuhan'] as const,
};

/**
 * Keterangan padukuhan, SELALU berisi — tidak pernah `undefined`.
 *
 * Sengaja tanpa keadaan memuat: pemakainya kaki halaman, judul hero, dan judul
 * peta, yang semuanya harus punya tulisan sejak render pertama. Selama
 * jawabannya belum sampai (atau servernya belum pernah diisi) yang tampil nilai
 * bawaan, lalu tergantikan sendiri begitu datanya tiba. Yang salah bukan
 * "kosong sebentar" melainkan judul kosong yang melompat.
 *
 * **Yang MENYUNTING tidak boleh memakai ini** — pakai `usePadukuhanQuery()`.
 * Menelan galat itu benar untuk kaki halaman, fatal untuk formulir: jawaban
 * yang gagal akan mengisi form dengan nilai bawaan, dan Simpan mengirim
 * seluruh kolom — keterangan desa yang tersimpan tertimpa default.
 */
export function usePadukuhanQuery() {
  return useQuery({
    queryKey: padukuhanKeys.all,
    queryFn: () => padukuhanApi.ambil(),
    // Jarang berubah — sekali diambil, cukup untuk seluruh kunjungan.
    staleTime: 60 * 60 * 1000,
  });
}

export function usePadukuhan(): Padukuhan {
  return usePadukuhanQuery().data ?? PADUKUHAN_BAWAAN;
}

export function useUbahPadukuhan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isi: Padukuhan) => padukuhanApi.ubah(isi),
    // Kaki halaman & hero ikut berubah tanpa muat ulang.
    onSuccess: (baru) => qc.setQueryData(padukuhanKeys.all, baru),
  });
}
