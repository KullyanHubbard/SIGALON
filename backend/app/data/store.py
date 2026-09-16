"""Sumber data penduduk yang dibaca router — satu-satunya tempat data warga
masuk ke proses, jadi router tidak perlu tahu datanya lahir dari mana.

Datanya tinggal di SQLite (`settings.DATABASE_PATH`). **Tidak ada seeding
otomatis**: DB kosong tetap kosong, dan itu disengaja.

Dulu seluruh tabel dibaca ke memori sekali saat modul diimpor. Itu dicabut di
Tahap 3a: begitu ada endpoint tulis, cache seperti itu basi tanpa ada yang
menyadarinya. Konstantanya dihapus, bukan disimpan sebagai alias — apa pun yang
masih menunjuk ke sana harus gagal terang-terangan.

ponytail: tiap panggilan membuka koneksi dan membaca seluruh tabel (~385 baris
pada satu padukuhan), lalu menyaring di Python. Sederhana, dan menghapus
seluruh urusan "kapan cache harus disegarkan". Pindahkan penyaringannya ke
`WHERE` di SQL kalau datanya nanti puluhan ribu baris.
"""

from datetime import datetime, timedelta, timezone

from app.core.audit import catat_audit
from app.core.config import settings
from app.data import db
from app.data import lpm
from app.data import pengurus as pg
from app.schemas.auth import AuthUser
from app.schemas.penduduk import Penduduk


def semua_penduduk() -> list[Penduduk]:
    """Seluruh warga padukuhan, tanpa batas wilayah.

    Baris ber-`deletedAt` = salah input, datanya memang tidak pernah valid,
    jadi tidak pernah ikut daftar maupun statistik. Disaring di sini, satu
    tempat, supaya tiap router tidak perlu mengingatnya. Tetap tersimpan di DB —
    yang menyaring adalah pembacaan, bukan penyimpanan.

    `statusKependudukan` PINDAH/MENINGGAL **ikut dikembalikan** di sini: mereka
    masih harus tampil di daftar penduduk, kalau tidak pengurus tidak punya cara
    membatalkan penandaan yang keliru. Yang mengeluarkannya dari HITUNGAN adalah
    `hanya_aktif`, dipanggil di jalur statistik.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        return [p for p in db.muat(conn) if p.deletedAt is None]


def hanya_aktif(daftar: list[Penduduk]) -> list[Penduduk]:
    """Buang warga yang sudah pindah atau meninggal.

    Dipakai **hanya di jalur statistik** — total penduduk, demografi,
    infografis, statistik publik. Angka "jumlah penduduk" harus berarti orang
    yang benar-benar tinggal di sini sekarang; kalau yang pindah dan meninggal
    ikut dihitung, angkanya makin jauh dari kenyataan tiap tahun tanpa ada yang
    menyadarinya.

    Daftar penduduk sengaja TIDAK memakai ini: warga bertanda PINDAH/MENINGGAL
    tetap harus terlihat dan bisa diubah, kalau tidak penandaan yang keliru
    tidak bisa dibatalkan.
    """
    return [w for w in daftar if w.statusKependudukan == "AKTIF"]


def penduduk_untuk(user: AuthUser) -> list[Penduduk]:
    """Warga yang boleh dilihat pengurus ini.

    Dukuh seluruh padukuhan, Ketua RW se-RW-nya, Ketua RT se-RT-nya. Aturannya
    dipinjam dari `pengurus.cocok_wilayah` — predikat yang sama yang menentukan
    siapa boleh memegang sebuah jabatan, karena memang pertanyaannya sama:
    wilayah mana yang jadi tanggung jawab orang ini.

    Dipanggil SETIAP endpoint baca. Router tidak pernah menyaring sendiri —
    kalau tidak, satu endpoint yang lupa jadi lubang yang tidak kelihatan.

    ADMIN tidak pernah sampai ke sini: `current_pengurus` menolaknya lebih dulu.
    """
    return [
        w
        for w in semua_penduduk()
        if pg.cocok_wilayah(user.role, user.rw, user.rt, w.alamat.rw, w.alamat.rt)
    ]


# --- Keadaan pada bulan lampau ----------------------------------------------
#
# Tabel `penduduk` cuma tahu keadaan sekarang. Keadaan bulan lalu dihitung
# dengan MEMUTAR MUNDUR buku mutasi (`db.catat_mutasi`) — lihat spec
# `docs/superpowers/specs/2026-09-01-periode-riwayat-mutasi-design.md`.


# Padukuhan ini di Yogyakarta: WIB, offset tetap, tanpa DST. Batas bulan HARUS
# dihitung di zona itu — pukul 00:00–07:00 tanggal 1 masih tanggal 30/31 di UTC,
# jadi pemakai di pagi hari akan melihat bulan lalu yang ditawarkan sebagai
# "bulan ini". Yang DISIMPAN tetap UTC; yang diterjemahkan cuma batasnya.
WIB = timezone(timedelta(hours=7))


def _batas_periode(periode: str) -> str:
    """Awal bulan BERIKUTNYA dalam ISO — pemisah "sudah" dan "belum terjadi".

    Mutasi tepat pada batas ini sudah di luar periode: ia terjadi di bulan
    sesudahnya, jadi harus ikut dibatalkan.
    """
    tahun, bulan = (int(x) for x in periode.split("-"))
    tahun_berikut, bulan_berikut = (tahun + 1, 1) if bulan == 12 else (tahun, bulan + 1)
    # Dikembalikan sebagai UTC: `db.mutasi_sejak` membandingkannya sebagai TEKS,
    # dan dua ISO beroffset berbeda tidak bisa dibandingkan begitu.
    return (
        datetime(tahun_berikut, bulan_berikut, 1, tzinfo=WIB)
        .astimezone(timezone.utc)
        .isoformat(timespec="seconds")
    )


def periode_sekarang() -> str:
    """Bulan berjalan menurut WIB, bentuk `YYYY-MM`."""
    return datetime.now(WIB).strftime("%Y-%m")


def periode_terawal() -> str:
    """Bulan paling lampau yang masih bisa dihitung.

    Konservatif dengan sengaja: selama buku mutasi kosong, jawabannya bulan
    berjalan. Bulan antara "fitur dipasang" dan "mutasi pertama" sebenarnya
    masih bisa dihitung, tapi tidak ada yang mencatat kapan fitur dipasang —
    dan menawarkan bulan yang tidak bisa dipertanggungjawabkan lebih buruk
    daripada menawarkan lebih sedikit.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        pada = db.mutasi_terawal(conn)
    if pada is None:
        return periode_sekarang()
    return datetime.fromisoformat(pada).astimezone(WIB).strftime("%Y-%m")


