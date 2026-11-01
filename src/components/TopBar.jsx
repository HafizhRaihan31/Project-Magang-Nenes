import React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen, RefreshCw, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

export default function TopBar({
  activeTab,
  onOpenMobileSidebar,
  isCollapsed,
  onToggleDesktopSidebar,
  syncStatus,
  onRefresh,
  isRefreshing
}) {
  const pageDetails = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Ringkasan mutu dan aktivitas rework Spiral Wound Gasket'
    },
    input: {
      title: 'Input Data Rework',
      subtitle: 'Pencatatan hasil pemeriksaan dan tindakan perbaikan'
    },
    table: {
      title: 'Riwayat & Olah Data',
      subtitle: 'Daftar catatan seluruh rework dengan pencarian, sorting, dan export'
    },
    analytics: {
      title: 'Statistik & Analisis Pareto',
      subtitle: 'Analisis Pareto aturan 80/20 dan matriks defect vs ukuran NPS per Class'
    }
  };

  const current = pageDetails[activeTab] || pageDetails.input;

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
      
      {/* Left: Mobile Toggle & Desktop Sidebar Toggle & Page Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* Mobile Hamburger Button */}
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Buka Menu"
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={onToggleDesktopSidebar}
          title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar (Hanya Ikon)'}
          className="hidden md:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Page Title & Subtitle */}
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
            {current.title}
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Company Badge & Status */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        
        {/* Sync Status Button */}
        {/* <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Klik untuk menyinkronkan data langsung dari Google Sheets"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition ${
            syncStatus === 'cloud'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : syncStatus === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline font-medium">
            {syncStatus === 'cloud' && 'Google Sheets Terhubung'}
            {syncStatus === 'unconfigured' && 'Setup URL Sheets'}
            {syncStatus === 'error' && 'Gagal Memuat Sheets'}
          </span>
        </button>  */}

        {/* Company Pill */}
        <div className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
          PT JFI
        </div>

      </div>

    </header>
  );
}
