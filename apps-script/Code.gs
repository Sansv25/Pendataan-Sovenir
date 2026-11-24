/**
 * Google Apps Script - Web Pendataan Sovenir
 * 
 * Konfigurasi:
 * FOLDER_ID_FOTO_BUKTI: Folder tempat menyimpan foto bukti & foto sovenir di Drive.
 */

const FOLDER_ID_FOTO_BUKTI = "1rsjH7VrZHdeXnrvmBhxN0_rVbNjUt55r";

/**
 * Sinkronisasi & hitung total stok secara otomatis dan andal
 * Membaca data langsung dari tab 'Stok Masuk', 'Pengambilan', dan 'Pengembalian'
 * Lalu menuliskan hasilnya ke kolom B s.d F di tab 'Sisa Stok'
 */
function syncAndCalculateStock(ss) {
  try {
    const sheetStok = ss.getSheetByName("Sisa Stok");
    if (!sheetStok) return;

    const sheetMasuk = ss.getSheetByName("Stok Masuk");
    const sheetPengambilan = ss.getSheetByName("Pengambilan");
    const sheetPengembalian = ss.getSheetByName("Pengembalian");

    // 1. Kumpulkan total Stok Masuk per jenis
    const masukMap = {};
    if (sheetMasuk && sheetMasuk.getLastRow() >= 2) {
      const masukValues = sheetMasuk.getRange(2, 2, sheetMasuk.getLastRow() - 1, 2).getValues();
      for (let i = 0; i < masukValues.length; i++) {
        const jns = masukValues[i][0] ? String(masukValues[i][0]).trim().toLowerCase() : "";
        const jml = Number(masukValues[i][1]) || 0;
        if (jns) {
          masukMap[jns] = (masukMap[jns] || 0) + jml;
        }
      }
    }

    // 2. Kumpulkan total Diambil per jenis
    const diambilMap = {};
    if (sheetPengambilan && sheetPengambilan.getLastRow() >= 2) {
      const pengambilanValues = sheetPengambilan.getRange(2, 2, sheetPengambilan.getLastRow() - 1, 2).getValues();
      for (let i = 0; i < pengambilanValues.length; i++) {
        const jns = pengambilanValues[i][0] ? String(pengambilanValues[i][0]).trim().toLowerCase() : "";
        const jml = Number(pengambilanValues[i][1]) || 0;
        if (jns) {
          diambilMap[jns] = (diambilMap[jns] || 0) + jml;
        }
      }
    }

    // 3. Kumpulkan total Dikembalikan per jenis
    const kembaliMap = {};
    if (sheetPengembalian && sheetPengembalian.getLastRow() >= 2) {
      const pengembalianValues = sheetPengembalian.getRange(2, 2, sheetPengembalian.getLastRow() - 1, 2).getValues();
      for (let i = 0; i < pengembalianValues.length; i++) {
        const jns = pengembalianValues[i][0] ? String(pengembalianValues[i][0]).trim().toLowerCase() : "";
        const jml = Number(pengembalianValues[i][1]) || 0;
        if (jns) {
          kembaliMap[jns] = (kembaliMap[jns] || 0) + jml;
        }
      }
    }

    // 4. Update kolom B s.d F di tab Sisa Stok
    const lastRow = Math.min(sheetStok.getLastRow(), 101);
    for (let r = 2; r <= Math.max(lastRow, 2); r++) {
      const jenisRaw = sheetStok.getRange(r, 1).getValue();
      if (!jenisRaw || String(jenisRaw).trim() === "") continue;

      const jnsKey = String(jenisRaw).trim().toLowerCase();
      const totMasuk = masukMap[jnsKey] || 0;
      const totDiambil = diambilMap[jnsKey] || 0;
      const totKembali = kembaliMap[jnsKey] || 0;
      const sisa = totMasuk - totDiambil + totKembali;

      let status = "Tersedia";
      if (sisa < 0) status = "Cek data";
      else if (sisa === 0) status = "Habis";

      // Tulis hasil kalkulasi riil ke sel B, C, D, E, F di Google Sheets
      sheetStok.getRange(r, 2, 1, 5).setValues([[totMasuk, totDiambil, totKembali, sisa, status]]);
    }

    SpreadsheetApp.flush();
  } catch (err) {
    Logger.log("syncAndCalculateStock error: " + err.toString());
  }
}

