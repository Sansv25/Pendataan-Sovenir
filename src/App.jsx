import React, { useState, useEffect, useCallback } from 'react';
import { getStok, kirimTransaksi } from './lib/api';
import { toastSuccess, toastError, alertError } from './lib/alert';
import { checkIsAdminLoggedIn, logoutAdmin } from './config/auth';
import Beranda from './pages/Beranda';
import Pengambilan from './pages/Pengambilan';
import Pengembalian from './pages/Pengembalian';
import StokMasuk from './pages/StokMasuk';
import SisaStok from './pages/SisaStok';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(checkIsAdminLoggedIn);
  const [currentPage, setCurrentPage] = useState(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    return 'beranda';
  });

  const [stokList, setStokList] = useState([]);
  const [loadingStok, setLoadingStok] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ambil data stok terkini dari Google Sheets via Apps Script
  const fetchStokData = useCallback(async (showNotificationOnError = false) => {
    setLoadingStok(true);
    try {
      const data = await getStok();
      setStokList(data);
    } catch (err) {
      console.error('Gagal memuat data stok:', err);
      if (showNotificationOnError) {
        toastError(err.message || 'Gagal memuat data dari Google Sheets.');
      }
    } finally {
      setLoadingStok(false);
    }
  }, []);

  // Load awal saat aplikasi dibuka
  useEffect(() => {
    fetchStokData();
  }, [fetchStokData]);

  // Handle URL perubahan (popstate untuk back/forward browser)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('beranda');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sinkronisasi navigasi halaman dengan URL browser
  const navigateTo = (pageId) => {
    // Proteksi halaman khusus admin
    if ((pageId === 'stok_masuk' || pageId === 'sisa_stok') && !isAdmin) {
      setCurrentPage('admin');
      window.history.pushState(null, '', '/admin');
      return;
    }

    setCurrentPage(pageId);
    if (pageId === 'admin') {
      window.history.pushState(null, '', '/admin');
    } else if (pageId === 'beranda') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentPage('beranda');
    window.history.pushState(null, '', '/');
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setCurrentPage('beranda');
    window.history.pushState(null, '', '/');
    toastSuccess('Berhasil keluar dari mode Admin');
  };

  // Handler kirim transaksi (Pengambilan, Pengembalian, Stok Masuk, Tambah Jenis)
  const handleSubmitTransaksi = async (payload) => {
    setSubmitting(true);
    try {
      const res = await kirimTransaksi(payload);
      toastSuccess(res.message || 'Transaksi berhasil disimpan!');

      // Refresh data sisa stok setelah berhasil simpan
      await fetchStokData();
      return true;
    } catch (err) {
      console.error('Transaksi gagal:', err);
      alertError('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan transaksi.');
      return false; // Form fields tetap dipertahankan
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigateTo('beranda')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
              <span className="material-symbols-outlined text-xl">inventory_2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                Pendataan Sovenir
              </span>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Admin
                </span>
              )}
            </div>
          </button>

          {/* Navigasi Kanan */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            {currentPage !== 'beranda' && (
              <button
                onClick={() => navigateTo('beranda')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              >
                <span className="material-symbols-outlined text-base">home</span>
                <span className="hidden sm:inline">Beranda</span>
              </button>
            )}

            {/* Tombol Stok HANYA untuk Admin */}
            {isAdmin ? (
              <>
                <button
                  onClick={() => navigateTo('sisa_stok')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    currentPage === 'sisa_stok'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">table_chart</span>
                  <span>Sisa Stok ({stokList.length})</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  title="Keluar dari Admin"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </>
            ) : (
              /* Tombol Login Admin untuk Non-Admin */
              currentPage !== 'admin' && (
                <button
                  onClick={() => navigateTo('admin')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Admin</span>
                </button>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-6">
        {/* Halaman Login Admin (/admin) */}
        {currentPage === 'admin' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBack={() => navigateTo('beranda')}
          />
        )}

        {/* Halaman Beranda */}
        {currentPage === 'beranda' && (
          <Beranda
            onNavigate={(pageId) => navigateTo(pageId)}
            totalJenis={stokList.length}
            isAdmin={isAdmin}
            onLoginClick={() => navigateTo('admin')}
          />
        )}

        {/* Halaman Pengambilan (Bisa Diakses Semua Orang) */}
        {currentPage === 'pengambilan' && (
          <Pengambilan
            stokList={stokList}
            onBack={() => navigateTo('beranda')}
            onSubmit={handleSubmitTransaksi}
            loading={submitting}
          />
        )}

        {/* Halaman Pengembalian (Bisa Diakses Semua Orang) */}
        {currentPage === 'pengembalian' && (
          <Pengembalian
            stokList={stokList}
            onBack={() => navigateTo('beranda')}
            onSubmit={handleSubmitTransaksi}
            loading={submitting}
          />
        )}

        {/* Halaman Stok Masuk (HANYA ADMIN) */}
        {currentPage === 'stok_masuk' && isAdmin && (
          <StokMasuk
            stokList={stokList}
            onBack={() => navigateTo('beranda')}
            onSubmit={handleSubmitTransaksi}
            loading={submitting}
          />
        )}

        {/* Halaman Sisa Stok (HANYA ADMIN) */}
        {currentPage === 'sisa_stok' && isAdmin && (
          <SisaStok
            stokList={stokList}
            loading={loadingStok}
            onRefresh={() => fetchStokData(true)}
            onBack={() => navigateTo('beranda')}
            onAddJenis={handleSubmitTransaksi}
          />
        )}
      </main>
    </div>
  );
}
