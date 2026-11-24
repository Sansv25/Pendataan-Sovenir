import React, { useState } from 'react';
import { FormCard, FormField, SubmitButton, BackButton } from '../components/Form';

function toDDMMYYYY(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return isoDate;
}

function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Halaman Form Stok Masuk
 * Mendukung memilih jenis yang sudah ada ATAU langsung input jenis baru
 */
export default function StokMasuk({ stokList = [], onBack, onSubmit, loading }) {
  const [isInputBaru, setIsInputBaru] = useState(stokList.length === 0);
  const [formData, setFormData] = useState({
    tanggal: getTodayISO(),
    jenis: '',
    jumlah: '',
    keterangan: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal stok masuk wajib diisi.';
    }

    if (!formData.jenis.trim()) {
      newErrors.jenis = isInputBaru
        ? 'Tuliskan nama jenis sovenir baru.'
        : 'Pilih Jenis Soevenir terlebih dahulu.';
    }

    const jumlahNum = Number(formData.jumlah);
    if (!formData.jumlah || !Number.isInteger(jumlahNum) || jumlahNum <= 0) {
      newErrors.jumlah = 'Jumlah harus berupa bilangan bulat positif lebih dari 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      action: 'stok_masuk',
      tanggal: toDDMMYYYY(formData.tanggal),
      jenis: formData.jenis.trim(),
      jumlah: Number(formData.jumlah),
      keterangan: formData.keterangan.trim(),
    };

    const success = await onSubmit(payload);
    if (success) {
      // Kosongkan form jika berhasil
      setFormData({
        tanggal: getTodayISO(),
        jenis: '',
        jumlah: '',
        keterangan: '',
      });
      setErrors({});
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <BackButton onBack={onBack} />

      <FormCard
        title="Stok Masuk"
        subtitle="Catat penambahan stok baru atau stok awal sovenir"
        onSubmit={handleSubmit}
      >
        {/* Tanggal Stok Masuk */}
        <FormField label="Tanggal Stok Masuk" required error={errors.tanggal}>
          <input
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Jenis Soevenir */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-700">
              Jenis Soevenir <span className="text-rose-500">*</span>
            </label>
            {stokList.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsInputBaru(!isInputBaru);
                  setFormData((prev) => ({ ...prev, jenis: '' }));
                  setErrors((prev) => ({ ...prev, jenis: '' }));
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">
                  {isInputBaru ? 'list' : 'add_circle'}
                </span>
                <span>{isInputBaru ? 'Pilih dari daftar' : '+ Buat jenis baru'}</span>
              </button>
            )}
          </div>

          {isInputBaru || stokList.length === 0 ? (
            <div>
              <input
                type="text"
                value={formData.jenis}
                onChange={(e) => handleChange('jenis', e.target.value)}
                disabled={loading}
                placeholder="Ketik nama jenis sovenir baru (misal: Mug Keramik)"
                className="w-full py-3 px-4 rounded-xl border border-amber-300 bg-amber-50/40 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
              />
              <p className="text-xs text-amber-700 mt-1 font-medium">
                Nama sovenir ini akan otomatis didaftarkan ke Google Sheets bersama stok pertamanya.
              </p>
            </div>
          ) : (
            <select
              value={formData.jenis}
              onChange={(e) => handleChange('jenis', e.target.value)}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
            >
              <option value="">-- Pilih Jenis Soevenir --</option>
              {stokList.map((item) => (
                <option key={item.id} value={item.jenis}>
                  {item.jenis} (Sisa saat ini: {item.sisaStok})
                </option>
              ))}
            </select>
          )}

          {errors.jenis && (
            <p className="text-xs font-medium text-rose-600">{errors.jenis}</p>
          )}
        </div>

        {/* Jumlah Stok Masuk */}
        <FormField label="Jumlah Stok Masuk (pcs)" required error={errors.jumlah}>
          <input
            type="number"
            min="1"
            step="1"
            value={formData.jumlah}
            onChange={(e) => handleChange('jumlah', e.target.value)}
            disabled={loading}
            placeholder="Contoh: 100"
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Keterangan */}
        <FormField label="Keterangan" error={errors.keterangan}>
          <textarea
            rows="3"
            value={formData.keterangan}
            onChange={(e) => handleChange('keterangan', e.target.value)}
            disabled={loading}
            placeholder="Contoh: Pengadaan stok awal semester 1..."
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Tombol Simpan */}
        <div className="pt-2">
          <SubmitButton loading={loading} color="amber" icon="add_box">
            Simpan Stok Masuk
          </SubmitButton>
        </div>
      </FormCard>
    </div>
  );
}
