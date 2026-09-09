import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ExternalLink,
  Focus,
  Maximize2,
  UserCheck,
} from 'lucide-react';
import { useTitikLokasiList } from '@/features/titik-lokasi/hooks/use-titik-lokasi';
import type { KategoriTitik, TitikLokasi } from '@/features/titik-lokasi/types';
import { dapatkanTemaTitik } from '@/features/titik-lokasi/warna';
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
  const tema = dapatkanTemaTitik(item);
  return {
    bg: tema.bgIkon,
    ring: tema.ringHotspot,
    badgeClass: `background-color: ${tema.bgHex}; color: white;`,
    simbol: tema.simbol,
  };
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
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setTabAktif('semua')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                tabAktif === 'semua'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              Semua Titik
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                  tabAktif === 'semua'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 text-slate-900',
                )}
              >
                {hotspots.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabAktif('fasilitas')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                tabAktif === 'fasilitas'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              Fasilitas Umum
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                  tabAktif === 'fasilitas'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 text-slate-900',
                )}
              >
                {jumlahFasilitas}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTabAktif('perangkat')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer',
                tabAktif === 'perangkat'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              Perangkat Desa
              <span
                className={cn(
                  'ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                  tabAktif === 'perangkat'
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-200 text-slate-900',
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
              title="Kembalikan fokus ke pusat Padukuhan Gading Kulon"
            >
              <Focus className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Pusat Wilayah</span>
            </button>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
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
            'relative overflow-hidden rounded-xl border border-slate-300 shadow-sm min-h-[360px] sm:min-h-[440px] bg-slate-100 z-0',
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
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#FACC15] px-4 py-2 text-xs font-bold text-[#4C1D95] shadow-sm transition-all hover:bg-yellow-400 hover:shadow-md active:scale-[0.98]"
            >
              <span>Buka di Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
}
