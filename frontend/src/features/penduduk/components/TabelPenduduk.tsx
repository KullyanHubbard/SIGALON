import { Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, Td, Th } from '@/components/ui/Table';
import type { PendudukRow } from '../view-model';

interface TabelPendudukProps {
  rows: PendudukRow[];
  onPilih: (row: PendudukRow) => void;
  onUbah: (id: string) => void;
}

export function TabelPenduduk({ rows, onPilih, onUbah }: TabelPendudukProps) {
  return (
    <Table className="min-w-[620px]">
      <thead>
        <tr>
          <Th>Nama</Th>
          <Th>L/P</Th>
          <Th>Umur</Th>
          <Th>Agama</Th>
          <Th>RT/RW</Th>
          <Th>Keterangan</Th>
          <Th className="text-right">Aksi</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="transition-colors hover:bg-slate-50">
            <Td className="font-medium text-slate-900">{row.nama}</Td>
            <Td>{row.jenisKelamin}</Td>
            <Td className="tabular-nums">{row.umur}</Td>
            <Td>{row.agama}</Td>
            <Td className="tabular-nums text-slate-600">{row.rtRw}</Td>
            <Td>
              <div className="flex flex-wrap items-center gap-1.5">
                {row.keteranganTone ? (
                  <Badge
                    tone={row.keteranganTone}
                    className="rounded-md font-medium"
                    title={
                      row.catatanKematian
                        ? `${row.keterangan}: ${row.catatanKematian}`
                        : undefined
                    }
                  >
                    {row.catatanKematian
                      ? `${row.keterangan} (${row.catatanKematian})`
                      : row.keterangan}
                  </Badge>
                ) : row.catatanKematian ? (
                  <Badge
                    tone="slate"
                    className="rounded-md font-medium"
                    title={row.catatanKematian}
                  >
                    Meninggal ({row.catatanKematian})
                  </Badge>
                ) : null}
                {row.statusDomisili === 'KONTRAK' && (
                  <Badge tone="amber" className="rounded-md font-semibold">
                    Ngontrak
                  </Badge>
                )}
                {row.bansos?.map((b) => (
                  <Badge
                    key={b}
                    tone={b === 'BPNT' ? 'green' : 'brand'}
                    className="rounded-md font-medium"
                  >
                    {b}
                  </Badge>
                ))}
                {row.catatanPerkawinan && (
                  <Badge
                    tone="red"
                    className="rounded-md text-[11px] font-medium"
                    title={row.catatanPerkawinan}
                  >
                    {row.catatanPerkawinan}
                  </Badge>
                )}
                {!row.keteranganTone &&
                  row.statusDomisili !== 'KONTRAK' &&
                  (!row.bansos || row.bansos.length === 0) &&
                  !row.catatanPerkawinan &&
                  !row.catatanKematian && (
                    <span className="text-xs text-slate-400">-</span>
                  )}
              </div>
            </Td>
            {}
            <Td className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onPilih(row)}
                  title="Lihat detail"
                  aria-label={`Lihat detail ${row.nama}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onUbah(row.id)}
                  title="Ubah data"
                  aria-label={`Ubah data ${row.nama}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
