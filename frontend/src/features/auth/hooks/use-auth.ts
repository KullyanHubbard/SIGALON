import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../auth-store';
import type { GantiPassword, PetugasCredentials, Role } from '../types';
import { ROLE_PENGURUS } from '../types';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return {
    user,
    isAuthenticated,

    isAdmin: user?.role === 'ADMIN',

    isPengurus: user ? ROLE_PENGURUS.includes(user.role) : false,

    harusGantiPassword: user?.harusGantiPassword ?? false,
  };
}

export function useLoginPetugas() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async ({
      credentials,
      expectedRole,
    }: {
      credentials: PetugasCredentials;
      expectedRole: Role;
    }) => {
      const session = await authApi.login(credentials);

      if (session.user.role !== expectedRole) {
        await authApi.logout(session.token).catch(() => undefined);
        const p = ROLE_PENGURUS.includes(expectedRole) ? expectedRole : 'Admin';
        throw new Error(`Username atau password salah untuk akun ${p}.`);
      }

      return session;
    },
    onSuccess: (session) => setSession(session),
  });
}

export function useGantiPassword() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: GantiPassword) => authApi.gantiPassword(payload),
    onSuccess: (user) => updateUser(user),
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return () => {
    void authApi.logout().catch(() => undefined);
    clear();

    queryClient.clear();

    navigate(paths.login, { replace: true });
  };
}