/**
 * Handle GET requests
 * Mengambil data Sisa Stok & daftar Jenis Sovenir
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetStok = ss.getSheetByName("Sisa Stok");
    
    if (!sheetStok) {
      return jsonResponse({
        success: false,
        message: "Tab 'Sisa Stok' tidak ditemukan di spreadsheet."
      });
    }

    // Lakukan sinkronisasi data riil dari Stok Masuk, Pengambilan, Pengembalian
    syncAndCalculateStock(ss);

    // Baca data dari baris 2 hingga 101 (maks 100 jenis sovenir)
    const lastRow = Math.min(sheetStok.getLastRow(), 101);
    if (lastRow < 2) {
      return jsonResponse({
        success: true,
        data: [],
        spreadsheetUrl: ss.getUrl()
      });
    }

    const range = sheetStok.getRange(2, 1, lastRow - 1, 7);
    const values = range.getValues();

    const data = [];
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const jenis = row[0] ? String(row[0]).trim() : "";
      if (!jenis) continue;

      const totalMasuk = Number(row[1]) || 0;
      const totalDiambil = Number(row[2]) || 0;
      const totalDikembalikan = Number(row[3]) || 0;
      const sisaStok = Number(row[4]) || 0;
      
      let status = row[5] ? String(row[5]).trim() : "";
      if (!status) {
        if (sisaStok < 0) status = "Cek data";
        else if (sisaStok === 0) status = "Habis";
        else status = "Tersedia";
      }

      const fotoRaw = row[6] ? String(row[6]).trim() : "";
      const fotoId = extractDriveId(fotoRaw);
      const fotoThumbnail = fotoId ? "https://drive.google.com/thumbnail?id=" + fotoId + "&sz=w400" : (fotoRaw || "");

      data.push({
        id: i + 1,
        jenis: jenis,
        totalMasuk: totalMasuk,
        totalDiambil: totalDiambil,
        totalDikembalikan: totalDikembalikan,
        sisaStok: sisaStok,
        status: status,
        fotoUrl: fotoRaw,
        fotoThumbnail: fotoThumbnail
      });
    }

    return jsonResponse({
      success: true,
      data: data,
      spreadsheetUrl: ss.getUrl(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan saat membaca data: " + error.toString()
    });
  }
}

/**
 * Handle POST requests
 * Menambah transaksi: pengambilan, pengembalian, stok_masuk, atau tambah_jenis
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Tunggu antrean LockService hingga 30 detik agar concurrent writes tidak bentrok
  const hasLock = lock.tryLock(30000);
  if (!hasLock) {
    return jsonResponse({
      success: false,
      message: "Server sedang sibuk memproses transaksi lain. Silakan coba lagi beberapa saat lagi."
    });
  }

  try {
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({
        success: false,
        message: "Format data request tidak valid (bukan JSON)."
      });
    }

    const action = String(payload.action || payload.type || "").toLowerCase().trim();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    const sheetStok = ss.getSheetByName("Sisa Stok");
    if (!sheetStok) {
      return jsonResponse({
        success: false,
        message: "Tab 'Sisa Stok' tidak ditemukan."
      });
    }

    // -------------------------------------------------------------
    // AKSI 1: TAMBAH JENIS SOVENIR BARU (LANGSUNG DARI WEB)
    // -------------------------------------------------------------
    if (action === "tambah_jenis" || action === "tambahjenis") {
      const namaJenisBaru = payload.jenis ? String(payload.jenis).trim() : (payload.nama ? String(payload.nama).trim() : "");
      if (!namaJenisBaru) {
        return jsonResponse({
          success: false,
          message: "Nama Jenis Sovenir wajib diisi."
        });
      }

      // Cek apakah jenis sovenir sudah ada
      const colAValues = sheetStok.getRange(2, 1, 100, 1).getValues();
      let targetRow = -1;

      for (let i = 0; i < colAValues.length; i++) {
        const existing = colAValues[i][0] ? String(colAValues[i][0]).trim() : "";
        if (existing.toLowerCase() === namaJenisBaru.toLowerCase()) {
          return jsonResponse({
            success: false,
            message: "Jenis Sovenir '" + existing + "' sudah terdaftar di Sisa Stok."
          });
        }
        if (!existing && targetRow === -1) {
          targetRow = i + 2; // Baris kosong pertama yang ditemukan
        }
      }

      if (targetRow === -1) {
        return jsonResponse({
          success: false,
          message: "Kapasitas tab Sisa Stok penuh (maksimal 100 jenis sovenir)."
        });
      }

      // Simpan foto sovenir jika ada
      let fotoUrl = "";
      if (payload.foto) {
        fotoUrl = simpanFotoDrive(payload.foto, "sovenir", namaJenisBaru);
      }

      // Tulis nama jenis ke kolom A
      sheetStok.getRange(targetRow, 1).setValue(namaJenisBaru);
      if (fotoUrl) {
        sheetStok.getRange(targetRow, 7).setValue(fotoUrl);
      }
      SpreadsheetApp.flush();

      // Sinkronkan sisa stok
      syncAndCalculateStock(ss);

      return jsonResponse({
        success: true,
        message: "Jenis Sovenir '" + namaJenisBaru + "' berhasil didaftarkan ke Google Sheets!",
        data: { jenis: namaJenisBaru, fotoUrl: fotoUrl }
      });
    }

    // -------------------------------------------------------------
    // PEMETAAN STOK UNTUK TRANSAKSI LAIN
    // -------------------------------------------------------------
    // Sinkronkan stok terlebih dahulu agar data terbaru
    syncAndCalculateStock(ss);

    const lastStokRow = Math.min(sheetStok.getLastRow(), 101);
    const stokValues = lastStokRow >= 2 ? sheetStok.getRange(2, 1, lastStokRow - 1, 6).getValues() : [];
    
    const stokMap = {};
    for (let i = 0; i < stokValues.length; i++) {
      const jns = stokValues[i][0] ? String(stokValues[i][0]).trim() : "";
      if (jns) {
        stokMap[jns.toLowerCase()] = {
          jenisExact: jns,
          sisaStok: Number(stokValues[i][4]) || 0
        };
      }
    }

    // Validasi field 'jenis'
    const jenisInput = payload.jenis ? String(payload.jenis).trim() : "";
    if (!jenisInput) {
      return jsonResponse({
        success: false,
        message: "Jenis Soevenir wajib diisi."
      });
    }

    let stokItem = stokMap[jenisInput.toLowerCase()];

    // Jika pada Stok Masuk jenis belum ada, otomatis daftarkan ke tab Sisa Stok
    if (!stokItem && (action === "stok_masuk" || action === "stokmasuk")) {
      const colAValues = sheetStok.getRange(2, 1, 100, 1).getValues();
      let targetRow = -1;
      for (let i = 0; i < colAValues.length; i++) {
        const val = colAValues[i][0] ? String(colAValues[i][0]).trim() : "";
        if (!val) {
          targetRow = i + 2;
          break;
        }
      }
      if (targetRow !== -1) {
        sheetStok.getRange(targetRow, 1).setValue(jenisInput);
        SpreadsheetApp.flush();
        stokItem = {
          jenisExact: jenisInput,
          sisaStok: 0
        };
      }
    }

    if (!stokItem) {
      return jsonResponse({
        success: false,
        message: "Jenis Soevenir '" + jenisInput + "' tidak terdaftar di tab Sisa Stok."
      });
    }
    const jenisResmi = stokItem.jenisExact;

    // Validasi field 'jumlah'
    const jumlah = Number(payload.jumlah);
    if (!Number.isInteger(jumlah) || jumlah <= 0) {
      return jsonResponse({
        success: false,
        message: "Jumlah harus berupa bilangan bulat positif lebih dari 0."
      });
    }

    // Validasi field 'tanggal'
    const tanggal = payload.tanggal ? String(payload.tanggal).trim() : "";
    if (!tanggal) {
      return jsonResponse({
        success: false,
        message: "Tanggal wajib diisi (format DD/MM/YYYY)."
      });
    }

    // Handle foto bukti jika ada (opsional)
    let fotoUrl = "";
    if (payload.foto) {
      fotoUrl = simpanFotoDrive(payload.foto, action, jenisResmi);
    }

    // -------------------------------------------------------------
    // AKSI 2: PENGAMBILAN
    // -------------------------------------------------------------
    if (action === "pengambilan") {
      const nama = payload.nama ? String(payload.nama).trim() : "";
      if (!nama) {
        return jsonResponse({
          success: false,
          message: "Nama pengambil wajib diisi."
        });
      }

      // Validasi ketersediaan stok
      if (jumlah > stokItem.sisaStok) {
        return jsonResponse({
          success: false,
          message: "Pengambilan ditolak: Jumlah pengambilan (" + jumlah + ") melebihi sisa stok yang tersedia (" + stokItem.sisaStok + ")."
        });
      }

      const sheetPengambilan = ss.getSheetByName("Pengambilan");
      if (!sheetPengambilan) {
        return jsonResponse({ success: false, message: "Tab 'Pengambilan' tidak ditemukan." });
      }

      const keterangan = payload.keterangan ? String(payload.keterangan).trim() : "";
      sheetPengambilan.appendRow([nama, jenisResmi, jumlah, tanggal, keterangan, fotoUrl]);
      SpreadsheetApp.flush();

      // Sinkronkan kembali sisa stok
      syncAndCalculateStock(ss);

      return jsonResponse({
        success: true,
        message: "Pengambilan berhasil dicatat.",
        data: { nama, jenis: jenisResmi, jumlah, tanggal, keterangan, fotoUrl }
      });

    // -------------------------------------------------------------
    // AKSI 3: PENGEMBALIAN
    // -------------------------------------------------------------
    } else if (action === "pengembalian") {
      const nama = payload.nama ? String(payload.nama).trim() : "";
      if (!nama) {
        return jsonResponse({
          success: false,
          message: "Nama pengembali wajib diisi."
        });
      }

      const sheetPengembalian = ss.getSheetByName("Pengembalian");
      if (!sheetPengembalian) {
        return jsonResponse({ success: false, message: "Tab 'Pengembalian' tidak ditemukan." });
      }

      const keterangan = payload.keterangan ? String(payload.keterangan).trim() : "";
      sheetPengembalian.appendRow([nama, jenisResmi, jumlah, tanggal, keterangan, fotoUrl]);
      SpreadsheetApp.flush();

      // Sinkronkan kembali sisa stok
      syncAndCalculateStock(ss);

      return jsonResponse({
        success: true,
        message: "Pengembalian berhasil dicatat.",
        data: { nama, jenis: jenisResmi, jumlah, tanggal, keterangan, fotoUrl }
      });

    // -------------------------------------------------------------
    // AKSI 4: STOK MASUK
    // -------------------------------------------------------------
    } else if (action === "stok_masuk" || action === "stokmasuk") {
      const sheetStokMasuk = ss.getSheetByName("Stok Masuk");
      if (!sheetStokMasuk) {
        return jsonResponse({ success: false, message: "Tab 'Stok Masuk' tidak ditemukan." });
      }

      const keterangan = payload.keterangan ? String(payload.keterangan).trim() : "";
      sheetStokMasuk.appendRow([tanggal, jenisResmi, jumlah, keterangan]);
      SpreadsheetApp.flush();

      // Sinkronkan kembali sisa stok
      syncAndCalculateStock(ss);

      return jsonResponse({
        success: true,
        message: "Stok Masuk berhasil dicatat.",
        data: { tanggal, jenis: jenisResmi, jumlah, keterangan }
      });

    } else {
      return jsonResponse({
        success: false,
        message: "Action tidak dikenali. Pilih: 'pengambilan', 'pengembalian', 'stok_masuk', atau 'tambah_jenis'."
      });
    }

  } catch (error) {
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan internal pada server: " + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan foto base64 ke Google Drive
 */
