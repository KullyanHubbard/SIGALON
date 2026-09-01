import { useState } from 'react';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDismissOnOutside } from '@/hooks/use-dismiss-on-outside';
import { cn } from '@/lib/utils';
import type { FilterOpsi, FilterPenduduk } from '../types';
import {
  agamaLabel,
  filterLabel,
  golonganDarahLabel,
  jenisKelaminLabel,
  kelompokUmurOpsi,
  pendidikanLabel,
  statusHubunganLabel,
  statusPerkawinanLabel,
  toFilterChips,
} from '../labels';

/** Satu pilihan dropdown: nilai yang dikirim ke API + teks yang dibaca orang. */
type Opsi = readonly [nilai: string, teks: string];

/**
 * Filter yang tinggal di dalam panel, bukan di baris depan.
 *
 * Baris depan cuma memuat wilayah (RW/RT) karena itu yang dipakai tiap hari:
 * pengurus bekerja per-RT, sisanya dipakai sesekali saat mencari kelompok
 * tertentu. Daftar ini juga yang dihitung jadi angka pada tombol Filter —
 * menghitung RW/RT ikut berarti memberi tahu ada filter tersembunyi padahal
 * pilihannya terpampang di sebelahnya.
 */
const LANJUTAN = [
  'jenisKelamin',
  'kelompokUmur',
  'agama',
  'pendidikan',
  'statusPerkawinan',
  'statusHubunganKeluarga',
  'golonganDarah',
  'pekerjaan',
] as const satisfies readonly (keyof FilterPenduduk)[];

interface ToolbarPendudukProps {
  search: string;
  onSearchChange: (value: string) => void;
  value: FilterPenduduk;
  /** Pilihan non-enum dari data (RT/RW/pekerjaan). `undefined` selagi dimuat. */
  opsi: FilterOpsi | undefined;
  onChange: (next: FilterPenduduk) => void;
  onTambah: () => void;
}

function dariLabel(map: Record<string, string>): Opsi[] {
  return Object.entries(map);
}

function dariData(nilai: string[] | undefined): Opsi[] {
  return (nilai ?? []).map((v) => [v, v] as Opsi);
}

/** Dropdown ramping untuk baris depan: tanpa label di atasnya, tingginya sama
 *  dengan tombol di sebelahnya supaya barisnya rata. */
function PilihanRingkas({
  label,
  nilai,
  opsi,
  onPilih,
}: {
  label: string;
  nilai: string | undefined;
  opsi: Opsi[];
  onPilih: (v: string) => void;
}) {
  return (
    <select
      aria-label={label}
      value={nilai ?? ''}
      onChange={(e) => onPilih(e.target.value)}
      className={cn(
        // `border-1`, bukan `border`: `borderWidth.DEFAULT` di tailwind.config
        // di-setel 4px.
        'focus-ring h-10 rounded-lg border-1 bg-surface px-3 text-sm transition-colors',
        nilai
          ? 'border-brand-600 font-medium text-brand-700 dark:text-brand-300'
          : 'border-slate-300 text-slate-700',
      )}
    >
      <option value="">{label}: Semua</option>
      {opsi.map(([v, teks]) => (
        <option key={v} value={v} className="bg-surface text-slate-900">
          {teks}
        </option>
      ))}
    </select>
  );
}

/** Dropdown berlabel di dalam panel filter. */
function PilihanPanel({
  field,
  nilai,
  opsi,
  onPilih,
}: {
  field: keyof FilterPenduduk;
  nilai: string | undefined;
  opsi: Opsi[];
  onPilih: (field: keyof FilterPenduduk, v: string) => void;
}) {
  return (
    <Select
      name={field}
      label={filterLabel[field]}
      value={nilai ?? ''}
      onChange={(e) => onPilih(field, e.target.value)}
    >
      <option value="">Semua</option>
      {opsi.map(([v, teks]) => (
        <option key={v} value={v} className="bg-surface text-slate-900">
          {teks}
        </option>
      ))}
    </Select>
  );
}

/**
 * Bilah kontrol daftar penduduk: cari nama, wilayah, panel filter lanjutan, dan
 * tombol tambah warga — satu baris, dengan chip filter aktif di bawahnya.
 *
 * Chip itu yang membuat panel aman dilipat: filter yang tidak kelihatan adalah
 * filter yang bikin orang mengira datanya hilang. Semua filter digabung AND
 * oleh backend.
 *
 * Menggantikan pencarian NIK/No. KK yang hilang bersama dua kolom itu: yang
 * dicari pengurus sekarang selalu sekelompok orang, bukan satu nomor.
 */
