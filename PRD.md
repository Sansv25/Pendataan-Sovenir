# PRD Web Pendataan Sovenir

Tanggal: 24/11/2026

## 1. Ringkasan

Web ini mencatat pengambilan, pengembalian, dan stok masuk sovenir, lalu menampilkan sisa stok per jenis; semua data tersimpan di satu Google Sheets.

- Pengguna: petugas yang mengelola sovenir. Versi 1 dibuka bebas tanpa login.
- Halaman awal punya 4 menu: Pengambilan, Pengembalian, Stok Masuk, Sisa Stok.
- Sisa stok = Total Stok Masuk - Total Diambil + Total Dikembalikan.
- Di luar cakupan versi 1: login, role pengguna, notifikasi, laporan PDF.

## 2. Stack & deployment

Supabase tidak dipakai: Google Sheets menjadi satu-satunya database, diakses lewat Google Apps Script, dan frontend React di-host di Vercel.

```
Frontend di Vercel          API: Apps Script            Google Sheets
React, Vite, Tailwind  -->  Web App: doGet, doPost -->  Pengambilan, Pengembalian
5 halaman form + stok       Validasi + LockService      Stok Masuk, Sisa Stok
URL API: VITE_API_URL       Akses: Anyone               Satu file, bisa diedit
        POST / GET                  baca / tulis
```

Frontend memanggil Apps Script lewat HTTP; Apps Script memvalidasi lalu membaca atau menulis baris di Google Sheets. Tanpa Supabase, tidak ada database kedua yang perlu disinkronkan.

## 3. Halaman & fitur

Satu halaman awal mengarah ke empat halaman kerja; setiap form menyimpan satu baris ke tab Google Sheets yang sesuai.

| Halaman | Isi form / tampilan | Disimpan ke tab |
| --- | --- | --- |
| Beranda | 4 tombol menu | - |
| Pengambilan | Nama, Jenis Soevenir (dropdown), Jumlah Pengambilan, Tanggal Pengambilan, Keterangan Pengambilan Soevenir, Foto Bukti (opsional) | Pengambilan |
| Pengembalian | Nama, Jenis Soevenir (dropdown), Jumlah Pengembalian, Tanggal Pengembalian, Keterangan, Foto Bukti (opsional) | Pengembalian |
| Stok Masuk | Tanggal, Jenis Soevenir (dropdown), Jumlah, Keterangan | Stok Masuk |
| Sisa Stok | Tabel Jenis Soevenir, Total Masuk, Total Diambil, Total Dikembalikan, Sisa Stok, Status, Foto Sovenir (thumbnail); kolom pencarian | Dibaca dari tab Sisa Stok |

Setelah simpan berhasil, form dikosongkan dan muncul notifikasi sukses; jika gagal, data yang diisi tetap ada.

## 4. Struktur data Google Sheets

Satu file Google Sheets dengan 4 tab data; file Data_Sovenir.xlsx yang sudah dibuat di-upload ke Google Drive sebagai template.

| Tab | Kolom | Diisi oleh |
| --- | --- | --- |
| Pengambilan | Nama, Jenis Soevenir, Jumlah Pengambilan, Tanggal Pengambilan, Keterangan Pengambilan Soevenir, Foto Bukti (Link) | Web (append baris) |
| Pengembalian | Nama, Jenis Soevenir, Jumlah Pengembalian, Tanggal Pengembalian, Keterangan, Foto Bukti (Link) | Web (append baris) |
| Stok Masuk | Tanggal Stok Masuk, Jenis Soevenir, Jumlah Stok Masuk, Keterangan | Web (append baris) |
| Sisa Stok | Jenis Soevenir, Total Stok Masuk, Total Diambil, Total Dikembalikan, Sisa Stok, Status, Foto Sovenir (Link) | Kolom A dan G manual (daftar jenis, maks. 100; link foto), kolom B-F rumus SUMIFS |

Baris pertama tiap tab adalah header dan tidak boleh diubah urutannya, karena API membaca kolom berdasarkan posisi.

## 5. Foto

Foto bukti bersifat opsional pada Pengambilan dan Pengembalian; foto sovenir per jenis ada di tab Sisa Stok.

- Browser mengompres foto (sisi terpanjang 1280 px, JPEG 0.7), lalu mengirimnya sebagai base64 ke Apps Script, yang menyimpannya ke satu folder Google Drive.
- Di Sheets hanya disimpan link foto (kolom Foto Bukti atau Foto Sovenir); web menampilkan thumbnail dari link itu.
- Akses foto: siapa saja dengan link dapat melihat; folder Drive tidak dipublikasikan.
- Versi 1: foto sovenir per jenis diisi dengan menempel link Drive di Sheets; upload foto sovenir dari web ditunda.
- Perlu dikonfirmasi: apakah foto bukti dan foto sovenir keduanya dibutuhkan.

## 6. Aturan bisnis & validasi

Pengeluaran tidak boleh membuat sisa stok minus; semua validasi dicek di frontend dan diulang di Apps Script.

- Jenis Soevenir wajib dipilih dari daftar di tab Sisa Stok kolom A; jenis baru ditambahkan di sana dulu.
- Jumlah harus bilangan bulat lebih dari 0.
- Tanggal wajib diisi, bentuk DD/MM/YYYY, default hari ini.
- Nama wajib diisi untuk Pengambilan dan Pengembalian.
- Pengambilan ditolak jika jumlah melebihi sisa stok saat ini.
- Pengembalian dicatat per nama + jenis sovenir; versi 1 tidak mengunci jumlah kembali ke jumlah yang diambil.
- Apps Script memakai LockService agar dua input bersamaan tidak saling menimpa.
- Status stok di tab Sisa Stok: Tersedia, Habis (0), Cek data (minus).

## 7. Dokumen pendamping

- `rules.md`: aturan untuk AI IDE.
- `EXECUTION_BRIEF.md`: urutan langkah eksekusi dan checklist uji.
