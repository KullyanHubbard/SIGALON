"""Keterangan tetap padukuhan: satu baris tunggal di tabel `padukuhan`.

Barisnya BOLEH tidak ada. Selama Admin belum pernah menyimpannya, `ambil()`
mengembalikan `None` dan frontend memakai nilai bawaannya sendiri
(`lib/padukuhan.ts`). Itu disengaja: kalau server ikut menyimpan nilai awal,
ada dua daftar nilai bawaan di dua bahasa yang bisa berbeda diam-diam, dan
tidak ada yang tahu mana yang menang.
"""

from app.core.config import settings
from app.data import db
from app.schemas.padukuhan import Padukuhan

_KOLOM = (
    "nama, namaLengkap, desa, kapanewon, kabupaten, provinsi, luasWilayah,"
    " telepon, email, sejarah, batasUtara, batasTimur, batasSelatan, batasBarat"
)


def ambil() -> Padukuhan | None:
    """Keterangan yang tersimpan, atau `None` kalau Admin belum pernah menyimpan."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute(f"SELECT {_KOLOM} FROM padukuhan WHERE id = 1").fetchone()
    return Padukuhan(**dict(row)) if row else None


def ubah(baru: Padukuhan) -> Padukuhan:
    """Simpan seluruh keterangan sekaligus — formnya memang mengirim semuanya,
    jadi tidak ada perpaduan sebagian yang bisa menyisakan kolom setengah lama."""
    kolom = [k.strip() for k in _KOLOM.split(",")]
    with db.koneksi(settings.DATABASE_FILE) as conn:
        conn.execute(
            f"INSERT INTO padukuhan (id, {_KOLOM}) VALUES"
            f" (1, {', '.join(':' + k for k in kolom)})"
            f" ON CONFLICT(id) DO UPDATE SET"
            f" {', '.join(f'{k} = excluded.{k}' for k in kolom)}",
            baru.model_dump(),
        )
        conn.commit()
    return baru


def demo() -> None:
    """Self-check. Jalankan:
    DATABASE_PATH=/tmp/uji-padukuhan.db .venv/bin/python -m app.data.padukuhan
    """
    assert ambil() is None, "DB uji harus mulai tanpa baris padukuhan"

    def contoh(**ganti: str) -> Padukuhan:
        dasar = dict(
            nama="Gading Kulon", namaLengkap="Padukuhan Gading Kulon",
            desa="Donokerto", kapanewon="Kapanewon Turi", kabupaten="Sleman",
            provinsi="Daerah Istimewa Yogyakarta", luasWilayah="162,4 ha",
            telepon="+62 812-2761-391", email="gadingkulon@gmail.com",
            sejarah="Padukuhan di lereng Merapi yang hidup dari pertanian.",
            batasUtara="Gading Lor", batasTimur="Gading Wetan",
            batasSelatan="Ngipak", batasBarat="Banyusoco",
        )
        return Padukuhan(**{**dasar, **ganti})

    assert ubah(contoh()).telepon == "+62 812-2761-391"
    tersimpan = ambil()
    assert tersimpan is not None and tersimpan.desa == "Donokerto"

    # Menyimpan lagi menimpa baris yang sama, bukan menambah baris kedua.
    ubah(contoh(telepon="+62 811-0000-000"))
    with db.koneksi(settings.DATABASE_FILE) as conn:
        (cacah,) = conn.execute("SELECT COUNT(*) FROM padukuhan").fetchone()
    assert cacah == 1, cacah
    assert ambil().telepon == "+62 811-0000-000"

    for salah in ({"nama": "   "}, {"email": "bukan-surel"}, {"sejarah": "pendek"}):
        try:
            contoh(**salah)
        except ValueError:
            pass
        else:
            raise AssertionError(f"seharusnya ditolak: {salah}")

    print("OK: app/data/padukuhan.py")


if __name__ == "__main__":
    demo()
