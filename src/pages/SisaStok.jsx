import React, { useState } from 'react';
import { BackButton } from '../components/Form';
import TabelStok from '../components/TabelStok';
import ModalTambahJenis from '../components/ModalTambahJenis';

/**
 * Halaman Sisa Stok
 * Menampilkan tabel/kartu sisa stok per jenis sovenir, kolom pencarian, status, foto, serta tombol Tambah Jenis Sovenir.
 */
export default function SisaStok({ stokList = [], loading = false, onRefresh, onBack, onAddJenis }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [savingJenis, setSavingJenis] = useState(false);

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

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <BackButton onBack={onBack} />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold shadow-sm transition mb-3"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Tambah Jenis Sovenir</span>
        </button>
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
