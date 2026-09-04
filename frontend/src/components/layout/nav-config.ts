import ikonChartPie from '@/assets/icons/nav/chart-pie.svg';
import ikonUsers from '@/assets/icons/nav/users.svg';
import type { Role } from '@/features/auth/types';
import { CHART_KATEGORI_COLORS } from '@/lib/colors';
import { paths } from '@/routes/paths';

export interface NavItem {
  label: string;
  to: string;

  icon?: string;

  aksen: string;

  end?: boolean;
}

const statistikDesa: NavItem = {
  label: 'Statistik Warga',
  to: paths.statistik,
  aksen: CHART_KATEGORI_COLORS[3],
  end: true,
};

const riwayat: NavItem = {
  label: 'Riwayat Edit',
  to: paths.admin.riwayat,
  aksen: CHART_KATEGORI_COLORS[1],
};

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
