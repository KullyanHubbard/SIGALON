import { Link } from 'react-router-dom';
import ikonMasuk from '@/assets/forward-navigasi.svg';
import ikonUserCircle from '@/assets/icons/nav/user-circle.svg';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { paths } from '@/routes/paths';
import { homePathForRole } from '@/routes/role-utils';

interface AccountButtonProps {
  className?: string;
}

export function AccountButton({ className }: AccountButtonProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <Link
      to={isAuthenticated ? homePathForRole(user?.role) : paths.login}
      className={cn(
        'flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700',
        className,
      )}
    >
      {}
      <span
        aria-hidden
        className="h-4 w-4 shrink-0 bg-current"
        style={{
          mask: `url("${isAuthenticated ? ikonUserCircle : ikonMasuk}") center / contain no-repeat`,
          WebkitMask: `url("${isAuthenticated ? ikonUserCircle : ikonMasuk}") center / contain no-repeat`,
        }}
      />
      {isAuthenticated ? 'Akun Saya' : 'Masuk'}
    </Link>
  );
}
