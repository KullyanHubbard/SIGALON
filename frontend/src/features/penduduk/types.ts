export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN';

export type Agama =
  'ISLAM' | 'KRISTEN' | 'KATOLIK' | 'HINDU' | 'BUDDHA' | 'KONGHUCU' | 'LAINNYA';

export type StatusPerkawinan =
  'BELUM_KAWIN' | 'KAWIN' | 'CERAI_HIDUP' | 'CERAI_MATI';

export type Pendidikan =
  'TIDAK_SEKOLAH' | 'SD' | 'SMP' | 'SMA' | 'D3' | 'S1' | 'S2' | 'S3';

export type StatusHubunganKeluarga =
  'KEPALA_KELUARGA' | 'ISTRI' | 'ANAK' | 'FAMILI_LAIN' | 'LAINNYA';

export type GolonganDarah = 'A' | 'B' | 'AB' | 'O' | 'TIDAK_TAHU';

export type StatusKependudukan = 'AKTIF' | 'PINDAH' | 'MENINGGAL';

export interface Alamat {
  jalan: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
}

export interface Penduduk {
  id: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;

  tanggalLahir: string;
  agama: Agama;
  statusPerkawinan: StatusPerkawinan;
  pendidikan: Pendidikan;
  pekerjaan: string;
  golonganDarah: GolonganDarah;
  statusHubunganKeluarga: StatusHubunganKeluarga;
  kewarganegaraan: string;

  jabatan: 'WARGA' | 'DUKUH' | 'RW' | 'RT';
  alamat: Alamat;
  statusKependudukan: StatusKependudukan;

  deletedAt: string | null;
}

export type KelompokUmur =
  '0-5' | '6-12' | '13-17' | '18-25' | '26-40' | '41-60' | '60+';

export interface FilterPenduduk {
  jenisKelamin?: JenisKelamin;
  agama?: Agama;
  golonganDarah?: GolonganDarah;
  pendidikan?: Pendidikan;
  statusPerkawinan?: StatusPerkawinan;
  statusHubunganKeluarga?: StatusHubunganKeluarga;
  pekerjaan?: string;
  rt?: string;
  rw?: string;
  kelompokUmur?: KelompokUmur;
}

export interface FilterOpsi {
  rt: string[];
  rw: string[];
  pekerjaan: string[];
}

export type PendudukBaru = Omit<
  Penduduk,
  'id' | 'statusKependudukan' | 'deletedAt' | 'jabatan'
>;

export interface PendudukUbah {
  nama?: string;
  jenisKelamin?: JenisKelamin;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: Agama;
  statusPerkawinan?: StatusPerkawinan;
  pendidikan?: Pendidikan;
  pekerjaan?: string;
  golonganDarah?: GolonganDarah;
  statusHubunganKeluarga?: StatusHubunganKeluarga;
  kewarganegaraan?: string;
  statusKependudukan?: StatusKependudukan;
  alamat?: Partial<Alamat>;
}
