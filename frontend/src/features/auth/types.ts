export type Role = 'ADMIN' | 'DUKUH' | 'RW' | 'RT';

export const ROLE_PENGURUS: readonly Role[] = ['DUKUH', 'RW', 'RT'];

export interface AuthUser {
  id: string;
  nama: string;
  username: string;
  role: Role;

  rw?: string | null;
  rt?: string | null;

  jabatan: string;

  harusGantiPassword: boolean;
}

export interface PetugasCredentials {
  username: string;
  password: string;
}

export interface GantiPassword {
  passwordLama: string;
  passwordBaru: string;
}

export interface Session {
  token: string;
  user: AuthUser;
}
