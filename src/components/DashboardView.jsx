import React from 'react';
import StatsCards from './StatsCards';
import { PlusCircle, Table, BarChart3, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';

export default function DashboardView({ records, onNavigate }) {
  const latestRecords = records.slice(0, 5);

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

  return (
    <div className="space-y-6">
      
      {/* 1. KPI CARDS */}
      <StatsCards records={records} />

      {/* 2. QUICK ACCESS CARDS (3 Fitur Utama) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* Card 1: Input Data */}
        <div 
          onClick={() => onNavigate('input')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-900/30 hover:shadow-sm transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Input Data Rework</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Formulir pencatatan hasil pemeriksaan produk reject dan tindakan perbaikan.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition">
            <span>Buka Formulir</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Riwayat Data */}
        <div 
          onClick={() => onNavigate('table')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-900/30 hover:shadow-sm transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Table className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Riwayat & Olah Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Daftar seluruh entri rework dengan fitur pencarian, filter, edit, dan export CSV.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-blue-700 group-hover:translate-x-0.5 transition">
            <span>Lihat Tabel Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Statistik */}
        <div 
          onClick={() => onNavigate('analytics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-900/30 hover:shadow-sm transition cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1">Statistik & Pareto</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analisis Pareto aturan 80/20 dan matriks sebaran defect per Class ASME.
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-amber-800 group-hover:translate-x-0.5 transition">
            <span>Buka Analisis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* 3. RECENT RECORDS SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Catatan Rework Terbaru</h3>
            <p className="text-xs text-slate-500">5 data transaksi rework terakhir yang tercatat di sistem</p>
          </div>
          <button
            onClick={() => onNavigate('table')}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-900 hover:text-blue-600 transition"
          >
            <span>Semua Data ({records.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {latestRecords.map((r, i) => (
            <div key={r.id || i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition">
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xs text-slate-400 w-6">#{i + 1}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      NPS {r.nps}
                    </span>
                    <span className="text-[11px] font-medium bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                      {r.asmeClass === 'PN' ? 'DIN/PN' : `Class ${r.asmeClass}`}
                    </span>
                    <span className="text-xs font-medium text-slate-800">
                      {r.defect}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-2">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(r.date)}</span>
                    </span>
                    {r.action && <span>• Tindakan: {r.action}</span>}
                  </div>
                </div>
              </div>

              <div className="text-right sm:self-center self-end">
                <span className="text-xs font-bold text-slate-900 bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg">
                  {r.qtyReject} pcs
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
