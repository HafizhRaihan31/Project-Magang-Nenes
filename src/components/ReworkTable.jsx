import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ReworkTable({
  records,
  sortConfig,
  onSort,
  onEdit,
  onDelete
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Pagination calculation
  const totalPages = Math.ceil(records.length / pageSize) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-slate-900 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-slate-900 ml-1 inline" />
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) return `${day}/${month}/${year}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  if (!records.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Tag className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Tidak ada data ditemukan</h3>
        <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter yang aktif.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      
      {/* DESKTOP TABLE VIEW (sm and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <th className="py-3 px-3.5 w-12 text-center">No</th>
              
              <th 
                onClick={() => onSort('date')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                <span>Tanggal</span>
                {getSortIcon('date')}
              </th>

              <th 
                onClick={() => onSort('nps')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                <span>Ukuran (NPS)</span>
                {getSortIcon('nps')}
              </th>

              <th 
                onClick={() => onSort('asmeClass')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                <span>Class</span>
                {getSortIcon('asmeClass')}
              </th>

              <th 
                onClick={() => onSort('qtyReject')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap text-right"
              >
                <span>Qty Rework</span>
                {getSortIcon('qtyReject')}
              </th>

              <th 
                onClick={() => onSort('defect')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                <span>Identifikasi Masalah (Defect)</span>
                {getSortIcon('defect')}
              </th>

              <th className="py-3 px-3.5 whitespace-nowrap">Proses Terkait</th>
              
              <th 
                onClick={() => onSort('action')}
                className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap"
              >
                <span>Tindakan Rework</span>
                {getSortIcon('action')}
              </th>

              <th className="py-3 px-3.5 text-center w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {paginatedRecords.map((r, index) => (
              <tr key={r.id || index} className="hover:bg-slate-50/80 transition-colors">
                
                {/* No */}
                <td className="py-3 px-3.5 text-center font-mono text-slate-400">
                  {startIndex + index + 1}
                </td>

                {/* Tanggal */}
                <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-900">
                  {formatDate(r.date)}
                </td>

                {/* Ukuran (NPS) */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {r.nps || '-'}
                  </span>
                </td>

                {/* Class */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800">
                    {r.asmeClass === 'PN' ? 'DIN/PN' : (r.asmeClass && r.asmeClass !== 'Other' ? `#${r.asmeClass}` : 'Lainnya')}
                  </span>
                </td>

                {/* Qty Rework */}
                <td className="py-3 px-3.5 whitespace-nowrap text-right">
                  <span className="font-bold text-slate-900">
                    {Number(r.qtyReject || 0).toLocaleString('id-ID')}
                  </span>
                  {r.qtyOrder > 0 && (
                    <span className="text-[10px] text-slate-400 block">
                      / {Number(r.qtyOrder).toLocaleString('id-ID')}
                    </span>
                  )}
                </td>

                {/* Defect */}
                <td className="py-3 px-3.5 font-medium text-slate-800 max-w-[200px] truncate" title={r.defect}>
                  {r.defect || '-'}
                </td>

                {/* Proses Terkait */}
                <td className="py-3 px-3.5 text-slate-600 max-w-[150px] truncate" title={r.process}>
                  {r.process || '-'}
                </td>

                {/* Tindakan Rework */}
                <td className="py-3 px-3.5 text-slate-600 max-w-[170px] truncate" title={r.action}>
                  {r.action || '-'}
                </td>

                {/* Actions */}
                <td className="py-3 px-3.5 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onEdit(r)}
                      title="Edit Data"
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(r.id)}
                      title="Hapus Data"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARD VIEW (xs to sm) */}
      <div className="sm:hidden divide-y divide-slate-100">
        {paginatedRecords.map((r, index) => (
          <div key={r.id || index} className="p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-slate-400">#{startIndex + index + 1}</span>
                <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {r.nps || '-'}
                </span>
                <span className="text-[11px] font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                  {r.asmeClass === 'PN' ? 'DIN/PN' : (r.asmeClass ? `#${r.asmeClass}` : '-')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 bg-amber-50 text-amber-800 px-2 py-0.5 rounded">
                  {r.qtyReject} pcs
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-900">{r.defect}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {r.action && <span>Tindakan: {r.action} • </span>}
                {r.process && <span>Proses: {r.process}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(r.date)}</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(r)}
                  className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(r.id)}
                  className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION TOOLBAR */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        <div className="flex items-center space-x-2">
          <span>Tampilkan per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400">
            ({startIndex + 1} - {Math.min(startIndex + pageSize, records.length)} dari {records.length})
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={validCurrentPage <= 1}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 font-medium text-slate-700">
            Halaman {validCurrentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={validCurrentPage >= totalPages}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
