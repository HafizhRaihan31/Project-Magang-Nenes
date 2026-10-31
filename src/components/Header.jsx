import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Table as TableIcon, 
  BarChart3, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  Settings 
} from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  syncStatus,
  onRefresh,
  isRefreshing,
  onOpenSettings
}) {
  const navItems = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'input', label: 'Input Data', icon: PlusCircle },
    { id: 'table', label: 'Data Rework', icon: TableIcon },
    { id: 'analytics', label: 'Statistik', icon: BarChart3 },
  ];

  return (
    <>
      {/* TOPBAR (Desktop & Mobile) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs group-hover:bg-slate-800 transition">
                JFI
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                    SWG Quality Monitoring
                  </h1>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  PT Jeil Fajar Indonesia
                </p>
              </div>
            </div>

            {/* DESKTOP NAVBAR TABS */}
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Status & Tools */}
            <div className="flex items-center space-x-2">
              
              {/* Cloud Sync Button */}
              <button
                onClick={onRefresh}
                title="Sinkronkan data dengan Google Sheets"
                disabled={isRefreshing}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">
                  {syncStatus === 'cloud' ? (
                    <span className="text-emerald-700 flex items-center space-x-1 font-medium text-[11px]">
                      <Cloud className="w-3 h-3 text-emerald-600" />
                      <span>Google Sheets</span>
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center space-x-1 text-[11px]">
                      <CloudOff className="w-3 h-3 text-slate-400" />
                      <span>Lokal</span>
                    </span>
                  )}
                </span>
              </button>

              {/* Settings button */}
              <button
                onClick={onOpenSettings}
                title="Pengaturan Integrasi Cloud"
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
              >
                <Settings className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
