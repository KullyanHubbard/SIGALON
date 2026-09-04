import { useEffect, useState, type ReactNode } from 'react';
import { CHART_KATEGORI_COLORS, CHART_SLICE_LABEL_COLOR } from '@/lib/colors';
import { irisanDonut, jalurIrisan, titik } from './donut-geometri';
import { LegendaDonut } from './LegendaDonut';
import type { Distribusi } from '@/types/statistik';

interface DistribusiPieChartProps {
  data: Distribusi[];

  height?: number;

  showLegend?: boolean;

  center?: ReactNode;

  labelIrisan?: (index: number) => string[];

  warna?: readonly string[];
}

const CELAH_DERAJAT = 0.6;

const RADIUS_LUAR = 0.88;
const RADIUS_DALAM_BERLABEL = 0.52;
const RADIUS_DALAM = 0.58;

function LabelIrisan({
  pusat,
  radius,
  sudut,
  teks,
}: {
  pusat: number;
  radius: number;
  sudut: number;
  teks: string[];
}) {
  const [x, y] = titik(pusat, pusat, radius, sudut);

  return (
    <text
      x={x}
      y={y}
      className="font-sans"
      fill={CHART_SLICE_LABEL_COLOR}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {teks.map((isi, i) => (
        <tspan
          key={isi}
          x={x}
          dy={i === 0 ? -5 : 20}
          fontSize={i === 0 ? 15 : 14}
          fontWeight={i === 0 ? 700 : 600}
        >
          {isi}
        </tspan>
      ))}
    </text>
  );
}

export function DistribusiPieChart({
  data,
  height = 260,
  showLegend = true,
  center,
  labelIrisan,
  warna = CHART_KATEGORI_COLORS,
}: DistribusiPieChartProps) {
  const [sempit, setSempit] = useState(
    () => window.matchMedia('(max-width: 639px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const ikuti = (e: MediaQueryListEvent) => setSempit(e.matches);
    setSempit(mq.matches);
    mq.addEventListener('change', ikuti);
    return () => mq.removeEventListener('change', ikuti);
  }, []);

  const sisi = sempit ? Math.min(height, 320) : height;
  const pusat = sisi / 2;
  const rLuar = pusat * RADIUS_LUAR;
  const rDalam = pusat * (labelIrisan ? RADIUS_DALAM_BERLABEL : RADIUS_DALAM);
  const rLabel = (rDalam + rLuar) / 2;

  const irisan = irisanDonut(data.map((d) => d.value));

  const penuh = irisan.length === 1;

  return (
    <>
      {}
      <div className="relative">
        {}
        <svg
          viewBox={`0 0 ${sisi} ${sisi}`}
          width="100%"
          height={sisi}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {penuh ? (
            <circle
              cx={pusat}
              cy={pusat}
              r={rLabel}
              fill="none"
              stroke={warna[irisan[0].index % warna.length]}
              strokeWidth={rLuar - rDalam}
            />
          ) : (
            irisan.map((s) => {
              const celah = Math.min(
                CELAH_DERAJAT / 2,
                (s.akhir - s.mulai) / 4,
              );
              return (
                <path
                  key={s.index}
                  d={jalurIrisan(
                    pusat,
                    pusat,
                    rDalam,
                    rLuar,
                    s.mulai + celah,
                    s.akhir - celah,
                  )}
                  fill={warna[s.index % warna.length]}
                >
                  {}
                  {!labelIrisan && (
                    <title>{`${data[s.index].label}: ${data[s.index].value}`}</title>
                  )}
                </path>
              );
            })
          )}

          {labelIrisan &&
            irisan.map((s) => {
              const teks = labelIrisan(s.index);
              if (teks.length === 0) return null;
              return (
                <LabelIrisan
                  key={s.index}
                  pusat={pusat}
                  radius={rLabel}
                  sudut={s.tengah}
                  teks={teks}
                />
              );
            })}
        </svg>

        {center && (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            aria-hidden
          >
            {center}
          </div>
        )}
      </div>

      {showLegend && <LegendaDonut data={data} warna={warna} />}
    </>
  );
}
