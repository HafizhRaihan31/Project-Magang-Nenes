import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Table as TableIcon, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  X 
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  syncStatus,
  onRefresh,
  isRefreshing
}) {
  const navItems = [
    { id: 'input', label: 'Input Data', icon: PlusCircle },
    { id: 'table', label: 'Data Rework', icon: TableIcon },
    { id: 'analytics', label: 'Statistik', icon: BarChart3 },
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* MOBILE BACKDROP OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 ease-in-out select-none ${
          // Mobile state
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop: Slim Icon-Only (w-16 / 64px) vs Expanded (w-60 / 240px)
          isCollapsed ? 'md:w-16' : 'md:w-60'
        } w-64 shadow-xl md:shadow-none`}
      >
        
        {/* TOP: BRAND & MENU */}
        <div>
          
          {/* Header Brand */}
          <div className={`h-16 border-b border-slate-100 flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}>
            <div 
              onClick={() => handleNavClick('input')}
              className="flex items-center space-x-3 cursor-pointer overflow-hidden"
              title="SWG Quality Monitoring - PT Jeil Fajar Indonesia"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-xs">
                JFI
              </div>
              {!isCollapsed && (
                <div className="truncate">
                  <h1 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight leading-tight">
                    SWG QUALITY
                  </h1>
                  <p className="text-[10px] text-slate-400 font-medium">
                    PT Jeil Fajar Indonesia
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Label (Only when expanded) */}
          {!isCollapsed && (
            <div className="px-5 pt-4 pb-2 text-[10px] font-bold text-slate-400 tracking-wider">
              MENU UTAMA
            </div>
          )}

          {/* Navigation Items (Icon-Only when collapsed) */}
          <nav className={`py-3 space-y-1.5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div key={item.id} className="relative group flex justify-center">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                      isCollapsed 
                        ? 'w-11 h-11 justify-center' 
                        : 'w-full space-x-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'
                    }`} />
                    
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>

                  {/* Tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <div className="hidden md:block absolute left-14 top-1/2 -translate-y-1/2 ml-1 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

        </div>

        {/* BOTTOM: UTILITIES & TOGGLE BUTTON */}
        <div className={`py-3 border-t border-slate-100 space-y-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          
          {/* Cloud Sync Button */}
          <div className="relative group flex justify-center">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`flex items-center rounded-xl text-xs border border-slate-200/80 bg-slate-50/60 hover:bg-slate-100 transition ${
                isCollapsed 
                  ? 'w-11 h-11 justify-center' 
                  : 'w-full space-x-2.5 px-3 py-2 text-left'
              }`}
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              
              {!isCollapsed && (
                <div className="truncate flex-1">
                  {syncStatus === 'cloud' && (
                    <div className="flex items-center space-x-1 text-emerald-700 font-medium text-[11px]">
                      <Cloud className="w-3 h-3 shrink-0" />
                      <span className="truncate">Google Sheets</span>
                    </div>
                  )}
                  {syncStatus === 'unconfigured' && (
                    <div className="flex items-center space-x-1 text-amber-600 font-medium text-[11px]">
                      <CloudOff className="w-3 h-3 shrink-0 text-amber-500" />
                      <span className="truncate">Setup URL Sheets</span>
                    </div>
                  )}
                  {syncStatus === 'error' && (
                    <div className="flex items-center space-x-1 text-rose-600 font-medium text-[11px]">
                      <CloudOff className="w-3 h-3 shrink-0 text-rose-500" />
                      <span className="truncate">Koneksi Error</span>
                    </div>
                  )}
                </div>
              )}
            </button>

            {isCollapsed && (
              <div className="hidden md:block absolute left-14 top-1/2 -translate-y-1/2 ml-1 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                {syncStatus === 'cloud' ? 'Google Sheets Terhubung' : syncStatus === 'error' ? 'Koneksi Error' : 'Setup URL Sheets'}
              </div>
            )}
          </div>

          {/* Desktop Minimize / Extend Toggle Button */}
          <div className="hidden md:block pt-1 border-t border-slate-100">
            <div className="relative group flex justify-center">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition ${
                  isCollapsed ? 'w-11 h-10' : 'w-full py-2 space-x-2'
                }`}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                ) : (
                  <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-500">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Kecilkan (Ikon Saja)</span>
                  </div>
                )}
              </button>

              {isCollapsed && (
                <div className="hidden md:block absolute left-14 top-1/2 -translate-y-1/2 ml-1 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg z-50">
                  Perluas Sidebar
                </div>
              )}
            </div>
          </div>

        </div>

      </aside>
    </>
  );
}
