import React, { useState, useMemo } from 'react';
import ParetoChart from './ParetoChart';
import DefectMatrixTable from './DefectMatrixTable';
import { Layers, AlertTriangle, FileText, RotateCcw, BarChart2 } from 'lucide-react';

export default function AnalyticsView({ records }) {
  const [selectedClassTab, setSelectedClassTab] = useState('ALL');

  // Hitung jumlah rework per class untuk badge di tab
  const classCounts = useMemo(() => {
    const counts = { ALL: 0, '150': 0, '300': 0, '600': 0, '900': 0, OTHER: 0 };

    records.forEach(r => {
      const qty = Number(r.qtyReject) || 0;
      counts.ALL += qty;

      const cls = String(r.asmeClass || '');
      if (counts[cls] !== undefined) {
        counts[cls] += qty;
      } else {
        counts.OTHER += qty;
      }
    });

    return counts;
  }, [records]);

  // Filter records berdasarkan class yang aktif
  const filteredRecords = useMemo(() => {
    if (selectedClassTab === 'ALL') return records;
    if (selectedClassTab === 'OTHER') {
      return records.filter(r => !['150', '300', '600', '900'].includes(String(r.asmeClass || '')));
    }
    return records.filter(r => String(r.asmeClass) === selectedClassTab);
  }, [records, selectedClassTab]);

  // Statistik ringkas untuk class yang sedang dipilih
  const classSummary = useMemo(() => {
    let totalQty = 0;
    const defectMap = {};
    const sizeMap = {};

    filteredRecords.forEach(r => {
      const qty = Number(r.qtyReject) || 0;
      totalQty += qty;

      const d = (r.defect && r.defect !== '-') ? r.defect : 'Lainnya';
      defectMap[d] = (defectMap[d] || 0) + qty;

      const s = r.nps ? (r.nps.includes('"') ? r.nps : `${r.nps}"`) : 'Lainnya';
      sizeMap[s] = (sizeMap[s] || 0) + qty;
    });

    const topDefect = Object.entries(defectMap).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
    const topSize = Object.entries(sizeMap).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    return {
      totalQty,
      cases: filteredRecords.length,
      topDefectName: topDefect[0],
      topDefectQty: topDefect[1],
      topSizeName: topSize[0],
      topSizeQty: topSize[1]
    };
  }, [filteredRecords]);

  const classTabs = [
    { id: 'ALL', label: 'Defect Keseluruhan', count: classCounts.ALL },
    { id: '150', label: 'Class 150', count: classCounts['150'] },
    { id: '300', label: 'Class 300', count: classCounts['300'] },
    { id: '600', label: 'Class 600', count: classCounts['600'] },
    { id: '900', label: 'Class 900', count: classCounts['900'] },
    { id: 'OTHER', label: 'DIN/PN & Non-Standar', count: classCounts.OTHER },
  ];

  const currentTabObj = classTabs.find(t => t.id === selectedClassTab) || classTabs[0];

  return (
    <div className="space-y-6">
      
      {/* 1. CLASS SELECTION TABS (Mengikuti Sheet di Excel) */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <div className="text-xs font-semibold text-slate-500 px-2 py-1 mb-1.5 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>PILIH KELAS / KATEGORI STATISTIK (SEPERTI SHEET DI EXCEL)</span>
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Menampilkan data sheet: <strong>{currentTabObj.label}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {classTabs.map(tab => {
            const isActive = selectedClassTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedClassTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {tab.count.toLocaleString('id-ID')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MINI KPI STATS KHUSUS CLASS YANG DIPILIH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Rework ({currentTabObj.label})</span>
          <div className="text-xl font-bold text-slate-900">
            {classSummary.totalQty.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">pcs</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Jumlah Kasus Catatan</span>
          <div className="text-xl font-bold text-slate-900">
            {classSummary.cases.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">entri</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Defect Tertinggi</span>
          <div className="text-sm font-bold text-slate-900 truncate" title={classSummary.topDefectName}>
            {classSummary.topDefectName}
          </div>
          <span className="text-[10px] text-slate-400">
            {classSummary.topDefectQty} pcs ({classSummary.totalQty ? Math.round((classSummary.topDefectQty / classSummary.totalQty) * 100) : 0}%)
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 block mb-0.5">Ukuran NPS Terbanyak</span>
          <div className="text-sm font-bold text-slate-900">
            NPS {classSummary.topSizeName}
          </div>
          <span className="text-[10px] text-slate-400">
            {classSummary.topSizeQty} pcs ({classSummary.totalQty ? Math.round((classSummary.topSizeQty / classSummary.totalQty) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* 3. DIAGRAM PARETO DINAMIS (Mengikuti Class yang Dipilih) */}
      <ParetoChart 
        records={filteredRecords} 
        classTitle={currentTabObj.label}
      />

      {/* 4. MATRIKS SEBARAN DEFECT VS UKURAN NPS (Sama Seperti di File Excel) */}
      <DefectMatrixTable 
        records={filteredRecords} 
        classTitle={currentTabObj.label}
      />

    </div>
  );
}
