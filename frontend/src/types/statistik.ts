export interface Distribusi {
  label: string;
  value: number;
}

export interface PanelDistribusi {
  id: string;
  judul: string;
  jenis: 'pie' | 'bar';
  data: Distribusi[];

  deskripsi?: string;

  lebarPenuh?: boolean;
}
