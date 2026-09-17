from collections import defaultdict
from typing import Callable

from fastapi import APIRouter, Query

from app.data.agregat import (
    distribusi_by,
    distribusi_kelompok_umur,
    distribusi_pendidikan,
    format_rt,
    format_rw,
)
from app.data import lpm as data_lpm
from app.data import pengurus as data_pengurus
from app.data.store import (
    hanya_aktif,
    penduduk_pada,
    periode_terawal,
    semua_penduduk,
)
from app.schemas.penduduk import Distribusi, Penduduk, RincianRw, StatistikPublik
from app.schemas.pengurus import (
    JabatanWilayahPublik,
    RwPublik,
    StrukturOrganisasiPublik,
)

router = APIRouter(tags=["publik"])


def _kelompokkan(
    warga: list[Penduduk], kunci: Callable[[Penduduk], str]
) -> list[tuple[str, list[Penduduk]]]:
    """Kelompokkan warga per nilai `kunci`, urut menaik menurut kuncinya."""
    hasil: defaultdict[str, list[Penduduk]] = defaultdict(list)
    for p in warga:
        hasil[kunci(p)].append(p)
    return sorted(hasil.items())


def _rincian(
    label: str, warga: list[Penduduk], per_rt: list[RincianRw] | None = None
) -> RincianRw:
    total_bpnt = sum(1 for p in warga if "BPNT" in getattr(p, "bansos", []))
    total_pkh = sum(1 for p in warga if "PKH" in getattr(p, "bansos", []))
    total_penerima = sum(1 for p in warga if getattr(p, "bansos", []))
    total_bpnt_saja = sum(
        1 for p in warga if "BPNT" in getattr(p, "bansos", []) and "PKH" not in getattr(p, "bansos", [])
    )
    total_pkh_saja = sum(
        1 for p in warga if "PKH" in getattr(p, "bansos", []) and "BPNT" not in getattr(p, "bansos", [])
    )
    total_ganda = sum(
        1 for p in warga if "BPNT" in getattr(p, "bansos", []) and "PKH" in getattr(p, "bansos", [])
    )
    per_bansos = [
        Distribusi(label="BPNT", value=total_bpnt_saja),
        Distribusi(label="PKH", value=total_pkh_saja),
        Distribusi(label="BPNT & PKH", value=total_ganda),
    ]
    return RincianRw(
        label=label,
        totalPenduduk=len(warga),
        totalKepalaKeluarga=sum(
            1 for p in warga if p.statusHubunganKeluarga == "KEPALA_KELUARGA"
        ),
        totalLakiLaki=sum(1 for p in warga if p.jenisKelamin == "LAKI_LAKI"),
        totalPerempuan=sum(1 for p in warga if p.jenisKelamin == "PEREMPUAN"),
        totalPenerimaBansos=total_penerima,
        totalBpnt=total_bpnt,
        totalPkh=total_pkh,
        perBansos=per_bansos,
        perKelompokUmur=distribusi_kelompok_umur(warga),
        perPendidikan=distribusi_pendidikan(warga),
        perAgama=distribusi_by(warga, lambda p: p.agama),
        perStatusPerkawinan=distribusi_by(warga, lambda p: p.statusPerkawinan),
        perRt=per_rt or [],
    )