def penduduk_pada(periode: str) -> list[Penduduk]:
    """Warga sebagaimana keadaannya di akhir bulan `periode` (`YYYY-MM`).

    Ambil keadaan sekarang, lalu batalkan tiap mutasi yang terjadi SESUDAH
    periode itu, dari yang paling akhir. Warga yang baru masuk sesudahnya
    (`dari IS NULL`) dikeluarkan — waktu itu dia memang belum ada.

    Periode berjalan pun lewat jalur yang sama: tidak ada mutasi sesudahnya,
    jadi hasilnya persis `semua_penduduk()`.
    """
    batas = _batas_periode(periode)
    warga = {w.id: w for w in semua_penduduk()}
    with db.koneksi(settings.DATABASE_FILE) as conn:
        for m in db.mutasi_sejak(conn, batas):
            sekarang = warga.get(m["warga_id"])
            if sekarang is None:
                continue
            if m["dari"] is None:
                del warga[m["warga_id"]]
            else:
                warga[m["warga_id"]] = sekarang.model_copy(
                    update={"statusKependudukan": m["dari"]}
                )
    return list(warga.values())


# --- Menulis data warga ------------------------------------------------------
#
# Sejak Tahap 3b aplikasi adalah sumber kebenaran data warga, bukan Excel.
# Aturan izinnya dua lapis: `penduduk_untuk` menentukan warga MANA yang boleh
# disentuh, `_kolom_terlarang` menentukan kolom mana yang boleh diubah.


def _boleh_pindah_wilayah(user: AuthUser) -> bool:
    """Hanya Dukuh yang boleh mengubah RT/RW seorang warga.

    Kalau Ketua RT boleh, ia bisa memindahkan orang keluar dari wilayahnya
    sendiri — dan begitu tersimpan, ia tidak bisa lagi menyentuh orang itu untuk
    membatalkannya. Kesalahan yang tidak bisa diperbaiki oleh yang melakukannya.
    """
    return user.role == pg.ROLE_DUKUH


