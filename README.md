# SWG Quality Monitoring System
**PT Jeil Fajar Indonesia**

Aplikasi monitoring, pencatatan (CRUD), dan analisis data rework produk *Spiral Wound Gasket* (SWG).

Dibangun menggunakan:
- **React.js** (Single-Page Focused Architecture)
- **Tailwind CSS** (Clean Industrial Minimalist, Mobile & Desktop Responsive)
- **Lucide Icons**
- **Vite**
- **Database & Backend**: Google Sheets + Google Apps Script (Serverless, Zero Database Cost)
- **Hosting**: Siap di-deploy langsung ke **Vercel**

---

## 🚀 Fitur Utama
1. **Interactive Sorting**: Klik pada judul kolom (Tanggal, NPS, Class, Qty Rework, Defect, Tindakan) untuk mengurutkan data (Ascending / Descending).
2. **Instant Search & Multi-Filter**: Pencarian teks instan dan filter berdasarkan ASME Class, Jenis Defect, dan Tanggal.
3. **Modal & Bottom-Sheet Input**: Catat atau edit data rework tanpa berpindah halaman. Di smartphone, formulir otomatis menjadi *bottom sheet* yang ramah jempol.
4. **Data Awal Riil**: Sudah terisi dengan 208 data rework asli dari file Excel perusahaan.
5. **Analitik Terpadu**: Visualisasi Pareto Defect, distribusi ASME Class, dan Top 8 Ukuran NPS.
6. **Export CSV**: Ekspor seluruh atau hasil filter data rework ke format CSV/Excel.
7. **Offline-Resilient**: Tetap berjalan lancar menggunakan penyimpanan lokal jika belum terhubung atau sedang offline dari Google Sheets.

---

## 🛠️ Menjalankan di Komputer Lokal

```bash
# 1. Pastikan dependensi terpasang
npm install

# 2. Jalankan server lokal
npm run dev
```

Buka browser di `http://localhost:3000`.

---

## ☁️ Menghubungkan ke Google Sheets (Backend CRUD)

1. Buat **Google Spreadsheet** baru di Google Drive Anda.
2. Di dalam Google Spreadsheet, klik menu **Ekstensi > Apps Script**.
3. Buka file [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) di proyek ini, lalu salin seluruh kodenya ke editor Apps Script.
4. Klik tombol **Deploy > New deployment**.
5. Pilih type: **Web app**.
   - **Execute as**: *Me (email Anda)*
   - **Who has access**: *Anyone* (wajib agar web bisa melakukan CRUD tanpa login)
6. Klik **Deploy**, beri izin akses (*Authorize access*), lalu salin **Web app URL** yang dihasilkan.
7. Buka website Anda, klik ikon **Pengaturan (roda gigi)** di header, tempelkan URL tersebut, lalu klik **Simpan**. Selesai!

---

## 🚢 Deploy ke Vercel

### Cara 1: Menggunakan Git & GitHub (Paling Direkomendasikan)
1. Inisialisasi git dan push repo ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial swg quality monitoring app"
   git branch -M main
   git remote add origin <URL_GITHUB_ANDA>
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com), klik **Add New > Project**, lalu pilih repositori GitHub Anda.
3. Klik **Deploy**. Vercel akan otomatis mendeteksi konfigurasi Vite dan aplikasi langsung aktif!

### Cara 2: Menggunakan Vercel CLI
```bash
npm i -g vercel
vercel
```
