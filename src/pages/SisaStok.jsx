import React, { useState } from 'react';
import { BackButton } from '../components/Form';
import TabelStok from '../components/TabelStok';
import ModalTambahJenis from '../components/ModalTambahJenis';
import Swal from 'sweetalert2';

/**
 * Halaman Sisa Stok
 * Menampilkan tabel/kartu sisa stok per jenis sovenir, kolom pencarian, status, foto,
 * tombol Tambah Jenis Sovenir, dan Tombol Buka Spreadsheet.
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

  const handleOpenSpreadsheet = async () => {
    let targetUrl = spreadsheetUrl || initialSpreadsheetUrl;

    if (!targetUrl) {
      const { value: urlInput } = await Swal.fire({
        title: 'Tautan Google Spreadsheet',
        text: 'Masukkan tautan (link) Google Sheets Anda:',
        input: 'url',
        inputPlaceholder: 'https://docs.google.com/spreadsheets/d/...',
        showCancelButton: true,
        confirmButtonText: 'Simpan & Buka',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#059669',
        customClass: {
          popup: 'rounded-2xl font-sans',
          confirmButton: 'px-5 py-2.5 rounded-xl font-semibold',
          cancelButton: 'px-5 py-2.5 rounded-xl font-semibold',
        },
      });

      if (urlInput) {
        targetUrl = urlInput.trim();
        setSpreadsheetUrl(targetUrl);
        localStorage.setItem('sovenir_spreadsheet_url', targetUrl);
      } else {
        return;
      }
    }

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Baris Tombol Atas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton onBack={onBack} />

        <div className="flex items-center gap-2">
          {/* Tombol Buka Spreadsheet */}
          <button
            type="button"
            onClick={handleOpenSpreadsheet}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-sm font-semibold transition shadow-sm mb-3"
            title="Buka Spreadsheet di Google Sheets"
          >
            <span className="material-symbols-outlined text-lg text-emerald-600">table_view</span>
            <span>Buka Spreadsheet</span>
            <span className="material-symbols-outlined text-sm text-emerald-600">open_in_new</span>
          </button>

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
