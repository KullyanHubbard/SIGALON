import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Building2,
  ExternalLink,
  Focus,
  Maximize2,
  UserCheck,
} from 'lucide-react';
import { useTitikLokasiList } from '@/features/titik-lokasi/hooks/use-titik-lokasi';
import type { KategoriTitik, TitikLokasi } from '@/features/titik-lokasi/types';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const PUSAT_PADUKUHAN: [number, number] = [-7.656826, 110.363111];
const DEFAULT_ZOOM = 16;

const PETA_BOUNDS = {
  minLat: -7.660500,
  maxLat: -7.653000,
  minLon: 110.358000,
  maxLon: 110.368500,
};

function dapatkanKoordinat(item: TitikLokasi): [number, number] {
  if (
    item.lat != null &&
    item.lon != null &&
    !isNaN(Number(item.lat)) &&
    !isNaN(Number(item.lon))
  ) {
    return [Number(item.lat), Number(item.lon)];
  }
  const hitungLat =
    PETA_BOUNDS.maxLat - (item.y / 100) * (PETA_BOUNDS.maxLat - PETA_BOUNDS.minLat);
  const hitungLon =
    PETA_BOUNDS.minLon + (item.x / 100) * (PETA_BOUNDS.maxLon - PETA_BOUNDS.minLon);
  return [hitungLat, hitungLon];
}

function dapatkanWarnaDanIkon(item: TitikLokasi) {
  if (item.kategori === 'perangkat' || item.ikon === 'perangkat') {
    return {
      bg: 'bg-purple-700',
      ring: 'bg-purple-400',
      badgeClass: 'background-color: #6b21a8; color: white;',
      simbol: '👤',
    };
  }
  switch (item.ikon) {
    case 'balai':
      return {
        bg: 'bg-amber-500',
        ring: 'bg-amber-400',
        badgeClass: 'background-color: #d97706; color: white;',
        simbol: '🏛️',
      };
    case 'ibadah':
      return {
        bg: 'bg-emerald-600',
        ring: 'bg-emerald-400',
        badgeClass: 'background-color: #059669; color: white;',
        simbol: '🕌',
      };
    case 'poskamling':
      return {
        bg: 'bg-blue-600',
        ring: 'bg-blue-400',
        badgeClass: 'background-color: #2563eb; color: white;',
        simbol: '🛡️',
      };
    case 'posyandu':
      return {
        bg: 'bg-rose-500',
        ring: 'bg-rose-400',
        badgeClass: 'background-color: #e11d48; color: white;',
        simbol: '🏥',
      };
    default:
      return {
        bg: 'bg-brand-600',
        ring: 'bg-brand-400',
        badgeClass: 'background-color: #4f46e5; color: white;',
        simbol: '📍',
      };
  }
}