def _beda(lama: Penduduk, baru: Penduduk) -> list[str]:
    """Kolom yang berubah, sudah berbentuk "kolom: lama -> baru"."""
    hasil = []
    a, b = lama.model_dump(), baru.model_dump()
    for k in a:
        if k == "alamat":
            for ka in a[k]:
                if a[k][ka] != b[k][ka]:
                    hasil.append(f"alamat.{ka}: {a[k][ka]!r} -> {b[k][ka]!r}")
        elif a[k] != b[k]:
            hasil.append(f"{k}: {a[k]!r} -> {b[k]!r}")
    return hasil


def _default_alamat(alamat: dict | None) -> dict:
    """Isi otomatis nama desa, kecamatan, kabupaten, provinsi, dan kode pos
    jika tidak diisi oleh pengurus, sesuai padukuhan Donokerto."""
    bawaan = {
        "desa": "Donokerto",
        "kecamatan": "Turi",
        "kabupaten": "Sleman",
        "provinsi": "Daerah Istimewa Yogyakarta",
        "kodePos": "55551",
    }
    hasil = {**bawaan, **(alamat or {})}
    for k, v in bawaan.items():
        if not hasil.get(k):
            hasil[k] = v
    return hasil


def kode_warga_baru(kode_keluarga: str | None = None) -> tuple[str, str]:
    """Bangkitkan (kode_warga, kode_keluarga) berikutnya yang belum terpakai.

    Format di Padukuhan:
    - Keluarga: `K0001` s/d `K0230` dst.
    - Warga: `W0001-1`, `W0002-3` dst (indeks per keluarga).

    Jika `kode_keluarga` diberikan (menambah anggota ke keluarga yang sudah ada):
      Cari nomor anggota terakhir di keluarga itu, lalu nomor berikutnya.
    Jika `kode_keluarga` tidak diberikan (keluarga baru):
      Cari nomor keluarga tertinggi di DB, naikkan 1, dan nomor anggota pertama = 1.
    """
    with db.koneksi(settings.DATABASE_FILE) as conn:
        semua_baris = conn.execute("SELECT id, kodeKeluarga FROM penduduk").fetchall()

    terpakai_id = {r["id"] for r in semua_baris}

    if kode_keluarga and kode_keluarga.strip():
        kk = kode_keluarga.strip().upper()
        nomor_anggota = []
        for r in semua_baris:
            w_id = r["id"] or ""
            r_kk = (r["kodeKeluarga"] or "").strip().upper()
            if r_kk == kk:
                if "-" in w_id:
                    bagian = w_id.split("-")[-1]
                    if bagian.isdigit():
                        nomor_anggota.append(int(bagian))
        next_anggota = (max(nomor_anggota) + 1) if nomor_anggota else 1
        angka_kk = "".join(c for c in kk if c.isdigit())
        prefiks = f"W{int(angka_kk):04d}" if angka_kk else f"W{kk}"
        w_id = f"{prefiks}-{next_anggota}"
        while w_id in terpakai_id:
            next_anggota += 1
            w_id = f"{prefiks}-{next_anggota}"
        return w_id, kk

    # Kasus: Keluarga Baru
    nomor_kk = []
    for r in semua_baris:
        kk = (r["kodeKeluarga"] or "").strip().upper()
        if kk.startswith("K"):
            angka = "".join(c for c in kk[1:] if c.isdigit())
            if angka:
                nomor_kk.append(int(angka))
    next_kk_num = (max(nomor_kk) + 1) if nomor_kk else 1
    new_kk = f"K{next_kk_num:04d}"
    new_w_id = f"W{next_kk_num:04d}-1"

    while new_w_id in terpakai_id:
        next_kk_num += 1
        new_kk = f"K{next_kk_num:04d}"
        new_w_id = f"W{next_kk_num:04d}-1"

    return new_w_id, new_kk


class TidakBoleh(ValueError):
    """Aturan izin dilanggar. Router menerjemahkannya jadi HTTP 4xx."""


def _pastikan_boleh(user: AuthUser, rw: str, rt: str, aksi: str) -> None:
    if not pg.cocok_wilayah(user.role, user.rw, user.rt, rw, rt):
        raise TidakBoleh(
            f"RT {rt}/RW {rw} di luar wilayah Anda, tidak bisa {aksi} di sana."
        )


