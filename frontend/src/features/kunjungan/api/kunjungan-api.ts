import { apiClient } from '@/lib/api-client';

export interface KunjunganApi {
  tambah(): Promise<number>;
  lihat(): Promise<number>;
}

export const kunjunganApi: KunjunganApi = {
  async tambah() {
    const { data } = await apiClient.post<{ jumlah: number }>(
      '/publik/kunjungan',
    );
    return data.jumlah;
  },
  async lihat() {
    const { data } = await apiClient.get<{ jumlah: number }>(
      '/publik/kunjungan',
    );
    return data.jumlah;
  },
};
