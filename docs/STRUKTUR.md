# Struktur folder (Fase 1 rapi)

## Halaman aplikasi
| Path | Fungsi |
|------|--------|
| `index.html` | Beranda |
| `pages/admin/` | Panel guru + audit/impor bank soal |
| `pages/admin/index.html` | Panel admin utama |
| `pages/admin/audit-bank-soal.html` | Audit pool |
| `pages/admin/impor-bank-soal.html` | Impor massal |
| `pages/uji-kemampuan.html` | ATS / latihan soal |
| `pages/laporan-siswa/` | Laporan (landing di `pages/laporan-siswa.html`) |
| `pages/materi/` | Konten materi (tidak digeser) |

## Redirect (path lama → baru)
| Lama | Baru |
|------|------|
| `pages/admin.html` | `pages/admin/` |
| `pages/bank-soal.html` | `pages/uji-kemampuan.html` |
| `pages/belajar-mandiri.html` | `pages/laporan-siswa/belajar-mandiri.html` |
| `pages/latihan-mandiri.html` | `pages/laporan-siswa/latihan-mandiri.html` |

## Dokumentasi
| Path | Isi |
|------|-----|
| `docs/` | Panduan, changelog, antiregresi, rancangan |
