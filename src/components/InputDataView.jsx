import React, { useState, useMemo } from 'react';
import { PlusCircle, Save, RotateCcw, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { ASME_CLASSES, NPS_SIZES, DEFECT_TYPES, PROCESS_LIST, ACTION_LIST } from '../data/constants';

export default function InputDataView({ onSave, onNavigateToTable, existingRecords = [] }) {
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
  const [customInputs, setCustomInputs] = useState({
    nps: '',
    asmeClass: '',
    defect: '',
    process: '',
    action: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Opsi Dinamis: Menggabungkan daftar standar + kategori kustom yang sudah ada di database + "Lainnya"
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.qtyReject || formData.qtyReject < 1) {
      alert('Mohon isi tanggal dan jumlah rework dengan benar.');
      return;
    }

    // Validasi input jika user memilih "Lainnya"
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

    setIsSubmitting(true);
    try {
      await onSave(payload);
      setLastSaved({ ...payload });
      // Reset form ke default tapi simpan tanggal & class
      setFormData({
        ...initialForm,
        date: formData.date,
        asmeClass: finalClass
      });
      setCustomInputs({
        nps: '',
        asmeClass: '',
        defect: '',
        process: '',
        action: ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setCustomInputs({
      nps: '',
      asmeClass: '',
      defect: '',
      process: '',
      action: ''
    });
    setLastSaved(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title & Introduction */}
      {/* <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
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
      </div> */}

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
                {availableClasses.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Input Kustom jika Class = Other */}
              {formData.asmeClass === 'Other' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.asmeClass}
                    onChange={(e) => setCustomInputs({ ...customInputs, asmeClass: e.target.value })}
                    placeholder="Ketikkan Class baru (contoh: 800, PN25, API 10K)..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-amber-50/60 border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition shadow-xs"
                  />
                  <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center space-x-1">
                    
                    
                  </p>
                </div>
              )}
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
                {availableNps.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Input Kustom jika NPS = Lainnya */}
              {formData.nps === 'Lainnya' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.nps}
                    onChange={(e) => setCustomInputs({ ...customInputs, nps: e.target.value })}
                    placeholder='Ketikkan ukuran NPS baru (contoh: 2-1/2" Special, 64")...'
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-amber-50/60 border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition shadow-xs"
                  />
                  <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center space-x-1">
                    
                   
                  </p>
                </div>
              )}
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
                {availableDefects.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Input Kustom jika Defect = Lainnya */}
              {formData.defect === 'Lainnya' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.defect}
                    onChange={(e) => setCustomInputs({ ...customInputs, defect: e.target.value })}
                    placeholder="Ketikkan nama jenis defect baru..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-amber-50/60 border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition shadow-xs"
                  />
                  <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center space-x-1">
                    
                    
                  </p>
                </div>
              )}
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
                {availableProcesses.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Input Kustom jika Proses = Lainnya */}
              {formData.process === 'Lainnya' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.process}
                    onChange={(e) => setCustomInputs({ ...customInputs, process: e.target.value })}
                    placeholder="Ketikkan nama proses terkait baru..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-amber-50/60 border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition shadow-xs"
                  />
                  <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center space-x-1">
                    
                    
                  </p>
                </div>
              )}
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
                {availableActions.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

              {/* Input Kustom jika Tindakan = Lainnya */}
              {formData.action === 'Lainnya' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    required
                    value={customInputs.action}
                    onChange={(e) => setCustomInputs({ ...customInputs, action: e.target.value })}
                    placeholder="Ketikkan nama tindakan rework baru..."
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-amber-50/60 border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition shadow-xs"
                  />
                  <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center space-x-1">
                    
                    
                  </p>
                </div>
              )}
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
