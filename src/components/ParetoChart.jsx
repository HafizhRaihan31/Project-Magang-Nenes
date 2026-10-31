import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

export default function ParetoChart({ records, classTitle = 'Semua Class' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'

  // Hitung data Pareto
  const paretoData = useMemo(() => {
    const defectMap = {};
    let totalQty = 0;

    records.forEach(r => {
      const qty = Number(r.qtyReject) || 0;
      const defect = (r.defect && r.defect !== '-') ? r.defect : 'Lainnya';
      defectMap[defect] = (defectMap[defect] || 0) + qty;
      totalQty += qty;
    });

    if (totalQty === 0) return { items: [], totalQty: 0, vitalDefects: [] };

    // Urutkan dari terbanyak ke terkecil
    const sorted = Object.entries(defectMap)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty);

    // Ambil top 8 defect dan gabungkan sisanya jika terlalu banyak
    const TOP_LIMIT = 8;
    let items = [];
    if (sorted.length > TOP_LIMIT) {
      const topItems = sorted.slice(0, TOP_LIMIT);
      const remainingQty = sorted.slice(TOP_LIMIT).reduce((sum, item) => sum + item.qty, 0);
      items = [...topItems, { name: 'Lain-lain', qty: remainingQty }];
    } else {
      items = sorted;
    }

    // Hitung persentase dan kumulatif
    let cumulative = 0;
    const itemsWithCumulative = items.map((item, idx) => {
      const pct = (item.qty / totalQty) * 100;
      cumulative += pct;
      const cumulativePct = Math.min(Math.round(cumulative * 10) / 10, 100);
      
      // Kategori Vital 80% (aturan Pareto)
      const isVital = cumulativePct <= 85 || idx < 3;

      return {
        ...item,
        percentage: Math.round(pct * 10) / 10,
        cumulativePercentage: cumulativePct,
        isVital
      };
    });

    const vitalDefects = itemsWithCumulative.filter(d => d.isVital && d.name !== 'Lain-lain');

    return {
      items: itemsWithCumulative,
      totalQty,
      vitalDefects
    };
  }, [records]);

  if (!paretoData.items.length) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
        Tidak ada data defect untuk {classTitle}.
      </div>
    );
  }

  // Parameter geometri SVG
  const width = 760;
  const height = 320;
  const padding = { top: 30, right: 55, bottom: 65, left: 55 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxQty = Math.max(...paretoData.items.map(d => d.qty), 10);
  const yAxisMax = Math.ceil(maxQty * 1.15);

  const barCount = paretoData.items.length;
  const barSpacing = chartWidth / barCount;
  const barWidth = Math.max(Math.min(barSpacing * 0.58, 48), 18);

  // Titik koordinat garis kumulatif
  const linePoints = paretoData.items.map((d, i) => {
    const x = padding.left + (i * barSpacing) + (barSpacing / 2);
    const y = padding.top + chartHeight - ((d.cumulativePercentage / 100) * chartHeight);
    return { x, y, data: d };
  });

  const polylinePoints = linePoints.map(p => `${p.x},${p.y}`).join(' ');

  // Koordinat garis referensi 80%
  const y80 = padding.top + chartHeight - (0.8 * chartHeight);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
      
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">
              Diagram Pareto Defect — {classTitle}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Batang = Frekuensi Qty Defect | Garis Biru = Persentase Kumulatif (%)
          </p>
        </div>

        {/* View Switcher (Chart vs Table) */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg self-start sm:self-auto text-xs">
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              viewMode === 'chart'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diagram Kombinasi
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-md font-medium transition ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel Rincian 80/20
          </button>
        </div>
      </div>

      {/* Insight Banner */}
      <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs flex items-start space-x-2.5">
        <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Analisis Pareto ({classTitle}): </strong>
          Fokus pada <strong className="text-blue-700">{paretoData.vitalDefects.length} defect utama</strong> (
          {paretoData.vitalDefects.map(d => `"${d.name}"`).join(', ')}
          ) yang menyumbang sekitar <strong className="text-slate-900">
            {paretoData.vitalDefects[paretoData.vitalDefects.length - 1]?.cumulativePercentage || 100}%
          </strong> dari seluruh rework {classTitle}.
        </div>
      </div>

      {viewMode === 'chart' ? (
        /* DIAGRAM PARETO (SVG) */
        <div className="relative w-full overflow-x-auto select-none">
          <div className="min-w-[620px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto"
              style={{ overflow: 'visible' }}
            >
              
              {/* Horizontal Gridlines (0%, 20%, 40%, 60%, 80%, 100%) */}
              {[0, 20, 40, 60, 80, 100].map(pct => {
                const y = padding.top + chartHeight - ((pct / 100) * chartHeight);
                const is80 = pct === 80;
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={is80 ? '#f59e0b' : '#f1f5f9'}
                      strokeWidth={is80 ? '1.5' : '1'}
                      strokeDasharray={is80 ? '4 3' : 'none'}
                    />
                    {/* Right Y-Axis (% Kumulatif) */}
                    <text
                      x={width - padding.right + 8}
                      y={y + 3}
                      fill={is80 ? '#b45309' : '#94a3b8'}
                      fontSize="10"
                      fontWeight={is80 ? '600' : '400'}
                      textAnchor="start"
                    >
                      {pct}%
                    </text>
                  </g>
                );
              })}

              {/* Left Y-Axis Grid Labels (Qty) */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const val = Math.round(yAxisMax * ratio);
                const y = padding.top + chartHeight - (ratio * chartHeight);
                return (
                  <text
                    key={ratio}
                    x={padding.left - 10}
                    y={y + 3}
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                );
              })}

              {/* 80% Target Line Label */}
              <text
                x={padding.left + 8}
                y={y80 - 6}
                fill="#b45309"
                fontSize="10"
                fontWeight="600"
              >
                Garis Batas 80% (Vital Few)
              </text>

              {/* Bars (Defect Qty) */}
              {paretoData.items.map((item, i) => {
                const barHeight = (item.qty / yAxisMax) * chartHeight;
                const x = padding.left + (i * barSpacing) + (barSpacing - barWidth) / 2;
                const y = padding.top + chartHeight - barHeight;
                const isHovered = hoveredIndex === i;

                return (
                  <g
                    key={item.name}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Batang Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="4"
                      fill={item.isVital ? (isHovered ? '#0f172a' : '#1e293b') : (isHovered ? '#64748b' : '#94a3b8')}
                      className="transition-colors duration-150"
                    />

                    {/* Nilai Qty di atas batang */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 5}
                      fill="#334155"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {item.qty}
                    </text>

                    {/* Label Nama Defect di bawah sumbu X */}
                    <text
                      x={x + barWidth / 2}
                      y={padding.top + chartHeight + 16}
                      fill="#475569"
                      fontSize="9.5"
                      textAnchor="end"
                      transform={`rotate(-25, ${x + barWidth / 2}, ${padding.top + chartHeight + 16})`}
                    >
                      {item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name}
                    </text>
                  </g>
                );
              })}

              {/* Garis Poligon Persentase Kumulatif */}
              <polyline
                points={polylinePoints}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Titik Lingkaran Kumulatif */}
              {linePoints.map((pt, i) => {
                const isHovered = hoveredIndex === i;
                return (
                  <g
                    key={pt.data.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill="#ffffff"
                      stroke="#2563eb"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150"
                    />
                    {/* Nilai % Kumulatif di samping titik */}
                    <text
                      x={pt.x}
                      y={pt.y - 8}
                      fill="#1d4ed8"
                      fontSize="9.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pt.data.cumulativePercentage}%
                    </text>
                  </g>
                );
              })}

            </svg>
          </div>

          {/* Interactive Tooltip on hover */}
          {hoveredIndex !== null && (
            <div className="mt-3 p-2.5 bg-slate-900 text-white rounded-lg text-xs flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-100">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">
                  {paretoData.items[hoveredIndex].name}
                </span>
                <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-800 text-slate-300">
                  {paretoData.items[hoveredIndex].isVital ? '⭐ Vital 80%' : 'Useful Many'}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-slate-300">
                <span>Jumlah: <strong className="text-white">{paretoData.items[hoveredIndex].qty} pcs</strong></span>
                <span>Kontribusi: <strong className="text-white">{paretoData.items[hoveredIndex].percentage}%</strong></span>
                <span>Kumulatif: <strong className="text-blue-300">{paretoData.items[hoveredIndex].cumulativePercentage}%</strong></span>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 bg-slate-900 rounded-xs inline-block" />
              <span>Vital Defect (Prioritas Perbaikan)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 bg-slate-400 rounded-xs inline-block" />
              <span>Defect Sekunder</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-blue-600 inline-block relative">
                <span className="w-2 h-2 rounded-full border border-blue-600 bg-white absolute -top-[3px] left-1" />
              </span>
              <span>Garis Kumulatif (%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-5 h-0 border-t-2 border-dashed border-amber-500 inline-block" />
              <span>Batas 80% Pareto</span>
            </div>
          </div>

        </div>
      ) : (
        /* TABEL RINCIAN PARETO (80/20) */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 w-10 text-center">Rank</th>
                <th className="py-2.5 px-3">Jenis Defect</th>
                <th className="py-2.5 px-3 text-right">Qty Rework</th>
                <th className="py-2.5 px-3 text-right">Persentase</th>
                <th className="py-2.5 px-3 text-right">Kumulatif</th>
                <th className="py-2.5 px-3 text-center">Klasifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paretoData.items.map((item, idx) => (
                <tr key={item.name} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-medium">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {item.qty.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.percentage}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-700">
                    {item.cumulativePercentage}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {item.isVital ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        ⭐ Vital (Prioritas)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        Sekunder
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <td colSpan={2} className="py-2.5 px-3 text-center">TOTAL</td>
                <td className="py-2.5 px-3 text-right font-mono">
                  {paretoData.totalQty.toLocaleString('id-ID')}
                </td>
                <td className="py-2.5 px-3 text-right font-mono">100%</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

    </div>
  );
}
