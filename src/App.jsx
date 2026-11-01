import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import DashboardView from './components/DashboardView';
import InputDataView from './components/InputDataView';
import FilterBar from './components/FilterBar';
import ReworkTable from './components/ReworkTable';
import AnalyticsView from './components/AnalyticsView';
import ReworkModal from './components/ReworkModal';
import { 
  fetchRecords, 
  createRecord, 
  updateRecord, 
  deleteRecord, 
  exportToCSV,
  getGasApiUrl
} from './services/api';
import { DEFECT_TYPES, ASME_CLASSES } from './data/constants';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState([]);
  const [syncStatus, setSyncStatus] = useState(() => getGasApiUrl() ? 'cloud' : 'unconfigured'); // 'cloud' | 'unconfigured' | 'error'
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Navbar Tab: 'input' | 'table' | 'analytics' | 'dashboard'
  const [activeTab, setActiveTab] = useState('input');

  // Sidebar Collapse & Mobile state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('swg_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = (collapsedState) => {
    setIsCollapsed(collapsedState);
    localStorage.setItem('swg_sidebar_collapsed', String(collapsedState));
  };

  // Filter & Search states (untuk Tab 'table')
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDefect, setSelectedDefect] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Sorting state (default: Date descending)
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  // Modal Edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load data murni langsung dari Google Sheets
  const loadData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsRefreshing(true);
    try {
      const res = await fetchRecords();
      if (res.source === 'unconfigured') {
        setSyncStatus('unconfigured');
        setRecords([]);
      } else {
        setRecords(res.data);
        setSyncStatus('cloud');
      }
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
      showToast('Gagal memuat data dari Google Sheets: ' + (err.message || ''), 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Sorting Handler
  const handleSort = (columnKey) => {
    setSortConfig(prev => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        key: columnKey,
        direction: columnKey === 'qtyReject' || columnKey === 'date' ? 'desc' : 'asc'
      };
    });
  };

  // Opsi Defect Dinamis (Standar + Kategori baru dari database)
  const dynamicDefects = useMemo(() => {
    const set = new Set(DEFECT_TYPES.filter(d => d !== 'Lainnya'));
    records.forEach(r => {
      if (r.defect && r.defect !== '-' && r.defect !== 'Lainnya') {
        set.add(r.defect);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [records]);

  // Opsi Class Dinamis (Standar + Class baru dari database)
  const dynamicClasses = useMemo(() => {
    const list = [...ASME_CLASSES.filter(c => c.value !== 'Other')];
    const existingVals = new Set(list.map(c => String(c.value)));
    records.forEach(r => {
      if (r.asmeClass && !existingVals.has(String(r.asmeClass)) && r.asmeClass !== 'Other') {
        existingVals.add(String(r.asmeClass));
        list.push({
          value: String(r.asmeClass),
          label: `Class ${r.asmeClass}`
        });
      }
    });
    return list;
  }, [records]);

  // Filter & Sort computation (untuk Tab 'table')
  const processedRecords = useMemo(() => {
    const filtered = records.filter(item => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match = [
          item.nps,
          item.asmeClass,
          item.defect,
          item.process,
          item.action,
          item.notes,
          item.date
        ].some(val => String(val || '').toLowerCase().includes(q));
        if (!match) return false;
      }

      if (selectedClass && String(item.asmeClass) !== String(selectedClass)) {
        return false;
      }

      if (selectedDefect && String(item.defect) !== String(selectedDefect)) {
        return false;
      }

      if (selectedDate && String(item.date) !== String(selectedDate)) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA = a[key];
      let valB = b[key];

      if (key === 'qtyReject' || key === 'qtyOrder') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return direction === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [records, searchQuery, selectedClass, selectedDefect, selectedDate, sortConfig]);

  // CRUD Operations langsung ke Google Sheets
  const handleSaveFromInput = async (formData) => {
    try {
      const created = await createRecord(formData);
      setRecords(prev => [created, ...prev]);
      showToast('Data rework baru berhasil disimpan ke Google Sheets!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenEditModal = (record) => {
    setEditData(record);
    setIsEditModalOpen(true);
  };

  const handleSaveFromEditModal = async (formData) => {
    setIsSubmitting(true);
    try {
      await updateRecord(formData);
      setRecords(prev => prev.map(item => item.id === formData.id ? { ...item, ...formData } : item));
      setIsEditModalOpen(false);
      showToast('Perubahan data di Google Sheets berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      showToast('Gagal memperbarui data: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus catatan rework ini dari Google Sheets?');
    if (!confirmed) return;

    try {
      await deleteRecord(id);
      setRecords(prev => prev.filter(item => item.id !== id));
      showToast('Catatan rework telah dihapus dari Google Sheets.');
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data: ' + err.message, 'error');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedDefect('');
    setSelectedDate('');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      
      {/* 1. COLLAPSIBLE SIDEBAR DI SAMPING KIRI */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        syncStatus={syncStatus}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
      />

      {/* 2. MAIN CONTENT AREA (MENYESUAIKAN LEBAR OTOMATIS) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOPBAR */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          isCollapsed={isCollapsed}
          onToggleDesktopSidebar={() => handleToggleCollapse(!isCollapsed)}
          syncStatus={syncStatus}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
        />

        {/* PAGE CONTENT CONTAINER (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">

            {/* NOTIFIKASI SETUP GOOGLE SHEETS JIKA BELUM TERHUBUNG */}
            {syncStatus === 'unconfigured' && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 flex items-center space-x-3 shadow-xs">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-amber-950">URL Google Apps Script Belum Terdeteksi</p>
                  <p className="text-amber-800 mt-0.5">
                    Pastikan variabel <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded">VITE_GAS_API_URL</code> sudah diisi pada file <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded">.env</code>.
                  </p>
                </div>
              </div>
            )}
            
            {/* FITUR 1: RINGKASAN DASHBOARD */}
            {activeTab === 'dashboard' && (
              <DashboardView 
                records={records} 
                onNavigate={(page) => setActiveTab(page)} 
              />
            )}

            {/* FITUR 2: INPUT DATA REWORK */}
            {activeTab === 'input' && (
              <InputDataView
                onSave={handleSaveFromInput}
                onNavigateToTable={() => setActiveTab('table')}
                existingRecords={records}
              />
            )}

            {/* FITUR 3: TAMPIL & KELOLA DATA REWORK */}
            {activeTab === 'table' && (
              <div className="space-y-4">
                <FilterBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedClass={selectedClass}
                  setSelectedClass={setSelectedClass}
                  selectedDefect={selectedDefect}
                  setSelectedDefect={setSelectedDefect}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  onResetFilters={handleResetFilters}
                  onExportCSV={() => exportToCSV(processedRecords)}
                  totalResults={processedRecords.length}
                  defectOptions={dynamicDefects}
                  classOptions={dynamicClasses}
                />

                <ReworkTable
                  records={processedRecords}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteRecord}
                />
              </div>
            )}

            {/* FITUR 4: STATISTIK & PARETO */}
            {activeTab === 'analytics' && (
              <AnalyticsView records={records} />
            )}

            {/* FOOTER */}
            <footer className="mt-12 text-center text-[11px] text-slate-400">
              SWG Quality Monitoring System © 2026 • PT Jeil Fajar Indonesia
            </footer>

          </div>
        </main>

      </div>

      {/* MODAL EDIT DATA (Dipakai saat edit dari tabel) */}
      <ReworkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveFromEditModal}
        editData={editData}
        isSubmitting={isSubmitting}
        existingRecords={records}
      />

      {/* TOAST FEEDBACK NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
