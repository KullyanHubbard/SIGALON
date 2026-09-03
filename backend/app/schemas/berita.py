"""Berita padukuhan — cerminan `frontend/src/features/berita/types.ts`.

Batasannya sengaja sama persis dengan skema Zod di
`frontend/src/features/berita/schemas.ts`: form yang lolos di layar tidak boleh
ditolak server, dan pemanggil yang melewati form tetap harus kena batas yang
sama.

`isi` berupa HTML sejak editornya jadi WYSIWYG (3 September 2026), dan HTML dari
klien tidak boleh dipercaya: nilainya dipasang ke `dangerouslySetInnerHTML` di
halaman publik, jadi satu `<script>` yang lolos berjalan di peramban setiap
pengunjung. Karena itu **penyaringan terjadi di sini, satu kali, saat menulis** —
bukan saat menampilkan. Yang tersimpan di DB sudah bersih, jadi tidak ada jalur
baca yang bisa lupa menyaring.
"""

import nh3
from pydantic import BaseModel, Field, field_validator

#: Batas panjang data URL foto sampul. Berkasnya sendiri dibatasi 600 KB di
#: `FotoBeritaField`, dan base64 membengkakkannya ±33% — 900 KB memberi ruang
#: untuk selisih itu tanpa membiarkan foto kamera ponsel utuh masuk.
MAKS_FOTO = 900_000

#: Batas panjang isi artikel. Besar karena foto yang disisipkan di tengah teks
#: ikut tinggal di dalamnya sebagai data URL — tiap gambar dibatasi 600 KB di
#: editor, jadi ini kira-kira ruang untuk lima gambar plus teksnya.
MAKS_ISI = 4_000_000

#: Tag yang boleh terbit. Persis yang bisa dihasilkan editornya, tidak lebih:
#: apa pun di luar daftar ini tidak punya cara masuk dari layar, jadi
#: kemunculannya berarti seseorang memanggil API langsung.
#:
#: `<a>` sengaja TIDAK ada, dan editornya juga tidak punya tombol tautan:
#: mengizinkannya berarti mengizinkan skema URL yang lebih longgar, sementara
#: `data:` harus tetap terbuka untuk gambar yang disisipkan. Berita padukuhan
#: belum butuh tautan; kalau nanti butuh, batasi skemanya per atribut.
TAG_DIIZINKAN = {
    "p", "br", "strong", "em", "u", "s", "code", "pre",
    "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "img",
}

ATRIBUT_DIIZINKAN = {"img": {"src", "alt"}}


def bersihkan_html(mentah: str) -> str:
    """Buang apa pun di luar daftar putih di atas.

    `nh3` (pengikat Rust untuk ammonia), bukan penyaring buatan sendiri:
    menulis parser HTML yang tahan segala bentuk penyelundupan adalah pekerjaan
    yang salah untuk dikerjakan sendiri, dan yang gagalnya diam-diam.
    """
    return nh3.clean(
        mentah,
        tags=TAG_DIIZINKAN,
        attributes=ATRIBUT_DIIZINKAN,
        # Cuma `data:` — satu-satunya yang dipakai gambar sisipan. Tanpa daftar
        # ini ammonia membuang seluruh data URL, dan setiap gambar hilang.
        url_schemes={"data"},
    )


def _teks_saja(html: str) -> str:
    """Isi artikel tanpa satu pun tag — dipakai mengukur panjang tulisannya.
    Tanpa ini `<p><img …></p>` berisi ribuan karakter base64 lolos batas
    minimum sementara tulisannya nol kata."""
    return nh3.clean(html, tags=set(), attributes={}).strip()


