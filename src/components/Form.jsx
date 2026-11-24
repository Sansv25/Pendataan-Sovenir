import React from 'react';

/**
 * Wrapper Header & Form Layout reusable
 */
export function FormCard({ title, subtitle, children, onSubmit }) {
  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <form onSubmit={onSubmit} className="space-y-5">
          {children}
        </form>
      </div>
    </div>
  );
}

/**
 * Reusable FormField
 */
export function FormField({ label, required, error, helpText, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-slate-500">{helpText}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}

/**
 * Reusable Tombol Aksi Utama
 */
export function SubmitButton({ loading, children, disabled, color = "blue", icon = "save" }) {
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20",
    emerald: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-500/20",
    amber: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-500/20",
  }[color] || "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full py-3.5 px-5 rounded-xl font-semibold text-base shadow-md transition flex items-center justify-center gap-2 ${colorClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined text-xl animate-spin">progress_activity</span>
          <span>Menyimpan...</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-xl">{icon}</span>
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

/**
 * Tombol Kembali ke Beranda
 */
export function BackButton({ onBack }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition mb-3 px-2 py-1.5 rounded-lg hover:bg-slate-100"
    >
      <span className="material-symbols-outlined text-lg">arrow_back</span>
      <span>Kembali ke Beranda</span>
    </button>
  );
}
