import logoGelap from '@/assets/Logo-darkmode.png';
import logoTerang from '@/assets/Logo-lightmode.png';
import { env } from '@/config/env';
import { useTemaGelap } from '@/hooks/use-tema-gelap';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const gelap = useTemaGelap();

  return (
    <img
      src={gelap ? logoGelap : logoTerang}
      alt={env.appName}
      width={592}
      height={96}
      decoding="async"
      className={cn('h-7 w-auto', className)}
    />
  );
}
