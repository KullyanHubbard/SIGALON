import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, ExternalLink, HelpCircle, Focus } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { pesanError } from '@/lib/utils';
import type { TitikLokasi, TitikLokasiBaru, TitikLokasiUbah } from '../types';
import { useTambahTitikLokasi, useUbahTitikLokasi } from '../hooks/use-titik-lokasi';

const PUSAT_PADUKUHAN: [number, number] = [-7.656826, 110.363111];
const DEFAULT_ZOOM = 16;

const PETA_BOUNDS = {
  minLat: -7.660500,
  maxLat: -7.653000,
  minLon: 110.358000,
  maxLon: 110.368500,
};

function latLonKeXY(latVal: number, lonVal: number): { x: number; y: number } {
  const hitungX = ((lonVal - PETA_BOUNDS.minLon) / (PETA_BOUNDS.maxLon - PETA_BOUNDS.minLon)) * 100;
  const hitungY = ((PETA_BOUNDS.maxLat - latVal) / (PETA_BOUNDS.maxLat - PETA_BOUNDS.minLat)) * 100;
  return {
    x: Math.round(Math.max(0, Math.min(100, hitungX)) * 10) / 10,
    y: Math.round(Math.max(0, Math.min(100, hitungY)) * 10) / 10,
  };
}

function xyKeLatLon(xVal: number, yVal: number): [number, number] {
  const latVal = PETA_BOUNDS.maxLat - (yVal / 100) * (PETA_BOUNDS.maxLat - PETA_BOUNDS.minLat);
  const lonVal = PETA_BOUNDS.minLon + (xVal / 100) * (PETA_BOUNDS.maxLon - PETA_BOUNDS.minLon);
  return [Number(latVal.toFixed(6)), Number(lonVal.toFixed(6))];
}

function dapatkanSimbolIkon(ikon: string): string {
  switch (ikon) {
    case 'balai':
      return '🏛️';
    case 'ibadah':
      return '🕌';
    case 'poskamling':
      return '🛡️';
    case 'posyandu':
      return '🏥';
    case 'perangkat':
    default:
      return '👤';
  }
}