function buatDivIcon(item: TitikLokasi) {
  const { bg, ring, simbol } = dapatkanWarnaDanIkon(item);

  return L.divIcon({
    className: 'sigalon-osm-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
        <span class="absolute h-8 w-8 rounded-full opacity-75 animate-ping ${ring}"></span>
        <span class="relative flex h-6 w-6 items-center justify-center rounded-full text-white text-xs shadow-md ring-2 ring-white transition-transform duration-150 group-hover:scale-125 ${bg}">
          ${simbol}
        </span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function buatPopupHtml(item: TitikLokasi, lat: number, lon: number) {
  const { badgeClass } = dapatkanWarnaDanIkon(item);
  const mapsUrl =
    item.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px; min-width: 210px;">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
        <span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; ${badgeClass}">
          ${item.kategoriLabel}
        </span>
        ${
          item.peran
            ? `<span style="padding: 1px 6px; font-size: 9px; font-family: monospace; font-weight: 600; border-radius: 3px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;">${item.peran}</span>`
            : ''
        }
      </div>
      <h4 style="margin: 0; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.3;">
        ${item.nama}
      </h4>
      ${
        item.deskripsi
          ? `<p style="margin: 6px 0 0 0; font-size: 11px; color: #475569; line-height: 1.5;">${item.deskripsi}</p>`
          : ''
      }
      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #f1f5f9;">
        <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #4f46e5; text-decoration: none;">
          <span>Buka di Google Maps</span> ↗
        </a>
      </div>
    </div>
  `;
}

export function PetaOpenStreetMap({ className }: { className?: string }) {
  const { data: hotspots = [], isLoading } = useTitikLokasiList();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [tabAktif, setTabAktif] = useState<'semua' | KategoriTitik>('semua');
  const [modalOpen, setModalOpen] = useState(false);

  // Inisialisasi Peta Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PUSAT_PADUKUHAN,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false, // Hindari mencegat scroll halaman web
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update Markers saat data atau filter kategori berubah
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer || !mapInstanceRef.current) return;

    layer.clearLayers();

    const dataTerfilter = hotspots.filter((item) => {
      if (tabAktif === 'semua') return true;
      return item.kategori === tabAktif;
    });

    dataTerfilter.forEach((item) => {
      const [lat, lon] = dapatkanKoordinat(item);
      const icon = buatDivIcon(item);
      const marker = L.marker([lat, lon], { icon });

      marker.bindPopup(buatPopupHtml(item, lat, lon), {
        maxWidth: 280,
      });

      layer.addLayer(marker);
    });
  }, [hotspots, tabAktif]);

  const resetPusatPeta = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(PUSAT_PADUKUHAN, DEFAULT_ZOOM, { animate: true });
    }
  };

  const jumlahFasilitas = hotspots.filter((t) => t.kategori === 'fasilitas').length;
  const jumlahPerangkat = hotspots.filter((t) => t.kategori === 'perangkat').length;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Filter Kategori Titik di Atas Peta OSM */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTabAktif('semua')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                tabAktif === 'semua'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              Semua Titik
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px]',
                  tabAktif === 'semua'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700',
                )}
              >
                {hotspots.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabAktif('fasilitas')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                tabAktif === 'fasilitas'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              <Building2 className="h-3.5 w-3.5" />
              Fasilitas Umum
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px]',
                  tabAktif === 'fasilitas'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700',
                )}
              >
                {jumlahFasilitas}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabAktif('perangkat')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                tabAktif === 'perangkat'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Perangkat Desa
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px]',
                  tabAktif === 'perangkat'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700',
                )}
              >
                {jumlahPerangkat}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={resetPusatPeta}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
              title="Kembalikan fokus ke pusat Padukuhan Gading Kulon"
            >
              <Focus className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Pusat Wilayah</span>
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
              title="Buka peta ukuran penuh"
            >
              <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Peta Penuh</span>
            </button>
          </div>
        </div>

        {/* Kontainer Peta Leaflet OpenStreetMap */}
        <div
          className={cn(
            'relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-300 shadow-sm min-h-[360px] sm:min-h-[440px] bg-slate-100 z-0',
            className,
          )}
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-xs">
              <span className="text-xs text-slate-500">Memuat titik peta OpenStreetMap…</span>
            </div>
          )}
          {tabAktif === 'perangkat' && jumlahPerangkat === 0 && !isLoading && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-[400] rounded-full bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-white shadow-md backdrop-blur-xs flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-purple-300" />
              <span>Belum ada data kediaman perangkat desa terdaftar</span>
            </div>
          )}
          <div ref={mapContainerRef} className="h-full w-full min-h-[360px] sm:min-h-[440px] z-0" />
        </div>

        {/* Legenda Titik Wilayah OpenStreetMap */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-600 px-1">
          <span className="font-semibold text-slate-700 mr-1">Titik Wilayah:</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Balai Padukuhan
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Masjid / Ibadah
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Pos Ronda Lingkungan
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 border border-slate-200">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Posyandu & Sosial
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 border border-purple-200 text-purple-800">
            <span className="h-2 w-2 rounded-full bg-purple-700" />
            Perangkat Desa (Dukuh, RW, RT)
          </span>
        </div>
      </div>

      {/* Modal Peta Penuh OpenStreetMap */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Peta Interaktif OpenStreetMap Padukuhan Gading Kulon"
        className="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="rounded-lg overflow-hidden border border-slate-200 h-[65vh] w-full bg-slate-100">
            <iframe
              title="Peta OpenStreetMap Layar Penuh"
              className="h-full w-full border-0"
              src="https://www.openstreetmap.org/export/embed.html?bbox=110.354000%2C-7.662000%2C110.372000%2C-7.651000&layer=mapnik&marker=-7.656826%2C110.363111"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-500">
              Peta geospasial resmi berbasis OpenStreetMap kontributor terbuka.
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=-7.656826,110.363111"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="h-3 w-3 opacity-75" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
