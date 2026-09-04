import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Role } from '@/features/auth/types';
import { paths } from './paths';
import { homePathForRole } from './role-utils';

export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }
  return <Outlet />;
}

export function RequireGantiPassword() {
  const { harusGantiPassword } = useAuth();

  if (harusGantiPassword) {
    return <Navigate to={paths.gantiPassword} replace />;
  }
  return <Outlet />;
}

export function RedirectIfAuthenticated() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }
  return <Outlet />;
}
