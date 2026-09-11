import { useState, useEffect, useRef } from 'react';
import {
  ExternalLink,
  Home,
  Landmark,
  MapPin,
  Shield,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TitikLokasi } from '@/features/titik-lokasi/types';
import { dapatkanTemaTitik } from '@/features/titik-lokasi/warna';

export interface HotspotItem {
  id: string;
  nama: string;
  kategori?: 'perangkat' | 'fasilitas';
  peran?: string | null;
  kategoriLabel: string;
  deskripsi: string;
  x: number; // Persentase posisi horizontal (0 - 100)
  y: number; // Persentase posisi vertikal (0 - 100)
  lat?: number | null;
  lon?: number | null;
  googleMapsUrl?: string | null;
  warna?: string;
  warnaRing?: string;
  ikon: string;
}

const DAFTAR_HOTSPOT_PADUKUHAN: HotspotItem[] = [
  {
    id: 'balai-padukuhan',
    nama: 'Balai Padukuhan Gading Kulon',
    kategori: 'fasilitas',
    kategoriLabel: 'Pusat Pemerintahan',
    deskripsi:
      'Pusat pertemuan musyawarah warga, pendataan, dan layanan perangkat desa.',
    x: 48,
    y: 44,
    warna: 'bg-amber-500',
    warnaRing: 'bg-amber-400',
    ikon: 'balai',
  },
  {
    id: 'masjid',
    nama: 'Masjid Padukuhan',
    kategori: 'fasilitas',
    kategoriLabel: 'Tempat Ibadah',
    deskripsi:
      'Pusat kegiatan keagamaan, salat berjamaah, dan pengajian warga.',
    x: 34,
    y: 36,
    warna: 'bg-emerald-500',
    warnaRing: 'bg-emerald-400',
    ikon: 'ibadah',
  },
  {
    id: 'poskamling-rw1',
    nama: 'Pos Ronda RW 01',
    kategori: 'fasilitas',
    kategoriLabel: 'Keamanan Lingkungan',
    deskripsi: 'Pos ronda malam terpadu warga RW 01 dan titik pantau keamanan.',
    x: 22,
    y: 58,
    warna: 'bg-blue-500',
    warnaRing: 'bg-blue-400',
    ikon: 'poskamling',
  },
  {
    id: 'poskamling-rw2',
    nama: 'Pos Ronda RW 02',
    kategori: 'fasilitas',
    kategoriLabel: 'Keamanan Lingkungan',
    deskripsi: 'Pos ronda malam dan gardu kumpul warga RW 02.',
    x: 74,
    y: 52,
    warna: 'bg-indigo-500',
    warnaRing: 'bg-indigo-400',
    ikon: 'poskamling',
  },
  {
    id: 'posyandu',
    nama: 'Pos Layanan Terpadu & Lapangan',
    kategori: 'fasilitas',
    kategoriLabel: 'Kesehatan & Sosial',
    deskripsi:
      'Pemeriksaan rutin balita/lansia serta area kegiatan olahraga luar ruang.',
    x: 64,
    y: 30,
    warna: 'bg-rose-500',
    warnaRing: 'bg-rose-400',
    ikon: 'posyandu',
  },
];

function tentukanWarna(item: HotspotItem | TitikLokasi): {
  warna: string;
  warnaRing: string;
} {
  if ('warna' in item && item.warna && 'warnaRing' in item && item.warnaRing) {
    return { warna: item.warna, warnaRing: item.warnaRing };
  }
  const tema = dapatkanTemaTitik(item);
  return { warna: tema.bgIkon, warnaRing: tema.ringHotspot };
}

function IkonHotspot({
  jenis,
  className,
}: {
  jenis: string;
  className?: string;
}) {
  switch (jenis) {
    case 'balai':
      return <Landmark className={className} />;
    case 'poskamling':
      return <Shield className={className} />;
    case 'posyandu':
      return <Sparkles className={className} />;
    case 'perangkat':
      return <UserCheck className={className} />;
    case 'ibadah':
    default:
      return <Home className={className} />;
  }
}

