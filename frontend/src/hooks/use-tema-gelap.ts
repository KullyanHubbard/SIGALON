import { useEffect, useState } from 'react';

export function useTemaGelap(): boolean {
  const [gelap, setGelap] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const akar = document.documentElement;
    const pantau = new MutationObserver(() =>
      setGelap(akar.classList.contains('dark')),
    );
    pantau.observe(akar, { attributes: true, attributeFilter: ['class'] });
    return () => pantau.disconnect();
  }, []);

  return gelap;
}
