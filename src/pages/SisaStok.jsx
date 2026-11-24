import React, { useState } from 'react';
import { BackButton } from '../components/Form';
import TabelStok from '../components/TabelStok';
import ModalTambahJenis from '../components/ModalTambahJenis';
import Swal from 'sweetalert2';
import { toastSuccess } from '../lib/alert';

/**
 * Halaman Sisa Stok
 * Menampilkan tabel/kartu sisa stok per jenis sovenir, kolom pencarian, status, foto,
 * tombol Tambah Jenis Sovenir, dan Tombol Buka/Ubah Spreadsheet.
 */
export default function SisaStok({
  stokList = [],
  loading = false,
  onRefresh,
  onBack,
  onAddJenis,
  spreadsheetUrl: initialSpreadsheetUrl,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [savingJenis, setSavingJenis] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(
    initialSpreadsheetUrl || localStorage.getItem('sovenir_spreadsheet_url') || ''
  );

  const handleSaveJenis = async (payload) => {
    setSavingJenis(true);
    try {
      if (onAddJenis) {
        const success = await onAddJenis(payload);
        return success;
      }
      return false;
    } finally {
      setSavingJenis(false);
    }
  };

  // Fungsi untuk mengubah / mengoreksi link Google Sheets
  const handleEditSpreadsheetUrl = async () => {
    const currentUrl = spreadsheetUrl || localStorage.getItem('sovenir_spreadsheet_url') || '';
    
    const { value: urlInput } = await Swal.fire({
      title: 'Ubah Link Spreadsheet',
      text: 'Masukkan link Google Sheets yang benar:',
      input: 'url',
      inputValue: currentUrl,
      inputPlaceholder: 'https://docs.google.com/spreadsheets/d/...',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#059669',
      customClass: {
        popup: 'rounded-2xl font-sans',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold',
      },
    });

    if (urlInput !== undefined) {
      const trimmed = urlInput.trim();
      setSpreadsheetUrl(trimmed);
      if (trimmed) {
        localStorage.setItem('sovenir_spreadsheet_url', trimmed);
        toastSuccess('Link Spreadsheet berhasil diperbarui!');
      } else {
        localStorage.removeItem('sovenir_spreadsheet_url');
        toastSuccess('Link Spreadsheet dihapus.');
      }
    }
  };

  const handleOpenSpreadsheet = async () => {
    let targetUrl = spreadsheetUrl || localStorage.getItem('sovenir_spreadsheet_url') || initialSpreadsheetUrl;

    if (!targetUrl) {
      handleEditSpreadsheetUrl();
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Baris Tombol Atas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton onBack={onBack} />

        <div className="flex items-center gap-2">
          {/* Group Tombol Buka & Edit Spreadsheet */}
          <div className="inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-50 shadow-sm mb-3 overflow-hidden">
            <button
              type="button"
              onClick={handleOpenSpreadsheet}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-sm font-semibold transition"
              title="Buka Spreadsheet di Google Sheets"
            >
              <span className="material-symbols-outlined text-lg text-emerald-600">table_view</span>
              <span>Buka Spreadsheet</span>
              <span className="material-symbols-outlined text-sm text-emerald-600">open_in_new</span>
            </button>
            <button
              type="button"
              onClick={handleEditSpreadsheetUrl}
              className="px-2 py-2 border-l border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 transition"
              title="Ganti / Edit Link Spreadsheet"
            >
              <span className="material-symbols-outlined text-base">edit</span>
            </button>
          </div>

          {/* Tombol Tambah Jenis Sovenir */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm transition mb-3"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            <span>Tambah Jenis Sovenir</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sisa Stok Sovenir</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar ketersediaan sovenir dihitung otomatis oleh Google Sheets
          </p>
        </div>

        <TabelStok data={stokList} loading={loading} onRefresh={onRefresh} />
      </div>

      {/* Modal Tambah Jenis Baru */}
      <ModalTambahJenis
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveJenis}
        loading={savingJenis}
      />
    </div>
  );
}
