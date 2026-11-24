/**
 * Kompres foto di browser sebelum diunggah ke Google Apps Script.
 * Ketentuan rules.md:
 * - Sisi terpanjang maks. 1280 px
 * - Format JPEG kualitas 0.7
 * - Mengembalikan base64 data URL
 */
export async function kompresFoto(file, maxDimension = 1280, quality = 0.7) {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    // Validasi tipe file
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan merupakan gambar.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar untuk dikompres.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Hitung skala rasio jika melebihi maxDimension (1280 px)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi canvas untuk kompresi foto.'));
          return;
        }

        // Gambar ke canvas dengan dimensi baru
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Ekspor ke format JPEG dengan kualitas 0.7
        try {
          const base64Data = canvas.toDataURL('image/jpeg', quality);
          resolve(base64Data);
        } catch (err) {
          reject(new Error('Gagal mengonversi gambar ke JPEG: ' + err.message));
        }
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format ukuran byte ke string human-readable (KB / MB)
 */
export function formatUkuranFile(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
