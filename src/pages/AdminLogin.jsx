import React, { useState } from 'react';
import { loginAdmin } from '../config/auth';
import { toastSuccess, alertError } from '../lib/alert';
import { BackButton } from '../components/Form';

/**
 * Halaman Login Admin
 */
export default function AdminLogin({ onLoginSuccess, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginAdmin(username, password);
      setLoading(false);

      if (res.success) {
        toastSuccess('Berhasil masuk sebagai Admin');
        onLoginSuccess();
      } else {
        setErrorMsg(res.message);
        alertError('Login Gagal', res.message);
      }
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6">
      <BackButton onBack={onBack} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login Admin</h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Hanya Admin yang dapat mengelola Stok Masuk, Sisa Stok, dan menambah jenis sovenir baru.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                disabled={loading}
                placeholder="Masukkan username admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoComplete="username"
              />
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                person
              </span>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                disabled={loading}
                placeholder="Masukkan password admin"
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoComplete="current-password"
              />
              <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                key
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-xl font-semibold text-base bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">login</span>
                <span>Masuk Admin</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