class BeritaBaru(BaseModel):
    """Isian form berita. `id` & `slug` dibuat lapisan penyimpanan."""

    judul: str = Field(min_length=4, max_length=200)
    penulis: str = Field(min_length=2, max_length=100)
    #: Tanggal saja, tanpa jam — `YYYY-MM-DD`.
    tanggalTerbit: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    #: HTML hasil editor, sudah disaring `bersihkan_html`.
    isi: str = Field(max_length=MAKS_ISI)
    #: Data URL foto sampul. Kosong berarti berita tanpa foto sampul.
    foto: str = Field("", max_length=MAKS_FOTO)

    @field_validator("judul", "penulis", mode="before")
    @classmethod
    def _rapikan(cls, v: object) -> object:
        """`mode="before"` supaya spasi dibuang SEBELUM panjangnya dihitung —
        kalau tidak, judul berisi empat spasi lolos `min_length`."""
        return v.strip() if isinstance(v, str) else v

    @field_validator("isi")
    @classmethod
    def _saring_isi(cls, v: str) -> str:
        bersih = bersihkan_html(v)
        if len(_teks_saja(bersih)) < 20:
            raise ValueError("Isi berita minimal 20 huruf")
        return bersih

    @field_validator("foto")
    @classmethod
    def _harus_gambar(cls, v: str) -> str:
        """Nilai ini dipasang apa adanya ke `<img src>` di halaman publik.
        Tanpa penjagaan ini, `data:text/html,…` yang dikirim langsung ke API
        ikut tersimpan dan terbit."""
        if v and not v.startswith("data:image/"):
            raise ValueError("Foto harus berupa data URL gambar")
        return v


class Berita(BeritaBaru):
    """Berita yang sudah tersimpan."""

    id: str
    #: Turunan judul; jadi bagian URL `/berita/:slug`. Unik.
    slug: str


def demo() -> None:
    """Self-check penyaring HTML. Jalankan:
    .venv/bin/python -m app.schemas.berita
    """
    # Yang jelas berbahaya hilang, tulisan di sekitarnya tetap utuh.
    assert bersihkan_html("<p>Halo</p><script>alert(1)</script>") == "<p>Halo</p>"
    assert "onerror" not in bersihkan_html('<img src="data:image/png;base64,AA" onerror="alert(1)">')
    assert bersihkan_html('<iframe src="https://jahat"></iframe>') == ""
    # Tag di luar daftar dibuang, isinya TIDAK ikut terbuang.
    assert bersihkan_html("<div><p>Isi</p></div>") == "<p>Isi</p>"

    # Yang dipakai editor selamat, termasuk gambar sisipan.
    kaya = "<h2>Judul</h2><p><strong>tebal</strong> <em>miring</em></p><ul><li>satu</li></ul>"
    assert bersihkan_html(kaya) == kaya, bersihkan_html(kaya)
    gambar = '<img src="data:image/png;base64,AAAA" alt="Kerja bakti">'
    assert bersihkan_html(gambar) == gambar, bersihkan_html(gambar)

    # Skema URL lain dibuang dari gambar, tag-nya boleh tinggal tanpa src.
    assert "javascript:" not in bersihkan_html('<img src="javascript:alert(1)">')
    assert "http" not in bersihkan_html('<img src="http://pelacak/x.gif">')

    # Panjang diukur dari tulisannya, bukan dari base64 gambarnya.
    isi_gambar_saja = '<p><img src="data:image/png;base64,' + "A" * 5000 + '"></p>'
    assert len(_teks_saja(isi_gambar_saja)) == 0

    def buat(isi: str) -> BeritaBaru:
        return BeritaBaru(
            judul="Kerja Bakti", penulis="Sekretariat",
            tanggalTerbit="2026-09-03", isi=isi, foto="",
        )

    lolos = buat("<p>Warga menggelar kerja bakti pada Minggu pagi.</p>")
    assert lolos.isi.startswith("<p>Warga")
    for ditolak in (isi_gambar_saja, "<p>Terlalu pendek</p>", "<script>alert(1)</script>"):
        try:
            buat(ditolak)
        except ValueError:
            pass
        else:
            raise AssertionError(f"seharusnya ditolak: {ditolak[:40]}")

    # Script yang diselipkan di tengah tulisan yang sah tetap dibuang, dan
    # beritanya TETAP tersimpan — bukan ditolak — karena sisanya wajar.
    dibersihkan = buat("<p>Warga menggelar kerja bakti.</p><script>alert(1)</script>")
    assert "script" not in dibersihkan.isi

    print("OK: app/schemas/berita.py (penyaring HTML)")


if __name__ == "__main__":
    demo()
