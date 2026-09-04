import { useState } from 'react';
import { useDismissOnOutside } from '@/hooks/use-dismiss-on-outside';
import { useAuth, useLogout } from '@/features/auth/hooks/use-auth';
import { NavbarView } from './NavbarView';

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user } = useAuth();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useDismissOnOutside<HTMLDivElement>(menuOpen, () =>
    setMenuOpen(false),
  );

  return (
    <NavbarView
      nama={user?.nama ?? ''}
      peran={user?.jabatan ?? 'Perangkat Desa'}
      onOpenSidebar={onOpenSidebar}
      menuOpen={menuOpen}
      onToggleMenu={() => setMenuOpen((v) => !v)}
      menuRef={menuRef}
      onTutupMenu={() => setMenuOpen(false)}
      onLogout={logout}
    />
  );
}
