import React, { useMemo } from 'react';
import { AlertTriangle, Layers, RotateCcw, FileText } from 'lucide-react';

export default function StatsCards({ records }) {
  const stats = useMemo(() => {
    let totalReject = 0;
    const defectMap = {};
    const classMap = {};

    records.forEach(r => {
      const qty = Number(r.qtyReject) || 0;
      totalReject += qty;

      if (r.defect && r.defect !== '-') {
        defectMap[r.defect] = (defectMap[r.defect] || 0) + qty;
      }

      if (r.asmeClass && r.asmeClass !== '-') {
        const clsKey = r.asmeClass === 'PN' ? 'DIN/PN' : `Class ${r.asmeClass}`;
        classMap[clsKey] = (classMap[clsKey] || 0) + qty;
      }
    });

    const topDefect = Object.entries(defectMap).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
    const topClass = Object.entries(classMap).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    return {
      totalQty: totalReject,
      totalCases: records.length,
      topDefectName: topDefect[0],
      topDefectQty: topDefect[1],
      topClassName: topClass[0],
      topClassQty: topClass[1]
    };
  }, [records]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      
      {/* Total Qty Rework */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Total Rework</span>
          <RotateCcw className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.totalQty.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-500 ml-1">pcs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Akumulasi produk di-rework</p>
        </div>
      </div>

      {/* Jumlah Catatan / Kasus */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Jumlah Kasus</span>
          <FileText className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.totalCases.toLocaleString('id-ID')}
            <span className="text-xs font-normal text-slate-500 ml-1">entri</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total baris catatan inspeksi</p>
        </div>
      </div>

      {/* Defect Terbanyak */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Defect Dominan</span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight" title={stats.topDefectName}>
            {stats.topDefectName}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.topDefectQty.toLocaleString('id-ID')} pcs ({stats.totalQty ? Math.round((stats.topDefectQty / stats.totalQty) * 100) : 0}%)
          </p>
        </div>
      </div>

      {/* Class Terbanyak */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">Class Terbanyak</span>
          <Layers className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <div className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
            {stats.topClassName}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {stats.topClassQty.toLocaleString('id-ID')} pcs ({stats.totalQty ? Math.round((stats.topClassQty / stats.totalQty) * 100) : 0}%)
          </p>
        </div>
      </div>

    </div>
  );
}
