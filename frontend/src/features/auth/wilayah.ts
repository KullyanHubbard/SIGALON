import type { AuthUser } from './types';

export function labelWilayah(user: AuthUser | null): string {
  if (!user) return '';
  if (user.role === 'RT') return `RT ${user.rt} / RW ${user.rw}`;
  if (user.role === 'RW') return `RW ${user.rw}`;
  return 'seluruh padukuhan';
}
