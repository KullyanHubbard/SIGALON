import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'brand' | 'green' | 'amber' | 'slate' | 'red';

/**
 * Nada = warna latar saja; teksnya mewarisi warna sel di sekitarnya.
 *
 * Teks berwarna membuat badge jadi dua sinyal untuk satu informasi, dan di
 * tabel hasilnya satu kolom yang warnanya beda sendiri dari kolom lain. Latar
 * yang menandai, teks yang dibaca.
 *
 * Latar memakai tint transparan, bukan `bg-*-50`: ramp warna literal
 * (brand/green/amber/red) tidak dibalik di mode gelap, jadi `-50` tetap jadi
 * tambalan hampir putih di atas kartu gelap. Tint menumpang latar apa pun di
 * bawahnya, jadi satu kelas benar di dua mode — dan karena teksnya mewarisi,
 * tidak ada `dark:` sama sekali di sini. Pola yang sama dengan `SOROT_BRAND`
 * di `lib/colors.ts`.
 */
const tones: Record<Tone, string> = {
  brand: 'bg-brand-600/20',
  green: 'bg-green-600/20',
  amber: 'bg-amber-500/20',
  slate: 'bg-slate-500/20',
  red: 'bg-red-600/20',
};

export function Badge({
  tone = 'slate',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
