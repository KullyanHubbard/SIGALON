from datetime import date
import io
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse

from app.api.routers.auth import current_pengurus
from app.data.agregat import kelompok_umur, umur
from app.data.ekspor import bikin_csv, bikin_excel
from app.data.padukuhan import ambil as ambil_padukuhan
from app.data.pengurus import _samakan_wilayah
from app.data import store
from app.data.store import penduduk_untuk
from app.schemas.auth import AuthUser
from app.schemas.penduduk import (
    FilterOpsi,
    PaginatedPenduduk,
    Penduduk,
    PendudukBaru,
    PendudukUbah,
)

router = APIRouter(tags=["penduduk"])

# Filter yang cukup dibandingkan sama-persis dengan satu field `Penduduk`.
# Ditulis sebagai daftar supaya menambah filter enum baru = satu baris di sini,
# bukan satu cabang `if` lagi di dalam fungsi.
_FILTER_LANGSUNG = (
    "jenisKelamin",
    "agama",
    "golonganDarah",
    "pendidikan",
    "statusPerkawinan",
    "statusHubunganKeluarga",
    "statusKependudukan",
    "statusDomisili",
)


def saring(
    daftar: list[Penduduk],
    *,
    search: str = "",
    pekerjaan: str = "",
    rt: str = "",
    rw: str = "",
    kelompokUmur: str = "",
    bansos: str = "",
    **enum_filter: str,
) -> list[Penduduk]:
    """Semua filter digabung AND; nilai kosong tidak menyaring apa pun.

    `search` mencocokkan nama dan Kode Warga (`id`).

    ponytail: disaring di memori atas cache `store.py`, bukan lewat SQL — data
    satu padukuhan muat di RAM dan sudah dimuat saat start. Pindah ke WHERE
    clause kalau datanya nanti puluhan ribu baris.
    """
    q = search.strip().lower()
    hasil = daftar
    if q:
        hasil = [p for p in hasil if q in p.nama.lower() or q in p.id.lower()]
    for field in _FILTER_LANGSUNG:
        nilai = enum_filter.get(field, "")
        if nilai:
            hasil = [p for p in hasil if getattr(p, field, None) == nilai]
    if pekerjaan:
        p_clean = pekerjaan.strip().lower()
        hasil = [p for p in hasil if p.pekerjaan and p.pekerjaan.strip().lower() == p_clean]
    if rt:
        hasil = [p for p in hasil if _samakan_wilayah(p.alamat.rt, rt)]
    if rw:
        hasil = [p for p in hasil if _samakan_wilayah(p.alamat.rw, rw)]
    if kelompokUmur:
        hasil = [
            p for p in hasil if kelompok_umur(umur(p.tanggalLahir)) == kelompokUmur
        ]
    if bansos:
        b_upper = bansos.strip().upper()
        if b_upper in ("SEMUA", "YA", "TERIMA"):
            hasil = [p for p in hasil if len(getattr(p, "bansos", [])) > 0]
        elif b_upper in ("TIDAK", "BUKAN", "NON"):
            hasil = [p for p in hasil if len(getattr(p, "bansos", [])) == 0]
        else:
            # Dinamis: mencocokkan tag bansos apa pun tanpa dibatasi hardcoded BPNT/PKH
            hasil = [
                p
                for p in hasil
                if any(b_upper == str(b).strip().upper() for b in getattr(p, "bansos", []))
            ]
    return hasil


