import initialData from '../data/initialData.json';

const STORAGE_KEY = 'swg_rework_records';
const API_URL_KEY = 'swg_gas_api_url';

export function getGasApiUrl() {
  return localStorage.getItem(API_URL_KEY) || '';
}

export function setGasApiUrl(url) {
  localStorage.setItem(API_URL_KEY, url.trim());
}

export function getLocalRecords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return initialData;
  }
}

export function saveLocalRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// Fetch records from Google Apps Script or fallback to LocalStorage
export async function fetchRecords() {
  const apiUrl = getGasApiUrl();
  if (!apiUrl) {
    return { data: getLocalRecords(), source: 'local' };
  }

  try {
    const res = await fetch(`${apiUrl}?action=read`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Network error: ' + res.status);
    const result = await res.json();
    if (result.status === 'success' && Array.isArray(result.data)) {
      saveLocalRecords(result.data); // sync local cache
      return { data: result.data, source: 'cloud' };
    }
    throw new Error(result.message || 'Gagal memuat data dari cloud');
  } catch (err) {
    console.warn('Fallback to local storage due to API error:', err);
    return { data: getLocalRecords(), source: 'local_fallback', error: err.message };
  }
}

// Create new record
export async function createRecord(record) {
  const apiUrl = getGasApiUrl();
  const localList = getLocalRecords();
  const newRecord = {
    ...record,
    id: record.id || `REC-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  // Always update local storage first
  const updated = [newRecord, ...localList];
  saveLocalRecords(updated);

  if (apiUrl) {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'create', data: newRecord })
      });
    } catch (err) {
      console.warn('Failed to sync create to cloud:', err);
    }
  }

  return newRecord;
}

// Update existing record
export async function updateRecord(record) {
  const apiUrl = getGasApiUrl();
  const localList = getLocalRecords();
  const updated = localList.map(item => item.id === record.id ? { ...item, ...record } : item);
  saveLocalRecords(updated);

  if (apiUrl) {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'update', data: record })
      });
    } catch (err) {
      console.warn('Failed to sync update to cloud:', err);
    }
  }

  return record;
}

// Delete record
export async function deleteRecord(id) {
  const apiUrl = getGasApiUrl();
  const localList = getLocalRecords();
  const updated = localList.filter(item => item.id !== id);
  saveLocalRecords(updated);

  if (apiUrl) {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete', id: id })
      });
    } catch (err) {
      console.warn('Failed to sync delete to cloud:', err);
    }
  }

  return true;
}

// Export records to CSV
export function exportToCSV(records) {
  if (!records || !records.length) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const headers = [
    'No',
    'Tanggal',
    'Product / Ukuran',
    'NPS',
    'Class',
    'Qty Order',
    'Qty Rework',
    'Jenis Defect',
    'Proses Terkait',
    'Tindakan Rework',
    'Keterangan'
  ];

  const rows = records.map((r, i) => [
    i + 1,
    r.date || '',
    r.product || '',
    r.nps || '',
    r.asmeClass || '',
    r.qtyOrder || 0,
    r.qtyReject || 0,
    r.defect || '',
    r.process || '',
    r.action || '',
    r.notes || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Data_Rework_SWG_PT_JFI_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
