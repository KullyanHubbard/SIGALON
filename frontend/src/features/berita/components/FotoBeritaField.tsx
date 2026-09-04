import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { bacaFoto } from '../foto';

interface FotoBeritaFieldProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

export function FotoBeritaField({ value, onChange }: FotoBeritaFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const onPilih = async (berkas: File | undefined) => {
    if (!berkas) return;
    const hasil = await bacaFoto(berkas);
    if ('galat' in hasil) {
      setError(hasil.galat);
      return;
    }
    setError(null);
    onChange(hasil.dataUrl);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Foto Sampul
      </label>
      {value && (
        <div className="mb-2 flex items-center gap-3">
          <img
            src={value}
            alt="Pratinjau foto utama"
            className="h-20 w-32 rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
          >
            Hapus foto
          </Button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => void onPilih(e.target.files?.[0])}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-600/20 dark:file:text-brand-300"
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          Opsional. JPG/PNG. Foto besar otomatis diperkecil, dan metadata
          lokasinya dibuang sebelum terbit.
        </p>
      )}
    </div>
  );
}
