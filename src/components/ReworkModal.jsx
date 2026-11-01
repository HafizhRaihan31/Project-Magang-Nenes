import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Sparkles } from 'lucide-react';
import { ASME_CLASSES, NPS_SIZES, DEFECT_TYPES, PROCESS_LIST, ACTION_LIST } from '../data/constants';

export default function ReworkModal({ isOpen, onClose, onSave, editData, isSubmitting, existingRecords = [] }) {
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

  const [customInputs, setCustomInputs] = useState({
    nps: '',
    asmeClass: '',
    defect: '',
    process: '',
    action: ''
  });

  // Dynamic Options
  const availableDefects = useMemo(() => {
    const list = [...DEFECT_TYPES.filter(d => d !== 'Lainnya')];
    existingRecords.forEach(r => {
      if (r.defect && r.defect !== '-' && !list.includes(r.defect) && r.defect !== 'Lainnya') {
        list.push(r.defect);
      }
    });
    return [...list, 'Lainnya'];
  }, [existingRecords]);

  const availableProcesses = useMemo(() => {
    const list = [...PROCESS_LIST.filter(p => p !== 'Lainnya')];
    existingRecords.forEach(r => {
      if (r.process && r.process !== '-' && !list.includes(r.process) && r.process !== 'Lainnya') {
        list.push(r.process);
      }
    });
    return [...list, 'Lainnya'];
  }, [existingRecords]);

  const availableActions = useMemo(() => {
    const list = [...ACTION_LIST.filter(a => a !== 'Lainnya')];
    existingRecords.forEach(r => {
      if (r.action && r.action !== '-' && !list.includes(r.action) && r.action !== 'Lainnya') {
        list.push(r.action);
      }
    });
    return [...list, 'Lainnya'];
  }, [existingRecords]);

  const availableClasses = useMemo(() => {
    const list = [...ASME_CLASSES.filter(c => c.value !== 'Other')];
    const existingVals = new Set(list.map(c => String(c.value)));
    existingRecords.forEach(r => {
      if (r.asmeClass && !existingVals.has(String(r.asmeClass)) && r.asmeClass !== 'Other') {
        existingVals.add(String(r.asmeClass));
        list.push({
          value: String(r.asmeClass),
          label: `Class ${r.asmeClass}`
        });
      }
    });
    return [...list, { value: 'Other', label: 'Class Lainnya (Kustom)' }];
  }, [existingRecords]);

  const availableNps = useMemo(() => {
    const list = [...NPS_SIZES.filter(s => s !== 'Lainnya')];
    existingRecords.forEach(r => {
      if (r.nps && r.nps !== '-' && !list.includes(r.nps) && r.nps !== 'Lainnya') {
        list.push(r.nps);
      }
    });
    return [...list, 'Lainnya'];
  }, [existingRecords]);

  useEffect(() => {
    if (editData) {
      const isDefectInList = availableDefects.some(d => d !== 'Lainnya' && d === editData.defect);
      const isProcessInList = availableProcesses.some(p => p !== 'Lainnya' && p === editData.process);
      const isActionInList = availableActions.some(a => a !== 'Lainnya' && a === editData.action);
      const isClassInList = availableClasses.some(c => c.value !== 'Other' && String(c.value) === String(editData.asmeClass));
      const isNpsInList = availableNps.some(n => n !== 'Lainnya' && n === editData.nps);

      setFormData({
        id: editData.id,
        date: editData.date || new Date().toISOString().slice(0, 10),
        nps: isNpsInList ? editData.nps : 'Lainnya',
        asmeClass: isClassInList ? editData.asmeClass : 'Other',
        qtyOrder: editData.qtyOrder || 0,
        qtyReject: editData.qtyReject || 1,
        defect: isDefectInList ? editData.defect : 'Lainnya',
        process: isProcessInList ? editData.process : 'Lainnya',
        action: isActionInList ? editData.action : 'Lainnya',
        notes: editData.notes || ''
      });

      setCustomInputs({
        nps: isNpsInList ? '' : (editData.nps || ''),
        asmeClass: isClassInList ? '' : (editData.asmeClass || ''),
        defect: isDefectInList ? '' : (editData.defect || ''),
        process: isProcessInList ? '' : (editData.process || ''),
        action: isActionInList ? '' : (editData.action || '')
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
      setCustomInputs({
        nps: '',
        asmeClass: '',
        defect: '',
        process: '',
        action: ''
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

    let finalDefect = formData.defect;
    if (formData.defect === 'Lainnya') {
      if (!customInputs.defect.trim()) {
        alert('Mohon ketikkan nama Jenis Defect baru pada kolom yang tersedia.');
        return;
      }
      finalDefect = customInputs.defect.trim();
    }

    let finalProcess = formData.process;
    if (formData.process === 'Lainnya') {
      if (!customInputs.process.trim()) {
        alert('Mohon ketikkan nama Proses Terkait baru pada kolom yang tersedia.');
        return;
      }
      finalProcess = customInputs.process.trim();
    }

    let finalAction = formData.action;
    if (formData.action === 'Lainnya') {
      if (!customInputs.action.trim()) {
        alert('Mohon ketikkan nama Tindakan Rework baru pada kolom yang tersedia.');
        return;
      }
      finalAction = customInputs.action.trim();
    }

    let finalClass = formData.asmeClass;
    if (formData.asmeClass === 'Other') {
      if (!customInputs.asmeClass.trim()) {
        alert('Mohon ketikkan nama ASME Class baru pada kolom yang tersedia.');
        return;
      }
      finalClass = customInputs.asmeClass.trim();
    }

    let finalNps = formData.nps;
    if (formData.nps === 'Lainnya') {
      if (!customInputs.nps.trim()) {
        alert('Mohon ketikkan nama Ukuran NPS baru pada kolom yang tersedia.');
        return;
      }
      finalNps = customInputs.nps.trim();
    }

    const payload = {
      ...formData,
      defect: finalDefect,
      process: finalProcess,
      action: finalAction,
      asmeClass: finalClass,
      nps: finalNps
    };

    onSave(payload);
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
                {availableClasses.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Input Kustom jika Class = Other */}
              {formData.asmeClass === 'Other' && (
                <div className="mt-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.asmeClass}
                    onChange={(e) => setCustomInputs({ ...customInputs, asmeClass: e.target.value })}
                    placeholder="Nama ASME Class baru..."
                    className="w-full px-3 py-1.5 text-xs bg-amber-50/70 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              )}
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
                {availableNps.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Input Kustom jika NPS = Lainnya */}
              {formData.nps === 'Lainnya' && (
                <div className="mt-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.nps}
                    onChange={(e) => setCustomInputs({ ...customInputs, nps: e.target.value })}
                    placeholder="Ukuran NPS baru..."
                    className="w-full px-3 py-1.5 text-xs bg-amber-50/70 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              )}
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
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Qty Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Qty Order (Opsional)
              </label>
              <input
                type="number"
                min="0"
                value={formData.qtyOrder}
                onChange={(e) => setFormData({ ...formData, qtyOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            {/* Jenis Defect */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identifikasi Masalah (Jenis Defect) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.defect}
                onChange={(e) => setFormData({ ...formData, defect: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white cursor-pointer"
              >
                {availableDefects.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Input Kustom jika Defect = Lainnya */}
              {formData.defect === 'Lainnya' && (
                <div className="mt-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.defect}
                    onChange={(e) => setCustomInputs({ ...customInputs, defect: e.target.value })}
                    placeholder="Nama defect baru..."
                    className="w-full px-3 py-1.5 text-xs bg-amber-50/70 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              )}
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
                {availableProcesses.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Input Kustom jika Proses = Lainnya */}
              {formData.process === 'Lainnya' && (
                <div className="mt-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.process}
                    onChange={(e) => setCustomInputs({ ...customInputs, process: e.target.value })}
                    placeholder="Nama proses baru..."
                    className="w-full px-3 py-1.5 text-xs bg-amber-50/70 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              )}
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
                {availableActions.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

              {/* Input Kustom jika Tindakan = Lainnya */}
              {formData.action === 'Lainnya' && (
                <div className="mt-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.action}
                    onChange={(e) => setCustomInputs({ ...customInputs, action: e.target.value })}
                    placeholder="Nama tindakan baru..."
                    className="w-full px-3 py-1.5 text-xs bg-amber-50/70 border border-amber-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-xs transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
