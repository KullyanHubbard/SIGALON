import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PersetujuanPanel } from '@/features/pergantian/components/PersetujuanPanel';
import { BarKredit } from './BarKredit';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const konten = useRef<HTMLElement>(null);

  useEffect(() => {
    konten.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {}
        <main ref={konten} className="flex-1 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
            {}
            <PersetujuanPanel />
            <Outlet />
          </div>
        </main>

        {}
        <BarKredit className="min-h-20 shrink-0 px-4 py-2 lg:px-8" />
      </div>
    </div>
  );
}
