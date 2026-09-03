import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiError } from '@/types/api';

/**
 * Gabungkan className secara kondisional + resolusi konflik utility Tailwind.
 * Contoh: cn('px-2', condition && 'px-4') -> 'px-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const formatterAngka = new Intl.NumberFormat('id-ID');

/** Cacah bergaya Indonesia: `1234` -> `'1.234'`. */
export function formatAngka(nilai: number): string {
  return formatterAngka.format(nilai);
}

/**
 * Ubah error apa pun jadi pesan yang layak dibaca warga.
 * `ApiError` sudah membawa pesan ramah dari interceptor; sisanya pakai fallback
 * supaya detail teknis tidak pernah bocor ke layar.
 */
export function pesanError(error: unknown, fallback: string): string | null {
  if (!error) return null;
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * `localStorage` yang tidak pernah melempar.
 *
 * Peramban yang memblokir site data (mode privat, setelan "blokir cookie
 * pihak ketiga" yang ketat) melempar pada AKSES, bukan mengembalikan null.
 * Terjadi di dalam efek, itu menjatuhkan seluruh pohon React — halaman publik
 * jadi putih gara-gara pilihan ukuran teks yang tidak bisa dibaca.
 */
export function bacaLokal(kunci: string): string | null {
  try {
    return localStorage.getItem(kunci);
  } catch {
    return null;
  }
}

/** Pasangan `bacaLokal`. Gagal menyimpan = pilihannya tidak bertahan, bukan halaman mati. */
export function tulisLokal(kunci: string, nilai: string): void {
  try {
    localStorage.setItem(kunci, nilai);
  } catch {
    return;
  }
}
