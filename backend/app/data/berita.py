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

import base64
import io
import re
import sqlite3
import uuid
from pathlib import Path
from PIL import Image

from app.core.config import settings
from app.data import db
from app.schemas.berita import Berita, BeritaBaru

_KOLOM = "id, slug, judul, foto, tanggalTerbit, penulis, isi"


def _simpan_foto_disk(foto_input: str) -> str:
    """Mengubah data URL base64 menjadi berkas `.webp` terkompresi di disk server.

    Mengembalikan path URL relatif `/uploads/berita/<filename>.webp` yang disajikan
    oleh StaticFiles. Jika input sudah berupa URL atau kosong, dikembalikan apa adanya.
    """
    if not foto_input or not foto_input.startswith("data:image/"):
        return foto_input

    try:
        data_str = foto_input.split(",", 1)[1] if "," in foto_input else foto_input
        img_bytes = base64.b64decode(data_str)
        img = Image.open(io.BytesIO(img_bytes))

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        max_lebar = 1200
        if img.width > max_lebar:
            rasio = max_lebar / float(img.width)
            tinggi_baru = int(float(img.height) * rasio)
            img = img.resize((max_lebar, tinggi_baru), Image.Resampling.LANCZOS)

        dir_berita = settings.UPLOADS_DIR / "berita"
        dir_berita.mkdir(parents=True, exist_ok=True)

        nama_file = f"{uuid.uuid4().hex}.webp"
        path_file = dir_berita / nama_file

        img.save(path_file, "WEBP", quality=80, optimize=True)

        return f"/uploads/berita/{nama_file}"
    except Exception as e:
        print(f"[BERITA] Gagal memproses foto ke disk: {e}")
        return foto_input


def _hapus_foto_disk(foto_url: str) -> None:
    """Hapus berkas foto dari disk jika foto_url menunjuk ke berkas di `/uploads/berita/`."""
    if not foto_url or not foto_url.startswith("/uploads/berita/"):
        return
    nama_file = foto_url.removeprefix("/uploads/berita/")
    path_file = settings.UPLOADS_DIR / "berita" / nama_file
    if path_file.is_file():
        try:
            path_file.unlink()
        except Exception as e:
            print(f"[BERITA] Gagal menghapus file foto {nama_file}: {e}")


def migrasi_foto_ke_disk() -> None:
    """Migrasi foto base64 yang sudah ada di DB menjadi file .webp di disk.

    Di-run saat startup agar file .db yang membengkak langsung mengecil.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        rows = conn.execute("SELECT id, foto FROM berita WHERE foto LIKE 'data:image/%'").fetchall()
        for r in rows:
            foto_baru = _simpan_foto_disk(r["foto"])
            if foto_baru != r["foto"]:
                conn.execute("UPDATE berita SET foto = ? WHERE id = ?", (foto_baru, r["id"]))
                conn.commit()


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
    """Semua berita, terbaru menurut tanggal kejadian/berita (tanggalTerbit DESC).
    Tanggal sama diurutkan menurut `rowid DESC` (yang ditulis belakangan lebih dulu)."""
    with db.koneksi(settings.DATABASE_FILE) as conn:
        rows = conn.execute(
            f"SELECT {_KOLOM} FROM berita ORDER BY tanggalTerbit DESC, rowid DESC"
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
    foto_disk = _simpan_foto_disk(baru.foto)
    data_baru = baru.model_copy(update={"foto": foto_disk})
    with db.koneksi(settings.DATABASE_FILE) as conn:
        berita = Berita(
            id=uuid.uuid4().hex,
            slug=_slug_unik(conn, data_baru.judul, None),
            **data_baru.model_dump(),
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
    lama = by_id(id)
    if lama is None:
        return None

    foto_disk = _simpan_foto_disk(isi.foto)
    if lama.foto and lama.foto != foto_disk and foto_disk != isi.foto:
        _hapus_foto_disk(lama.foto)

    data_baru = isi.model_copy(update={"foto": foto_disk})

    with db.koneksi(settings.DATABASE_FILE) as conn:
        berita = Berita(id=id, slug=_slug_unik(conn, data_baru.judul, id), **data_baru.model_dump())
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
    lama = by_id(id)
    if lama and lama.foto:
        _hapus_foto_disk(lama.foto)

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
    b_satu = by_id(satu.id)
    assert b_satu is not None and b_satu.tanggalTerbit == "2026-08-02"

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
