import { Headset } from 'lucide-react';
import { usePadukuhan } from '@/hooks/use-padukuhan';

export function TombolPengaduan() {
  const padukuhan = usePadukuhan();

  return (
    <a
      href={`mailto:${padukuhan.email}?subject=${encodeURIComponent('Pengaduan Warga')}`}
      className="focus-ring flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-rose-700"
    >
      <Headset className="h-5 w-5" aria-hidden />
      Pengaduan
    </a>
  );
}
