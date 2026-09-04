import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bacaLokal, tulisLokal } from '@/lib/utils';
import { kunjunganApi } from '../api/kunjungan-api';

const KUNCI = 'siduk.kunjunganTerhitung';

function hariIni(): string {
  return new Date().toLocaleDateString('sv-SE');
}

function sudahDihitungHariIni(): boolean {
  return bacaLokal(KUNCI) === hariIni();
}

const kunciQuery = () => ['kunjungan', hariIni()] as const;

export function useKunjunganHariIni(): number | undefined {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: kunciQuery(),
    queryFn: () => kunjunganApi.lihat(),
  });

  const dipicu = useRef(false);
  useEffect(() => {
    if (dipicu.current || sudahDihitungHariIni()) return;
    dipicu.current = true;
    kunjunganApi
      .tambah()
      .then((jumlah) => {
        tulisLokal(KUNCI, hariIni());
        queryClient.setQueryData(kunciQuery(), jumlah);
      })

      .catch(() => {
        dipicu.current = false;
      });
  }, [queryClient]);

  return query.data;
}
