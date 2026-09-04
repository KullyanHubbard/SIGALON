import { useState } from 'react';
import { ExternalLink, MapPin, Maximize2 } from 'lucide-react';
import mapImage from '@/assets/Maps-frontend.png';
import { Modal } from '@/components/ui/Modal';
import { usePadukuhan } from '@/hooks/use-padukuhan';
import { GOOGLE_MAPS_URL } from '@/lib/padukuhan';
import { cn } from '@/lib/utils';

export function PetaPadukuhan({ className }: { className?: string }) {
  const { namaLengkap } = usePadukuhan();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          'group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition-all hover:shadow-md dark:border-slate-800',
          className,
        )}
        onClick={() => setModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setModalOpen(true);
          }
        }}
        aria-label={`Buka peta penuh ${namaLengkap}`}
      >
        <img
          src={mapImage}
          alt={`Peta Wilayah ${namaLengkap}`}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.01]"
          loading="lazy"
          decoding="async"
        />

        {/* Tombol langsung buka Google Maps */}
        <a
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-brand-600 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/90 dark:text-slate-100"
          title="Buka lokasi di Google Maps"
        >
          <MapPin className="h-3.5 w-3.5 text-rose-500" />
          <span>Buka di Google Maps</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </a>

        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-slate-900/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm opacity-90 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Lihat Peta Penuh</span>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Peta Wilayah ${namaLengkap}`}
      >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-slate-950">
            <img
              src={mapImage}
              alt={`Peta Wilayah ${namaLengkap}`}
              className="h-auto w-full max-h-[75vh] object-contain"
            />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Koordinat: -7.656826, 110.363111
            </p>
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <MapPin className="h-3.5 w-3.5" />
              <span>Buka di Google Maps</span>
              <ExternalLink className="h-3 w-3 opacity-75" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
