# Panduan Integrasi Google Spreadsheet & Google Apps Script

Aplikasi Supervisi SE2026 ini mendukung Google Spreadsheet sebagai database cloud real-time dengan perantara **Google Apps Script (GAS)**.

---

## Langkah-Langkah Pemasangan (Setup):

1. **Buat Google Spreadsheet Baru**
   - Kunjungi [https://sheets.new](https://sheets.new) di browser Anda.
   - Berikan nama spreadsheet, contoh: `Database Supervisi SE2026 - 1308 & 1376`.

2. **Buka Apps Script**
   - Pada Google Spreadsheet, klik menu **Ekstensi (Extensions)** &gt; **Apps Script**.

3. **Tempel Kode Script**
   - Hapus semua kode bawaan di `Code.gs`.
   - Salin seluruh isi file [Code.gs](./Code.gs) lalu tempelkan ke editor Apps Script.

4. **Jalankan Inisialisasi Sheet (setupSpreadsheet)**
   - Pada dropdown fungsi di toolbar atas Apps Script, pilih fungsi `setupSpreadsheet`.
   - Klik tombol **Jalankan (Run)**.
   - Berikan izin akun Google jika muncul jendela otorisasi.
   - Script akan otomatis membuat 4 sheet: `Pengawalan`, `Prelist_1308`, `Prelist_1376`, dan `Uraian_Tugas`.

5. **Deploy sebagai Web App**
   - Klik tombol biru **Terapkan (Deploy)** di pojok kanan atas &gt; **Penerapan baru (New deployment)**.
   - Pilih jenis: **Aplikasi web (Web app)**.
   - Deskripsi: `SE2026 API v1`.
   - Jalankan sebagai (Execute as): **Saya (Email Anda)**.
   - Siapa yang memiliki akses (Who has access): **Siapa saja (Anyone)**.
   - Klik **Terapkan (Deploy)**.

6. **Hubungkan ke Web App**
   - Salin **URL Aplikasi Web** yang dihasilkan (berakhiran `/exec`).
   - Buka Aplikasi Web Supervisi & Pengawalan SE2026, klik tombol **Database GAS** di header atas.
   - Tempelkan URL tersebut ke kolom *URL Web App Google Apps Script*, lalu klik **Simpan URL** dan **Uji Koneksi**.
   - Klik **Kirim Data (Push)** untuk mengisi spreadsheet pertama kali dari web app, atau **Tarik Data (Pull)** untuk membaca data terbaru dari spreadsheet.
