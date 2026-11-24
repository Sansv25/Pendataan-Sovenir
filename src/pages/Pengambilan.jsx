import React, { useState } from 'react';
import { FormCard, FormField, SubmitButton, BackButton } from '../components/Form';
import FotoInput from '../components/FotoInput';

/**
 * Format Date picker YYYY-MM-DD ke DD/MM/YYYY
 */
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
 * Halaman Form Pengambilan Sovenir
 */
export default function Pengambilan({ stokList = [], onBack, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    nama: '',
    jenis: '',
    jumlah: '',
    tanggal: getTodayISO(),
    keterangan: '',
    foto: '',
  });

  const [errors, setErrors] = useState({});

  // Temukan item stok yang dipilih
  const selectedStok = stokList.find(
    (item) => item.jenis.toLowerCase() === formData.jenis.toLowerCase()
  );
  const sisaStokSaatIni = selectedStok ? selectedStok.sisaStok : null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama pengambil wajib diisi.';
    }

    if (!formData.jenis) {
      newErrors.jenis = 'Pilih Jenis Soevenir terlebih dahulu.';
    }

    const jumlahNum = Number(formData.jumlah);
    if (!formData.jumlah || !Number.isInteger(jumlahNum) || jumlahNum <= 0) {
      newErrors.jumlah = 'Jumlah harus berupa bilangan bulat positif lebih dari 0.';
    } else if (sisaStokSaatIni !== null && jumlahNum > sisaStokSaatIni) {
      newErrors.jumlah = `Jumlah pengambilan (${jumlahNum}) melebihi sisa stok yang tersedia (${sisaStokSaatIni} pcs).`;
    }

    if (!formData.tanggal) {
      newErrors.tanggal = 'Tanggal pengambilan wajib diisi.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      action: 'pengambilan',
      nama: formData.nama.trim(),
      jenis: formData.jenis,
      jumlah: Number(formData.jumlah),
      tanggal: toDDMMYYYY(formData.tanggal),
      keterangan: formData.keterangan.trim(),
      foto: formData.foto || '',
    };

    const success = await onSubmit(payload);
    if (success) {
      // Kosongkan form jika berhasil
      setFormData({
        nama: '',
        jenis: '',
        jumlah: '',
        tanggal: getTodayISO(),
        keterangan: '',
        foto: '',
      });
      setErrors({});
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <BackButton onBack={onBack} />

      <FormCard
        title="Pengambilan Sovenir"
        subtitle="Catat sovenir yang dikeluarkan atau diambil oleh anggota/tamu"
        onSubmit={handleSubmit}
      >
        {/* Nama */}
        <FormField label="Nama Pengambil" required error={errors.nama}>
          <input
            type="text"
            value={formData.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            disabled={loading}
            placeholder="Contoh: Made Wijaya"
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Jenis Soevenir */}
        <FormField
          label="Jenis Soevenir"
          required
          error={errors.jenis}
          helpText={
            selectedStok
              ? `Sisa stok saat ini: ${selectedStok.sisaStok} pcs (Status: ${selectedStok.status})`
              : 'Pilih jenis sovenir dari daftar yang tersedia'
          }
        >
          <select
            value={formData.jenis}
            onChange={(e) => handleChange('jenis', e.target.value)}
            disabled={loading || stokList.length === 0}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          >
            <option value="">-- Pilih Jenis Soevenir --</option>
            {stokList.map((item) => (
              <option key={item.id} value={item.jenis}>
                {item.jenis} (Sisa: {item.sisaStok})
              </option>
            ))}
          </select>
        </FormField>

        {/* Jumlah Pengambilan */}
        <FormField label="Jumlah Pengambilan (pcs)" required error={errors.jumlah}>
          <input
            type="number"
            min="1"
            step="1"
            value={formData.jumlah}
            onChange={(e) => handleChange('jumlah', e.target.value)}
            disabled={loading}
            placeholder="Masukkan jumlah pcs"
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Tanggal Pengambilan */}
        <FormField label="Tanggal Pengambilan" required error={errors.tanggal}>
          <input
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleChange('tanggal', e.target.value)}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Keterangan */}
        <FormField label="Keterangan Pengambilan Soevenir" error={errors.keterangan}>
          <textarea
            rows="3"
            value={formData.keterangan}
            onChange={(e) => handleChange('keterangan', e.target.value)}
            disabled={loading}
            placeholder="Contoh: Untuk tamu VIP seminar..."
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
          />
        </FormField>

        {/* Foto Bukti */}
        <FotoInput
          label="Foto Bukti Pengambilan (Opsional)"
          value={formData.foto}
          onChange={(val) => handleChange('foto', val)}
          disabled={loading}
        />

        {/* Tombol Simpan */}
        <div className="pt-2">
          <SubmitButton loading={loading} color="blue" icon="output">
            Simpan Pengambilan
          </SubmitButton>
        </div>
      </FormCard>
    </div>
  );
}
