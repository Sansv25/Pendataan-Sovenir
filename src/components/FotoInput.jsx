import React, { useState, useRef, useEffect } from 'react';
import { kompresFoto, formatUkuranFile } from '../lib/foto';

/**
 * Komponen Input Foto & Kamera Interaktif
 * Fitur:
 * - Kamera langsung (WebRTC getUserMedia)
 * - Switch kamera depan & belakang (facingMode 'user' & 'environment')
 * - Fitur Mirror (horizontal flip) baik preview maupun hasil jepretan
 * - Fallback upload file dari galeri / disk
 * - Kompresi otomatis (maks. 1280 px, JPEG 0.7)
 */
export default function FotoInput({ label = "Foto Bukti (Opsional)", value, onChange, disabled }) {
  const [compressing, setCompressing] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // State Kamera Langsung
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (belakang) | 'user' (depan)
  const [isMirrored, setIsMirrored] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPreview, setCapturedPreview] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Otomatis atur mirror saat ganti kamera: depan default mirror, belakang default tidak
  useEffect(() => {
    if (facingMode === 'user') {
      setIsMirrored(true);
    } else {
      setIsMirrored(false);
    }
  }, [facingMode]);

  // Efek untuk menyalakan/mematikan stream kamera
  useEffect(() => {
    if (!isCameraOpen) {
      stopCameraStream();
      return;
    }

    startCameraStream();

    return () => {
      stopCameraStream();
    };
  }, [isCameraOpen, facingMode]);

  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Fitur kamera tidak didukung di browser ini.');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Gagal mengakses kamera:', err);
      // Fallback: coba tanpa exact constraints jika gagal
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
      } catch (fallbackErr) {
        setCameraError(
          'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.'
        );
      }
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Switch kamera depan <-> belakang
  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle mirror manual
  const handleToggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  // Ambil gambar dari video stream
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Terapkan mirror horizontal jika isMirrored aktif
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Dapatkan data URL sementara untuk preview konfirmasi
    const tempUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPreview(tempUrl);
  };

  // Konfirmasi dan simpan hasil foto kamera
  const handleAcceptCaptured = async () => {
    if (!capturedPreview) return;

    setCompressing(true);
    setIsCameraOpen(false);
    stopCameraStream();

    try {
      // Konversi dataURL ke blob untuk dikompres sesuai standar (maks 1280px, jpeg 0.7)
      const res = await fetch(capturedPreview);
      const blob = await res.blob();
      const originalSize = blob.size;

      const base64Compressed = await kompresFoto(blob, 1280, 0.7);

      const stringLength = base64Compressed.length - 'data:image/jpeg;base64,'.length;
      const compressedSize = Math.round((stringLength * 3) / 4);

      setFileInfo({
        name: `Foto_${facingMode === 'user' ? 'Depan' : 'Belakang'}_${Date.now()}.jpg`,
        originalSize: formatUkuranFile(originalSize),
        compressedSize: formatUkuranFile(compressedSize),
      });

      onChange(base64Compressed);
      setCapturedPreview(null);
    } catch (err) {
      console.error('Gagal memproses foto kamera:', err);
      setErrorMsg('Gagal memproses foto kamera.');
    } finally {
      setCompressing(false);
    }
  };

  // Ulangi pengambilan foto kamera
  const handleRetake = () => {
    setCapturedPreview(null);
  };

  // Tutup modal kamera
  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedPreview(null);
  };

  // Handle pilih dari file / galeri
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setCompressing(true);

    try {
      const originalSize = file.size;
      const base64Compressed = await kompresFoto(file, 1280, 0.7);

      const stringLength = base64Compressed.length - 'data:image/jpeg;base64,'.length;
      const compressedSize = Math.round((stringLength * 3) / 4);

      setFileInfo({
        name: file.name,
        originalSize: formatUkuranFile(originalSize),
        compressedSize: formatUkuranFile(compressedSize),
      });

      onChange(base64Compressed);
    } catch (err) {
      console.error('Gagal kompres foto:', err);
      setErrorMsg(err.message || 'Gagal memproses foto.');
      onChange('');
    } finally {
      setCompressing(false);
    }
  };

  const handleHapusFoto = () => {
    onChange('');
    setFileInfo(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>

      {/* Hidden input file galeri */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || compressing}
        className="hidden"
        id="foto-file-input"
      />

      {/* Kondisi 1: Belum ada foto terpilih */}
      {!value ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Tombol 1: Buka Kamera Langsung */}
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            disabled={disabled || compressing}
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50 transition active:scale-[0.99] disabled:opacity-50"
          >
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 shadow-sm">
              <span className="material-symbols-outlined text-2xl">photo_camera</span>
            </div>
            <span className="text-sm font-bold text-slate-800">Buka Kamera</span>
            <span className="text-xs text-slate-500 mt-0.5">Depan / Belakang & Mirror</span>
          </button>

          {/* Tombol 2: Pilih dari Galeri */}
          <label
            htmlFor="foto-file-input"
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 transition cursor-pointer active:scale-[0.99]"
          >
            <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-2xl">image</span>
            </div>
            <span className="text-sm font-bold text-slate-800">Pilih dari Galeri</span>
            <span className="text-xs text-slate-500 mt-0.5">JPG, PNG (dari perangkat)</span>
          </label>
        </div>
      ) : (
        /* Kondisi 2: Foto sudah ada */
        <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt="Preview bukti"
              className="w-20 h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {fileInfo?.name || 'Foto Bukti Siap'}
              </p>
              {fileInfo && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ukuran: <span className="line-through">{fileInfo.originalSize}</span> →{' '}
                  <span className="font-semibold text-emerald-600">{fileInfo.compressedSize}</span>
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  <span>Ganti Kamera</span>
                </button>
                <button
                  type="button"
                  onClick={handleHapusFoto}
                  disabled={disabled}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

      {/* ------------------------------------------------------------- */}
      {/* MODAL KAMERA LANGSUNG */}
      {/* ------------------------------------------------------------- */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-3 sm:p-6 backdrop-blur-sm animate-fade-in">
          {/* Header Kamera: Tombol Mirror, Ganti Kamera, Tutup */}
          <div className="flex items-center justify-between z-10 text-white">
            <div className="flex items-center gap-2">
              {/* Tombol Mirror */}
              <button
                type="button"
                onClick={handleToggleMirror}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  isMirrored ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/90 hover:bg-white/30'
                }`}
                title="Toggle Mirror Horizontal"
              >
                <span className="material-symbols-outlined text-base">flip</span>
                <span>Mirror: {isMirrored ? 'ON' : 'OFF'}</span>
              </button>

              {/* Tombol Switch Kamera Depan/Belakang */}
              <button
                type="button"
                onClick={handleToggleFacingMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition"
                title="Ganti Kamera Depan / Belakang"
              >
                <span className="material-symbols-outlined text-base">cameraswitch</span>
                <span>{facingMode === 'user' ? 'Kamera Depan' : 'Kamera Belakang'}</span>
              </button>
            </div>

            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={handleCloseCamera}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              title="Tutup Kamera"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Area Viewfinder Video / Preview Jepretan */}
          <div className="relative flex-1 my-3 flex items-center justify-center overflow-hidden rounded-2xl bg-black">
            {cameraError ? (
              <div className="text-center p-6 text-white max-w-sm">
                <span className="material-symbols-outlined text-4xl text-rose-500 mb-2">videocam_off</span>
                <p className="text-sm font-medium">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCameraStream}
                  className="mt-4 px-4 py-2 bg-blue-600 rounded-xl text-xs font-semibold"
                >
                  Coba Lagi
                </button>
              </div>
            ) : capturedPreview ? (
              /* Preview Foto yang baru dijepret */
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={capturedPreview}
                  alt="Hasil jepretan"
                  className="max-h-full max-w-full object-contain rounded-xl"
                />
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                  Pratinjau Hasil Jepretan
                </div>
              </div>
            ) : (
              /* Live Video Stream */
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover sm:object-contain rounded-xl ${
                  isMirrored ? 'scale-x-[-1]' : ''
                }`}
              />
            )}
          </div>

          {/* Controls Bagian Bawah */}
          <div className="flex items-center justify-center gap-6 pb-2 z-10">
            {capturedPreview ? (
              /* Tombol Konfirmasi Setelah Jepret */
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition"
                >
                  <span className="material-symbols-outlined text-xl">replay</span>
                  <span>Foto Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={handleAcceptCaptured}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition"
                >
                  <span className="material-symbols-outlined text-xl">check</span>
                  <span>Gunakan Foto</span>
                </button>
              </div>
            ) : (
              /* Tombol Jepret (Shutter) */
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={Boolean(cameraError)}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-white bg-white/30 hover:bg-white/50 active:scale-95 transition flex items-center justify-center p-1.5 shadow-2xl disabled:opacity-40"
                title="Ambil Foto"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