function buatMarkerIcon(simbol: string, kategori: string) {
  const bgClass = kategori === 'perangkat' ? 'bg-purple-700' : 'bg-rose-600';
  const ringClass = kategori === 'perangkat' ? 'bg-purple-400' : 'bg-rose-400';

  return L.divIcon({
    className: 'sigalon-picker-marker',
    html: `
      <div class="relative flex items-center justify-center cursor-grab active:cursor-grabbing" style="width: 36px; height: 36px;">
        <span class="absolute h-9 w-9 rounded-full opacity-75 animate-ping ${ringClass}"></span>
        <span class="relative flex h-8 w-8 items-center justify-center rounded-full text-white text-sm shadow-xl ring-2 ring-white ${bgClass}">
          ${simbol}
        </span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface DialogUbahTitikLokasiProps {
  open: boolean;
  onClose: () => void;
  titik: TitikLokasi | null; // null jika mode tambah baru
}

export function DialogUbahTitikLokasi({ open, onClose, titik }: DialogUbahTitikLokasiProps) {
  const isTambah = titik === null;
  const ubahMutasi = useUbahTitikLokasi();
  const tambahMutasi = useTambahTitikLokasi();
  const isPending = ubahMutasi.isPending || tambahMutasi.isPending;

  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<'perangkat' | 'fasilitas'>('fasilitas');
  const [kategoriLabel, setKategoriLabel] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [x, setX] = useState<number>(50);
  const [y, setY] = useState<number>(50);
  const [lat, setLat] = useState<string>('');
  const [lon, setLon] = useState<string>('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [ikon, setIkon] = useState('balai');
  const [galatForm, setGalatForm] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Inisialisasi data form saat modal dibuka
  useEffect(() => {
    if (!open) return;

    if (titik) {
      setNama(titik.nama);
      setKategori(titik.kategori);
      setKategoriLabel(titik.kategoriLabel);
      setDeskripsi(titik.deskripsi);
      setX(titik.x);
      setY(titik.y);
      const titikLat =
        titik.lat != null && !isNaN(Number(titik.lat))
          ? Number(titik.lat)
          : xyKeLatLon(titik.x, titik.y)[0];
      const titikLon =
        titik.lon != null && !isNaN(Number(titik.lon))
          ? Number(titik.lon)
          : xyKeLatLon(titik.x, titik.y)[1];

      setLat(titikLat.toFixed(6));
      setLon(titikLon.toFixed(6));
      setGoogleMapsUrl(
        titik.googleMapsUrl ?? `https://maps.google.com/?q=${titikLat.toFixed(6)},${titikLon.toFixed(6)}`,
      );
      setIkon(titik.ikon);
    } else {
      setNama('');
      setKategori('fasilitas');
      setKategoriLabel('Fasilitas Umum');
      setDeskripsi('');
      const defaultCoord = PUSAT_PADUKUHAN;
      const { x: defaultX, y: defaultY } = latLonKeXY(defaultCoord[0], defaultCoord[1]);
      setX(defaultX);
      setY(defaultY);
      setLat(defaultCoord[0].toFixed(6));
      setLon(defaultCoord[1].toFixed(6));
      setGoogleMapsUrl(`https://maps.google.com/?q=${defaultCoord[0]},${defaultCoord[1]}`);
      setIkon('balai');
    }
    setGalatForm(null);
  }, [titik, open]);

  // Fungsi pembantu untuk memperbarui koordinat secara sinkron
  const perbaruiKoordinat = useCallback((latVal: number, lonVal: number) => {
    const latFix = Number(latVal.toFixed(6));
    const lonFix = Number(lonVal.toFixed(6));
    setLat(String(latFix));
    setLon(String(lonFix));
    setGoogleMapsUrl(`https://maps.google.com/?q=${latFix},${lonFix}`);

    const { x: hitungX, y: hitungY } = latLonKeXY(latFix, lonFix);
    setX(hitungX);
    setY(hitungY);
  }, []);

  // Inisialisasi Peta Leaflet OpenStreetMap saat modal terbuka
  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    // Bersihkan instance lama jika ada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    }

    const initLat =
      lat && !isNaN(parseFloat(lat))
        ? parseFloat(lat)
        : titik?.lat != null && !isNaN(Number(titik.lat))
          ? Number(titik.lat)
          : PUSAT_PADUKUHAN[0];
    const initLon =
      lon && !isNaN(parseFloat(lon))
        ? parseFloat(lon)
        : titik?.lon != null && !isNaN(Number(titik.lon))
          ? Number(titik.lon)
          : PUSAT_PADUKUHAN[1];

    const centerCoord: [number, number] = [initLat, initLon];

    const map = L.map(mapContainerRef.current, {
      center: centerCoord,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(map);

    const simbol = dapatkanSimbolIkon(ikon);
    const icon = buatMarkerIcon(simbol, kategori);
    const marker = L.marker(centerCoord, { icon, draggable: true }).addTo(map);

    marker.bindTooltip(nama || 'Titik Terpilih', {
      permanent: true,
      direction: 'top',
      offset: [0, -18],
    });

    // Event klik pada peta
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      perbaruiKoordinat(e.latlng.lat, e.latlng.lng);
    });

    // Event geser pin pada peta
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      perbaruiKoordinat(pos.lat, pos.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size setelah transisi modal selesai agar tiles termuat utuh
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Update tooltip & ikon pin saat nama, ikon, atau kategori berubah
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    const simbol = dapatkanSimbolIkon(ikon);
    marker.setIcon(buatMarkerIcon(simbol, kategori));
    marker.setTooltipContent(nama || 'Titik Terpilih');
  }, [nama, ikon, kategori]);

  // Tangani perubahan manual teks koordinat Lat/Lon
  const handleLatLonInputManual = (newLatStr: string, newLonStr: string) => {
    setLat(newLatStr);
    setLon(newLonStr);
    const numLat = parseFloat(newLatStr);
    const numLon = parseFloat(newLonStr);
    if (!isNaN(numLat) && !isNaN(numLon) && numLat >= -90 && numLat <= 90 && numLon >= -180 && numLon <= 180) {
      setGoogleMapsUrl(`https://maps.google.com/?q=${numLat},${numLon}`);
      const { x: hitungX, y: hitungY } = latLonKeXY(numLat, numLon);
      setX(hitungX);
      setY(hitungY);

      if (markerRef.current && mapInstanceRef.current) {
        markerRef.current.setLatLng([numLat, numLon]);
        mapInstanceRef.current.panTo([numLat, numLon]);
      }
    }
  };

  // Fokuskan peta kembali ke Pusat Wilayah (Balai Padukuhan)
  const fokusPusatWilayah = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(PUSAT_PADUKUHAN, DEFAULT_ZOOM, { animate: true });
      markerRef.current.setLatLng(PUSAT_PADUKUHAN);
      perbaruiKoordinat(PUSAT_PADUKUHAN[0], PUSAT_PADUKUHAN[1]);
    }
  };

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setGalatForm('Nama lokasi wajib diisi.');
      return;
    }
    if (!kategoriLabel.trim()) {
      setGalatForm('Label kategori wajib diisi.');
      return;
    }

    const numLat = lat.trim() ? parseFloat(lat) : null;
    const numLon = lon.trim() ? parseFloat(lon) : null;

    const payload: TitikLokasiUbah = {
      nama: nama.trim(),
      kategori,
      peran: null,
      kategoriLabel: kategoriLabel.trim(),
      deskripsi: deskripsi.trim(),
      x: Number(x) || 50,
      y: Number(y) || 50,
      lat: numLat,
      lon: numLon,
      googleMapsUrl: googleMapsUrl.trim() || (numLat && numLon ? `https://maps.google.com/?q=${numLat},${numLon}` : null),
      ikon,
      urutan: titik?.urutan ?? 0,
    };

    try {
      if (isTambah) {
        await tambahMutasi.mutateAsync(payload as TitikLokasiBaru);
      } else {
        await ubahMutasi.mutateAsync({ id: titik.id, input: payload });
      }
      onClose();
    } catch (err) {
      setGalatForm(pesanError(err, 'Gagal menyimpan titik lokasi.'));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isTambah ? 'Tambah Titik Lokasi' : `Atur Titik: ${titik.nama}`}
      className="max-w-4xl"
    >
      <form onSubmit={handleSimpan} className="space-y-6">
        {galatForm && <Alert tone="error">{galatForm}</Alert>}

        {/* Pemilih Titik Koordinat Berbasis OpenStreetMap Interaktif */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Crosshair className="h-4 w-4 text-brand-600" />
              Pilih Titik pada Peta OpenStreetMap (Klik Langsung atau Seret Pin)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-medium text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                Lat: {lat || '-'} | Lon: {lon || '-'}
              </span>
              <button
                type="button"
                onClick={fokusPusatWilayah}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                title="Pusatkan peta ke Balai Padukuhan"
              >
                <Focus className="h-3 w-3" />
                <span>Pusat Wilayah</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            <HelpCircle className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            Klik di mana saja pada peta jalan OpenStreetMap di bawah atau seret pin merah untuk menentukan koordinat yang akurat.
          </p>

          <div className="relative overflow-hidden rounded-xl border-2 border-slate-300 shadow-inner z-0 bg-slate-100">
            <div
              ref={mapContainerRef}
              className="h-[280px] sm:h-[360px] w-full z-0 cursor-crosshair"
            />
            <div className="pointer-events-none absolute bottom-2 left-2 z-[400] rounded-md bg-slate-900/80 px-2.5 py-1 text-[10px] text-white backdrop-blur-xs">
              <span>💡 Klik pada peta jalan atau seret pin untuk memindahkan titik</span>
            </div>
          </div>
        </div>

        {/* 1. Koordinat GPS (Diletakkan di atas sendiri agar langsung terlihat dan mudah diatur) */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-600" />
              Koordinat GPS (Otomatis Terisi dari Klik Peta)
            </span>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              Posisi Peta: X {x}% | Y {y}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Latitude GPS (Otomatis dari Peta)"
              placeholder="-7.656826"
              value={lat}
              onChange={(e) => handleLatLonInputManual(e.target.value, lon)}
            />
            <Input
              label="Longitude GPS (Otomatis dari Peta)"
              placeholder="110.363111"
              value={lon}
              onChange={(e) => handleLatLonInputManual(lat, e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              Link Google Maps (Otomatis Dihasilkan)
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </label>
            <input
              type="url"
              placeholder="https://maps.google.com/?q=..."
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>
        </div>

        {/* 2. Informasi Detail Tempat / Fasilitas */}
        <div className="grid gap-4 sm:grid-cols-2 border-t border-slate-100 pt-3">
          <Input
            label="Nama Lokasi / Tempat"
            hint="Contoh: Masjid Padukuhan, Balai RW 01, Kediaman Dukuh"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => {
                const val = e.target.value as 'perangkat' | 'fasilitas';
                setKategori(val);
                if (val === 'perangkat') {
                  setKategoriLabel('Perangkat Desa');
                  setIkon('perangkat');
                } else if (val === 'fasilitas' && ikon === 'perangkat') {
                  setIkon('balai');
                  setKategoriLabel('Fasilitas Umum');
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="fasilitas">Fasilitas Umum (Masjid, Balai, Pos Ronda, Posyandu)</option>
              <option value="perangkat">Perangkat Desa (Dukuh, RW, RT)</option>
            </select>
          </div>

          <Input
            label="Label Kategori"
            hint="Teks pada badge popup (mis. Tempat Ibadah, Kepala Dusun)"
            value={kategoriLabel}
            onChange={(e) => setKategoriLabel(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Ikon
            </label>
            <select
              value={ikon}
              onChange={(e) => setIkon(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="balai">🏛️ Balai Pertemuan (Landmark)</option>
              <option value="ibadah">🕌 Tempat Ibadah / Masjid</option>
              <option value="poskamling">🛡️ Pos Keamanan / Ronda</option>
              <option value="posyandu">🏥 Posyandu / Layanan Sosial</option>
              <option value="perangkat">👤 Perangkat Desa / Tokoh Warga</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <Textarea
              label="Keterangan / Deskripsi"
              rows={3}
              hint="Keterangan singkat yang muncul saat warga menekan pin hotspot ini."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button type="submit" isLoading={isPending}>
            Simpan Titik Lokasi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
