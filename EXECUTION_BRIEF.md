# AI Execution Brief - Web Pendataan Sovenir

## Konteks & target

Bangun web pendataan sovenir (pengambilan, pengembalian, stok masuk, sisa stok, dengan foto) di React + Vite + Tailwind, hosting Vercel, data di Google Sheets lewat Apps Script.

- Baca lebih dulu: `PRD.md` dan `rules.md`. Jika ada pertentangan, rules.md menang.
- File Google Sheets: Data_Sovenir.xlsx, di-upload ke Google Drive sebagai template.
- Kerjakan berurutan dan berhenti di akhir tiap langkah untuk dites sebelum lanjut.
- Tanya pengguna jika ada hal yang tidak jelas; jangan berasumsi.

## Langkah eksekusi

Urutannya: data dulu, lalu API, lalu frontend, terakhir deploy; tiap langkah punya hasil yang bisa dites.

1. **Siapkan Sheets.** Upload Data_Sovenir.xlsx ke Google Drive, buka sebagai Google Sheets, isi daftar Jenis Soevenir di tab Sisa Stok kolom A. Hasil: tab terisi dan rumus Sisa Stok berjalan.
2. **Tulis Apps Script.** Dari Extensions > Apps Script, buat `Code.gs`: `doGet` (baca Sisa Stok) dan `doPost` (tambah baris ke Pengambilan, Pengembalian, Stok Masuk) dengan LockService dan validasi. Hasil: bisa dites lewat URL dan Postman/curl.
3. **Tambah upload foto.** Di `doPost`, jika ada foto base64, simpan ke satu folder Drive, set akses siapa saja dengan link, tulis link ke kolom Foto Bukti. Hasil: foto muncul di Drive dan linknya di Sheets.
4. **Deploy Apps Script.** Web App, Execute as: Me, Access: Anyone. Salin URL.
5. **Buat proyek frontend.** React + Vite + Tailwind, `src/lib/api.js` memakai `VITE_API_URL`, `src/lib/foto.js` untuk kompres foto (maks. 1280 px, JPEG 0.7).
6. **Bangun 5 halaman.** Beranda, Pengambilan, Pengembalian, Stok Masuk, Sisa Stok (dengan thumbnail foto sovenir), sesuai tabel halaman di PRD.
7. **Validasi dan notifikasi.** Cek stok sebelum Pengambilan disimpan; loading, toast sukses, pesan error di setiap form.
8. **Deploy ke Vercel.** Push ke GitHub, import ke Vercel, isi `VITE_API_URL` di Environment Variables, deploy.

## Checklist uji

Proyek dianggap selesai jika semua poin ini lolos di versi yang sudah di-deploy ke Vercel.

- [ ] Tambah stok 100 pcs untuk satu jenis; Sisa Stok menjadi 100.
- [ ] Pengambilan 20 pcs dengan nama dan foto bukti; Sisa Stok menjadi 80, foto terbuka dari link di Sheets.
- [ ] Pengembalian 5 pcs; Sisa Stok menjadi 85.
- [ ] Pengambilan melebihi sisa stok ditolak dengan pesan jelas, dan tidak ada baris baru di Sheets.
- [ ] Jumlah 0, minus, atau kosong ditolak; tanggal kosong ditolak.
- [ ] Dua orang menyimpan hampir bersamaan: kedua baris tercatat, tidak ada yang tertimpa.
- [ ] Foto besar (misalnya 5 MB dari HP) berhasil di-upload setelah dikompres.
- [ ] Tampilan nyaman di layar HP (lebar 360 px).