function simpanFotoDrive(fotoData, action, jenis) {
  try {
    if (!fotoData) return "";
    
    // Jika sudah berupa URL, kembalikan langsung
    if (String(fotoData).startsWith("http://") || String(fotoData).startsWith("https://")) {
      return String(fotoData);
    }

    let base64String = String(fotoData);
    let mimeType = "image/jpeg";
    let extension = "jpg";

    if (base64String.indexOf(";base64,") !== -1) {
      const parts = base64String.split(";base64,");
      const mimeMatch = parts[0].match(/data:(.*?)$/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
        if (mimeType === "image/png") extension = "png";
        else if (mimeType === "image/webp") extension = "webp";
      }
      base64String = parts[1];
    }

    const decoded = Utilities.base64Decode(base64String);
    const timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd_HHmmss");
    const sanitizedJenis = jenis.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = "Bukti_" + action + "_" + sanitizedJenis + "_" + timestamp + "." + extension;
    const blob = Utilities.newBlob(decoded, mimeType, fileName);

    let folder;
    if (FOLDER_ID_FOTO_BUKTI && FOLDER_ID_FOTO_BUKTI !== "GANTI_DENGAN_FOLDER_ID_DRIVE_ANDA") {
      try {
        folder = DriveApp.getFolderById(FOLDER_ID_FOTO_BUKTI);
      } catch (e) {
        folder = DriveApp.getRootFolder();
      }
    } else {
      folder = DriveApp.getRootFolder();
    }

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (e) {
    Logger.log("Gagal menyimpan foto: " + e.toString());
    return "";
  }
}

/**
 * Ekstrak ID File Google Drive dari URL
 */
function extractDriveId(url) {
  if (!url) return null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];
  return null;
}

/**
 * Helper untuk response JSON
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
