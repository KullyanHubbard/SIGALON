import { useMemo } from 'react';
import { formatAngka } from '@/lib/utils';

interface ProporsiGenderBarProps {
  totalLakiLaki: number;
  totalPerempuan: number;
  totalPenduduk: number;
  className?: string;
}

export function ProporsiGenderBar({
  totalLakiLaki,
  totalPerempuan,
  totalPenduduk,
  className = '',
}: ProporsiGenderBarProps) {
  const { persenLaki, persenPerempuan, rasioJenisKelamin } = useMemo(() => {
    if (!totalPenduduk || totalPenduduk <= 0) {
      return { persenLaki: 50, persenPerempuan: 50, rasioJenisKelamin: '100' };
    }
    const pLaki = Math.round((totalLakiLaki / totalPenduduk) * 100);
    const pPerempuan = 100 - pLaki;
    const rasio =
      totalPerempuan > 0
        ? ((totalLakiLaki / totalPerempuan) * 100).toFixed(1)
        : '100';

    return {
      persenLaki: pLaki,
      persenPerempuan: pPerempuan,
      rasioJenisKelamin: rasio,
    };
  }, [totalLakiLaki, totalPerempuan, totalPenduduk]);

  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-3">
        {/* Baris Keterangan Atas */}
        <div className="flex items-center justify-between gap-2">
          {/* Sisi Laki-laki */}
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-brand-600 ring-2 ring-brand-200" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Laki-laki
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{formatAngka(totalLakiLaki)}</span> jiwa ({persenLaki}%)
              </p>
            </div>
          </div>

          {/* Sisi Perempuan */}
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800">
                Perempuan
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-bold text-slate-900">{formatAngka(totalPerempuan)}</span> jiwa ({persenPerempuan}%)
              </p>
            </div>
            <span className="flex h-3 w-3 rounded-full bg-rose-500 ring-2 ring-rose-200" />
          </div>
        </div>

        {/* Bilah Visual Proporsi (Bar Chart Ganda) */}
        <div className="relative flex h-3 sm:h-3.5 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
          <div
            style={{ width: `${persenLaki}%` }}
            className="h-full bg-gradient-to-r from-brand-700 to-brand-500 transition-all duration-1000 ease-out"
            title={`Laki-laki: ${persenLaki}%`}
          />
          <div
            style={{ width: `${persenPerempuan}%` }}
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out"
            title={`Perempuan: ${persenPerempuan}%`}
          />
        </div>

        {/* Indikator Rasio Demografi */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] sm:text-xs text-slate-500">
          <span>Keseimbangan Komposisi Gender</span>
          <span className="font-medium text-slate-700">
            Rasio Jenis Kelamin: <span className="font-semibold text-brand-700">{rasioJenisKelamin}</span> pria per 100 wanita
          </span>
        </div>
      </div>
    </div>
  );
}
