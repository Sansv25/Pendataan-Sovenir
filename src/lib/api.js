/**
 * API Client untuk Web Pendataan Sovenir
 * Berkomunikasi dengan Google Apps Script Web App
 */

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.warn(
    'Peringatan: VITE_API_URL belum disetel di environment variable (.env.local).'
  );
}

/**
 * Mengambil data Sisa Stok & Jenis Sovenir dari Apps Script (doGet)
 */
export async function getStok() {
  if (!API_URL) {
    throw new Error('URL API (VITE_API_URL) belum dikonfigurasi.');
  }

  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`Server merespons dengan status: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Gagal mengambil data dari Google Sheets.');
    }

    return json.data || [];
  } catch (err) {
    console.error('Error saat fetch getStok:', err);
    throw new Error(err.message || 'Gagal terhubung ke server Apps Script.');
  }
}

/**
 * Mengirim transaksi (Pengambilan, Pengembalian, atau Stok Masuk) ke Apps Script (doPost)
 * Menggunakan Content-Type: text/plain untuk menghindari preflight CORS
 */
export async function kirimTransaksi(payload) {
  if (!API_URL) {
    throw new Error('URL API (VITE_API_URL) belum dikonfigurasi.');
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`Server merespons dengan status: ${res.status}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Gagal menyimpan transaksi ke Google Sheets.');
    }

    return json;
  } catch (err) {
    console.error('Error saat kirimTransaksi:', err);
    throw new Error(err.message || 'Gagal menyimpan data.');
  }
}
