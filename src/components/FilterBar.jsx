import React from 'react';
import { Search, Download, X, Filter } from 'lucide-react';
import { ASME_CLASSES, DEFECT_TYPES } from '../data/constants';

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedClass,
  setSelectedClass,
  selectedDefect,
  setSelectedDefect,
  selectedDate,
  setSelectedDate,
  onResetFilters,
  onExportCSV,
  totalResults
}) {
  const hasActiveFilters = Boolean(searchQuery || selectedClass || selectedDefect || selectedDate);

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs mb-4">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ukuran (NPS), defect, proses, tindakan..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 cursor-pointer"
          >
            <option value="">Semua Class</option>
            {ASME_CLASSES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          {/* Defect Filter */}
          <select
            value={selectedDefect}
            onChange={(e) => setSelectedDefect(e.target.value)}
            className="px-2.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 cursor-pointer max-w-[180px] truncate"
          >
            <option value="">Semua Defect</option>
            {DEFECT_TYPES.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Filter berdasarkan tanggal"
            className="px-2.5 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-700 cursor-pointer"
          />

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              title="Reset seluruh filter"
              className="flex items-center space-x-1 px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Export CSV button */}
          <button
            onClick={onExportCSV}
            title="Download CSV"
            className="flex items-center space-x-1.5 px-3 py-2 text-xs sm:text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg transition ml-auto lg:ml-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

        </div>

      </div>

      {/* Filter status counter */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Menampilkan <strong>{totalResults}</strong> catatan rework</span>
        {hasActiveFilters && (
          <span className="text-slate-400">Filter sedang aktif</span>
        )}
      </div>

    </div>
  );
}
