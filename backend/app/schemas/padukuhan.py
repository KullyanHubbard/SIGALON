"""Keterangan tetap padukuhan — cerminan `frontend/src/lib/padukuhan.ts`.

Semua kolomnya teks yang dibaca manusia, jadi yang dijaga cuma "tidak kosong"
dan "tidak kepanjangan". `luasWilayah` sengaja teks (`162,4 ha`), bukan angka:
satuannya ikut ditulis perangkat desa, dan tidak ada satu pun tempat yang
menghitungnya.
"""

from pydantic import BaseModel, Field, field_validator


def _kolom(maks: int) -> object:
    return Field(min_length=1, max_length=maks)


class Padukuhan(BaseModel):
    nama: str = _kolom(100)
    namaLengkap: str = _kolom(150)
    desa: str = _kolom(100)
    kapanewon: str = _kolom(100)
    kabupaten: str = _kolom(100)
    provinsi: str = _kolom(100)
    luasWilayah: str = _kolom(50)
    telepon: str = _kolom(30)
    email: str = _kolom(150)
    #: Paragraf dipisah baris kosong.
    sejarah: str = Field(min_length=20, max_length=8000)
    batasUtara: str = _kolom(150)
    batasTimur: str = _kolom(150)
    batasSelatan: str = _kolom(150)
    batasBarat: str = _kolom(150)

    @field_validator("*", mode="before")
    @classmethod
    def _rapikan(cls, v: object) -> object:
        """Spasi dibuang SEBELUM panjangnya dihitung — kalau tidak, kolom berisi
        satu spasi lolos sebagai "tidak kosong"."""
        return v.strip() if isinstance(v, str) else v

    @field_validator("email")
    @classmethod
    def _bentuk_email(cls, v: str) -> str:
        """Dipasang ke `mailto:` di footer dan tombol Pengaduan. Pemeriksaan
        seadanya: yang menentukan alamatnya benar-benar hidup cuma surat yang
        sampai, bukan pola apa pun."""
        if v.count("@") != 1 or v.startswith("@") or v.endswith("@") or " " in v:
            raise ValueError("Email tidak berbentuk alamat surel")
        return v
