import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink, 
  Loader2, 
  DownloadCloud, 
  UploadCloud, 
  Terminal,
  HelpCircle,
  Info
} from 'lucide-react';
import { getGasUrl, setGasUrl, testGasConnection, fetchDatasetsFromGas, pushDatasetsToGas } from '../services/gasService';

export default function GasModal({ 
  isOpen, 
  onClose, 
  getCurrentDataPayload, 
  onDataSynced 
}) {
  const [gasUrlInput, setGasUrlInput] = useState(getGasUrl());
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'script' | 'guide'
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    setGasUrl(gasUrlInput);
    setStatusMessage({ type: 'success', text: 'URL Google Apps Script berhasil disimpan ke browser.' });
  };

  const handleTestConnection = async () => {
    if (!gasUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Harap masukkan URL Web App Google Apps Script terlebih dahulu.' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      setGasUrl(gasUrlInput);
      const res = await testGasConnection(gasUrlInput);
      setStatusMessage({ 
        type: 'success', 
        text: `Koneksi Berhasil! Respon: ${res.message || 'Koneksi ke Google Sheets Aktif'}` 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullData = async () => {
    if (!gasUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'URL Google Apps Script belum diisi.' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const data = await fetchDatasetsFromGas(gasUrlInput);
      onDataSynced(data);
      setStatusMessage({ 
        type: 'success', 
        text: 'Berhasil menarik data terbaru dari Google Spreadsheet!' 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushData = async () => {
    if (!gasUrlInput.trim()) {
      setStatusMessage({ type: 'error', text: 'URL Google Apps Script belum diisi.' });
      return;
    }
    if (!window.confirm('Simpan seluruh dataset saat ini ke Google Spreadsheet?')) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const payload = getCurrentDataPayload();
      await pushDatasetsToGas(gasUrlInput, payload);
      setStatusMessage({ 
        type: 'success', 
        text: 'Data berhasil disinkronkan dan disimpan ke Google Spreadsheet!' 
      });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const copyScriptText = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container modal-lg" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-header-icon bg-primary-subtle">
              <Database size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="modal-title">Database Google Spreadsheet (Apps Script)</h3>
              <p className="modal-subtitle">Kelola sinkronisasi data cloud dengan Google Spreadsheet melalui Google Apps Script</p>
            </div>
          </div>

          <button 
            type="button" 
            className="modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Database size={15} />
            <span>Koneksi & Sinkronisasi</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'script' ? 'active' : ''}`}
            onClick={() => setActiveTab('script')}
          >
            <Terminal size={15} />
            <span>Kode Script (Code.gs)</span>
          </button>

          <button 
            type="button"
            className={`modal-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <HelpCircle size={15} />
            <span>Panduan Setup</span>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          
          {/* TAB 1: SETTINGS & SYNC */}
          {activeTab === 'settings' && (
            <div className="gas-settings-view">
              
              <div className="form-group">
                <label className="form-label">
                  <strong>URL Web App Google Apps Script:</strong>
                </label>
                <div className="input-btn-group">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSaveUrl}
                  >
                    Simpan URL
                  </button>
                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleTestConnection}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Uji Koneksi'}
                  </button>
                </div>
                <span className="form-hint">
                  Dapatkan URL ini setelah mempublikasikan (Deploy as Web App) script Google Apps Script di Spreadsheet Anda.
                </span>
              </div>

              {/* Status Alert */}
              {statusMessage && (
                <div className={`alert-box ${statusMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                  {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Sync Actions Grid */}
              <div className="gas-sync-actions-grid">
                
                <div className="sync-action-card">
                  <div className="sync-card-icon bg-info-subtle">
                    <DownloadCloud size={24} className="text-info" />
                  </div>
                  <div className="sync-card-body">
                    <h4 className="sync-card-title">Tarik Data dari Spreadsheet</h4>
                    <p className="sync-card-desc">
                      Mengambil data terbaru dari sheet Google Spreadsheet (Prelist 1308, 1376, dan Pengawalan) ke web app.
                    </p>
                    <button 
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handlePullData}
                      disabled={isLoading || !gasUrlInput.trim()}
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Tarik Data (Pull)'}
                    </button>
                  </div>
                </div>

                <div className="sync-action-card">
                  <div className="sync-card-icon bg-primary-subtle">
                    <UploadCloud size={24} className="text-primary" />
                  </div>
                  <div className="sync-card-body">
                    <h4 className="sync-card-title">Kirim Data ke Spreadsheet</h4>
                    <p className="sync-card-desc">
                      Menyimpan seluruh data lokal saat ini (termasuk hasil upload Excel terbaru) ke Google Spreadsheet.
                    </p>
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handlePushData}
                      disabled={isLoading || !gasUrlInput.trim()}
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : 'Kirim Data (Push)'}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CODE.GS */}
          {activeTab === 'script' && (
            <div className="gas-script-view">
              <div className="code-header-bar">
                <span className="code-filename">google-apps-script/Code.gs</span>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm"
                  onClick={copyScriptText}
                >
                  {copiedScript ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copiedScript ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <pre className="code-block-display">
                <code>{APPS_SCRIPT_CODE}</code>
              </pre>
            </div>
          )}

          {/* TAB 3: SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="gas-guide-view">
              <div className="alert-box alert-info" style={{ marginBottom: '16px' }}>
                <Info size={18} />
                <span>
                  <strong>2 Pilihan Cara Pembaruan Data:</strong> Anda bisa mengunggah file Excel secara langsung di menu <em>"Upload Excel"</em> (otomatis menyaring 1308 & 1376), atau mengelolanya di Google Spreadsheet di bawah ini.
                </span>
              </div>

              <ol className="setup-steps-list">
                <li>
                  <strong>1. Buat Google Spreadsheet Baru</strong>
                  <p>Buka <a href="https://sheets.new" target="_blank" rel="noreferrer">sheets.new</a> di browser dan beri nama spreadsheet, misalnya <em>"Database Supervisi SE2026 - 1308 & 1376"</em>.</p>
                </li>
                <li>
                  <strong>2. Buka Apps Script Editor</strong>
                  <p>Di menu atas Google Spreadsheet, klik <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>.</p>
                </li>
                <li>
                  <strong>3. Salin & Tempel Kode</strong>
                  <p>Buka tab <em>"Kode Script (Code.gs)"</em> di modal ini, klik <strong>Salin Kode</strong>, lalu hapus seluruh kode lama di editor Apps Script dan tempelkan kode tersebut.</p>
                </li>
                <li>
                  <strong>4. Jalankan Inisialisasi Sheet</strong>
                  <p>Pada toolbar Apps Script, pilih fungsi <code>setupSpreadsheet</code> lalu klik tombol <strong>Run (Jalankan)</strong>. Ini akan otomatis membuat sheet <code>Pengawalan</code>, <code>Prelist_1308</code>, <code>Prelist_1376</code>, <code>Uraian_Tugas</code>, dan <code>RAW_DATA</code>.</p>
                </li>
                <li>
                  <strong>5. Cara Update Lewat Spreadsheet (Opsi RAW_DATA):</strong>
                  <p>Jika Anda memiliki file ekspor SQL Lab UMKM se-Sumbar (17.000+ baris), cukup copy/paste isinya ke sheet <strong>RAW_DATA</strong> di Spreadsheet, lalu klik menu atas <strong>"📊 SE2026 Supervisi"</strong> &gt; <strong>"🚀 2. Filter & Proses Otomatis 1308 & 1376"</strong>.</p>
                </li>
                <li>
                  <strong>6. Publikasikan sebagai Web App (Deploy)</strong>
                  <p>Klik tombol biru <strong>Deploy (Terapkan)</strong> &gt; <strong>New Deployment (Penerapan Baru)</strong>.</p>
                  <ul className="sub-steps">
                    <li>Pilih jenis: <strong>Web app</strong></li>
                    <li>Execute as: <strong>Me (email Anda)</strong></li>
                    <li>Who has access: <strong>Anyone (Siapa saja)</strong></li>
                  </ul>
                </li>
                <li>
                  <strong>7. Masukkan Web App URL</strong>
                  <p>Salin <strong>Web App URL</strong> yang dihasilkan (berakhiran <code>/exec</code>), lalu tempelkan ke tab <em>"Koneksi & Sinkronisasi"</em> pada web app ini, lalu klik <strong>Tarik Data (Pull)</strong>.</p>
                </li>
              </ol>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}

const APPS_SCRIPT_CODE = `/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT BACKEND - SE2026 SUPERVISI & PENGAWALAN KUALITAS
 * Wilayah: Kabupaten Lima Puluh Kota (1308) & Kota Payakumbuh (1376)
 * ==============================================================================
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📊 SE2026 Supervisi')
    .addItem('⚡ 1. Inisialisasi Sheet Struktur Tabel', 'setupSpreadsheet')
    .addItem('🚀 2. Filter & Proses Otomatis 1308 & 1376 dari Sheet RAW_DATA', 'filterRawDataToKabkot')
    .addSeparator()
    .addItem('ℹ️ 3. Petunjuk & Status API', 'showApiInstructions')
    .addToUi();
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'ping') {
    return createJsonResponse({
      status: 'success',
      message: 'Koneksi ke Google Spreadsheet berhasil aktif.',
      timestamp: new Date()
    });
  }

  if (action === 'getAllData') {
    try {
      var data = {
        pengawalan: getPengawalanData(ss),
        uraianTugas: getUraianTugasData(ss),
        prelist1308: getSheetJsonData(ss, 'Prelist_1308'),
        prelist1376: getSheetJsonData(ss, 'Prelist_1376')
      };

      return createJsonResponse({
        status: 'success',
        data: data,
        counts: {
          prelist1308: data.prelist1308.length,
          prelist1376: data.prelist1376.length
        },
        timestamp: new Date()
      });
    } catch (err) {
      return createJsonResponse({
        status: 'error',
        message: err.toString()
      });
    }
  }

  if (action === 'filterNow') {
    try {
      var result = filterRawDataToKabkot();
      return createJsonResponse({
        status: 'success',
        message: 'Filter data 1308 & 1376 berhasil dijalankan.',
        result: result,
        timestamp: new Date()
      });
    } catch (err) {
      return createJsonResponse({
        status: 'error',
        message: err.toString()
      });
    }
  }

  return createJsonResponse({
    status: 'success',
    message: 'SE2026 Supervisi Apps Script Backend Ready'
  });
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.payload;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'saveAllData') {
      if (payload.pengawalan) savePengawalanData(ss, payload.pengawalan);
      if (payload.uraianTugas) saveUraianTugasData(ss, payload.uraianTugas);
      if (payload.prelist1308) saveSheetJsonData(ss, 'Prelist_1308', payload.prelist1308);
      if (payload.prelist1376) saveSheetJsonData(ss, 'Prelist_1376', payload.prelist1376);

      return createJsonResponse({
        status: 'success',
        message: 'Data berhasil disinkronkan ke Google Spreadsheet.',
        timestamp: new Date()
      });
    }

    if (action === 'savePrelist') {
      if (payload.targetKab === '1308' || payload.prelist1308) {
        saveSheetJsonData(ss, 'Prelist_1308', payload.prelist1308 || payload.data);
      }
      if (payload.targetKab === '1376' || payload.prelist1376) {
        saveSheetJsonData(ss, 'Prelist_1376', payload.prelist1376 || payload.data);
      }

      return createJsonResponse({
        status: 'success',
        message: 'Data Prelist berhasil diperbarui di Google Spreadsheet.',
        timestamp: new Date()
      });
    }

    return createJsonResponse({
      status: 'error',
      message: 'Aksi POST tidak dikenali.'
    });
  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  }
}

function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ['Pengawalan', 'Prelist_1308', 'Prelist_1376', 'Uraian_Tugas', 'RAW_DATA'];
  
  sheets.forEach(function(sname) {
    var s = ss.getSheetByName(sname);
    if (!s) {
      ss.insertSheet(sname);
    }
  });

  var ui = SpreadsheetApp.getUi();
  if (ui) {
    ui.alert('Inisialisasi Berhasil', 'Struktur sheet (Pengawalan, Prelist_1308, Prelist_1376, Uraian_Tugas, RAW_DATA) telah siap digunakan!', ui.ButtonSet.OK);
  }
}

function filterRawDataToKabkot() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawSheet = ss.getSheetByName('RAW_DATA');
  
  if (!rawSheet) {
    throw new Error('Sheet "RAW_DATA" belum ada. Buat sheet RAW_DATA dan paste data SQL Lab UMKM di sana.');
  }

  var rawValues = rawSheet.getDataRange().getValues();
  if (rawValues.length < 2) {
    throw new Error('Sheet RAW_DATA masih kosong atau belum ada data.');
  }

  var headers = rawValues[0].map(function(h) { return String(h).trim().toUpperCase(); });
  var idxKodeSub = headers.indexOf('KODE_SUB_SLS');
  
  if (idxKodeSub === -1) {
    throw new Error('Kolom KODE_SUB_SLS tidak ditemukan di sheet RAW_DATA.');
  }

  var list1308 = [];
  var list1376 = [];

  for (var r = 1; r < rawValues.length; r++) {
    var row = rawValues[r];
    var kdSub = String(row[idxKodeSub] || '').trim();
    if (!kdSub) continue;

    if (kdSub.indexOf('1308') === 0) {
      list1308.push(mapRowToObject(headers, row, kdSub, '1308'));
    } else if (kdSub.indexOf('1376') === 0) {
      list1376.push(mapRowToObject(headers, row, kdSub, '1376'));
    }
  }

  if (list1308.length > 0) saveSheetJsonData(ss, 'Prelist_1308', list1308);
  if (list1376.length > 0) saveSheetJsonData(ss, 'Prelist_1376', list1376);

  var msg = 'Filter Selesai: ' + list1308.length + ' baris Kab. Lima Puluh Kota & ' + list1376.length + ' baris Kota Payakumbuh berhasil diproses!';
  Logger.log(msg);

  try {
    var ui = SpreadsheetApp.getUi();
    if (ui) ui.alert('Proses Sukses', msg, ui.ButtonSet.OK);
  } catch (e) {}

  return {
    count1308: list1308.length,
    count1376: list1376.length
  };
}

function mapRowToObject(headers, row, kdSub, kdKab) {
  var d = {};
  for (var c = 0; c < headers.length; c++) {
    d[headers[c]] = row[c];
  }

  var getNum = function(key) {
    var val = d[key];
    if (val === undefined || val === null || val === '' || val === '-') return 0;
    var n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  var totPrelist = getNum('JUMLAH_PRELIST');
  var plOpen = getNum('JUMLAH_PRELIST_OPEN');
  var plDraft = getNum('JUMLAH_PRELIST_DRAFT');
  var plOpenDraft = (d['JUMLAH_PRELIST_OPEN_DRAFT'] !== undefined) ? getNum('JUMLAH_PRELIST_OPEN_DRAFT') : (plOpen + plDraft);
  var plSubmit = (d['JUMLAH_PRELIST_SELAIN_OPEN_DRAFT'] !== undefined) ? getNum('JUMLAH_PRELIST_SELAIN_OPEN_DRAFT') : Math.max(0, totPrelist - (plOpen + plDraft));

  var plKlgTot = getNum('JUMLAH_KELUARGA_PRELIST');
  var plKlgSub = getNum('KELUARGA_PRELIST_SUBMIT');
  var plUshTot = getNum('JUMLAH_USAHA_PRELIST');
  var plUshSub = getNum('USAHA_PRELIST_SUBMIT');
  var plNonTot = getNum('JUMLAH_NONBKU_PRELIST');
  var plNonSub = getNum('NONBKU_PRELIST_SUBMIT');

  var glUshTot = getNum('JUMLAH_USAHA_GENERAL_LINK');
  var glUshSub = getNum('USAHA_GENERAL_LINK_SUBMIT');
  var glKlgTot = getNum('JUMLAH_KELUARGA_GENERAL_LINK');
  var glKlgSub = getNum('KELUARGA_GENERAL_LINK_SUBMIT');

  var abTot = getNum('JUMLAH_ASSIGNMENT_BARU');
  var abKlgTot = getNum('JUMLAH_KELUARGA_BARU');
  var abKlgSub = getNum('KELUARGA_BARU_SUBMIT');
  var abUshTot = getNum('JUMLAH_USAHA_BARU');
  var abUshSub = getNum('USAHA_BARU_SUBMIT');
  var abNonTot = getNum('JUMLAH_NONBKU_BARU');
  var abNonSub = getNum('NONBKU_BARU_SUBMIT');

  var abSub = abKlgSub + abUshSub + abNonSub;
  var abOpen = getNum('JUMLAH_BARU_OPEN');
  var abDraft = getNum('JUMLAH_BARU_DRAFT') || getNum('JUMLAH_BARU_STATUS_DRAFT');
  var abOpenDraft = abOpen + abDraft;

  var totBeban = totPrelist + abTot;
  var totSubmit = plSubmit + abSub;
  var totOpen = plOpen + abOpen;
  var totDraft = plDraft + abDraft;
  var totOpenDraft = totOpen + totDraft;
  var totPct = totBeban > 0 ? (totSubmit / totBeban) : 1;

  return {
    kdKab: kdKab,
    nmKab: kdKab === '1376' ? 'Kota Payakumbuh' : 'Kabupaten Lima Puluh Kota',
    kdKec: kdSub.slice(0, 7),
    nmKec: '',
    kdDesa: kdSub.slice(0, 10),
    nmDesa: '',
    kdSubSls: kdSub,
    nmSubSls: 'Sub SLS [' + kdSub.slice(-2) + ']',

    prelistKeluargaTot: plKlgTot,
    prelistKeluargaSub: plKlgSub,
    prelistKeluargaPct: plKlgTot > 0 ? (plKlgSub / plKlgTot) : 1,

    prelistUsahaTot: plUshTot,
    prelistUsahaSub: plUshSub,
    prelistUsahaPct: plUshTot > 0 ? (plUshSub / plUshTot) : 1,

    prelistNonBkuTot: plNonTot,
    prelistNonBkuSub: plNonSub,
    prelistNonBkuPct: plNonTot > 0 ? (plNonSub / plNonTot) : 1,

    totPrelistTot: totPrelist,
    totPrelistSub: plSubmit,
    totPrelistPct: totPrelist > 0 ? (plSubmit / totPrelist) : 1,
    prelistOpen: plOpen,
    prelistDraft: plDraft,
    prelistOpenDraft: plOpenDraft,

    glKeluargaTot: glKlgTot,
    glKeluargaSub: glKlgSub,
    glKeluargaPct: glKlgTot > 0 ? (glKlgSub / glKlgTot) : 1,

    glUsahaTot: glUshTot,
    glUsahaSub: glUshSub,
    glUsahaPct: glUshTot > 0 ? (glUshSub / glUshTot) : 1,

    abKeluargaTot: abKlgTot,
    abKeluargaSub: abKlgSub,
    abKeluargaPct: abKlgTot > 0 ? (abKlgSub / abKlgTot) : 1,

    abUsahaTot: abUshTot,
    abUsahaSub: abUshSub,
    abUsahaPct: abUshTot > 0 ? (abUshSub / abUshTot) : 1,

    abNonBkuTot: abNonTot,
    abNonBkuSub: abNonSub,
    abNonBkuPct: abNonTot > 0 ? (abNonSub / abNonTot) : 1,

    totAbTot: abTot,
    totAbSub: abSub,
    totAbPct: abTot > 0 ? (abSub / abTot) : 1,
    abOpen: abOpen,
    abDraft: abDraft,
    abOpenDraft: abOpenDraft,

    totBeban: totBeban,
    totSubmit: totSubmit,
    totOpen: totOpen,
    totDraft: totDraft,
    totOpenDraft: totOpenDraft,
    totPct: totPct,
    deltaJml: 0,
    deltaPct: 0,
    dummy: getNum('JUMLAH_DUMMY')
  };
}

function getSheetJsonData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  
  var headers = values[0];
  var list = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var item = {};
    for (var c = 0; c < headers.length; c++) {
      item[headers[c]] = row[c];
    }
    list.push(item);
  }
  return list;
}

function saveSheetJsonData(ss, sheetName, dataList) {
  if (!dataList || dataList.length === 0) return;
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);
  
  sheet.clear();
  var headers = Object.keys(dataList[0]);
  var rows = [headers];
  
  dataList.forEach(function(item) {
    var row = [];
    headers.forEach(function(h) {
      row.push(item[h] !== undefined ? item[h] : '');
    });
    rows.push(row);
  });
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}

function getPengawalanData(ss) {
  var list = getSheetJsonData(ss, 'Pengawalan');
  var map = {};
  list.forEach(function(item) {
    if (item.kodeKab) map[String(item.kodeKab)] = item;
  });
  return map;
}

function savePengawalanData(ss, pengawalanMap) {
  var list = [];
  Object.keys(pengawalanMap).forEach(function(k) {
    list.push(pengawalanMap[k]);
  });
  saveSheetJsonData(ss, 'Pengawalan', list);
}

function getUraianTugasData(ss) {
  return getSheetJsonData(ss, 'Uraian_Tugas');
}

function saveUraianTugasData(ss, tasks) {
  saveSheetJsonData(ss, 'Uraian_Tugas', tasks);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function showApiInstructions() {
  var ui = SpreadsheetApp.getUi();
  ui.alert('Petunjuk Integrasi Web SE2026', '1. Tempel data di sheet RAW_DATA.\\n2. Klik menu 2. Filter & Proses Otomatis.\\n3. Buka web dan klik Sinkronkan.', ui.ButtonSet.OK);
}
`;
