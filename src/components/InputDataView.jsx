import React, { useState } from 'react';
import { PlusCircle, Save, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';
import { ASME_CLASSES, NPS_SIZES, DEFECT_TYPES, PROCESS_LIST, ACTION_LIST } from '../data/constants';

export default function InputDataView({ onSave, onNavigateToTable }) {
  const initialForm = {
    date: new Date().toISOString().slice(0, 10),
    nps: '3"',
    asmeClass: '150',
    qtyOrder: 100,
    qtyReject: 1,
    defect: DEFECT_TYPES[0],
    process: PROCESS_LIST[0],
    action: ACTION_LIST[0],
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.qtyReject || formData.qtyReject < 1) {
      alert('Mohon isi tanggal dan jumlah rework dengan benar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      setLastSaved({ ...formData });
      // Reset form ke default tapi simpan tanggal
      setFormData({
        ...initialForm,
        date: formData.date,
        asmeClass: formData.asmeClass
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setLastSaved(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title & Introduction */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Formulir Input Data Rework SWG
            </h2>
            <p className="text-xs text-slate-500">
              Catat hasil temuan cacat dan tindakan perbaikan pada produk Spiral Wound Gasket
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification if just saved */}
      {lastSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Data berhasil disimpan: <strong>NPS {lastSaved.nps} (Class {lastSaved.asmeClass})</strong> - {lastSaved.qtyReject} pcs ({lastSaved.defect})
            </span>
          </div>
          <button
            onClick={onNavigateToTable}
            className="flex items-center space-x-1 font-semibold text-emerald-900 hover:underline ml-3 shrink-0"
          >
            <span>Lihat Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Pengamatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
              />
            </div>

            {/* ASME Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ASME Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.asmeClass}
                onChange={(e) => setFormData({ ...formData, asmeClass: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer transition"
              >
                {ASME_CLASSES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* NPS Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Flange Size (NPS) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.nps}
                onChange={(e) => setFormData({ ...formData, nps: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer transition"
              >
                {NPS_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Qty Rework */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jumlah Rework (Qty) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.qtyReject}
                onChange={(e) => setFormData({ ...formData, qtyReject: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                placeholder="Jumlah unit rework"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Qty Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Qty Order / Batch (Opsional)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qtyOrder}
                onChange={(e) => setFormData({ ...formData, qtyOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                placeholder="Total produksi batch"
              />
            </div>

            {/* Jenis Defect */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Identifikasi Masalah (Jenis Defect) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.defect}
                onChange={(e) => setFormData({ ...formData, defect: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer transition"
              >
                {DEFECT_TYPES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Proses Terkait */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Proses Terkait
              </label>
              <select
                value={formData.process}
                onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer transition"
              >
                {PROCESS_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Tindakan Rework */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tindakan Rework
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer transition"
              >
                {ACTION_LIST.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan Tambahan (Opsional)
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan hasil inspeksi atau kondisi produk..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Formulir</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan ke Cloud...' : 'Simpan Data Rework'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
