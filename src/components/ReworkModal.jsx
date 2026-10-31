import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ASME_CLASSES, NPS_SIZES, DEFECT_TYPES, PROCESS_LIST, ACTION_LIST } from '../data/constants';

export default function ReworkModal({ isOpen, onClose, onSave, editData, isSubmitting }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    nps: '3"',
    asmeClass: '150',
    qtyOrder: 100,
    qtyReject: 1,
    defect: DEFECT_TYPES[0],
    process: PROCESS_LIST[0],
    action: ACTION_LIST[0],
    notes: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id,
        date: editData.date || new Date().toISOString().slice(0, 10),
        nps: editData.nps || '3"',
        asmeClass: editData.asmeClass || '150',
        qtyOrder: editData.qtyOrder || 0,
        qtyReject: editData.qtyReject || 1,
        defect: editData.defect || DEFECT_TYPES[0],
        process: editData.process || PROCESS_LIST[0],
        action: editData.action || ACTION_LIST[0],
        notes: editData.notes || ''
      });
    } else {
      setFormData({
        date: new Date().toISOString().slice(0, 10),
        nps: '3"',
        asmeClass: '150',
        qtyOrder: 100,
        qtyReject: 1,
        defect: DEFECT_TYPES[0],
        process: PROCESS_LIST[0],
        action: ACTION_LIST[0],
        notes: ''
      });
    }
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.qtyReject || formData.qtyReject < 1) {
      alert('Mohon isi tanggal dan jumlah rework dengan benar.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity">
      
      {/* Modal / Bottom Sheet Box */}
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {editData ? 'Edit Data Rework' : 'Catat Data Rework Baru'}
            </h2>
            <p className="text-xs text-slate-500">
              {editData ? 'Perbarui informasi hasil rework SWG' : 'Masukkan rincian temuan rework produk'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pengamatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            {/* ASME Class */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ASME Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.asmeClass}
                onChange={(e) => setFormData({ ...formData, asmeClass: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer"
              >
                {ASME_CLASSES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* NPS Size */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flange Size (NPS) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.nps}
                onChange={(e) => setFormData({ ...formData, nps: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer"
              >
                {NPS_SIZES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Qty Rework */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Rework (Qty) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.qtyReject}
                onChange={(e) => setFormData({ ...formData, qtyReject: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                placeholder="Jumlah produk rework"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Qty Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qty Total Order (Opsional)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qtyOrder}
                onChange={(e) => setFormData({ ...formData, qtyOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                placeholder="Jumlah pesanan batch"
              />
            </div>

            {/* Jenis Defect */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jenis Defect <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.defect}
                onChange={(e) => setFormData({ ...formData, defect: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer"
              >
                {DEFECT_TYPES.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Proses Terkait */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proses Terkait
              </label>
              <select
                value={formData.process}
                onChange={(e) => setFormData({ ...formData, process: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer"
              >
                {PROCESS_LIST.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Tindakan Rework */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tindakan Rework
              </label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer"
              >
                {ACTION_LIST.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Tambahan
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Catatan inspeksi atau informasi lot..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Data'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