@router.get("/publik/statistik", response_model=StatistikPublik)
def statistik_publik(
    periode: str | None = Query(
        None,
        pattern=r"^\d{4}-(0[1-9]|1[0-2])$",
        description="Bulan statistik, format YYYY-MM. Kosongkan untuk data saat ini.",
    ),
) -> StatistikPublik:
    """Statistik agregat warga yang aktif pada akhir bulan yang diminta.

    Format query parameter `YYYY-MM` divalidasi dengan regex — parameter
    yang salah ketik lebih baik tahu daripada dikasih angka bulan lain.
    """
    # Yang pindah & meninggal tidak ikut dihitung — lihat `store.hanya_aktif`.
    semua = hanya_aktif(penduduk_pada(periode) if periode else semua_penduduk())
    total_bpnt = sum(1 for p in semua if "BPNT" in getattr(p, "bansos", []))
    total_pkh = sum(1 for p in semua if "PKH" in getattr(p, "bansos", []))
    total_penerima = sum(1 for p in semua if getattr(p, "bansos", []))
    total_bpnt_saja = sum(
        1 for p in semua if "BPNT" in getattr(p, "bansos", []) and "PKH" not in getattr(p, "bansos", [])
    )
    total_pkh_saja = sum(
        1 for p in semua if "PKH" in getattr(p, "bansos", []) and "BPNT" not in getattr(p, "bansos", [])
    )
    total_ganda = sum(
        1 for p in semua if "BPNT" in getattr(p, "bansos", []) and "PKH" in getattr(p, "bansos", [])
    )
    per_bansos = [
        Distribusi(label="BPNT", value=total_bpnt_saja),
        Distribusi(label="PKH", value=total_pkh_saja),
        Distribusi(label="BPNT & PKH", value=total_ganda),
    ]
    return StatistikPublik(
        periodeTerawal=periode_terawal(),
        totalPenduduk=len(semua),
        totalLakiLaki=sum(
            1 for p in semua if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in semua if p.jenisKelamin == "PEREMPUAN"
        ),
        totalKepalaKeluarga=sum(
            1 for p in semua if p.statusHubunganKeluarga == "KEPALA_KELUARGA"
        ),
        totalPenerimaBansos=total_penerima,
        totalBpnt=total_bpnt,
        totalPkh=total_pkh,
        perBansos=per_bansos,
        perPekerjaan=distribusi_by(semua, lambda p: p.pekerjaan)[:10],
        perRw=[
            _rincian(
                format_rw(rw),
                warga,
                [
                    _rincian(format_rt(rt), warga_rt)
                    for rt, warga_rt in _kelompokkan(warga, lambda p: p.alamat.rt)
                ],
            )
            for rw, warga in _kelompokkan(semua, lambda p: p.alamat.rw)
        ],
    )


@router.get("/publik/struktur-organisasi", response_model=StrukturOrganisasiPublik)
def struktur_organisasi_publik() -> StrukturOrganisasiPublik:
    """Bagan pengurus untuk halaman profil — Dukuh & Ketua RW/RT beserta nama
    pemegangnya kalau ada. Dibangun dari `pengurus.daftar_jabatan()`, sumber
    yang sama dipakai halaman Admin, jadi pergantian jabatan yang disetujui
    otomatis terlihat di sini tanpa deploy ulang.

    RW/RT hanya muncul kalau ada warga AKTIF ber-alamat di situ —
    `daftar_jabatan()` menurunkan wilayahnya dari data warga, bukan daftar
    tetap. Jabatan tanpa akun aktif tampil dengan `nama=None`; frontend yang
    menandainya "Belum diisi".
    """
    jabatan = data_pengurus.daftar_jabatan()

    dukuh = next(
        (j for j in jabatan if j.role == data_pengurus.ROLE_DUKUH), None
    )

    rw_map: dict[str, RwPublik] = {}
    urutan_rw: list[str] = []
    for j in jabatan:
        if j.role == data_pengurus.ROLE_RW and j.rw is not None:
            rw_map[j.rw] = RwPublik(
                nomor=j.rw, nama=j.pemegang.nama if j.pemegang else None
            )
            urutan_rw.append(j.rw)
    for j in jabatan:
        if j.role == data_pengurus.ROLE_RT and j.rw is not None and j.rt is not None:
            rw_map[j.rw].rt.append(
                JabatanWilayahPublik(
                    nomor=j.rt, nama=j.pemegang.nama if j.pemegang else None
                )
            )

    return StrukturOrganisasiPublik(
        dukuh=dukuh.pemegang.nama if dukuh and dukuh.pemegang else None,
        rw=[rw_map[rw] for rw in urutan_rw],
        lpm=data_lpm.nama() or None,
    )
