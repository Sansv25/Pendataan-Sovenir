import React, { useState } from 'react';

/**
 * Komponen Tabel & Card Sisa Stok dengan Google Font Icon
 */
export default function TabelStok({ data = [], loading = false, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedFoto, setSelectedFoto] = useState(null);

  const filteredData = data.filter((item) =>
    item.jenis.toLowerCase().includes(search.toLowerCase().trim())
  );

  const getStatusBadge = (status, sisaStok) => {
    if (status === 'Cek data' || sisaStok < 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
          Cek data
        </span>
      );
    }
    if (status === 'Habis' || sisaStok === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          Habis
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
        Tersedia
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar & Tombol Refresh */}
      <div className="flex flex-col sm:flex-row gap-2.5 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jenis sovenir..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="material-symbols-outlined text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
            search
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>Refresh Data</span>
        </button>
      </div>

      {/* State Loading */}
      {loading && data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-blue-600 animate-spin mx-auto mb-3 block">
            progress_activity
          </span>
          <p className="text-sm font-medium text-slate-600">Memuat data sisa stok dari Google Sheets...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">
            inventory_2
          </span>
          <p className="text-slate-500 text-sm">
            {search ? 'Tidak ada jenis sovenir yang cocok dengan pencarian.' : 'Belum ada data sovenir di tab Sisa Stok.'}
          </p>
        </div>
      ) : (
        <>
          {/* Tampilan Mobile: Cards */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredData.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {item.fotoThumbnail ? (
                      <img
                        src={item.fotoThumbnail}
                        alt={item.jenis}
                        onClick={() => setSelectedFoto(item.fotoUrl || item.fotoThumbnail)}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-90 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                        <span className="material-symbols-outlined text-xl">image</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{item.jenis}</h3>
                      <div className="mt-0.5">{getStatusBadge(item.status, item.sisaStok)}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Masuk</p>
                    <p className="text-sm font-bold text-slate-800">{item.totalMasuk}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Diambil</p>
                    <p className="text-sm font-bold text-slate-800">{item.totalDiambil}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-medium">Kembali</p>
                    <p className="text-sm font-bold text-slate-800">{item.totalDikembalikan}</p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <p className="text-[10px] text-blue-700 uppercase font-semibold">Sisa</p>
                    <p className="text-base font-extrabold text-blue-900">{item.sisaStok}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tampilan Desktop: Tabel */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-4 py-3.5">Foto</th>
                    <th scope="col" className="px-4 py-3.5">Jenis Soevenir</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Total Masuk</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Total Diambil</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Total Kembali</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Sisa Stok</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredData.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/60'}>
                      <td className="px-4 py-3">
                        {item.fotoThumbnail ? (
                          <img
                            src={item.fotoThumbnail}
                            alt={item.jenis}
                            onClick={() => setSelectedFoto(item.fotoUrl || item.fotoThumbnail)}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-lg">image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{item.jenis}</td>
                      <td className="px-4 py-3 text-center">{item.totalMasuk}</td>
                      <td className="px-4 py-3 text-center">{item.totalDiambil}</td>
                      <td className="px-4 py-3 text-center">{item.totalDikembalikan}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-base bg-blue-50 text-blue-900 px-2.5 py-1 rounded-lg">
                          {item.sisaStok}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(item.status, item.sisaStok)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal Preview Foto Besar */}
      {selectedFoto && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedFoto(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedFoto(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full transition flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img src={selectedFoto} alt="Foto Sovenir" className="w-full h-auto max-h-[75vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
