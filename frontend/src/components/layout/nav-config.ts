import ikonChartPie from '@/assets/icons/nav/chart-pie.svg';
import ikonUsers from '@/assets/icons/nav/users.svg';
import type { Role } from '@/features/auth/types';
import { CHART_KATEGORI_COLORS } from '@/lib/colors';
import { paths } from '@/routes/paths';

export interface NavItem {
  label: string;
  to: string;
  /** URL berkas SVG di `@/assets/icons/nav`. Kosong = menu tampil tanpa ikon. */
  icon?: string;
  /**
   * Warna penanda halaman: mewarnai ikonnya, dan jadi latar lembut saat menu
   * itu aktif. Satu halaman = satu warna tetap di semua role — menu yang muncul
   * di dua role tidak boleh berganti warna tergantung siapa yang masuk.
   */
  aksen: string;
  /** Cocokkan sebagai prefix (untuk highlight nested route). */
  end?: boolean;
}

/** Statistik desa — halaman publik, terbuka juga tanpa sesi. */
const statistikDesa: NavItem = {
  label: 'Statistik Warga',
  to: paths.statistik,
  aksen: CHART_KATEGORI_COLORS[3],
  end: true,
};

/** Muncul di semua peran, isinya yang berbeda — jadi warnanya ditulis sekali. */
const riwayat: NavItem = {
  label: 'Riwayat Edit',
  to: paths.admin.riwayat,
  aksen: CHART_KATEGORI_COLORS[1],
};

/**
 * Menu navigasi sesuai peran.
 *
 * Admin TIDAK melihat Dashboard, Data Penduduk, maupun Infografis: ketiganya
 * memang ditolak backend untuknya. Menampilkannya cuma menyediakan tiga pintu
 * buntu di sidebar.
 *
 * Kelola Berita ada di sisi Admin, bukan Dukuh: berita adalah isi portal, dan
 * yang mengurus isi portal sekarang Admin (keputusan 3 September 2026).
 */
export function navItemsForRole(role: Role | undefined): NavItem[] {
  if (role === 'ADMIN') {
    return [
      {
        label: 'Kelola Akun',
        to: paths.admin.pengurus,
        aksen: CHART_KATEGORI_COLORS[2],
      },
      {
        label: 'Kelola Berita',
        to: paths.admin.berita,
        aksen: CHART_KATEGORI_COLORS[6],
      },
      {
        label: 'Profil Padukuhan',
        to: paths.admin.profil,
        aksen: CHART_KATEGORI_COLORS[7],
      },
      riwayat,
    ];
  }
  return [
    {
      label: 'Dashboard',
      to: paths.admin.root,
      aksen: CHART_KATEGORI_COLORS[0],
      end: true,
    },
    {
      label: 'Penduduk',
      to: paths.admin.penduduk,
      icon: ikonUsers,
      aksen: CHART_KATEGORI_COLORS[5],
    },
    {
      label: 'Infografis',
      to: paths.admin.infografis,
      icon: ikonChartPie,
      aksen: CHART_KATEGORI_COLORS[4],
    },
    riwayat,
    statistikDesa,
  ];
}
