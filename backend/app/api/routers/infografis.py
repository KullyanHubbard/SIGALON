from fastapi import APIRouter, Depends

from app.api.routers.auth import current_pengurus
from app.data.agregat import (
    distribusi_by,
    distribusi_kelompok_umur,
    distribusi_pendidikan,
    format_rw,
)
from app.data.store import hanya_aktif, penduduk_untuk
from app.schemas.auth import AuthUser
from app.schemas.infografis import InfografisData
from app.schemas.penduduk import Distribusi

router = APIRouter(tags=["infografis"])


@router.get("/infografis", response_model=InfografisData)
async def infografis(user: AuthUser = Depends(current_pengurus)) -> InfografisData:
    """Agregat wilayah pemanggilnya, bukan seluruh padukuhan.

    Grafik Ketua RT 004 jadi tentang RT 004 saja — termasuk `perDusun`, yang
    karena itu cuma berisi satu batang. Wajar, bukan cacat.
    """
    # Yang pindah & meninggal tidak ikut dihitung: ini gambaran siapa yang
    # tinggal di sini sekarang, bukan siapa yang pernah tercatat.
    warga = hanya_aktif(penduduk_untuk(user))
    total_bpnt = sum(1 for p in warga if "BPNT" in getattr(p, "bansos", []))
    total_pkh = sum(1 for p in warga if "PKH" in getattr(p, "bansos", []))
    total_penerima = sum(1 for p in warga if getattr(p, "bansos", []))
    total_ngontrak = sum(1 for p in warga if getattr(p, "statusDomisili", "TETAP") == "KONTRAK")
    per_bansos = [
        Distribusi(label="BPNT", value=total_bpnt),
        Distribusi(label="PKH", value=total_pkh),
    ]
    return InfografisData(
        totalPenduduk=len(warga),
        totalKepalaKeluarga=sum(
            1 for p in warga if p.statusHubunganKeluarga == "KEPALA_KELUARGA"
        ),
        totalLakiLaki=sum(
            1 for p in warga if p.jenisKelamin == "LAKI_LAKI"
        ),
        totalPerempuan=sum(
            1 for p in warga if p.jenisKelamin == "PEREMPUAN"
        ),
        totalPenerimaBansos=total_penerima,
        totalBpnt=total_bpnt,
        totalPkh=total_pkh,
        perBansos=per_bansos,
        totalNgontrak=total_ngontrak,
        perAgama=distribusi_by(warga, lambda p: p.agama),
        perPendidikan=distribusi_pendidikan(warga),
        perStatusPerkawinan=distribusi_by(
            warga, lambda p: p.statusPerkawinan
        ),
        perDusun=distribusi_by(warga, lambda p: format_rw(p.alamat.rw)),
        perKelompokUmur=distribusi_kelompok_umur(warga),
    )
