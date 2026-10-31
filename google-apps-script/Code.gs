/**
 * GOOGLE APPS SCRIPT BACKEND UNTUK SWG QUALITY MONITORING
 * PT JEIL FAJAR INDONESIA
 * 
 * Cara Penggunaan:
 * 1. Buka Google Sheets baru.
 * 2. Klik menu 'Ekstensi' > 'Apps Script'.
 * 3. Hapus kode bawaan dan tempel kode ini seluruhnya.
 * 4. Klik 'Deploy' > 'New deployment'.
 * 5. Pilih type: 'Web app'.
 * 6. Execute as: 'Me (akun email Anda)'.
 * 7. Who has access: 'Anyone' (PENTING agar website bisa mengakses API tanpa login Google).
 * 8. Klik 'Deploy', izinkan hak akses (Authorize access), lalu salin 'Web app URL'.
 * 9. Masukkan Web app URL tersebut ke menu Pengaturan di Website.
 */

const SHEET_NAME = 'Rework_Master';

// Inisialisasi sheet dan header jika belum ada
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Buat header baris 1
    const headers = [
      'ID',
      'Tanggal',
      'NPS',
      'ASME_Class',
      'Qty_Order',
      'Qty_Rework',
      'Jenis_Defect',
      'Proses_Terkait',
      'Tindakan_Rework',
      'Keterangan',
      'Created_At'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#f1f5f9');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Handler GET (Read data)
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'read';
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (action === 'read') {
      if (data.length <= 1) {
        return createJsonResponse({ status: 'success', data: [] });
      }

      const headers = data[0];
      const rows = data.slice(1);

      const records = rows.map((row, idx) => {
        let dateVal = row[1];
        if (dateVal instanceof Date) {
          const y = dateVal.getFullYear();
          const m = String(dateVal.getMonth() + 1).padStart(2, '0');
          const d = String(dateVal.getDate()).padStart(2, '0');
          dateVal = `${y}-${m}-${d}`;
        }

        return {
          id: String(row[0] || `REC-${idx + 1}`),
          date: String(dateVal || ''),
          nps: String(row[2] || ''),
          asmeClass: String(row[3] || '150'),
          qtyOrder: Number(row[4]) || 0,
          qtyReject: Number(row[5]) || 1,
          defect: String(row[6] || ''),
          process: String(row[7] || ''),
          action: String(row[8] || ''),
          notes: String(row[9] || ''),
          createdAt: String(row[10] || '')
        };
      });

      return createJsonResponse({ status: 'success', data: records });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// Handler POST (Create, Update, Delete)
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: 'error', message: 'No payload' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheet = getOrCreateSheet();

    // 1. CREATE
    if (action === 'create') {
      const item = payload.data;
      const newRow = [
        item.id || `REC-${Date.now()}`,
        item.date || '',
        item.nps || '',
        item.asmeClass || '',
        Number(item.qtyOrder) || 0,
        Number(item.qtyReject) || 1,
        item.defect || '',
        item.process || '',
        item.action || '',
        item.notes || '',
        item.createdAt || new Date().toISOString()
      ];
      sheet.appendRow(newRow);
      return createJsonResponse({ status: 'success', message: 'Record created', data: item });
    }

    // 2. UPDATE
    if (action === 'update') {
      const item = payload.data;
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(item.id)) {
          foundRow = i + 1; // 1-based index
          break;
        }
      }

      if (foundRow !== -1) {
        const updateRow = [
          item.id,
          item.date || '',
          item.nps || '',
          item.asmeClass || '',
          Number(item.qtyOrder) || 0,
          Number(item.qtyReject) || 1,
          item.defect || '',
          item.process || '',
          item.action || '',
          item.notes || '',
          item.createdAt || new Date().toISOString()
        ];
        sheet.getRange(foundRow, 1, 1, updateRow.length).setValues([updateRow]);
        return createJsonResponse({ status: 'success', message: 'Record updated' });
      }

      return createJsonResponse({ status: 'error', message: 'Record ID not found' });
    }

    // 3. DELETE
    if (action === 'delete') {
      const id = String(payload.id);
      const data = sheet.getDataRange().getValues();
      let foundRow = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === id) {
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow !== -1) {
        sheet.deleteRow(foundRow);
        return createJsonResponse({ status: 'success', message: 'Record deleted' });
      }

      return createJsonResponse({ status: 'error', message: 'Record ID not found for deletion' });
    }

    return createJsonResponse({ status: 'error', message: 'Invalid action: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// Utility Response JSON
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
