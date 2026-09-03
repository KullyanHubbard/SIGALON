import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { ApiError } from '@/types/api';
import { useAuthStore } from '@/features/auth/auth-store';
import { queryClient } from '@/lib/query-client';
import { getStoredToken } from '@/features/auth/token-storage';

/** Instance HTTP tunggal untuk memanggil FastAPI. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Sisipkan bearer token ke setiap request bila ada sesi aktif.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Normalisasi error menjadi ApiError + auto-logout saat 401.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data as { message?: string } | undefined;
      const message =
        data?.message ?? error.message ?? 'Terjadi kesalahan jaringan';

      if (status === 401) {
        // Lewat store, bukan `clearSession()` langsung: menghapus localStorage
        // saja meninggalkan `isAuthenticated: true` di memori, jadi guard tidak
        // melempar ke /login dan pemakainya terdampar di halaman yang semua
        // query-nya gagal sampai ia menekan muat ulang sendiri.
        // Aman dari impor melingkar: `auth-store` tidak mengimpor berkas ini.
        useAuthStore.getState().clear();
        // Cache ikut dibuang, bukan cuma sesinya. `staleTime` 60 detik berarti
        // data pengurus sebelumnya masih disajikan tanpa refetch — di komputer
        // balai desa yang dipakai bergantian, orang berikutnya yang masuk bisa
        // melihat daftar warga milik peran sebelumnya selama semenit itu.
        queryClient.clear();
      }
      return Promise.reject(
        new ApiError(status, message, error.response?.data),
      );
    }
    return Promise.reject(new ApiError(0, 'Kesalahan tak terduga', error));
  },
);
