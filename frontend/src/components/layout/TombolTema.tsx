import { useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn, tulisLokal } from '@/lib/utils';

const KUNCI = 'siduk.tema';

const DURASI_MS = 300;

const IKON =
  'absolute h-6 w-6 transition-all duration-300 motion-reduce:transition-none';

export function TombolTema() {
  const [gelap, setGelap] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const jedaRef = useRef<number>();

  const ganti = () => {
    const baru = !gelap;
    const akar = document.documentElement;

    akar.classList.add('tema-beralih');
    akar.classList.toggle('dark', baru);
    tulisLokal(KUNCI, baru ? 'gelap' : 'terang');
    setGelap(baru);

    window.clearTimeout(jedaRef.current);
    jedaRef.current = window.setTimeout(
      () => akar.classList.remove('tema-beralih'),
      DURASI_MS,
    );
  };

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={gelap ? 'Mode terang' : 'Mode gelap'}
      aria-pressed={gelap}
      className="focus-ring relative flex h-12 w-12 items-center justify-center rounded-full border-1 border-slate-200 bg-surface text-slate-700 shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <Moon
        aria-hidden
        className={cn(
          IKON,
          gelap ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100',
        )}
      />
      <Sun
        aria-hidden
        className={cn(
          IKON,
          gelap ? 'rotate-0 scale-100' : '-rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  );
}
