# Rules - Web Pendataan Sovenir

## Stack
- React + Vite + Tailwind CSS. Tanpa Supabase, tanpa backend lain.
- Database hanya Google Sheets, diakses lewat Google Apps Script Web App.
- Foto disimpan di Google Drive lewat Apps Script; di Sheets hanya disimpan link/ID file.
- Hosting di Vercel. URL Apps Script disimpan di environment variable VITE_API_URL, jangan di-hardcode.

## Struktur folder
- src/pages: Beranda, Pengambilan, Pengembalian, StokMasuk, SisaStok
- src/components: komponen UI yang dipakai ulang (Form, Toast, FotoInput, TabelStok)
- src/lib/api.js: semua pemanggilan ke Apps Script
- src/lib/foto.js: kompres foto sebelum upload
- apps-script/Code.gs: kode Apps Script (doGet, doPost)

## Aturan data
- Jangan ubah urutan atau nama kolom di Google Sheets; API membaca kolom berdasarkan posisi.
- Tab: Pengambilan, Pengembalian, Stok Masuk, Sisa Stok.
- Sisa Stok = Total Stok Masuk - Total Diambil + Total Dikembalikan (dihitung rumus di Sheets, bukan di frontend).
- Jenis Soevenir hanya boleh dari daftar di tab Sisa Stok kolom A.

## Validasi (frontend DAN Apps Script)
- Jumlah: bilangan bulat > 0. Tanggal: wajib, format DD/MM/YYYY, default hari ini. Nama: wajib untuk Pengambilan dan Pengembalian.
- Pengambilan ditolak jika jumlah melebihi sisa stok; cek ulang di Apps Script sebelum menulis.
- Gunakan LockService di Apps Script pada setiap penulisan.

## Foto
- Foto bukti pada Pengambilan dan Pengembalian bersifat opsional; foto sovenir per jenis disimpan di Sisa Stok kolom Foto.
- Kompres di browser: sisi terpanjang maks. 1280 px, JPEG kualitas 0.7, sebelum dikirim.
- Kirim sebagai base64 dalam JSON via POST Content-Type text/plain (hindari preflight CORS).
- Apps Script menyimpan ke satu folder Drive, set akses 'siapa saja dengan link: lihat', lalu mengembalikan link.
- Tampilkan thumbnail dengan https://drive.google.com/thumbnail?id=ID&sz=w400.

## UI
- Bahasa Indonesia. Layout mobile-first, tombol besar.
- Setiap form: loading saat simpan, notifikasi sukses, pesan error jelas; data form tetap ada jika gagal.

## Larangan
- Jangan tambah login, role, laporan PDF, atau fitur lain di luar PRD tanpa diminta.
- Jangan commit URL Apps Script atau ID folder Drive ke repo publik.
- Jangan memakai library tambahan jika bisa dikerjakan dengan React dan Tailwind saja.
