import React, { useMemo } from 'react';
import { Grid, Table } from 'lucide-react';
import { NPS_SIZES } from '../data/constants';

export default function DefectMatrixTable({ records, classTitle }) {
  const matrixData = useMemo(() => {
    const defectSet = new Set();
    const sizeMap = {};
    const defectTotals = {};
    let grandTotal = 0;

    records.forEach(r => {
      const qty = Number(r.qtyReject) || 0;
      const defect = (r.defect && r.defect !== '-') ? r.defect : 'Lainnya';
      const size = (r.nps && r.nps !== '-') ? (r.nps.includes('"') ? r.nps : `${r.nps}"`) : 'Lainnya';

      defectSet.add(defect);
      defectTotals[defect] = (defectTotals[defect] || 0) + qty;
      grandTotal += qty;

      if (!sizeMap[size]) {
        sizeMap[size] = { size, total: 0, defects: {} };
      }
      sizeMap[size].defects[defect] = (sizeMap[size].defects[defect] || 0) + qty;
      sizeMap[size].total += qty;
    });

    // Urutkan jenis defect berdasarkan total terbanyak
    const sortedDefects = Array.from(defectSet).sort((a, b) => (defectTotals[b] || 0) - (defectTotals[a] || 0));

    // Urutkan ukuran NPS mengacu pada standar NPS_SIZES
    const sortedSizes = Object.values(sizeMap).sort((a, b) => {
      const idxA = NPS_SIZES.findIndex(s => s === a.size || s.replace('"', '') === a.size.replace('"', ''));
      const idxB = NPS_SIZES.findIndex(s => s === b.size || s.replace('"', '') === b.size.replace('"', ''));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.total - a.total;
    });

    return {
      defects: sortedDefects,
      rows: sortedSizes,
      defectTotals,
      grandTotal
    };
  }, [records]);

  if (!matrixData.rows.length) {
    return null;
  }

  // Cari nilai sel terbesar untuk pewarnaan heatmap
  let maxCellVal = 1;
  matrixData.rows.forEach(r => {
    Object.values(r.defects).forEach(val => {
      if (val > maxCellVal) maxCellVal = val;
    });
  });

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Grid className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Matriks Sebaran Defect vs Ukuran Flange (NPS) — {classTitle}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sama seperti tabel rekap matriks pada sheet file Excel asli pabrik
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{matrixData.grandTotal.toLocaleString('id-ID')} pcs</strong>
        </div>
      </div>

      {/* Responsive Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <th className="py-2.5 px-3 sticky left-0 bg-slate-50 z-10 w-24 border-r border-slate-200">
                Ukuran (NPS)
              </th>
              {matrixData.defects.map(d => (
                <th key={d} className="py-2.5 px-3 text-right whitespace-nowrap min-w-[100px] max-w-[150px] truncate" title={d}>
                  {d}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right bg-slate-100/80 text-slate-800 font-bold border-l border-slate-200 min-w-[90px]">
                Total Rework
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {matrixData.rows.map(row => (
              <tr key={row.size} className="hover:bg-slate-50/80 transition">
                
                {/* Size column (Sticky) */}
                <td className="py-2 px-3 font-semibold text-slate-900 sticky left-0 bg-white border-r border-slate-100 whitespace-nowrap shadow-xs">
                  {row.size}
                </td>

                {/* Defect count cells */}
                {matrixData.defects.map(d => {
                  const val = row.defects[d] || 0;
                  const intensity = val > 0 ? Math.min(Math.round((val / maxCellVal) * 100), 100) : 0;
                  
                  return (
                    <td 
                      key={d} 
                      className="py-2 px-3 text-right font-mono"
                      style={{
                        backgroundColor: val > 0 
                          ? `rgba(29, 78, 216, ${Math.max(0.06, intensity / 150)})` 
                          : 'transparent'
                      }}
                    >
                      {val > 0 ? (
                        <span className={`font-semibold ${val > 10 ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>
                          {val}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  );
                })}

                {/* Row Total */}
                <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50/60 border-l border-slate-100">
                  {row.total.toLocaleString('id-ID')}
                </td>

              </tr>
            ))}
          </tbody>
          
          {/* Footer Total Row */}
          <tfoot>
            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-200">
              <td className="py-2.5 px-3 sticky left-0 bg-slate-100 border-r border-slate-200 z-10 whitespace-nowrap">
                TOTAL
              </td>
              {matrixData.defects.map(d => (
                <td key={d} className="py-2.5 px-3 text-right font-mono text-slate-900">
                  {(matrixData.defectTotals[d] || 0).toLocaleString('id-ID')}
                </td>
              ))}
              <td className="py-2.5 px-3 text-right font-mono text-blue-900 bg-blue-50/70 border-l border-slate-200 text-sm">
                {matrixData.grandTotal.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>

        </table>
      </div>

      <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span>* Warna biru yang lebih gelap menandakan titik konsentrasi defect yang tinggi (Hotspot QC).</span>
      </div>

    </div>
  );
}
