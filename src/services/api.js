const API_URL_KEY = 'swg_gas_api_url';
const ENV_API_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GAS_API_URL) ? import.meta.env.VITE_GAS_API_URL.trim() : '';

// Ambil URL Google Apps Script permanen dari Environment Variable (.env)
export function getGasApiUrl() {
  if (ENV_API_URL) {
    return ENV_API_URL;
  }
  return localStorage.getItem(API_URL_KEY) || '';
}

// Simpan custom URL ke LocalStorage
export function setGasApiUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem(API_URL_KEY);
  } else {
    localStorage.setItem(API_URL_KEY, url.trim());
  }
}

// Hapus custom URL dari LocalStorage
export function clearGasApiUrl() {
  localStorage.removeItem(API_URL_KEY);
}

// Fetch records murni dari Google Sheets (Cloud Only)
export async function fetchRecords() {
  const apiUrl = getGasApiUrl();
  if (!apiUrl) {
    return { data: [], source: 'unconfigured' };
  }

  try {
    const res = await fetch(`${apiUrl}?action=read`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const result = await res.json();
    if (result.status === 'success' && Array.isArray(result.data)) {
      return { data: result.data, source: 'cloud' };
    }

    throw new Error(result.message || 'Gagal memuat data dari Google Sheets.');
  } catch (err) {
    console.error('Gagal mengambil data dari Google Apps Script:', err);
    throw err;
  }
}

// Tambah catatan baru ke Google Sheets (Create)
export async function createRecord(record) {
  const apiUrl = getGasApiUrl();
  if (!apiUrl) {
    throw new Error('URL Google Apps Script belum disetel.');
  }

  const newRecord = {
    ...record,
    id: record.id || `REC-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'create', data: newRecord })
    });
  } catch (err) {
    // Penanganan warning CORS redirect pada Google Apps Script
    console.warn('Cloud sync notice (create):', err);
  }

  return newRecord;
}

// Perbarui catatan di Google Sheets (Update)
export async function updateRecord(record) {
  const apiUrl = getGasApiUrl();
  if (!apiUrl) {
    throw new Error('URL Google Apps Script belum disetel.');
  }

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'update', data: record })
    });
  } catch (err) {
    console.warn('Cloud sync notice (update):', err);
  }

  return record;
}

// Hapus catatan dari Google Sheets (Delete)
export async function deleteRecord(id) {
  const apiUrl = getGasApiUrl();
  if (!apiUrl) {
    throw new Error('URL Google Apps Script belum disetel.');
  }

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', id: String(id) })
    });
  } catch (err) {
    console.warn('Cloud sync notice (delete):', err);
  }

  return true;
}

// Ekspor data ke CSV
export function exportToCSV(records) {
  if (!records || !records.length) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const headers = [
    'No',
    'Tanggal',
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
