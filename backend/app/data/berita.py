"""Berita padukuhan: tulis, sunting, hapus. Tabel `berita` di SQLite.

Sebelum ini berita tinggal di `localStorage` peramban yang menulisnya, jadi
tulisan Dukuh tidak pernah sampai ke satu pun pengunjung. Yang dipindahkan cuma
penyimpanannya; bentuk datanya tetap sama seperti yang sudah dibaca frontend.

**Foto disimpan utuh sebagai data URL di kolomnya**, bukan sebagai berkas di
disk. Harganya jelas dan dipilih sadar: hapus berita = hapus satu baris, tanpa
berkas yatim yang tertinggal; backup tetap menyalin satu file `.db`; dan tidak
ada direktori unggahan yang harus dijaga izinnya.

ponytail: ceilingnya `daftar()` — ia mengirim seluruh foto sekaligus, jadi tiap
muat `/berita` membawa ±800 KB per berita berfoto. Puluhan berita masih wajar
untuk satu padukuhan; begitu lewat dari itu, simpan berkasnya di disk lalu
sajikan lewat StaticFiles dan sisakan path-nya saja di kolom ini.
"""

import re
import sqlite3
import uuid

from app.core.config import settings
from app.data import db
from app.schemas.berita import Berita, BeritaBaru

_KOLOM = "id, slug, judul, foto, tanggalTerbit, penulis, isi"


def ke_slug(judul: str) -> str:
    """Judul -> potongan URL. Huruf kecil, hanya a-z/0-9, sisanya jadi tanda
    hubung. Tanpa normalisasi diakritik: judul berita padukuhan berbahasa
    Indonesia, yang tidak punya huruf beraksen."""
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", judul.lower()))


def _slug_unik(conn: sqlite3.Connection, judul: str, kecuali_id: str | None) -> str:
    """Slug yang belum dipakai berita lain. Bentrok diberi akhiran angka, bukan
    ditolak: dua kegiatan tahunan bernama sama itu wajar ("Kerja Bakti
    Bulanan"), dan menolaknya memaksa penulis mengarang judul yang tidak dia
    inginkan.

    `id IS NOT ?` menangani dua hal sekaligus: saat menyunting, berita itu
    sendiri tidak dianggap bentrok dengan dirinya; saat menulis baru
    (`kecuali_id` None) tidak ada baris yang dikecualikan.
    """
    dasar = ke_slug(judul) or "berita"
    terpakai = {
        r["slug"]
        for r in conn.execute("SELECT slug FROM berita WHERE id IS NOT ?", (kecuali_id,))
    }
    if dasar not in terpakai:
        return dasar
    n = 2
    while f"{dasar}-{n}" in terpakai:
        n += 1
    return f"{dasar}-{n}"


def daftar() -> list[Berita]:
    """Semua berita, terbaru dulu. Tanggal sama diurutkan menurut `id` supaya
    urutannya tidak berubah-ubah antar permintaan."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        rows = conn.execute(
            f"SELECT {_KOLOM} FROM berita ORDER BY tanggalTerbit DESC, id DESC"
        ).fetchall()
    return [Berita(**dict(r)) for r in rows]


def by_slug(slug: str) -> Berita | None:
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute(
            f"SELECT {_KOLOM} FROM berita WHERE slug = ?", (slug,)
        ).fetchone()
    return Berita(**dict(row)) if row else None


def by_id(id: str) -> Berita | None:
    with db.koneksi(settings.DATABASE_FILE) as conn:
        row = conn.execute(f"SELECT {_KOLOM} FROM berita WHERE id = ?", (id,)).fetchone()
    return Berita(**dict(row)) if row else None


def tambah(baru: BeritaBaru) -> Berita:
    with db.koneksi(settings.DATABASE_FILE) as conn:
        berita = Berita(
            id=uuid.uuid4().hex,
            slug=_slug_unik(conn, baru.judul, None),
            **baru.model_dump(),
        )
        conn.execute(
            f"INSERT INTO berita ({_KOLOM}) VALUES"
            " (:id, :slug, :judul, :foto, :tanggalTerbit, :penulis, :isi)",
            berita.model_dump(),
        )
        conn.commit()
    return berita


def ubah(id: str, isi: BeritaBaru) -> Berita | None:
    """Ganti seluruh isi satu berita. `None` kalau id-nya tidak ada.

    Slug ikut berubah saat judul disunting: tautan lama jadi mati, dan itu
    dipilih sadar daripada URL yang bertentangan dengan judul di layar.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        berita = Berita(id=id, slug=_slug_unik(conn, isi.judul, id), **isi.model_dump())
        cur = conn.execute(
            "UPDATE berita SET slug = :slug, judul = :judul, foto = :foto,"
            " tanggalTerbit = :tanggalTerbit, penulis = :penulis, isi = :isi"
            " WHERE id = :id",
            berita.model_dump(),
        )
        conn.commit()
    return berita if cur.rowcount else None


def hapus(id: str) -> bool:
    """True kalau ada yang terhapus. False = id tidak dikenal, dan pemanggilnya
    yang memutuskan itu 404 atau bukan."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        cur = conn.execute("DELETE FROM berita WHERE id = ?", (id,))
        conn.commit()
        return cur.rowcount > 0


def demo() -> None:
    """Self-check. Jalankan:
    DATABASE_PATH=/tmp/uji-berita.db .venv/bin/python -m app.data.berita
    """
    assert ke_slug("Kerja Bakti RW 01!") == "kerja-bakti-rw-01"
    assert ke_slug("  --Halo, Dunia--  ") == "halo-dunia"
    assert ke_slug("!!!") == ""

    assert daftar() == [], "DB uji harus mulai kosong"

    def contoh(judul: str, tanggal: str = "2026-09-01") -> BeritaBaru:
        return BeritaBaru(
            judul=judul,
            penulis="Sekretariat",
            tanggalTerbit=tanggal,
            isi="Isi berita percobaan yang panjangnya cukup.",
            foto="",
        )

    satu = tambah(contoh("Kerja Bakti", "2026-08-01"))
    assert satu.slug == "kerja-bakti"

    # Judul sama tidak ditolak; slugnya yang diberi akhiran.
    dua = tambah(contoh("Kerja Bakti", "2026-08-20"))
    assert dua.slug == "kerja-bakti-2", dua.slug
    # Judul yang seluruhnya tanda baca tetap menghasilkan slug yang bisa dibuka.
    tiga = tambah(contoh("!!!!", "2026-08-10"))
    assert tiga.slug == "berita", tiga.slug

    # Terbaru dulu.
    assert [b.id for b in daftar()] == [dua.id, tiga.id, satu.id]
    assert by_slug("kerja-bakti-2") is not None
    assert by_slug("tidak-ada") is None

    # Menyunting tanpa mengganti judul TIDAK menaikkan akhiran slugnya sendiri.
    tetap = ubah(satu.id, contoh("Kerja Bakti", "2026-08-02"))
    assert tetap is not None and tetap.slug == "kerja-bakti", tetap
    assert by_id(satu.id).tanggalTerbit == "2026-08-02"

    # Judul baru menggeser slug, dan yang lama benar-benar hilang.
    pindah = ubah(satu.id, contoh("Rapat RT", "2026-08-02"))
    assert pindah is not None and pindah.slug == "rapat-rt"
    assert by_slug("kerja-bakti") is None

    assert ubah("bukan-id", contoh("Apa Saja")) is None
    assert hapus(satu.id) is True
    assert hapus(satu.id) is False
    assert len(daftar()) == 2

    print("OK: app/data/berita.py")


if __name__ == "__main__":
    demo()
