import React, { useState, useEffect } from 'react';
import { X, Cloud, Link, Check, ExternalLink, Trash2 } from 'lucide-react';
import { getGasApiUrl, setGasApiUrl } from '../services/api';

export default function SettingsModal({ isOpen, onClose, onUrlUpdated }) {
  const [url, setUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(getGasApiUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setGasApiUrl(url);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onUrlUpdated();
  };

  const handleClear = () => {
    setUrl('');
    setGasApiUrl('');
    onUrlUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Integrasi Google Sheets Database</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-slate-600">
          
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Google Apps Script Web App URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
              >
                {savedSuccess ? 'Tersimpan!' : 'Simpan'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              URL ini menghubungkan web langsung ke spreadsheet Google Sheets Anda secara real-time. Anda juga bisa memasukkannya ke file <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code> dengan variabel <code className="text-slate-700 bg-slate-100 px-1 py-0.5 rounded font-mono">VITE_GAS_API_URL</code>.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <h4 className="font-semibold text-slate-800">Langkah Cepat Mendapatkan URL:</h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>Buka spreadsheet Google Sheets Anda.</li>
              <li>Klik menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
              <li>Salin kode dari file <code>google-apps-script/Code.gs</code> di proyek ini.</li>
              <li>Klik <strong>Deploy &gt; New deployment</strong>, pilih type <em>Web app</em>.</li>
              <li>Set <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>.</li>
              <li>Klik Deploy, izinkan akses, lalu salin URL Web App dan simpan di sini.</li>
            </ol>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center space-x-1.5 text-rose-500 hover:text-rose-700 text-xs transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus URL Tersimpan</span>
              </button>
            ) : <div />}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition"
            >
              Tutup
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