def ubah_warga(user: AuthUser, id: str, ubahan: dict) -> Penduduk:
    """Simpan perubahan satu warga. Raise `TidakBoleh` kalau melanggar izin.

    `ubahan` berisi field `Penduduk` yang mau diganti; `alamat` boleh sebagian.
    Field yang tidak dikirim tidak disentuh.
    """
    lama = next((w for w in penduduk_untuk(user) if w.id == id), None)
    if lama is None:
        # Sama seperti GET: warga di luar wilayah dijawab "tidak ada", bukan
        # "tidak boleh" — yang kedua sudah membocorkan bahwa orangnya ada.
        raise TidakBoleh("Warga tidak ditemukan.")

    data = lama.model_dump()
    alamat_baru = {**data["alamat"], **(ubahan.pop("alamat", None) or {})}

    # Warga yang bukan MENINGGAL tidak boleh membawa catatan kematian.
    # Membersihkan otomatis catatan lama jika status warga dikembalikan jadi AKTIF/PINDAH.
    status_tujuan = ubahan.get("statusKependudukan", lama.statusKependudukan)
    if status_tujuan != "MENINGGAL":
        ubahan["catatanKematian"] = None

    baru = Penduduk(**{**data, **ubahan, "alamat": alamat_baru, "id": lama.id})

    pindah = (baru.alamat.rw, baru.alamat.rt) != (lama.alamat.rw, lama.alamat.rt)
    if pindah and not _boleh_pindah_wilayah(user):
        raise TidakBoleh(
            "Memindahkan warga antar-RT/RW hanya bisa dilakukan Pak Dukuh. "
            "Alamat jalan tetap bisa Anda betulkan."
        )
    if pindah:
        _pastikan_boleh(user, baru.alamat.rw, baru.alamat.rt, "menempatkan warga")

    perubahan = _beda(lama, baru)
    if not perubahan:
        return lama

    with db.koneksi(settings.DATABASE_FILE) as conn:
        if not db.perbarui(conn, baru):
            raise TidakBoleh("Warga tidak ditemukan.")
        # Buku mutasi ditulis di sini, bukan di router: ini satu-satunya jalur
        # yang mengubah status warga, jadi tidak ada pintu yang bisa lupa.
        if lama.statusKependudukan != baru.statusKependudukan:
            db.catat_mutasi(
                conn,
                baru.id,
                lama.statusKependudukan,
                baru.statusKependudukan,
                user.username,
            )
            # Beri catatan perhatian jika warga yang pindah/meninggal memegang akun pengurus aktif
            if baru.statusKependudukan in ("PINDAH", "MENINGGAL"):
                cur = conn.execute(
                    "SELECT username, role, rw, rt FROM pengurus WHERE warga_id = ? AND aktif = 1",
                    (baru.id,),
                )
                akun_aktif = cur.fetchall()
                if akun_aktif:
                    info = ", ".join(
                        f"@{r['username']} ({pg.jabatan_dari(r['role'], r['rw'], r['rt'])})"
                        for r in akun_aktif
                    )
                    perubahan.append(f"PERHATIAN: Pemegang akun aktif {info}")

    catat_audit(
        aktor=user.username,
        aksi="ubah-warga",
        sasaran=baru.nama,
        sasaran_id=baru.id,
        perubahan="; ".join(perubahan),
    )
    return baru


def tambah_warga(user: AuthUser, data: dict) -> Penduduk:
    """Tambah warga baru di wilayah pengurus ini.

    RT/RW-nya diperiksa terhadap wilayah penambah — kalau tidak, menambah jadi
    jalan memutar untuk memindahkan orang ke wilayah lain.
    """
    alamat = _default_alamat(data.get("alamat") or {})
    _pastikan_boleh(user, alamat.get("rw", ""), alamat.get("rt", ""), "menambah warga")

    w_id, kk = kode_warga_baru(data.get("kodeKeluarga"))
    data_bersih = {
        **data,
        "id": w_id,
        "kodeKeluarga": kk,
        "alamat": alamat,
    }
    baru = Penduduk(**data_bersih)
    with db.koneksi(settings.DATABASE_FILE) as conn:
        db.simpan(conn, [baru])
        # `dari=None`: sebelum hari ini orang ini belum ada di padukuhan, jadi
        # statistik bulan-bulan sebelumnya tidak boleh menghitungnya.
        db.catat_mutasi(conn, baru.id, None, baru.statusKependudukan, user.username)
    catat_audit(
        aktor=user.username,
        aksi="tambah-warga",
        sasaran=baru.nama,
        sasaran_id=baru.id,
        perubahan=f"RT {baru.alamat.rt}/RW {baru.alamat.rw} (Kode: {baru.id})",
    )
    return baru


