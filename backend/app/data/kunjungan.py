"""Penghitung kunjungan harian portal publik — satu baris per tanggal.

BUKAN pengunjung unik: frontend menjaga "sekali per browser per hari" lewat
`localStorage` (`features/kunjungan/hooks/use-kunjungan.ts`), jadi yang
terhitung per-BROWSER, bukan per-orang. Dua orang berbagi satu komputer balai
desa tercatat sebagai satu kunjungan.

ponytail: kasar secara sengaja. Penghitung yang akurat butuh sesi anonim atau
IP hashing — kompleksitas yang tidak sepadan dengan angka hiasan di footer.
"""

import datetime as dt

from app.core.config import settings
from app.data import db

# Baris kunjungan yang lebih tua dari ini dihapus otomatis. Frontend hanya
# membaca hitungan hari ini; data historis tidak punya konsumen dan hanya
# menambah berat DB (~30 byte/baris, tapi tanpa alasan).
RETENSI_KUNJUNGAN_HARI = 90


def _hari_ini() -> str:
    return dt.date.today().isoformat()


def _pangkas_kunjungan_lama() -> None:
    """Buang baris kunjungan yang lebih tua dari `RETENSI_KUNJUNGAN_HARI`.

    Menumpang di `tambah()` — dipanggil paling banyak sekali per browser per
    hari, jadi overhead-nya nyaris tidak terasa.
    """
    batas = (dt.date.today() - dt.timedelta(days=RETENSI_KUNJUNGAN_HARI)).isoformat()
    with db.koneksi(settings.DATABASE_FILE) as conn:
        with conn:
            conn.execute("DELETE FROM kunjungan WHERE tanggal < ?", (batas,))


def tambah() -> int:
    """Tambah 1 ke hitungan hari ini, kembalikan total setelahnya."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        conn.execute(
            """
            INSERT INTO kunjungan (tanggal, jumlah) VALUES (?, 1)
            ON CONFLICT(tanggal) DO UPDATE SET jumlah = jumlah + 1
            """,
            (_hari_ini(),),
        )
        conn.commit()
        row = conn.execute(
            "SELECT jumlah FROM kunjungan WHERE tanggal = ?", (_hari_ini(),)
        ).fetchone()
    _pangkas_kunjungan_lama()
    return row["jumlah"]


def hari_ini() -> int:
    """Hitungan hari ini tanpa menambah — dipakai saat browser sudah
    menghitung kunjungannya untuk hari yang sama."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute(
            "SELECT jumlah FROM kunjungan WHERE tanggal = ?", (_hari_ini(),)
        ).fetchone()
        return row["jumlah"] if row else 0


def demo() -> None:
    """Self-check. Jalankan:
    DATABASE_PATH=/tmp/uji.db .venv/bin/python -m app.data.kunjungan
    """
    assert hari_ini() == 0, "DB uji harus mulai kosong"
    assert tambah() == 1
    assert tambah() == 2
    assert hari_ini() == 2, "membaca tidak boleh ikut menambah"
    print("OK: app/data/kunjungan.py")


if __name__ == "__main__":
    demo()