@router.get("/penduduk", response_model=PaginatedPenduduk)
def list_penduduk(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=200),
    search: str = "",
    jenisKelamin: str = "",
    agama: str = "",
    golonganDarah: str = "",
    pendidikan: str = "",
    statusPerkawinan: str = "",
    statusHubunganKeluarga: str = "",
    statusKependudukan: str = "",
    pekerjaan: str = "",
    rt: str = "",
    rw: str = "",
    kelompokUmur: str = "",
    bansos: str = "",
    statusDomisili: str = "",
    sortBy: str = "",
    sortOrder: str = "asc",
    user: AuthUser = Depends(current_pengurus),
) -> PaginatedPenduduk:
    if user.role == "RT":
        if rw and not _samakan_wilayah(rw, user.rw):
            raise HTTPException(403, "Anda hanya berwenang mengakses data wilayah RT Anda sendiri.")
        if rt and not _samakan_wilayah(rt, user.rt):
            raise HTTPException(403, "Anda hanya berwenang mengakses data wilayah RT Anda sendiri.")
    elif user.role == "RW":
        if rw and not _samakan_wilayah(rw, user.rw):
            raise HTTPException(403, "Anda hanya berwenang mengakses data wilayah RW Anda sendiri.")

    hasil = saring(
        penduduk_untuk(user),
        search=search,
        pekerjaan=pekerjaan,
        rt=rt,
        rw=rw,
        kelompokUmur=kelompokUmur,
        bansos=bansos,
        statusDomisili=statusDomisili,
        statusKependudukan=statusKependudukan,
        jenisKelamin=jenisKelamin,
        agama=agama,
        golonganDarah=golonganDarah,
        pendidikan=pendidikan,
        statusPerkawinan=statusPerkawinan,
        statusHubunganKeluarga=statusHubunganKeluarga,
    )

    if sortBy:
        reverse = sortOrder.lower() == "desc"
        if sortBy == "nama":
            hasil = sorted(hasil, key=lambda p: p.nama.lower(), reverse=reverse)
        elif sortBy in ("umur", "tanggalLahir"):
            hasil = sorted(
                hasil,
                key=lambda p: p.tanggalLahir or "",
                reverse=(not reverse if sortBy == "umur" else reverse),
            )
        elif sortBy == "rt":
            hasil = sorted(
                hasil,
                key=lambda p: int(p.alamat.rt) if p.alamat.rt.isdigit() else 0,
                reverse=reverse,
            )
        elif sortBy == "rw":
            hasil = sorted(
                hasil,
                key=lambda p: int(p.alamat.rw) if p.alamat.rw.isdigit() else 0,
                reverse=reverse,
            )
        elif sortBy == "id":
            hasil = sorted(hasil, key=lambda p: p.id, reverse=reverse)

    start = (page - 1) * pageSize
    return PaginatedPenduduk(
        items=hasil[start : start + pageSize],
        total=len(hasil),
        page=page,
        pageSize=pageSize,
    )


@router.get("/penduduk/ekspor")
def ekspor_penduduk(
    search: str = "",
    jenisKelamin: str = "",
    agama: str = "",
    golonganDarah: str = "",
    pendidikan: str = "",
    statusPerkawinan: str = "",
    statusHubunganKeluarga: str = "",
    statusKependudukan: str = "",
    pekerjaan: str = "",
    rt: str = "",
    rw: str = "",
    kelompokUmur: str = "",
    bansos: str = "",
    statusDomisili: str = "",
    format: str = Query("xlsx", pattern="^(xlsx|csv)$"),
    user: AuthUser = Depends(current_pengurus),
) -> Response:
    """Ekspor data warga ke file Excel (.xlsx) atau CSV (.csv) sesuai hak akses & filter."""
    if user.role == "RT":
        if rw and not _samakan_wilayah(rw, user.rw):
            raise HTTPException(403, "Anda hanya berwenang mengekspor data wilayah RT Anda sendiri.")
        if rt and not _samakan_wilayah(rt, user.rt):
            raise HTTPException(403, "Anda hanya berwenang mengekspor data wilayah RT Anda sendiri.")
    elif user.role == "RW":
        if rw and not _samakan_wilayah(rw, user.rw):
            raise HTTPException(403, "Anda hanya berwenang mengekspor data wilayah RW Anda sendiri.")

    hasil = saring(
        penduduk_untuk(user),
        search=search,
        pekerjaan=pekerjaan,
        rt=rt,
        rw=rw,
        kelompokUmur=kelompokUmur,
        bansos=bansos,
        statusDomisili=statusDomisili,
        statusKependudukan=statusKependudukan,
        jenisKelamin=jenisKelamin,
        agama=agama,
        golonganDarah=golonganDarah,
        pendidikan=pendidikan,
        statusPerkawinan=statusPerkawinan,
        statusHubunganKeluarga=statusHubunganKeluarga,
    )

    tgl = date.today().isoformat()
    padukuhan = ambil_padukuhan()
    judul = f"DATA PENDUDUK — {padukuhan.namaLengkap.upper() if padukuhan else 'PADUKUHAN'}"

    if format == "csv":
        konten_csv = bikin_csv(hasil)
        nama_file = f"data-penduduk-{tgl}.csv"
        return Response(
            content=konten_csv,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{nama_file}"'},
        )

    # Default: Excel (.xlsx)
    konten_xlsx = bikin_excel(hasil, judul=judul)
    nama_file = f"data-penduduk-{tgl}.xlsx"
    return StreamingResponse(
        io.BytesIO(konten_xlsx),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{nama_file}"'},
    )


