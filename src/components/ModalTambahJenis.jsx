import React, { useState } from 'react';
import FotoInput from './FotoInput';

/**
 * Modal untuk Menambah Jenis Sovenir Baru langsung dari Web
 */
export default function ModalTambahJenis({ isOpen, onClose, onSave, loading }) {
  const [namaJenis, setNamaJenis] = useState('');
  const [foto, setFoto] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaJenis.trim()) {
      setError('Nama jenis sovenir wajib diisi.');
      return;
    }

    setError('');
    const success = await onSave({
      action: 'tambah_jenis',
      jenis: namaJenis.trim(),
      foto: foto || '',
    });

    if (success) {
      setNamaJenis('');
      setFoto('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">add_circle</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Tambah Jenis Sovenir</h3>
              <p className="text-xs text-slate-500">Daftarkan jenis barang baru ke Google Sheets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Nama Jenis Sovenir <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={namaJenis}
              onChange={(e) => {
                setNamaJenis(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Gantungan Kunci Kayu"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
            />
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          </div>

          <FotoInput
            label="Foto Sovenir (Opsional)"
            value={foto}
            onChange={(val) => setFoto(val)}
            disabled={loading}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  <span>Daftarkan Sovenir</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
