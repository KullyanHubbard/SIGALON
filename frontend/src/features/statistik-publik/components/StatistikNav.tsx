import { CalendarDays } from 'lucide-react';
import ikonDashboard from '@/assets/icons/dashboard.png';
import ikonRw from '@/assets/icons/rw-icon.png';
import { cn } from '@/lib/utils';
import { daftarPeriode, labelPeriode } from '@/lib/tanggal';
import { useStatistikPublik } from '../hooks/use-statistik-publik';

interface StatistikNavProps {
  rwAktif: string | null;

  rtAktif: string | null;
  onPilih: (rw: string | null, rt?: string | null) => void;

  periode: string;
  onPilihPeriode: (periode: string) => void;
}

function itemClass(aktif: boolean) {
  return cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors',
    aktif
      ? 'font-bold text-brand-600'
      : 'font-medium text-slate-900 hover:bg-slate-100',
  );
}

export function StatistikNav({
  rwAktif,
  rtAktif,
  onPilih,
  periode,
  onPilihPeriode,
}: StatistikNavProps) {
  const { data, isError } = useStatistikPublik(periode);

  return (
    <nav aria-label="Bagian statistik" className="space-y-7">
      <button
        type="button"
        onClick={() => onPilih(null)}
        aria-current={rwAktif === null ? 'page' : undefined}
        className={itemClass(rwAktif === null)}
      >
        {}
        <img src={ikonDashboard} alt="" className="h-5 w-5 shrink-0" />
        Dashboard
      </button>

      {}
      <div>
        <p className="px-3 text-sm font-semibold uppercase tracking-widest text-slate-900">
          Periode
        </p>
        <div className="mt-2 flex items-center gap-3 px-3">
          <CalendarDays
            className="h-5 w-5 shrink-0 text-brand-600"
            aria-hidden
          />
          <select
            value={periode}
            onChange={(e) => onPilihPeriode(e.target.value)}
            aria-label="Periode data"
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-surface px-3 py-2 text-base font-medium text-slate-900 outline-none transition-colors hover:border-brand-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            {daftarPeriode(data?.periodeTerawal ?? periode, periode).map(
              (p) => (
                <option key={p} value={p} className="bg-surface text-slate-900">
                  {labelPeriode(p)}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div>
        <p className="px-3 text-sm font-semibold uppercase tracking-widest text-slate-900">
          Statistik Warga
        </p>

        {data ? (
          <ul className="mt-2 space-y-1">
            {data.perRw.map((rw) => (
              <li key={rw.label}>
                <button
                  type="button"
                  onClick={() => onPilih(rw.label)}
                  aria-current={
                    rwAktif === rw.label && rtAktif === null
                      ? 'page'
                      : undefined
                  }
                  className={itemClass(
                    rwAktif === rw.label && rtAktif === null,
                  )}
                >
                  <img src={ikonRw} alt="" className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{rw.label}</span>
                </button>

                {rw.perRt.length > 0 && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {rw.perRt.map((rt) => {
                      const aktif =
                        rwAktif === rw.label && rtAktif === rt.label;
                      return (
                        <li key={rt.label}>
                          <button
                            type="button"
                            onClick={() => onPilih(rw.label, rt.label)}
                            aria-current={aktif ? 'page' : undefined}
                            className={cn(itemClass(aktif), 'py-2 text-sm')}
                          >
                            {}
                            <span
                              aria-hidden
                              className="ml-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50"
                            />
                            <span className="flex-1 text-left">{rt.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs leading-relaxed text-slate-400">
            {isError
              ? 'Rincian per RW belum bisa dimuat.'
              : 'Memuat rincian per RW…'}
          </p>
        )}
      </div>
    </nav>
  );
}