# Ditulis SEBELUM `/penduduk/{id}`: rute statis harus menang atas rute
# ber-parameter, kalau tidak "filter-opsi" akan terbaca sebagai sebuah id.
@router.get("/penduduk/filter-opsi", response_model=FilterOpsi)
def filter_opsi(user: AuthUser = Depends(current_pengurus)) -> FilterOpsi:
    """Pilihan filter yang bukan enum — hanya bisa diketahui dari isi data.

    Ikut menyempit sesuai wilayah pemanggilnya: Ketua RT 004 tidak melihat
    daftar RT lain di dropdown-nya.

    `pekerjaan` teks bebas di Excel, jadi daftarnya ikut kotor kalau pengurus
    mengetik tidak konsisten. Diterima sadar: daftar pekerjaan satu padukuhan
    tidak bisa dijadikan enum tertutup dari awal.
    """
    milik_saya = penduduk_untuk(user)

    def _urut_wilayah(kode: str) -> tuple[int, int | str]:
        angka = "".join(c for c in kode if c.isdigit())
        return (0, int(angka)) if angka else (1, kode)

    semua_bansos: set[str] = set()
    for p in milik_saya:
        for b in getattr(p, "bansos", []):
            if b and str(b).strip():
                semua_bansos.add(str(b).strip())

    return FilterOpsi(
        rt=sorted({p.alamat.rt for p in milik_saya if p.alamat.rt}, key=_urut_wilayah),
        rw=sorted({p.alamat.rw for p in milik_saya if p.alamat.rw}, key=_urut_wilayah),
        pekerjaan=sorted({p.pekerjaan for p in milik_saya if p.pekerjaan}),
        bansos=sorted(semua_bansos),
    )


@router.get("/penduduk/{id}", response_model=Penduduk)
def get_by_id(id: str, user: AuthUser = Depends(current_pengurus)) -> Penduduk:
    """404 — bukan 403 — untuk warga di luar wilayahnya. 403 memberi tahu bahwa
    orang itu ada; 404 tidak memberi tahu apa-apa."""
    for p in penduduk_untuk(user):
        if p.id == id:
            return p
    raise HTTPException(status_code=404, detail="Penduduk tidak ditemukan")


@router.post("/penduduk", response_model=Penduduk, status_code=201)
def tambah_penduduk(
    payload: PendudukBaru, user: AuthUser = Depends(current_pengurus)
) -> Penduduk:
    """Tambah warga baru di wilayah pengurus ini. Kode Warganya dibangkitkan
    aplikasi."""
    try:
        return store.tambah_warga(user, payload.model_dump())
    except store.TidakBoleh as e:
        raise HTTPException(403, str(e))


@router.patch("/penduduk/{id}", response_model=Penduduk)
def ubah_penduduk(
    id: str, payload: PendudukUbah, user: AuthUser = Depends(current_pengurus)
) -> Penduduk:
    """Ubah data satu warga. Field yang tidak dikirim tidak disentuh.

    Mengubah RT/RW (memindahkan warga) hanya boleh Dukuh — lihat
    `app/data/store.py:ubah_warga`.
    """
    ubahan = payload.model_dump(exclude_unset=True)
    if "alamat" in ubahan and ubahan["alamat"] is not None:
        ubahan["alamat"] = {
            k: v for k, v in ubahan["alamat"].items() if v is not None
        }
    try:
        return store.ubah_warga(user, id, ubahan)
    except store.TidakBoleh as e:
        # 404 kalau memang tidak terlihat olehnya; 403 kalau terlihat tapi
        # tindakannya yang dilarang.
        raise HTTPException(404 if "tidak ditemukan" in str(e) else 403, str(e))


@router.delete("/penduduk/{id}", status_code=204)
def hapus_penduduk(
    id: str, user: AuthUser = Depends(current_pengurus)
) -> None:
    """Hapus data warga karena salah input (soft-delete).

    Warga yang dihapus disembunyikan permanen dari daftar dan statistik,
    tetapi barisnya tetap ada di database dengan deletedAt untuk riwayat audit.
    Warga yang pindah atau meninggal jangan dihapus, melainkan gunakan PATCH /penduduk/{id}.
    """
    try:
        store.hapus_warga(user, id)
    except store.TidakBoleh as e:
        raise HTTPException(404 if "tidak ditemukan" in str(e) else 403, str(e))

