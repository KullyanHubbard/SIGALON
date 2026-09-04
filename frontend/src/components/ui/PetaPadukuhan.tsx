import { useEffect, useRef, useState } from 'react';
import { usePadukuhan } from '@/hooks/use-padukuhan';
import { PETA } from '@/lib/padukuhan';
import { cn } from '@/lib/utils';

const { koordinat, radiusPeta } = PETA;

const bbox = [
  koordinat.lon - radiusPeta,
  koordinat.lat - radiusPeta,
  koordinat.lon + radiusPeta,
  koordinat.lat + radiusPeta,
].join('%2C');

const SUMBER = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${koordinat.lat}%2C${koordinat.lon}`;

export function PetaPadukuhan({ className }: { className?: string }) {
  const { namaLengkap } = usePadukuhan();
  const kotak = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const elemen = kotak.current;
    if (!elemen) return;

    const pantau = new IntersectionObserver(
      (entri) => {
        if (!entri.some((e) => e.isIntersecting)) return;
        setTampil(true);
        pantau.disconnect();
      },
      { rootMargin: '300px' },
    );

    pantau.observe(elemen);
    return () => pantau.disconnect();
  }, []);

  return (
    <div
      ref={kotak}
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm',
        className,
      )}
    >
      {tampil && (
        <iframe
          title={`Peta ${namaLengkap}`}
          className="h-full w-full"
          src={SUMBER}
        />
      )}
    </div>
  );
}
