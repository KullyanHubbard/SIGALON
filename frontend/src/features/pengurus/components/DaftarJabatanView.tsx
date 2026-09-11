import { Card, CardHeader } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import ikonKeyRound from '@/assets/icons/nav/key-round.svg';
import type { Jabatan } from '../types';

interface DaftarJabatanViewProps {
  isLoading: boolean;
  isError: boolean;
  jabatan: Jabatan[] | undefined;
  sedangMengubah: boolean;
  onIsiJabatan: (jabatan: Jabatan) => void;
  onResetPassword: (jabatan: Jabatan) => void;
  onAjukanPergantian: (jabatan: Jabatan) => void;

  lpmNama: string | null | undefined;
  onUbahLpm: () => void;
}

const tombolAksiClass =
  'focus-ring inline-flex items-center justify-center gap-1.5 rounded-md border-1 border-black bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-900 shadow-xs transition-all hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

const tombolResetClass =
  'focus-ring inline-flex items-center justify-center gap-1.5 rounded-md border-1 border-black bg-white px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-900 shadow-xs transition-all hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer';

export function DaftarJabatanView({
  isLoading,
  isError,
  jabatan,
  sedangMengubah,
  onIsiJabatan,
  onResetPassword,
  onAjukanPergantian,
  lpmNama,
  onUbahLpm,
}: DaftarJabatanViewProps) {
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader title="Daftar Akun" />
      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        data={jabatan}
        errorMessage="Gagal memuat daftar akun pengurus."
      >
        {(daftar) => (
          <Table className="min-w-[580px]">
            <thead>
              <tr>
                <Th className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Jabatan
                </Th>
                <Th className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nama
                </Th>
                <Th className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Username
                </Th>
                <Th className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Status
                </Th>
                <Th className="bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-700">
                  Aksi
                </Th>
              </tr>
            </thead>
            <tbody>
              {daftar.map((j) => (
                <tr
                  key={j.kode}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <Td className="font-semibold text-slate-900">{j.label}</Td>
                  <Td className="font-medium text-slate-800">
                    {j.pemegang ? (
                      j.pemegang.nama
                    ) : j.calon ? (
                      <span className="font-normal text-slate-500">
                        {j.calon.nama}{' '}
                        <span className="text-xs text-slate-400">
                          (dari data warga)
                        </span>
                      </span>
                    ) : (
                      <span className="font-normal text-slate-400">—</span>
                    )}
                  </Td>
                  <Td className="font-mono text-xs text-slate-600">
                    {j.pemegang?.username ?? (
                      <span className="font-sans text-sm text-slate-400">
                        —
                      </span>
                    )}
                  </Td>
                  <Td>
                    {j.pemegang ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${j.pemegang.harusGantiPassword ? 'bg-amber-500' : 'bg-emerald-600'}`}
                        />
                        <span className="text-sm font-bold text-slate-800">
                          {j.pemegang.harusGantiPassword
                            ? 'Belum ganti password'
                            : 'Aktif'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                        <span className="text-sm font-bold text-slate-800">
                          Kosong
                        </span>
                      </div>
                    )}
                  </Td>
                  <Td>
                    {j.pemegang ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={tombolAksiClass}
                          disabled={sedangMengubah}
                          onClick={() => onAjukanPergantian(j)}
                        >
                          Ajukan Pergantian
                        </button>
                        <button
                          type="button"
                          className={tombolResetClass}
                          title="Reset Password"
                          onClick={() => onResetPassword(j)}
                        >
                          <span
                            aria-hidden
                            className="block h-3.5 w-3.5 bg-current"
                            style={{
                              mask: `url("${ikonKeyRound}") center / contain no-repeat`,
                              WebkitMask: `url("${ikonKeyRound}") center / contain no-repeat`,
                            }}
                          />
                          Reset
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={tombolAksiClass}
                        onClick={() => onIsiJabatan(j)}
                      >
                        + Buat Akun
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
              {/* Bukan bagian dari `daftar.map`: LPM tidak punya baris di
                  tabel `pengurus`, jadi bukan `Jabatan` — datanya lewat
                  prop terpisah (`lpmNama`/`onUbahLpm`), bukan array ini. */}
              <tr className="transition-colors hover:bg-slate-50/80">
                <Td className="border-b-0 font-semibold text-slate-900">
                  Ketua LPM
                </Td>
                <Td className="border-b-0 font-medium text-slate-800">
                  {lpmNama ? (
                    lpmNama
                  ) : (
                    <span className="font-normal text-slate-400">—</span>
                  )}
                </Td>
                <Td className="border-b-0 text-sm text-slate-400">—</Td>
                <Td className="border-b-0">
                  {lpmNama ? (
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      <span className="text-sm font-bold text-slate-800">
                        Terisi
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                      <span className="text-sm font-bold text-slate-800">
                        Kosong
                      </span>
                    </div>
                  )}
                </Td>
                <Td className="border-b-0">
                  {lpmNama ? (
                    <button
                      type="button"
                      className={tombolAksiClass}
                      disabled={sedangMengubah}
                      onClick={() =>
                        onAjukanPergantian({
                          kode: 'LPM',
                          role: 'LPM' as unknown as Jabatan['role'],
                          label: 'Ketua LPM',
                          pemegang: {
                            nama: lpmNama,
                          } as unknown as Jabatan['pemegang'],
                          calon: null,
                        })
                      }
                    >
                      Ajukan Pergantian
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={tombolAksiClass}
                      onClick={onUbahLpm}
                    >
                      + Pilih Warga
                    </button>
                  )}
                </Td>
              </tr>
            </tbody>
          </Table>
        )}
      </QueryBoundary>
    </Card>
  );
}