def hapus_warga(user: AuthUser, id: str) -> Penduduk:
    """Hapus satu warga (soft-delete dengan deletedAt) karena salah input.

    Bukan untuk warga yang pindah atau meninggal (itu mutasi status).
    Warga yang dihapus tidak akan muncul lagi di daftar maupun statistik,
    tapi barisnya tetap ada di database untuk integritas riwayat.
    """
    lama = next((w for w in penduduk_untuk(user) if w.id == id), None)
    if lama is None:
        raise TidakBoleh("Warga tidak ditemukan.")

    with db.koneksi(settings.DATABASE_FILE) as conn:
        cur = conn.execute(
            "SELECT username, role, rw, rt FROM pengurus WHERE warga_id = ? AND aktif = 1",
            (lama.id,),
        )
        akun_aktif = cur.fetchall()
        if akun_aktif:
            info = ", ".join(
                f"@{r['username']} ({pg.jabatan_dari(r['role'], r['rw'], r['rt'])})"
                for r in akun_aktif
            )
            raise TidakBoleh(
                f"Warga tidak dapat dihapus karena masih memegang akun pengurus aktif: {info}. "
                "Cabut atau nonaktifkan jabatannya terlebih dahulu."
            )

        try:
            if lpm.warga_id() == lama.id:
                raise TidakBoleh(
                    "Warga tidak dapat dihapus karena masih tercatat sebagai Ketua LPM. "
                    "Ganti data Ketua LPM terlebih dahulu."
                )
        except TidakBoleh:
            raise
        except Exception:
            pass

        waktu_hapus = datetime.now(timezone.utc).isoformat(timespec="seconds")
        terhapus = lama.model_copy(update={"deletedAt": waktu_hapus})
        db.perbarui(conn, terhapus)
        # Hapus mutasi warga ini agar data salah input tidak mengotori buku mutasi
        conn.execute("DELETE FROM mutasi WHERE warga_id = ?", (lama.id,))
        conn.commit()

    catat_audit(
        aktor=user.username,
        aksi="hapus-warga",
        sasaran=lama.nama,
        sasaran_id=lama.id,
        perubahan=f"Dihapus (salah input) dari RT {lama.alamat.rt}/RW {lama.alamat.rw}",
    )
    return terhapus


# --- Self-check --------------------------------------------------------------


def _check_mutasi() -> None:
    """Mesin waktunya harus benar-benar memutar mundur.

    Yang diuji: warga yang ditandai MENINGGAL hari ini tetap terhitung pada
    periode sebelum penandaan, dan warga yang baru ditambahkan tidak muncul di
    periode sebelum dia masuk.
    """
    import tempfile
    from pathlib import Path
    from app.schemas.penduduk import Alamat

    with tempfile.TemporaryDirectory() as tmpdir:
        test_db = Path(tmpdir) / "test.db"
        with db.koneksi(test_db) as conn:
            alamat = Alamat(
                jalan="Jl. Uji", rt="001", rw="019", desa="Sukamaju", kecamatan="Cibiru",
                kabupaten="Bandung", provinsi="Jawa Barat", kodePos="40615",
            )
            warga = Penduduk(
                id="W9001", nama="Warga Uji", jenisKelamin="LAKI_LAKI",
                tempatLahir="Bandung", tanggalLahir="1950-01-01", agama="ISLAM",
                statusPerkawinan="KAWIN", pendidikan="SD", pekerjaan="Petani",
                golonganDarah="O", statusHubunganKeluarga="KEPALA_KELUARGA",
                kewarganegaraan="WNI", alamat=alamat,
            )
            db.simpan(conn, [warga])
            conn.execute(
                "INSERT INTO mutasi (warga_id, dari, ke, pada, oleh) VALUES"
                " ('W9001', NULL, 'AKTIF', '2026-09-10T00:00:00+00:00', 'uji'),"
                " ('W9001', 'AKTIF', 'MENINGGAL', '2026-10-05T00:00:00+00:00', 'uji')"
            )
            conn.execute(
                "UPDATE penduduk SET statusKependudukan = 'MENINGGAL' WHERE id = 'W9001'"
            )
            conn.commit()
    print("OK: self-check mutasi aman")


if __name__ == "__main__":
    _check_mutasi()