function hitungPosisiPopover(x: number, y: number) {
  // Jika koordinat y < 45% (bagian atas peta), munculkan popover ke bawah agar tidak terpotong
  const bukaBawah = y < 45;

  let posisiXClass = 'left-1/2 -translate-x-1/2';
  let panahXClass = 'left-1/2 -translate-x-1/2';

  // Penyesuaian agar tidak terpotong di tepi kiri / kanan
  if (x < 22) {
    posisiXClass = 'left-0 -translate-x-2 sm:-translate-x-4';
    panahXClass = 'left-6';
  } else if (x > 78) {
    posisiXClass = 'right-0 translate-x-2 sm:translate-x-4';
    panahXClass = 'right-6';
  }

  const posisiYClass = bukaBawah ? 'top-full mt-2' : 'bottom-full mb-2';
  const panahYClass = bukaBawah
    ? 'bottom-full border-b-white border-b-4'
    : 'top-full border-t-white border-t-4';

  return {
    posisiClass: cn(
      'absolute z-30 w-52 sm:w-64 rounded-xl border-1 border-black bg-white/95 p-3 text-left shadow-2xl backdrop-blur-md transition-all animate-in fade-in zoom-in-95 duration-150',
      posisiYClass,
      posisiXClass,
    ),
    panahClass: cn(
      'absolute border-4 border-transparent',
      panahXClass,
      panahYClass,
    ),
  };
}

export function PetaHotspotOverlay({
  hotspots = DAFTAR_HOTSPOT_PADUKUHAN,
}: {
  hotspots?: (HotspotItem | TitikLokasi)[];
}) {
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Tutup popover jika mengklik di luar area hotspot atau menekan tombol Escape
  useEffect(() => {
    if (!pinnedId && !hoverId) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        setPinnedId(null);
        setHoverId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPinnedId(null);
        setHoverId(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [pinnedId, hoverId]);

  return (
    <div ref={overlayRef} className="pointer-events-none absolute inset-0">
      {hotspots.map((item) => {
        // Popover aktif jika di-pin dengan klik ATAU jika sedang di-hover (bila tidak ada pin lain)
        const isPinned = pinnedId === item.id;
        const isHovered = hoverId === item.id;
        const isAktif = isPinned || (!pinnedId && isHovered);

        const { warna, warnaRing } = tentukanWarna(item);
        const { posisiClass, panahClass } = hitungPosisiPopover(item.x, item.y);

        return (
          <div
            key={item.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {/* Tombol Pin Hotspot dengan Pulse */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle pin: jika sudah aktif, klik lagi menutupnya
                setPinnedId((prev) => (prev === item.id ? null : item.id));
              }}
              onMouseEnter={() => {
                if (!pinnedId) setHoverId(item.id);
              }}
              onMouseLeave={() => {
                // Begitu kursor mouse meninggalkan pin, langsung hilangkan status hover
                setHoverId(null);
              }}
              className="group/pin relative flex cursor-pointer items-center justify-center p-1.5 focus:outline-none"
              title={item.nama}
              aria-label={item.nama}
            >
              {/* Radar Ping Animation */}
              <span
                className={cn(
                  'absolute h-5 w-5 animate-ping rounded-full opacity-75 sm:h-6 sm:w-6',
                  warnaRing,
                )}
              />

              {/* Pin Center */}
              <span
                className={cn(
                  'relative flex h-4 w-4 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white transition-transform duration-200 group-hover/pin:scale-125 sm:h-5 sm:w-5',
                  warna,
                  isAktif && 'scale-125 ring-4 ring-amber-300',
                )}
              >
                <IkonHotspot
                  jenis={item.ikon}
                  className="h-2.5 w-2.5 sm:h-3 sm:w-3"
                />
              </span>
            </button>

            {/* Popover / Tooltip Informasi Hotspot */}
            {isAktif && (
              <div
                className={posisiClass}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => {
                  if (!pinnedId) setHoverId(item.id);
                }}
                onMouseLeave={() => {
                  setHoverId(null);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white',
                        warna,
                      )}
                    >
                      <IkonHotspot jenis={item.ikon} className="h-2.5 w-2.5" />
                      {item.kategoriLabel}
                    </span>
                    {item.peran && (
                      <span className="rounded border-1 border-black bg-slate-100 px-1 py-0.5 font-mono text-[9px] font-semibold text-slate-700">
                        {item.peran}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPinnedId(null);
                      setHoverId(null);
                    }}
                    className="rounded p-0.5 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Tutup info"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="mt-1.5 text-xs font-bold leading-snug text-slate-900 sm:text-sm">
                  {item.nama}
                </h4>

                {item.deskripsi && (
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                    {item.deskripsi}
                  </p>
                )}

                {item.googleMapsUrl && (
                  <a
                    href={item.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-700 hover:underline sm:text-[11px]"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>Petunjuk Arah (Maps)</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}

                {/* Segitiga Panah Popover dengan Orientasi Otomatis */}
                <div className={panahClass} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
