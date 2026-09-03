"""Nama Ketua LPM untuk bagan struktur organisasi publik — satu baris tunggal.

Bukan bagian dari `pengurus`: LPM tidak punya login, tidak punya akun di tabel
`pengurus`. Tapi pergantiannya tetap membutuhkan persetujuan Dukuh lewat sistem
pergantian yang sama (`app/data/pergantian.py`).

Kalau LPM masih kosong, Admin mengisi langsung (tanpa persetujuan). Kalau sudah
terisi, Admin mengajukan pergantian yang harus disetujui Dukuh.

`warga_id` menghubungkan LPM ke data warga: nama ikut dari data penduduk
(bukan diketik), dan satu orang satu jabatan bisa diperiksa.
"""

from app.core.config import settings
from app.data import db


def nama() -> str:
    """Nama Ketua LPM saat ini. String kosong berarti belum diisi."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute("SELECT nama FROM lpm WHERE id = 1").fetchone()
        return row["nama"] if row else ""


def warga_id() -> str | None:
    """Kode Warga pemegang LPM saat ini. `None` berarti kosong."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute("SELECT warga_id FROM lpm WHERE id = 1").fetchone()
        return row["warga_id"] if row else None


def info() -> tuple[str, str | None]:
    """(nama, warga_id) Ketua LPM saat ini."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute(
            "SELECT nama, warga_id FROM lpm WHERE id = 1"
        ).fetchone()
        return (row["nama"], row["warga_id"]) if row else ("", None)


def ubah(nama_baru: str, warga_id_baru: str | None = None) -> str:
    """Ganti nama + warga_id Ketua LPM, kembalikan nama barunya."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        conn.execute(
            """
            INSERT INTO lpm (id, nama, warga_id) VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET nama = excluded.nama,
                                          warga_id = excluded.warga_id
            """,
            (nama_baru, warga_id_baru),
        )
        conn.commit()
        return nama_baru


def demo() -> None:
    """Self-check. Jalankan:
    DATABASE_PATH=/tmp/uji-lpm.db .venv/bin/python -m app.data.lpm
    """
    assert nama() == "", "DB uji harus mulai kosong"
    assert warga_id() is None, "warga_id harus None di awal"

    assert ubah("Masjkuri", "W001") == "Masjkuri"
    assert nama() == "Masjkuri"
    assert warga_id() == "W001"

    n, w = info()
    assert n == "Masjkuri" and w == "W001", "info() tidak cocok"

    assert ubah("", None) == "", "mengosongkan lagi harus tetap boleh"
    assert nama() == ""
    assert warga_id() is None
    print("OK: app/data/lpm.py")


if __name__ == "__main__":
    demo()