export function ToolbarPenduduk({
  search,
  onSearchChange,
  value,
  opsi,
  onChange,
  onTambah,
}: ToolbarPendudukProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useDismissOnOutside<HTMLDivElement>(panelOpen, () =>
    setPanelOpen(false),
  );

  /**
   * Nilai kosong dibuang dari objek, bukan disimpan sebagai `''` — kalau tidak,
   * query key React Query berbeda hanya karena ada field bernilai kosong, dan
   * cache-nya pecah tanpa alasan.
   */
  const set = (field: keyof FilterPenduduk, v: string) => {
    const next = { ...value };
    if (v) {
      // Nilai <select> selalu `string`; union sempitnya dijaga oleh daftar
      // pilihan yang dibangkitkan dari `labels`/`opsi`, bukan input bebas.
      next[field] = v as never;
    } else {
      delete next[field];
    }
    onChange(next);
  };

  const chips = toFilterChips(value);
  const jumlahLanjutan = LANJUTAN.filter((f) => value[f]).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[12rem] flex-1 sm:max-w-xs">
          <Input
            icon={<Search className="h-4 w-4" />}
            placeholder="Cari nama warga…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Cari nama warga"
          />
        </div>

        <PilihanRingkas
          label="RW"
          nilai={value.rw}
          opsi={dariData(opsi?.rw)}
          onPilih={(v) => set('rw', v)}
        />
        <PilihanRingkas
          label="RT"
          nilai={value.rt}
          opsi={dariData(opsi?.rt)}
          onPilih={(v) => set('rt', v)}
        />

        {/* `relative` dipasang di grup kanan, bukan di tombolnya: panel
            digantung pada tepi kanan toolbar, jadi di layar sempit ia melebar
            ke dalam kartu, bukan keluar layar. */}
        <div
          className="relative ml-auto flex items-center gap-2"
          ref={panelRef}
        >
          <Button
            variant="outline"
            onClick={() => setPanelOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={panelOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {jumlahLanjutan > 0 && (
              <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
                {jumlahLanjutan}
              </span>
            )}
          </Button>

          <Button
            onClick={() => {
              setPanelOpen(false);
              onTambah();
            }}
          >
            <Plus className="h-4 w-4" />
            Tambah Warga
          </Button>

          {panelOpen && (
            <div
              role="dialog"
              aria-label="Filter lanjutan"
              className="absolute right-0 top-full z-30 mt-2 w-[min(26rem,calc(100vw-3rem))] rounded-xl border-1 border-slate-200 bg-surface p-4 shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">
                  Filter lanjutan
                </p>
                {jumlahLanjutan > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const next = { ...value };
                      for (const f of LANJUTAN) delete next[f];
                      onChange(next);
                    }}
                  >
                    Atur ulang
                  </Button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <PilihanPanel
                  field="jenisKelamin"
                  nilai={value.jenisKelamin}
                  opsi={dariLabel(jenisKelaminLabel)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="kelompokUmur"
                  nilai={value.kelompokUmur}
                  opsi={kelompokUmurOpsi.map((u) => [u, `${u} th`] as Opsi)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="agama"
                  nilai={value.agama}
                  opsi={dariLabel(agamaLabel)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="pendidikan"
                  nilai={value.pendidikan}
                  opsi={dariLabel(pendidikanLabel)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="statusPerkawinan"
                  nilai={value.statusPerkawinan}
                  opsi={dariLabel(statusPerkawinanLabel)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="statusHubunganKeluarga"
                  nilai={value.statusHubunganKeluarga}
                  opsi={dariLabel(statusHubunganLabel)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="golonganDarah"
                  nilai={value.golonganDarah}
                  opsi={dariLabel(golonganDarahLabel)}
                  onPilih={set}
                />
                <PilihanPanel
                  field="pekerjaan"
                  nilai={value.pekerjaan}
                  opsi={dariData(opsi?.pekerjaan)}
                  onPilih={set}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <span
              key={chip.field}
              className="inline-flex items-center gap-1.5 rounded-full border-1 border-slate-200 bg-slate-50 py-1 pl-3 pr-1.5 text-xs text-slate-700"
            >
              <span className="text-slate-500">{chip.label}:</span>
              <span className="font-medium">{chip.nilai}</span>
              <button
                type="button"
                onClick={() => set(chip.field, '')}
                aria-label={`Hapus filter ${chip.label}`}
                className="focus-ring rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <Button size="sm" variant="ghost" onClick={() => onChange({})}>
            Hapus semua
          </Button>
        </div>
      )}
    </div>
  );
}
