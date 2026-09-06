# NIA Web — Frontend

Portal Data Kependudukan Desa. React + TypeScript + Vite.

## Menjalankan

Backend (FastAPI, data dummy) harus jalan dulu — lihat
[`../backend/README.md`](../backend/README.md).

```bash
./start.sh    # bikin .env kalau belum ada, pasang dependensi, nyalakan Vite
```

Tidak ada `.env.example`. Kerangkanya dibuatkan `start.sh` dengan **nilai
bawaan yang langsung bisa jalan** — frontend tidak punya rahasia wajib seperti
backend, jadi kerangkanya lengkap.

### Isi `frontend/.env`

| Variabel | Wajib | Bawaan | Guna |
| -------- | ----- | ------ | ---- |
| `VITE_API_BASE_URL` | — | `/api` | Base URL API backend. `/api` melewati proxy Vite ke `localhost:8000` (satu origin, tanpa CORS). Isi URL penuh hanya kalau mau memanggil backend langsung. |
| `VITE_APP_NAME` | — | `SIGALON` | Nama aplikasi, dipakai di title & header. |

Semua variabel yang diakses di client **wajib** berprefix `VITE_`.

Berkas itu **tidak ikut repo** (`.gitignore`).

Manual, kalau lebih suka:

```bash
npm install
npm run dev   # http://localhost:5173
```

## Peran & Hak Akses Pengurus

Aplikasi ini ditujukan khusus untuk **Perangkat Desa** (warga tidak memiliki akun). Terdapat 4 peran:

| Peran | Hak Akses |
| ----- | --------- |
| **`ADMIN`** | Kelola akun pengurus, ajukan pergantian jabatan, reset password. **Nol akses ke data warga**. |
| **`DUKUH`** | Akses penuh membaca, menambah, dan mengubah data warga seluruh padukuhan. |
| **`RW`** | Akses data warga terbatas hanya untuk wilayah RW bersangkutan. |
| **`RT`** | Akses data warga terbatas hanya untuk wilayah RT bersangkutan. |

Portal publik (`/`, `/profil`, `/infografis`, `/berita`, `/statistik`) terbuka bebas tanpa autentikasi.

## Skrip

| Perintah            | Fungsi                          |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server                      |
| `npm run build`     | Typecheck + build produksi      |
| `npm run typecheck` | Cek tipe (tsc)                  |
| `npm run lint`      | ESLint                          |
| `npm run format`    | Prettier                        |

Konvensi kode & arsitektur lengkap ada di [`../CLAUDE.md`](../CLAUDE.md).
