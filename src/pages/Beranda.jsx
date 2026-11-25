import React from 'react';

/**
 * Halaman Beranda
 * - Non-Admin: Hanya menampilkan 2 menu (Pengambilan [Output] & Pengembalian [Input])
 * - Admin: Menampilkan 4 menu lengkap (+ Stok Masuk & Sisa Stok)
 */
export default function Beranda({ onNavigate, totalJenis = 0, isAdmin = false, onLoginClick }) {
  // Menu dasar untuk semua pengguna (Non-Admin & Admin)
  const baseMenus = [
    {
      id: 'pengambilan',
      title: 'Pengambilan Sovenir',
      desc: 'Catat pengeluaran atau pengambilan sovenir',
      badge: 'Output',
      iconName: 'output',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'pengembalian',
      title: 'Pengembalian Sovenir',
      desc: 'Catat sovenir sisa event yang dikembalikan',
      badge: 'Input',
      iconName: 'input',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  // Menu tambahan khusus Admin
  const adminMenus = [
    {
      id: 'stok_masuk',
      title: 'Stok Masuk',
      desc: 'Tambah pasokan stok baru atau stok awal',
      badge: 'Masuk',
      iconName: 'add_box',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'sisa_stok',
      title: 'Sisa Stok & Foto',
      desc: 'Pantau ketersediaan stok & galeri foto sovenir',
      badge: `${totalJenis} Jenis`,
      iconName: 'table_chart',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
  ];

  const visibleMenus = isAdmin ? [...baseMenus, ...adminMenus] : baseMenus;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header Aplikasi */}
      <div className="text-center py-4 space-y-3">
        {/* Logo Danantara & PLN Icon Plus */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 py-1 mb-2">
          <img
            src="/logo-danantara.png"
            alt="Danantara Indonesia"
            className="h-10 sm:h-12 w-auto object-contain hover:opacity-90 transition"
          />
          <div className="h-7 w-px bg-slate-300"></div>
          <img
            src="/logo-pln-iconplus.png"
            alt="PLN Icon Plus"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm hover:opacity-90 transition"
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Formulir Pengambilan Dan Pengeluaran Barang
          </h1>
          {isAdmin && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Admin
            </span>
          )}
        </div>
        {isAdmin && (
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Panel Admin: Akses penuh pencatatan, penambahan stok, dan kelola data sovenir
          </p>
        )}
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleMenus.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onNavigate(m.id)}
            className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 active:scale-[0.98] transition-all text-left flex flex-col justify-between"
          >
            <div className="flex items-start justify-between w-full mb-3">
              <div className={`p-3 rounded-xl ${m.iconBg} group-hover:scale-105 transition`}>
                <span className="material-symbols-outlined text-2xl">{m.iconName}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                m.badge === 'Output'
                  ? 'bg-blue-100 text-blue-700'
                  : m.badge === 'Input'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {m.badge}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                {m.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {m.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>Buka Menu</span>
              <span className="material-symbols-outlined text-base transform group-hover:translate-x-1 transition">
                arrow_forward
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Tombol Login Admin untuk Non-Admin */}
      {!isAdmin && (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onLoginClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-base">lock</span>
            <span>Masuk sebagai Admin</span>
          </button>
        </div>
      )}
    </div>
  );
}
